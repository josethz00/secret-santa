import { createTransport } from "nodemailer";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { memoryCache } from "../../common/mem-cache";
import crypto from "crypto";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  createGroup: protectedProcedure.input(z.object({
    name: z.string(),
    emails: z.array(z.string()),
  })).mutation(async ({ ctx, input }) => {
    const group = await ctx.prisma.group.create({
      data: {
        name: input.name,
        userGroups: {
          create: {
            userId: ctx.session.user.id,
            userRole: "ADMIN",
          }
        }
      },
    });

    const transport = createTransport({
      host: String(process.env.EMAIL_SERVER_HOST),
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: String(process.env.EMAIL_SERVER_USER),
        pass: String(process.env.EMAIL_SERVER_PASSWORD)
      }
    });

    input.emails.forEach(async (email) => {
      const inviteLinkUuid = crypto.randomUUID();
      const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${group.id}/${inviteLinkUuid}`;
      // se nao tiver o `id` no link, o usuario nao vai conseguir entrar no grupo, entao nesse
      // caso, o usuário deverá ser redirecionado para a página de login e depois para a página
      // de convite
      memoryCache.set(inviteLinkUuid, email, 27000);

      const result = await transport.sendMail({
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `You have been invited to join ${input.name}`,
        html: `You have been invited to join ${input.name}. Click the link below
          to join the group: <a href="${inviteLink}">${input.name}</a>`,
      });
      if (result.accepted.length === 0) {
        throw new Error("Failed to send email");
      }
    });

    return group;
  }),
  getUserGroups: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.group.findMany({
      where: {
        userGroups: {
          some: {
            userId: ctx.session.user.id,
          }
        }
      },
    });
  }),
  updateName: protectedProcedure.input(z.object({
    name: z.string()
  })).mutation(({ ctx, input }) => {
    return ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        name: input.name,
      },
    });
  }),
  updateBio: protectedProcedure.input(z.object({
    bio: z.string().max(160)
  })).mutation(({ ctx, input }) => {
    return ctx.prisma.user.update({
      where: {
        id: ctx.session.user.id,
      },
      data: {
        bio: input.bio,
      },
    });
  }),
  joinGroup: protectedProcedure.input(z.object({
    groupId: z.string(),
    inviteUuid: z.string().uuid(),
  })).mutation(async ({ ctx, input }) => {
    const email = await memoryCache.get(input.inviteUuid);
    if (!email) {
      throw new Error("Invalid invite link");
    }

    const userExists = await ctx.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!userExists) {
      return {
        userNotRegistered: true,
      }
    }

    const userGroup = await ctx.prisma.userGroups.findFirst({
      where: {
        groupId: input.groupId,
        userId: userExists.id,
      },
    });

    if (userGroup) {
      throw new Error("This user is already in group");
    }

    await ctx.prisma.userGroups.create({
      data: {
        groupId: input.groupId,
        userId: userExists.id,
        userRole: "USER",
        userConfirmed: true,
      },
    })

    await memoryCache.del(input.inviteUuid);

    return {
      success: true,
    }
  })
});
