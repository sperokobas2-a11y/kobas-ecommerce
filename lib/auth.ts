import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
  id: "admin",
  name: "Admin",

  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Mot de passe", type: "password" },
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
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const customer = await prisma.customer.findUnique({
          where: { email },
        });

        if (!customer || !customer.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, customer.password);

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
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
  authorized({ auth }) {
    return !!auth?.user;
  },

  async jwt({ token, user }) {
    if (user) {
      token.role = (user as { role?: string }).role;
      token.id = user.id;
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      (session.user as { role?: string; id?: string }).role =
        token.role as string;
      (session.user as { role?: string; id?: string }).id =
        token.id as string;
    }
    return session;
  },
},

  secret: process.env.AUTH_SECRET,
});