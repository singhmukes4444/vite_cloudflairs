CREATE TABLE `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `hotels` ADD `numRooms` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `doubleSharing` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `tripleSharing` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `childNoBed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `childWithBed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotels` ADD `extraBed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnFrom` varchar(128) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnTo` varchar(128) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `specialNotes` text;--> statement-breakpoint
ALTER TABLE `meal_plans` ADD `breakfastType` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `meal_plans` ADD `lunchType` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `meal_plans` ADD `dinnerType` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` DROP COLUMN `bgImageUrl`;