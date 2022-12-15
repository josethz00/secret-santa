import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { prisma } from "../../../server/db/client";
import { createTransport } from "nodemailer"
import { EmailTemplateUtils } from "../../../utils/email-template"

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: String(process.env.EMAIL_SERVER_HOST),
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: String(process.env.EMAIL_SERVER_USER),
          pass: String(process.env.EMAIL_SERVER_PASSWORD)
        }
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async (params) => {
        const { identifier, url, provider, theme } = params
        const { host } = new URL(url)
        const transport = createTransport(provider.server)
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: EmailTemplateUtils.text({ url, host }),
          html: EmailTemplateUtils.html({ url, host, theme }),
        })
        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
        }
      },
      normalizeIdentifier(identifier: string): string {
        // eslint-disable-next-line prefer-const
        let [local, domain] = identifier.toLowerCase().trim().split("@")
        domain = domain?.split(",")[0]
        return `${local}@${domain}`
      }
    }),
  ],
};

export default NextAuth(authOptions);
