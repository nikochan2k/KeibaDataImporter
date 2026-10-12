PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Shoyuu` (
	`Id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Kubun` integer NOT NULL,
	`Meishou` text NOT NULL,
	`MatchingKey` text NOT NULL,
	`BanushiKaiCode` integer
);
--> statement-breakpoint
INSERT INTO `__new_Shoyuu`("Id", "Kubun", "Meishou", "MatchingKey", "BanushiKaiCode") SELECT "Id", "Kubun", "Meishou", "MatchingKey", "BanushiKaiCode" FROM `Shoyuu`;--> statement-breakpoint
DROP TABLE `Shoyuu`;--> statement-breakpoint
ALTER TABLE `__new_Shoyuu` RENAME TO `Shoyuu`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `IxShoyuu1` ON `Shoyuu` (`Meishou`);--> statement-breakpoint
CREATE INDEX `IxShoyuu2` ON `Shoyuu` (`MatchingKey`);