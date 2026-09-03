import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const GOOGLE_LINK_COOKIE = "kobas_google_link";
const GOOGLE_LINK_MAX_AGE = 10 * 60; // 10 minutes

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MINUTES = 15;

function createLinkSignature(customerId: string) {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET manquant.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(customerId)
    .digest("hex");
}

function createLinkCookieValue(customerId: string) {
  return `${customerId}.${createLinkSignature(customerId)}`;
}

function verifyLinkCookieValue(value: string) {
  const separatorIndex = value.lastIndexOf(".");

  if (separatorIndex <= 0) {
    return null;
  }

  const customerId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);

  if (!customerId || !signature) {
    return null;
  }

  const expectedSignature = createLinkSignature(customerId);

  const receivedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const isValid = crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );

  return isValid ? customerId : null;
}

function getClientIp(request: Request | undefined): string {
  if (!request) return "unknown";

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

async function checkAndRecordAttempt(
  ip: string,
  success: boolean
): Promise<{ blocked: boolean; remainingMinutes?: number }> {
  const existing = await prisma.loginAttempt.findUnique({
    where: { ip },
  });

  const now = new Date();

  if (existing?.blockedUntil && existing.blockedUntil > now) {
    const remainingMs = existing.blockedUntil.getTime() - now.getTime();
    return {
      blocked: true,
      remainingMinutes: Math.ceil(remainingMs / 60000),
    };
  }

  if (success) {
    if (existing) {
      await prisma.loginAttempt.update({
        where: { ip },
        data: { attempts: 0, blockedUntil: null },
      });
    }
    return { blocked: false };
  }

  const wasBlockedAndExpired =
    existing?.blockedUntil && existing.blockedUntil <= now;

  const newAttempts = wasBlockedAndExpired
    ? 1
    : (existing?.attempts || 0) + 1;

  const shouldBlock = newAttempts >= MAX_ATTEMPTS;

  await prisma.loginAttempt.upsert({
    where: { ip },
    create: {
      ip,
      attempts: newAttempts,
      blockedUntil: shouldBlock
        ? new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60000)
        : null,
    },
    update: {
      attempts: newAttempts,
      blockedUntil: shouldBlock
        ? new Date(now.getTime() + BLOCK_DURATION_MINUTES * 60000)
        : null,
    },
  });

  return { blocked: false };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "admin",
      name: "Admin",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Mot de passe",
          type: "password",
        },
      },

      async authorize(credentials, request) {
        const ip = getClientIp(request as Request | undefined);

        const attemptCheck = await checkAndRecordAttempt(ip, false);

        if (attemptCheck.blocked) {
          throw new Error(
            `Trop de tentatives échouées. Réessayez dans ${attemptCheck.remainingMinutes} minute(s).`
          );
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          console.error(
            "ADMIN_EMAIL ou ADMIN_PASSWORD manquant dans les variables d'environnement."
          );

          return null;
        }

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          await checkAndRecordAttempt(ip, true);

          return {
            id: "admin",
            name: "Kobas Tech",
            email: adminEmail,
            role: "admin",
          };
        }

        return null;
      },
    }),

    Credentials({
      id: "customer",
      name: "Client",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Mot de passe",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const customer = await prisma.customer.findUnique({
          where: {
            email: email.toLowerCase().trim(),
          },
        });

        if (!customer || !customer.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          password,
          customer.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          role: "customer",
        };
      },
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.toLowerCase().trim();

      if (!email) {
        return false;
      }

      const googleProfile = profile as {
        email_verified?: boolean;
        given_name?: string;
        family_name?: string;
      };

      if (googleProfile.email_verified === false) {
        return false;
      }

      const googleId = account.providerAccountId;

      /*
       * ============================================================
       * LIEN GOOGLE EXPLICITE
       * ============================================================
       *
       * Le cookie est créé uniquement lorsqu'un client connecté
       * demande explicitement de lier un compte Google.
       */

      const cookieStore = await cookies();
      const linkCookie = cookieStore.get(GOOGLE_LINK_COOKIE)?.value;

      if (linkCookie) {
        const customerId = verifyLinkCookieValue(linkCookie);

        if (!customerId) {
          return false;
        }

        const customer = await prisma.customer.findUnique({
          where: {
            id: customerId,
          },
          select: {
            id: true,
            googleId: true,
          },
        });

        if (!customer) {
          return false;
        }

        /*
         * Vérifier que ce compte Google n'est pas déjà
         * associé à un autre client.
         */
        const googleOwner = await prisma.customer.findFirst({
          where: {
            googleId,
          },
          select: {
            id: true,
          },
        });

        if (googleOwner && googleOwner.id !== customer.id) {
          return false;
        }

        /*
         * Le compte Google est déjà lié à ce même client.
         */
        if (customer.googleId === googleId) {
          cookieStore.delete(GOOGLE_LINK_COOKIE);
          return true;
        }

        /*
         * Le client possède déjà un autre compte Google.
         * On ne remplace jamais silencieusement l'ancien.
         */
        if (customer.googleId) {
          return false;
        }

        /*
         * Association explicite au compte actuellement ciblé
         * par le cookie signé.
         */
        await prisma.customer.update({
          where: {
            id: customer.id,
          },
          data: {
            googleId,
          },
        });

        cookieStore.delete(GOOGLE_LINK_COOKIE);

        return true;
      }

      /*
       * ============================================================
       * CONNEXION GOOGLE NORMALE
       * ============================================================
       */

      let customer = await prisma.customer.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          googleId: true,
        },
      });

      /*
       * Aucun compte Kobas Tech avec cet email :
       * création d'un nouveau compte client.
       */
      if (!customer) {
        const firstName =
          googleProfile.given_name ||
          user.name?.split(" ")[0] ||
          "Client";

        const lastName =
          googleProfile.family_name ||
          user.name?.split(" ").slice(1).join(" ") ||
          "Kobas";

        customer = await prisma.customer.create({
          data: {
            firstName,
            lastName,
            email,
            googleId,
          },
          select: {
            id: true,
            googleId: true,
          },
        });
      } else if (!customer.googleId) {
        /*
         * Compte existant sans Google :
         * connexion Google normale par même adresse email.
         */
        customer = await prisma.customer.update({
          where: {
            id: customer.id,
          },
          data: {
            googleId,
          },
          select: {
            id: true,
            googleId: true,
          },
        });
      } else if (customer.googleId !== googleId) {
        /*
         * L'adresse email existe mais appartient déjà
         * à un autre compte Google.
         */
        return false;
      }

      return true;
    },

    authorized({ auth }) {
      return !!auth?.user;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }

      /*
       * Pour Google, on retrouve en priorité le client
       * grâce au googleId.
       *
       * Cela est particulièrement important lorsqu'un client
       * a lié une adresse Google différente de son adresse
       * email Kobas Tech.
       */
      if (account?.provider === "google") {
        const googleId = account.providerAccountId;

        if (googleId) {
          const customerByGoogle = await prisma.customer.findUnique({
            where: {
              googleId,
            },
            select: {
              id: true,
            },
          });

          if (customerByGoogle) {
            token.id = customerByGoogle.id;
            token.role = "customer";
            return token;
          }
        }

        /*
         * Fallback pour les connexions Google normales
         * basées sur la même adresse email.
         */
        if (user.email) {
          const customerByEmail = await prisma.customer.findUnique({
            where: {
              email: user.email.toLowerCase().trim(),
            },
            select: {
              id: true,
            },
          });

          if (customerByEmail) {
            token.id = customerByEmail.id;
            token.role = "customer";
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (
          session.user as {
            role?: string;
            id?: string;
          }
        ).role = token.role as string;

        (
          session.user as {
            role?: string;
            id?: string;
          }
        ).id = token.id as string;
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});
