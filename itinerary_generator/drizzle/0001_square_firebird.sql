CREATE TABLE `hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itineraryId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`name` varchar(255) NOT NULL,
	`starRating` int NOT NULL DEFAULT 3,
	`numNights` int NOT NULL DEFAULT 1,
	`checkInTime` varchar(32) NOT NULL DEFAULT '02:00 PM',
	`checkInDate` varchar(64) NOT NULL DEFAULT '',
	`checkOutTime` varchar(32) NOT NULL DEFAULT '12:00 PM',
	`checkOutDate` varchar(64) NOT NULL DEFAULT '',
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itineraries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL DEFAULT '',
	`guestNames` text NOT NULL DEFAULT (''),
	`numGuests` int NOT NULL DEFAULT 1,
	`startDate` varchar(32) NOT NULL DEFAULT '',
	`endDate` varchar(32) NOT NULL DEFAULT '',
	`numNights` int NOT NULL DEFAULT 1,
	`numDays` int NOT NULL DEFAULT 2,
	`mealPlan` varchar(255) NOT NULL DEFAULT '',
	`transfers` varchar(255) NOT NULL DEFAULT '',
	`coverImageUrl` text,
	`inclusions` json NOT NULL DEFAULT ('[]'),
	`exclusions` json NOT NULL DEFAULT ('[]'),
	`termsAndConditions` text NOT NULL DEFAULT (''),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `itineraries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itinerary_days` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itineraryId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`date` varchar(64) NOT NULL DEFAULT '',
	`title` varchar(255) NOT NULL DEFAULT '',
	`description` text NOT NULL DEFAULT (''),
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itinerary_days_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itineraryId` int NOT NULL,
	`dayNumber` int NOT NULL,
	`date` varchar(64) NOT NULL DEFAULT '',
	`breakfast` int NOT NULL DEFAULT 0,
	`lunch` int NOT NULL DEFAULT 0,
	`dinner` int NOT NULL DEFAULT 0,
	CONSTRAINT `meal_plans_id` PRIMARY KEY(`id`)
);
