import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import db from "@/core/db";
import EmailProvider from "next-auth/providers/email";
import NextAuth from "next-auth/next";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.userId = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verifyRequest=1",
  },
  secret: process.env.SECRET,
};

export default NextAuth(authOptions);
