import { PrismaClient } from '@prisma/client';

export async function randomlyAwardBadgesToUsers(prisma: PrismaClient) {
  const users = await prisma.user.findMany({ select: { id: true } });
  const badges = await prisma.badge.findMany({ select: { id: true } });

  for (const u of users) {
    const count = Math.floor(Math.random() * 4); // 0..3
    const picks = [...badges].sort(() => Math.random() - 0.5).slice(0, count);
    for (const b of picks) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: u.id, badgeId: b.id } },
        create: { userId: u.id, badgeId: b.id },
        update: {},
      });
    }
  }
}
