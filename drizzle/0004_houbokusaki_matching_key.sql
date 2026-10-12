ALTER TABLE `Houbokusaki` ADD `MatchingKey` text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `Houbokusaki` SET `MatchingKey` = `Meishou`;--> statement-breakpoint
CREATE INDEX `IxHoubokusaki2` ON `Houbokusaki` (`MatchingKey`);
