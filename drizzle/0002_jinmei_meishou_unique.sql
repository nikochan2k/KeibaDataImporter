DROP INDEX `IxJinmei`;--> statement-breakpoint
CREATE UNIQUE INDEX `IxJinmei1` ON `Jinmei` (`Meishou`);--> statement-breakpoint
CREATE INDEX `IxJinmei2` ON `Jinmei` (`MatchingKey`);