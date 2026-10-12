CREATE TABLE `RaceHyousuu` (
	`Id` integer PRIMARY KEY NOT NULL,
	`RaceId` integer NOT NULL,
	`Kakutei` integer NOT NULL,
	`Baken` integer NOT NULL,
	`GoukeiHyousuu` integer,
	`HenkanHyousuu` integer
);
--> statement-breakpoint
CREATE INDEX `IxRaceHyousuu` ON `RaceHyousuu` (`RaceId`);--> statement-breakpoint
ALTER TABLE `OddsHaitou` ADD `Hyousuu` integer;