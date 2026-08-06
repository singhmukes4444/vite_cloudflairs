ALTER TABLE `itineraries` ADD `tripType` varchar(32) DEFAULT 'flight-rt' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalDepartureDate` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `arrivalArrivalDate` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnDepartureDate` varchar(32) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `itineraries` ADD `returnArrivalDate` varchar(32) DEFAULT '' NOT NULL;