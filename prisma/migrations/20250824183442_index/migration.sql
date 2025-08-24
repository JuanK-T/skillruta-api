-- AlterTable
ALTER TABLE `course` ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `thumbnailUrl` VARCHAR(191) NULL,
    ADD COLUMN `totalDurationSec` INTEGER NULL;

-- AlterTable
ALTER TABLE `progress` ADD COLUMN `percent` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `startedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Chapter_courseId_idx` ON `Chapter`(`courseId`);

-- CreateIndex
CREATE INDEX `Course_category_idx` ON `Course`(`category`);

-- CreateIndex
CREATE INDEX `Course_isPublished_idx` ON `Course`(`isPublished`);

-- CreateIndex
CREATE INDEX `Enrollment_userId_idx` ON `Enrollment`(`userId`);

-- CreateIndex
CREATE INDEX `Progress_userId_status_idx` ON `Progress`(`userId`, `status`);

-- RenameIndex
ALTER TABLE `course` RENAME INDEX `Course_authorId_fkey` TO `Course_authorId_idx`;

-- RenameIndex
ALTER TABLE `enrollment` RENAME INDEX `Enrollment_courseId_fkey` TO `Enrollment_courseId_idx`;

-- RenameIndex
ALTER TABLE `progress` RENAME INDEX `Progress_chapterId_fkey` TO `Progress_chapterId_idx`;
