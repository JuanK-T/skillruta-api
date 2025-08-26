import { PrismaClient, ProgressStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { pick } from './utils';

function randomProgressStatus(): ProgressStatus {
  return pick(Object.values(ProgressStatus));
}

export async function enrollUsersAndGenerateProgress(
  prisma: PrismaClient,
  userIds: string[],
  courseId: string,
  chapterIds: string[]
) {
  const target = Math.floor(
    (userIds.length * faker.number.int({ min: 30, max: 70 })) / 100
  );
  const chosen = [...userIds].sort(() => Math.random() - 0.5).slice(0, target);

  for (const userId of chosen) {
    await prisma.enrollment.create({ data: { userId, courseId } });

    for (const chapterId of chapterIds) {
      const status = randomProgressStatus();
      const percent =
        status === 'NOT_STARTED'
          ? 0
          : status === 'COMPLETED'
            ? 100
            : faker.number.int({ min: 5, max: 95 });
      const lastPositionSec = Math.floor(
        (percent / 100) * faker.number.int({ min: 180, max: 1200 })
      );

      await prisma.progress.create({
        data: {
          userId,
          chapterId,
          status,
          percent,
          lastPositionSec,
          startedAt:
            status !== 'NOT_STARTED' ? faker.date.recent({ days: 30 }) : null,
          completedAt:
            status === 'COMPLETED' ? faker.date.recent({ days: 10 }) : null,
        },
      });
    }
  }
}
