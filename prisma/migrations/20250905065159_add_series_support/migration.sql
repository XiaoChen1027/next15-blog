-- AlterTable
ALTER TABLE `Blog` ADD COLUMN `seriesId` VARCHAR(191) NULL,
    ADD COLUMN `seriesOrder` INTEGER NULL;

-- CreateTable
CREATE TABLE `Series` (
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `cover` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Series_title_key`(`title`),
    UNIQUE INDEX `Series_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Blog` ADD CONSTRAINT `Blog_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `Series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
