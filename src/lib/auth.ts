import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: `${user.firstName} ${user.lastName}`.trim(), email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, account }) {
      // On sign in, user object is present
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
      }
      // Preserve id and role from previous token if not set
      if (!token.id && token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    session({ session, token }) {
      // Ensure id is always a valid string
      const id = token.id ? String(token.id) : "";
      const role = token.role ? String(token.role) : "USER";

      if (!id) {
        console.warn("[Auth] Session has no token.id. Token:", { id: token.id, sub: token.sub });
      }

      session.user.id = id;
      session.user.role = role as any;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
