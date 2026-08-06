CREATE TABLE `transportation_segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayId` int NOT NULL,
	`itineraryId` int NOT NULL,
	`type` enum('flight','train','car','bus','ship','other') NOT NULL DEFAULT 'flight',
	`originLocation` varchar(255) NOT NULL DEFAULT '',
	`originDate` varchar(32) NOT NULL DEFAULT '',
	`originTime` varchar(16) NOT NULL DEFAULT '',
	`destinationLocation` varchar(255) NOT NULL DEFAULT '',
	`destinationDate` varchar(32) NOT NULL DEFAULT '',
	`destinationTime` varchar(16) NOT NULL DEFAULT '',
	`flightNumber` varchar(32) NOT NULL DEFAULT '',
	`airline` varchar(128) NOT NULL DEFAULT '',
	`trainNumber` varchar(32) NOT NULL DEFAULT '',
	`trainName` varchar(128) NOT NULL DEFAULT '',
	`vehicleType` varchar(64) NOT NULL DEFAULT '',
	`vehicleNumber` varchar(32) NOT NULL DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transportation_segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `hotel_vouchers` ADD `earlyCheckIn` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotel_vouchers` ADD `lateCheckOut` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `hotel_vouchers` ADD `status` enum('draft','confirmed') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `hotel_vouchers` DROP COLUMN `voucherStatus`;