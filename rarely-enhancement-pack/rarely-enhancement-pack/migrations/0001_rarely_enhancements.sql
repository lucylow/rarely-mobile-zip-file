CREATE TABLE IF NOT EXISTS `rarely_sync_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `eventId` VARCHAR(160) NOT NULL,
  `deviceId` VARCHAR(100) NOT NULL,
  `sequence` BIGINT UNSIGNED NOT NULL,
  `kind` VARCHAR(80) NOT NULL,
  `source` VARCHAR(40) NOT NULL,
  `privacy` VARCHAR(24) NOT NULL,
  `title` VARCHAR(160) NULL,
  `metadataJson` JSON NULL,
  `occurredAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `rarely_sync_user_sequence_idx` (`userId`, `sequence`),
  UNIQUE INDEX `rarely_sync_event_id_uidx` (`userId`, `eventId`),
  INDEX `rarely_sync_occurred_at_idx` (`userId`, `occurredAt`)
);
