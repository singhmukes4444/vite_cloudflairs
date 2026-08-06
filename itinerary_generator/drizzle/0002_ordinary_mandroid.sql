ALTER TABLE `itineraries` MODIFY COLUMN `guestNames` text NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` MODIFY COLUMN `inclusions` json;--> statement-breakpoint
ALTER TABLE `itineraries` MODIFY COLUMN `exclusions` json;--> statement-breakpoint
ALTER TABLE `itineraries` MODIFY COLUMN `termsAndConditions` text NOT NULL;--> statement-breakpoint
ALTER TABLE `itinerary_days` MODIFY COLUMN `description` text NOT NULL;