import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

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

      async authorize(credentials) {
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

      let customer = await prisma.customer.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          googleId: true,
        },
      });

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

      if (account?.provider === "google" && user.email) {
        const customer = await prisma.customer.findUnique({
          where: {
            email: user.email.toLowerCase().trim(),
          },
          select: {
            id: true,
          },
        });

        if (customer) {
          token.id = customer.id;
          token.role = "customer";
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
