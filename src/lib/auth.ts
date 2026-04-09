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
    jwt({ token, user }) {
      // On sign in, user object is present - this is where we capture the user info
      if (user) {
        const userId = (user as any).id || user.id;
        if (userId) {
          token.id = String(userId);
          token.role = (user as any).role;
          console.log("[JWT] User signed in. Set token.id:", token.id);
        } else {
          console.error("[JWT] User object has no id:", user);
        }
      } else {
        // On refresh, preserve existing values
        if (token.id) {
          console.log("[JWT] Token refresh. Preserving token.id:", token.id);
        }
      }
      return token;
    },
    session({ session, token }) {
      // Map token properties to session
      session.user.id = String(token.id || "");
      session.user.role = String(token.role || "USER") as any;

      console.log("[Session] Callback. session.user.id:", session.user.id, "token.id:", token.id);

      return session;
    },
  },
  pages: { signIn: "/login" },
});
