import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { ALLOWED_EMAILS } from "./allowed-emails";

const prisma = new PrismaClient();

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    signIn({ user, email: emailDetails }) {
      console.log("[auth][signIn]", JSON.stringify({ user, emailDetails }));
      const address = user.email?.toLowerCase().trim();
      if (!address) return true; // let verification-request phase pass; checked again on link click
      return ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(address);
    },
  },
};
