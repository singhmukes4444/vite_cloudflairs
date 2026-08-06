ALTER TABLE `itineraries` ADD `foodPreference` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalType` varchar(16) DEFAULT 'flight' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalFrom` varchar(128) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalTo` varchar(128) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalFlightNo` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalAirline` varchar(128) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalStops` varchar(16) DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalDepartureTime` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalArrivalTime` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnFlightNo` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnAirline` varchar(128) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnStops` varchar(16) DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnDepartureTime` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnArrivalTime` varchar(32) DEFAULT '' NOT NULL;