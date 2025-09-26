CREATE TABLE `twitch` (
	`id` INT(16) NOT NULL AUTO_INCREMENT,
	`Auth` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`Oauth_owner` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`BotAuth` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`Oauth_bot` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`createdDT` DATETIME NULL DEFAULT current_timestamp(),
	`updateDT` DATETIME NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	`Ads` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`Meta` LONGTEXT NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2
;