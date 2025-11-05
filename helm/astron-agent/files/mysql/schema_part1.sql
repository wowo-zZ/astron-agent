SELECT 'astron_console DATABASE initialization started' AS '';
CREATE DATABASE IF NOT EXISTS astron_console;

USE astron_console;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for agent_apply_record
-- ----------------------------
DROP TABLE IF EXISTS `agent_apply_record`;
CREATE TABLE `agent_apply_record`
(
    `id`             bigint NOT NULL AUTO_INCREMENT,
    `enterprise_id`  bigint       DEFAULT NULL COMMENT 'Enterprise team ID',
    `space_id`       bigint       DEFAULT NULL COMMENT 'Space ID',
    `apply_uid`      varchar(128) DEFAULT NULL COMMENT 'Applicant UID',
    `apply_nickname` varchar(64)  DEFAULT NULL COMMENT 'Applicant nickname',
    `apply_time`     datetime     DEFAULT NULL COMMENT 'Application time',
    `status`         tinyint      DEFAULT NULL COMMENT 'Application status: 1 pending confirmation, 2 approved, 3 rejected',
    `audit_time`     datetime     DEFAULT NULL COMMENT 'Processing time',
    `audit_uid`      varchar(128) DEFAULT NULL COMMENT 'Processor UID',
    `create_time`    datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`    datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY              `enterprise_id_key` (`enterprise_id`) USING BTREE,
    KEY              `space_id_key` (`space_id`) USING BTREE,
    KEY              `apply_uid_key` (`apply_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Application records for joining space/enterprise';

-- ----------------------------
-- Table structure for agent_enterprise
-- ----------------------------
DROP TABLE IF EXISTS `agent_enterprise`;
CREATE TABLE `agent_enterprise`
(
    `id`           bigint        NOT NULL AUTO_INCREMENT,
    `uid`          varchar(128)  DEFAULT NULL COMMENT 'Creator ID',
    `name`         varchar(50)   DEFAULT NULL COMMENT 'Team name',
    `logo_url`     varchar(1024) DEFAULT NULL COMMENT 'logoURL',
    `avatar_url`   varchar(1024) NOT NULL COMMENT 'Avatar URL',
    `org_id`       bigint        DEFAULT NULL COMMENT 'Organization ID',
    `service_type` tinyint       DEFAULT NULL COMMENT 'Service type: 1 team, 2 enterprise',
    `create_time`  datetime      DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `expire_time`  datetime      DEFAULT NULL COMMENT 'Expiration time',
    `update_time`  datetime      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `deleted`      tinyint       DEFAULT '0' COMMENT 'Is deleted: 0 no, 1 yes',
    PRIMARY KEY (`id`),
    KEY            `enterprise_name_key` (`name`) USING BTREE,
    KEY            `enterprise_uid_key` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Enterprise team';

-- ----------------------------
-- Table structure for agent_enterprise_permission
-- ----------------------------
DROP TABLE IF EXISTS `agent_enterprise_permission`;
CREATE TABLE `agent_enterprise_permission`
(
    `id`                bigint  NOT NULL AUTO_INCREMENT,
    `module`            varchar(50)  DEFAULT NULL COMMENT 'Permission module',
    `description`       varchar(255) DEFAULT NULL COMMENT 'Description',
    `permission_key`    varchar(128)  DEFAULT NULL COMMENT 'Permission unique identifier',
    `officer`           tinyint NOT NULL COMMENT 'Super administrator (has permission): 1 yes, 0 no',
    `governor`          tinyint NOT NULL COMMENT 'Administrator (has permission): 1 yes, 0 no',
    `staff`             tinyint NOT NULL COMMENT 'Member (has permission): 1 yes, 0 no',
    `available_expired` tinyint NOT NULL COMMENT 'Available when expired: 1 yes, 0 no',
    `create_time`       datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`       datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY                 `key_uni_key` (`permission_key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Enterprise team role permission configuration';

-- ----------------------------
-- Records of agent_enterprise_permission
-- ----------------------------
BEGIN;
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (1, 'Team/Enterprise level space management', 'Create space', 'SpaceController_createCorporateSpace_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (3, 'Team/Enterprise level space management', 'Delete space', 'SpaceController_deleteCorporateSpace_DELETE', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (5, 'Team/Enterprise info settings (Team management)', 'Set team/enterprise name', 'EnterpriseController_updateName_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (7, 'Team/Enterprise level space management', 'Edit space info', 'SpaceController_updateCorporateSpace_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (9, 'Team/Enterprise info view', 'View team/enterprise details', 'EnterpriseController_detail_GET', 1, 1, 1, 1,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (13, 'Team/Enterprise level space management', 'Enterprise all spaces', 'SpaceController_corporateList_GET', 1, 1, 1, 1,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (15, 'Team/Enterprise level space management', 'Enterprise my spaces', 'SpaceController_corporateJoinList_GET', 1, 1, 1, 1,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (17, 'Team/Enterprise Info Settings (Team Management)', 'Set team/enterprise LOGO', 'EnterpriseController_updateLogo_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (19, 'Team/Enterprise Info Settings (Team Management)', 'Set team/enterprise avatar', 'EnterpriseController_updateAvatar_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (21, 'Invitation Management', 'Enterprise team invitation list', 'InviteRecordController_enterpriseInviteList_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (23, 'Enterprise Team User Management', 'Team user list', 'EnterpriseUserController_page_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (25, 'Enterprise Team User Management', 'Modify user role', 'EnterpriseUserController_updateRole_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (27, 'Enterprise Team User Management', 'Remove user', 'EnterpriseUserController_remove_DELETE', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (29, 'Invitation Management', 'Invite to join enterprise team', 'InviteRecordController_enterpriseInvite_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (31, 'Invitation Management', 'Enterprise invitation search user', 'InviteRecordController_enterpriseSearchUser_GET', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (33, 'Invitation Management', 'Revoke enterprise invitation', 'InviteRecordController_revokeEnterpriseInvite_POST', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (35, 'Application Management', 'Apply to join enterprise space', 'ApplyRecordController_joinEnterpriseSpace_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (37, 'Enterprise Team User Management', 'Quit enterprise team', 'EnterpriseUserController_quitEnterprise_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (39, 'Enterprise Team User Management', 'Get user limits', 'EnterpriseUserController_getUserLimit_GET', 1, 1, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (41, 'User Rights Query', 'Get team edition non-model resources', 'UserAuthController_getDetailByEnterpriseId_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (43, 'User Rights Query', 'Get team edition package', 'UserAuthController_getTeamOrderMeta_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (45, 'User Rights Query', 'Get team edition model resources', 'UserAuthController_getModelDetailByEnterpriseId_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (47, 'Team/Enterprise Level Space Management', 'Enterprise total space count', 'SpaceController_corporateCount_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (49, 'User Rights Query', 'Get team edition model resources by app ID',
        'UserAuthController_getModelDetailByEnterpriseIdAndAppId_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_enterprise_permission` (`id`, `module`, `description`, `permission_key`, `officer`, `governor`,
                                           `staff`, `available_expired`, `create_time`, `update_time`)
VALUES (51, 'Invitation Management', 'Enterprise invitation batch search user', 'InviteRecordController_enterpriseBatchSearchUser_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `astron_console`.`agent_enterprise_permission` (`module`, `description`, `permission_key`, `officer`, `governor`, `staff`, `available_expired`, `create_time`, `update_time`) VALUES ('Invitation Management', 'Enterprise invitation search username', 'InviteRecordController_enterpriseBatchSearchUsername_POST', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `astron_console`.`agent_enterprise_permission` (`module`, `description`, `permission_key`, `officer`, `governor`, `staff`, `available_expired`, `create_time`, `update_time`) VALUES ('Invitation Management', 'Enterprise invitation batch search username', 'InviteRecordController_enterpriseSearchUsername_GET', 1, 1, 0, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

COMMIT;

-- ----------------------------
-- Table structure for agent_enterprise_user
-- ----------------------------
DROP TABLE IF EXISTS `agent_enterprise_user`;
CREATE TABLE `agent_enterprise_user`
(
    `id`            bigint NOT NULL AUTO_INCREMENT,
    `enterprise_id` bigint       DEFAULT NULL COMMENT 'Team ID',
    `uid`           varchar(128) DEFAULT NULL COMMENT 'User ID',
    `nickname`      varchar(64)  DEFAULT NULL COMMENT 'User nickname',
    `role`          tinyint      DEFAULT NULL COMMENT 'Role: 1 super administrator, 2 administrator, 3 member',
    `create_time`   datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`   datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `enterprise_id_uid_uni_key` (`enterprise_id`,`uid`) USING BTREE,
    KEY             `enterprise_user_uid_key` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Enterprise team users';

-- ----------------------------
-- Table structure for agent_invite_record
-- ----------------------------
DROP TABLE IF EXISTS `agent_invite_record`;
CREATE TABLE `agent_invite_record`
(
    `id`               bigint NOT NULL AUTO_INCREMENT,
    `type`             tinyint      DEFAULT NULL COMMENT 'Invitation type: 1 space, 2 team',
    `space_id`         bigint       DEFAULT NULL COMMENT 'Space ID',
    `enterprise_id`    bigint       DEFAULT NULL COMMENT 'Team ID',
    `invitee_uid`      varchar(128) DEFAULT NULL COMMENT 'Invitee UID',
    `role`             tinyint      DEFAULT NULL COMMENT 'Join role: 1 administrator, 2 member',
    `invitee_nickname` varchar(64)  DEFAULT NULL COMMENT 'Invitee nickname',
    `inviter_uid`      varchar(128) DEFAULT NULL COMMENT 'Inviter UID',
    `expire_time`      datetime     DEFAULT NULL COMMENT 'Expiration time',
    `status`           tinyint      DEFAULT NULL COMMENT 'Status: 1 initial, 2 rejected, 3 joined, 4 revoked, 5 expired',
    `create_time`      datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`      datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY                `invitee_id_key` (`invitee_uid`) USING BTREE,
    KEY                `space_id_key` (`space_id`),
    KEY                `enterprise_id_key` (`enterprise_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Invitation records';

-- ----------------------------
-- Table structure for agent_share_record
-- ----------------------------
DROP TABLE IF EXISTS `agent_share_record`;
CREATE TABLE `agent_share_record`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `uid`         varchar(128) NOT NULL COMMENT 'User ID',
    `base_id`     bigint       NOT NULL COMMENT 'Primary key ID of shared entity',
    `share_key`   varchar(64) DEFAULT '' COMMENT 'Unique identifier for sharing',
    `share_type`  tinyint     DEFAULT '0' COMMENT 'Category: 0 share assistant',
    `is_act`      tinyint     DEFAULT '1' COMMENT 'Is effective: 0 invalid, 1 valid',
    `create_time` datetime    DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY           `idx_uid` (`uid`),
    KEY           `idx_base_id` (`base_id`),
    KEY           `idx_share_key` (`share_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Agent sharing record table';

-- ----------------------------
-- Table structure for agent_space
-- ----------------------------
DROP TABLE IF EXISTS `agent_space`;
CREATE TABLE `agent_space`
(
    `id`            bigint      NOT NULL AUTO_INCREMENT,
    `name`          varchar(50) NOT NULL COMMENT 'Space name',
    `description`   varchar(2000) DEFAULT NULL COMMENT 'Description',
    `avatar_url`    varchar(1024) DEFAULT NULL COMMENT 'Avatar URL',
    `uid`           varchar(128)  DEFAULT NULL COMMENT 'Creator ID',
    `enterprise_id` bigint        DEFAULT NULL COMMENT 'Team ID',
    `type`          tinyint       DEFAULT NULL COMMENT 'Type: 1 free version, 2 professional version, 3 team version, 4 enterprise version',
    `create_time`   datetime      DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`   datetime      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `deleted`       tinyint       DEFAULT '0' COMMENT 'Is deleted: 0 no, 1 yes',
    PRIMARY KEY (`id`),
    KEY             `uid_key` (`uid`),
    KEY             `enterprise_id_key` (`enterprise_id`) USING BTREE,
    KEY             `space_name` (`name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Workspace';

-- ----------------------------
-- Table structure for agent_space_permission
-- ----------------------------
DROP TABLE IF EXISTS `agent_space_permission`;
CREATE TABLE `agent_space_permission`
(
    `id`                bigint  NOT NULL AUTO_INCREMENT,
    `module`            varchar(50)  DEFAULT NULL COMMENT 'Permission module',
    `point`             varchar(50)  DEFAULT NULL COMMENT 'Permission point',
    `description`       varchar(255) DEFAULT NULL COMMENT 'Description',
    `permission_key`    varchar(128)  DEFAULT NULL COMMENT 'Permission unique identifier',
    `owner`             tinyint NOT NULL COMMENT 'Owner (has permission): 1 yes, 0 no',
    `admin`             tinyint NOT NULL COMMENT 'Administrator (has permission): 1 yes, 0 no',
    `member`            tinyint NOT NULL COMMENT 'Member (has permission): 1 yes, 0 no',
    `available_expired` tinyint NOT NULL COMMENT 'Available when expired: 1 yes, 0 no',
    `create_time`       datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`       datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `key_uni_key` (`permission_key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Workspace role permission configuration';

-- ----------------------------
-- Records of agent_space_permission
-- ----------------------------
BEGIN;
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (1, 'Bot Management', 'testPoint', '', 'MyBotController_getCreatedList_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (3, 'Bot Management', 'testPoint', '', 'ChatBotMarketController_botDetail_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (5, 'Bot Management', 'testPoint', '', 'ChatBotController_insert_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (7, 'Bot Management', 'testPoint', '', 'WorkflowController_list_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (9, 'Publishing Management', 'testPoint', '', 'BotController_takeoffBot_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (11, 'Bot Management', 'testPoint', '', 'ShareController_getShareKey_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (13, 'Bot Management', 'testPoint', '', 'ChatBotMarketController_updateMarketBot_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (15, 'Bot Management', 'testPoint', '', 'ChatBotController_update_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (17, 'Bot Management', 'testPoint', '', 'ChatBotController_generateAvatar_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (19, 'Bot Management', 'testPoint', '', 'BotController_copyBot2_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (21, 'Publishing Management', 'testPoint', '', 'ChatBotMarketController_upToBotMarket_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (23, 'Bot Management', 'testPoint', '', 'MyBotController_deleteBot_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (25, 'Space Management', 'Get space details', '', 'SpaceController_detail_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (27, 'Space Management', 'Edit space information', '', 'SpaceController_updatePersonalSpace_POST', 1, 0, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (29, 'Prompt Management', 'testPoint', '', 'PromptManageController_createPrompt_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (31, 'Prompt Management', 'testPoint', '', 'PromptManageController_deletePrompt_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (33, 'Prompt Management', 'testPoint', '', 'PromptManageController_listPrompt_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (35, 'Prompt Management', 'testPoint', '', 'PromptManageController_savePrompt_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (37, 'Prompt Management', 'testPoint', '', 'PromptManageController_createPromptGroup_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (39, 'Prompt Management', 'testPoint', '', 'PromptManageController_getPromptVersionDetail_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (41, 'Prompt Management', 'testPoint', '', 'PromptManageController_commitPrompt_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (43, 'Prompt Management', 'testPoint', '', 'PromptManageController_deletePromptVersion_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (45, 'Prompt Management', 'testPoint', '', 'PromptManageController_revertPrompt_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (47, 'Prompt Management', 'testPoint', '', 'PromptManageController_listPromptVersion_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (49, 'Prompt Management', 'testPoint', '', 'PromptManageController_getPromptDetail_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (51, 'Prompt Management', 'testPoint', '', 'PromptManageController_renamePrompt_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (53, 'Prompt Management', 'testPoint', '', 'ChatMessageController_promptDebug_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (55, 'Bot Management', 'testPoint', '', 'BotDashboardController_details_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (57, 'Publish Management', 'testPoint', '', 'BotV2Controller_botV2Info_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (59, 'Publish Management', 'testPoint', '', 'BotV2Controller_massPublish_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (61, 'Publish Management', 'testPoint', '', 'BotOffiaccountController_getAuthUrl_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (63, 'Publish Management', 'testPoint', '', 'MCPController_publishMCP_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (65, 'test', 'test', '', '', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (71, 'Bot Management', 'testPoint', '', 'ChatMessageController_botDebug_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (73, 'Invite Management', '', '', 'InviteRecordController_spaceInviteList_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (75, 'Application Management', '', '', 'ApplyRecordController_page_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (77, 'Application Management', '', '', 'ApplyRecordController_agreeEnterpriseSpace_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (79, 'Invite Management', '', '', 'InviteRecordController_spaceSearchUser_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (81, 'Space User Management', '', '', 'SpaceUserController_enterpriseAdd_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (83, 'Space User Management', '', '', 'SpaceUserController_updateRole_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (85, 'Application Management', '', '', 'ApplyRecordController_refuseEnterpriseSpace_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (87, 'Space User Management', '', '', 'SpaceUserController_remove_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (89, 'Invite Management', '', '', 'InviteRecordController_spaceInvite_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (91, 'Space User Management', '', '', 'SpaceUserController_page_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (93, 'Invite Management', '', '', 'InviteRecordController_revokeSpaceInvite_POST', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (95, 'Space User Management', '', '', 'SpaceUserController_transferSpace_POST', 1, 0, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (97, 'Space User Management', '', '', 'SpaceUserController_listSpaceMember_GET', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (99, 'Knowledge Base', 'Create Knowledge Base', '', 'RepoController_createRepo_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (101, 'Evaluation Dimension', 'Delete Evaluation Dimension', '', 'EvalDimensionController_deleteDimension_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (103, '', '', '', 'DataBaseController_deleteTable_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (105, 'Evaluation Scenario', 'Edit Evaluation Scenario', '', 'EvalDimensionController_updateScene_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (107, 'Workflow', 'Publish Workflow', '', 'WorkflowController_publish_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (109, '', '', '', 'DataBaseController_createDbTable_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (111, '', '', '', 'ToolBoxController_favorite_GET', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (113, 'Knowledge', 'createKnowledge', '', 'KnowledgeController_createKnowledge_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (115, 'Evaluation Task Retry', 'Evaluation Task Retry', '', 'EvalTaskController_again_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (117, 'Evaluation Object Scenario', 'Evaluation Object', '', 'EvalTaskController_objectList_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (119, 'Evaluation Task Append - Only for Completed Tasks', 'Evaluation Task Append - Only for Completed Tasks', '',
        'EvalTaskController_getEvalReport_GET', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (121, '', '', '', 'ToolBoxController_createTool_POST', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (123, 'Evaluation Task Retry', 'Evaluation Task Retry', '', 'EvalTaskController_stopProgress_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (125, '', '', '', 'DataBaseController_getDbTableInfoList_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (127, 'Evaluation Task Delete', 'Evaluation Task Delete', '', 'EvalTaskController_delete_DELETE', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (129, '', '', '', 'DataBaseController_getDatabaseInfo_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (131, 'Knowledge Base', 'Knowledge Base Simple List', '', 'RepoController_list_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (133, '', '', '', 'DataBaseController_getDbTableList_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (135, 'Create Evaluation Task', 'Create Evaluation Task', '', 'EvalTaskController_create_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (137, '', '', '', 'ToolBoxController_getToolDefaultIcon_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (139, 'Evaluation Dimension', 'Edit Evaluation Dimension', '', 'EvalDimensionController_updateDimension_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (141, '', '', '', 'DataBaseController_copyTable_GET', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (143, 'Evaluation Task Temporary Storage Echo', 'Evaluation Task Temporary Storage Echo', '', 'EvalTaskController_storeTemporary_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (145, 'Model Management', 'Add/Edit Model', '', 'ModelController_validateModel_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (147, 'Knowledge Base', 'Knowledge Base List', '', 'RepoController_listRepos_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (149, '', '', '', 'DataBaseController_deleteDatabase_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (151, 'Knowledge Base', 'Knowledge Base Details', '', 'RepoController_getDetail_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (153, '', '', '', 'DataBaseController_copyDatabase_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (155, '', '', '', 'ToolBoxController_listToolSquare_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (157, 'Create Evaluation Task Temporary Storage', 'Create Evaluation Task Temporary Storage', '', 'EvalTaskController_storeTemporary_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (159, 'Evaluation Scenario', 'Delete Evaluation Scenario', '', 'EvalDimensionController_deleteScene_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (161, '', '', '', 'DataBaseController_createDatabase_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (163, 'Evaluation Task Append Data Echo', 'Evaluation Task Append Data Echo', '', 'EvalTaskController_appendFeedback_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (165, 'Knowledge Base', 'Update Knowledge Base', '', 'RepoController_updateRepo_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (167, 'Knowledge Base', 'Delete Knowledge Base', '', 'RepoController_deleteRepo_DELETE', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (169, '', '', '', 'DataBaseController_selectDatabase_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (171, 'Evaluation Dimension', 'Evaluation Dimension Paged List', '', 'EvalDimensionController_getDimensionPageList_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (173, 'Evaluation Dimension', 'Add Evaluation Dimension', '', 'EvalDimensionController_addScene_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (175, 'Evaluation Set', 'Evaluation Set List', '', 'EvalSetController_list_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (177, '', '', '', 'DataBaseController_importTableData_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (179, '', '', '', 'DataBaseController_updateTable_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (181, '', '', '', 'ToolBoxController_deleteTool_DELETE', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (183, 'Evaluation Set', 'Delete Evaluation Set', '', 'EvalSetController_delete_DELETE', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (185, '', '', '', 'ToolBoxController_listTools_GET', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (187, 'Knowledge', 'updateKnowledge', '', 'KnowledgeController_updateKnowledge_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (189, 'Create Evaluation Task Temporary Storage', 'Create Evaluation Task Temporary Storage', '', 'EvalTaskController_appendTemporary_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (191, 'Evaluation Set', 'Create Evaluation Set', '', 'EvalSetController_create_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (193, 'Knowledge', 'deleteKnowledge', '', 'KnowledgeController_deleteKnowledge_DELETE', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (195, '', '', '', 'ToolBoxController_getToolVersion_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (197, 'Evaluation Task Append - Only for Completed Tasks', 'Evaluation Task Append - Only for Completed Tasks', '',
        'EvalTaskController_append_POST', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (199, 'Knowledge', 'enableKnowledge', '', 'KnowledgeController_enableKnowledge_PUT', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (201, '', '', '', 'DataBaseController_operateTableData_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (203, 'Workflow', 'Add Workflow', '', 'WorkflowController_create_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (205, '', '', '', 'DataBaseController_getTableTemplateFile_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (207, 'Evaluation Scenario', 'Evaluation Scenario List', '', 'EvalDimensionController_getSceneList_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (209, 'Evaluation Set', 'Download Evaluation Set', '', 'EvalSetController_download_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (211, '', '', '', 'ToolBoxController_debugToolV2_POST', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (213, 'File', 'createHtmlFile', '', 'FileController_createHtmlFile_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (215, 'Workflow', 'Edit Workflow', '', 'WorkflowController_update_PUT', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (217, 'File', 'fileIndexingStatus', '', 'FileController_getIndexingStatus_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (219, 'Model Management', 'Model List', '', 'ModelController_list_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (221, 'Evaluation Dimension', 'Evaluation Dimension Total List', '', 'EvalDimensionController_getDimensionList_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (223, 'Evaluation Set', 'Evaluation Set Details', '', 'EvalSetController_get_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (225, 'Evaluation Scenario', 'Add Evaluation Scenario', '', 'EvalDimensionController_addScene_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (227, '', '', '', 'DataBaseController_importDbTableField_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (229, '', '', '', 'DataBaseController_updateDatabase_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (231, 'Knowledge Base', 'Enable Knowledge Base', '', 'RepoController_enableRepo_PUT', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (233, 'Model Management', 'Delete Model', '', 'ModelController_validateModel_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (235, '', '', '', 'ToolBoxController_updateTool_PUT', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (237, 'File', 'File Upload', '', 'FileController_uploadFile_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (239, '', '', '', 'DataBaseController_getDbTableFieldList_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (241, '', '', '', 'ToolBoxController_getToolLatestVersion_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (243, '', '', '', 'DataBaseController_selectTableData_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (245, 'Evaluation Dimension', 'Import Evaluation Dimension', '', 'EvalDimensionController_importEvalDimensionData_POST', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (247, 'Evaluation Task Scenario', 'Evaluation Task List', '', 'EvalTaskController_list_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (249, 'Workflow', 'Workflow Details', '', 'WorkflowController_detail_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (251, '', '', '', 'DataBaseController_exportTableData_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (253, '', '', '', 'ToolBoxController_temporaryTool_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (255, 'Evaluation Dimension', 'Evaluation Dimension List', '', 'EvalDimensionController_getDimension_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (257, 'Evaluation Task Scenario', 'Evaluation Task Single Details', '', 'EvalTaskController_get_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (259, '', '', '', 'ToolBoxController_getDetail_GET', 1, 1, 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (261, 'Space User Management', '', '', 'SpaceUserController_getUserLimit_GET', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (263, 'Workflow', 'Workflow Build', '', 'WorkflowController_build_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (265, 'Space User Management', '', '', 'SpaceUserController_quitSpace_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (267, 'Invite Management', '', '', 'InviteRecordController_spaceSearchUser_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (269, 'Space User Management', '', '', 'SpaceUserController_remove_DELETE', 1, 1, 0, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (271, 'Evaluation Task Scenario', 'Evaluation Task Name Duplicate Check', '', 'EvalTaskController_checkName_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (273, 'Publish API Access Package', 'Publish API Access Package', '', 'UserAuthController_getBindableOrderId_GET', 1, 0, 0, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (275, 'Publish Management', 'testPoint', '', 'MCPController_getMcpContent_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (277, 'Model Management', 'Enable/Disable Model', '', 'ModelController_switchModel_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (278, 'Model Management', 'Add/Edit Local Model', '', 'ModelController_localModel_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (279, 'Model Management', 'Get Model File Directory List', '', 'ModelController_localModelList_GET', 1, 1, 1, 0,
        '2025-01-01 00:00:00', '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (280, 'Invite Management', '', '', 'InviteRecordController_spaceSearchUsername_GET', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (281, 'Agent Details', '', '', 'MyBotController_getBotDetail_POST', 1, 1, 1, 0, '2025-01-01 00:00:00',
        '2025-01-01 00:00:00');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (282, 'Create Bot', '', '', 'BotCreateController_createBot_POST', 1, 1, 1, 0, '2025-08-11 09:19:40',
        '2025-09-20 16:00:44');
INSERT INTO `agent_space_permission` (`id`, `module`, `point`, `description`, `permission_key`, `owner`, `admin`,
                                      `member`, `available_expired`, `create_time`, `update_time`)
VALUES (283, 'Update Bot', '', '', 'BotCreateController_updateBot_POST', 1, 1, 1, 0, '2025-08-11 09:19:40',
        '2025-08-11 09:19:40');
COMMIT;

-- ----------------------------
-- Table structure for agent_space_user
-- ----------------------------
DROP TABLE IF EXISTS `agent_space_user`;
CREATE TABLE `agent_space_user`
(
    `id`              bigint       NOT NULL AUTO_INCREMENT,
    `space_id`        bigint       NOT NULL COMMENT 'Space ID',
    `uid`             varchar(128) NOT NULL COMMENT 'User ID',
    `nickname`        varchar(64) DEFAULT NULL COMMENT 'User nickname',
    `role`            tinyint      NOT NULL COMMENT 'Role: 1 owner, 2 administrator, 3 member',
    `last_visit_time` datetime    DEFAULT NULL COMMENT 'Last visit time',
    `create_time`     datetime    DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`     datetime    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `space_id_uid_uni_key` (`space_id`,`uid`) USING BTREE,
    KEY               `space_user_uid_key` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Workspace users';

-- ----------------------------
-- Table structure for ai_prompt_template
-- ----------------------------
DROP TABLE IF EXISTS `ai_prompt_template`;
CREATE TABLE `ai_prompt_template`
(
    `id`             bigint                                                        NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
    `prompt_key`     varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Prompt unique identifier',
    `language_code`  varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci  NOT NULL COMMENT 'Language code: zh_CN/en_US',
    `prompt_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Prompt template content',
    `is_active`      tinyint(1) DEFAULT '1' COMMENT 'Is active (0-disabled, 1-enabled)',
    `created_time`   datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
    `updated_time`   datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Updated time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_prompt_key_lang` (`prompt_key`,`language_code`),
    KEY              `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI prompt template table';

BEGIN;
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(1, 'avatar_generation', 'zh', '请为名为"%s"的AI助手生成专业头像。助手描述：%s。要求：简洁现代风格，适合商务场景。', 1, '2025-09-20 11:37:51', '2025-09-20 11:41:22');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(2, 'avatar_generation', 'en', 'Please generate a professional avatar for an AI assistant named "%s". Assistant
  description: %s. Requirements: simple and modern style, suitable for business scenarios.', 1, '2025-09-20 11:37:51', '2025-09-20 11:41:22');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(3, 'prologue_generation', 'zh', '请根据给定的助手名称，在100字内生成智能助手简介，准确专业，用于作为助手的宣传文
  本，向用户展示其能力。%n助手名称：%s。%n请直接返回简介，不要添加其他无关语句', 1, '2025-09-20 11:37:51', '2025-09-20 11:41:22');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(4, 'prologue_generation', 'en', 'Please generate an intelligent agent profile within 100 words based on the given
   agent name, accurate and professional, to be used as promotional text for the agent to showcase its capabilities
  to users.%nAgent name: %s.%nReturn the profile directly without adding other irrelevant statements', 1, '2025-09-20 11:37:51', '2025-09-20 11:41:22');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(5, 'sentence_bot_generation', 'zh', '你是一个助手配置生成专家。请根据输入信息理解用户意图，合理准确处理用户输入，生成以下字段内容：助手名称、助手分类
  、助手描述(不超过100字)、角色设定、目标任务、需求描述、输入示例。其中输入示例字段需要提供三个具体示例，助手分类必须从【工作、学
  习、写作、编程、生活、健康】中选择。返回结果必须严格按照以下格式：%n助手名称：xxxx%n助手分类：xx%n助手描述：xxxxx%
  n角色设定：xxxxx%n目标任务：xxxxxxxx%n需求描述：xxxxxx%n输入示例：xxxxxxx||xxxxxxx||xxxxxxx%n用户输入为：%s', 1, '2025-09-20 11:37:51', '2025-09-20 11:41:23');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(6, 'sentence_bot_generation', 'en', 'You are an assistant configuration generation expert. Please understand the
  user''s intent based on the input information, process the user input appropriately and accurately, and generate
  content for the following fields: assistant name, assistant category, assistant description, role setting, target
  task, requirement description, and input examples. The input examples field should provide three specific
  examples, and the assistant category must be selected from [Workplace, Learning, Writing, Programming, Lifestyle,
  Health]. The returned result must strictly follow the format below:%nAssistant Name: xxxx%nAssistant Category:
  xx%nAssistant Description: xxxxx%nRole Setting: xxxxx%nTarget Task: xxxxxxxx%nRequirement Description:
  xxxxxx%nInput Examples: xxxxxxx||xxxxxxx||xxxxxxx%nThe user input is: %s', 1, '2025-09-20 11:37:51', '2025-09-20 11:41:23');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(8, 'field_mappings', 'en', '{
        "assistant_name": ["Assistant Name:", "助手名称："],
        "assistant_category": ["Assistant Category:", "助手分类："],
        "assistant_description": ["Assistant Description:", "助手描述："],
        "role_setting": ["Role Setting:", "角色设定："],
        "target_task": ["Target Task:", "目标任务："],
        "requirement_description": ["Requirement Description:", "需求描述："],
        "input_examples": ["Input Examples:", "输入示例："]
    }', 1, '2025-09-20 12:59:28', '2025-09-20 12:59:28');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(10, 'bot_type_mappings', 'en', '{
    "Workplace": 10,
    "Learning": 13,
    "Writing": 14,
    "Programming": 15,
    "Lifestyle": 17,
    "Health": 39,
    "Other": 24,
    "职场": 10,
    "学习": 13,
    "创作": 14,
    "编程": 15,
    "生活": 17,
    "健康": 39,
    "其他": 24
}', 1, '2025-09-20 12:59:49', '2025-09-20 15:01:53');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(11, 'prompt_struct_labels', 'zh', '{
        "role_setting": "角色设定",
        "target_task": "目标任务",
        "requirement_description": "需求描述"
    }', 1, '2025-09-20 12:59:53', '2025-09-20 12:59:53');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(12, 'prompt_struct_labels', 'en', '{
        "role_setting": "Role Setting",
        "target_task": "Target Task",
        "requirement_description": "Requirement Description"
    }', 1, '2025-09-20 12:59:57', '2025-09-20 12:59:57');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(13, 'input_example_generation', 'zh', '
  助手名称如下:

  {{%s}}

  助手描述如下:

  {{%s}}

  助手指令如下:

  {{%s}}

  注意：
  助手是将指令模板与用户输入的详细信息共同输送给大模型从而让大模型完成特定任务的应用；助手描述是描述这个助手要完成的功能
  任务以及用户需要输入什么内容才能更好的实现任务；助手指令是助手给到大模型的指令模板，指令模板与用户输入的详细信息任务共
  同送给大模型，从而让大模型完成助手任务。

  请按照如下步骤进行处理:
  1.仔细阅读助手名称、助手描述、助手指令，理解它们需要大模型完成的任务；
  2.基于上述内容，生成三条作为这个助手的使用用户，需要输入的简短任务描述；
  3.保证返回的内容与助手的任务相匹配且不重复；
  4.任务描述的内容尽量具体，不要只是表达维度；
  5.按行返回你的结果，每条描述一行；
  6.每条描述的长度不要超过20个汉字；【非常重要！！】
  7.切忌啰嗦，言简意赅，用短语表达！！！

  确保返回的三条用户输入的详细任务描述要符合使用助手的要求。
  按照如下格式返回结果:
  1.context1
  2.context2
  3.context3
  ', 1, '2025-09-30 11:24:14', '2025-09-30 11:24:14');
INSERT INTO astron_console.ai_prompt_template
(id, prompt_key, language_code, prompt_content, is_active, created_time, updated_time)
VALUES(14, 'input_example_generation', 'en', '
  Assistant name as follows:

  {{%s}}

  Assistant description as follows:

  {{%s}}

  Assistant instructions as follows:

  {{%s}}

  Note:
  An assistant is an application that sends the instruction template together with the user''s detailed input to
  the large model to complete a specific task. The assistant description states what the assistant should accomplish
  and what the user needs to provide. The assistant instructions are the instruction template sent to the model; the
  template plus the user''s detailed input are used to complete the task.

  Please follow these steps:

  1. Carefully read the assistant name, assistant description, and assistant instructions to understand the intended
  task.
  2. Based on the above, generate three short task descriptions that a user would input when using this assistant.
  3. Ensure the outputs match the assistant task and do not repeat each other.
  4. Be specific; avoid vague dimensions only.
  5. Return your results line by line, one description per line.
  6. Each description must be no more than 20 words. [VERY IMPORTANT!!]
  7. Be concise and avoid verbosity; use short phrases.

  Ensure the three user input task descriptions are appropriate for this assistant.
  Return results in the following format:
  1.context1
  2.context2
  3.context3
  ', 1, '2025-09-30 13:31:59', '2025-09-30 13:31:59');
COMMIT;

-- ----------------------------
-- Table structure for application_form
-- ----------------------------
DROP TABLE IF EXISTS `application_form`;
CREATE TABLE `application_form`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
    `nickname`    varchar(255) NOT NULL COMMENT 'User nickname',
    `mobile`      varchar(255) NOT NULL COMMENT 'Mobile number',
    `bot_name`    varchar(255) NOT NULL COMMENT 'Assistant name',
    `bot_id`      bigint       NOT NULL COMMENT 'Assistant ID',
    `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    PRIMARY KEY (`id`),
    KEY           `idx_bot_id` (`bot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for auth_apply_record
-- ----------------------------
DROP TABLE IF EXISTS `auth_apply_record`;
CREATE TABLE `auth_apply_record`
(
    `id`            int NOT NULL AUTO_INCREMENT,
    `app_id`        varchar(128) DEFAULT NULL,
    `domain`        varchar(255) DEFAULT NULL,
    `content`       text,
    `create_time`   datetime     DEFAULT NULL,
    `uid`           varchar(128) DEFAULT NULL,
    `channel`       varchar(255) DEFAULT NULL,
    `patch_id`      varchar(128) DEFAULT NULL,
    `auto_auth`     bit(1)       DEFAULT NULL,
    `auth_order_id` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for base_model_map
-- ----------------------------
DROP TABLE IF EXISTS `base_model_map`;
CREATE TABLE `base_model_map`
(
    `id`              int unsigned NOT NULL AUTO_INCREMENT,
    `create_time`     datetime NOT NULL                                             DEFAULT CURRENT_TIMESTAMP,
    `domain`          varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `base_model_id`   bigint                                                        DEFAULT NULL,
    `base_model_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for bot_chat_file_param
-- ----------------------------
DROP TABLE IF EXISTS `bot_chat_file_param`;
CREATE TABLE `bot_chat_file_param`
(
    `id`          bigint                                                        NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
    `uid`         varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'User ID',
    `chat_id`     bigint                                                        NOT NULL COMMENT 'Chat ID',
    `name`        varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Parameter name',
    `file_ids`    json     DEFAULT NULL COMMENT 'File ID list',
    `file_urls`   json     DEFAULT NULL COMMENT 'File URL list',
    `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `is_delete`   tinyint  DEFAULT '0' COMMENT 'Whether deleted: 0 not deleted, 1 deleted',
    PRIMARY KEY (`id`),
    KEY           `idx_uid` (`uid`),
    KEY           `idx_chat_id` (`chat_id`),
    KEY           `idx_name` (`name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot chat file parameter info table';

-- ----------------------------
-- Table structure for bot_conversation_stats
-- ----------------------------
DROP TABLE IF EXISTS `bot_conversation_stats`;
CREATE TABLE `bot_conversation_stats`
(
    `id`                bigint                                                        NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
    `uid`               varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'User ID',
    `space_id`          bigint                                                                 DEFAULT NULL COMMENT 'Space ID, NULL for personal agents',
    `bot_id`            int                                                           NOT NULL COMMENT 'Agent ID',
    `chat_id`           bigint                                                        NOT NULL COMMENT 'Conversation ID',
    `sid`               varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci          DEFAULT NULL COMMENT 'Session identifier',
    `token_consumed`    int                                                           NOT NULL DEFAULT '0' COMMENT 'Token count consumed in this conversation',
    `conversation_date` date                                                          NOT NULL COMMENT 'Conversation date',
    `create_time`       datetime                                                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `is_delete`         tinyint                                                       NOT NULL DEFAULT '0' COMMENT 'Whether deleted: 0=not deleted, 1=deleted',
    PRIMARY KEY (`id`),
    KEY                 `idx_bot_id_date` (`bot_id`,`conversation_date`),
    KEY                 `idx_uid_bot_id` (`uid`,`bot_id`),
    KEY                 `idx_space_id_bot_id` (`space_id`,`bot_id`),
    KEY                 `idx_chat_id` (`chat_id`),
    KEY                 `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot conversation statistics table';

-- ----------------------------
-- Table structure for bot_dataset
-- ----------------------------
DROP TABLE IF EXISTS `bot_dataset`;
CREATE TABLE `bot_dataset`
(
    `id`            bigint NOT NULL AUTO_INCREMENT,
    `bot_id`        bigint NOT NULL COMMENT 'Corresponding primary key ID of chat_bot_base table',
    `dataset_id`    bigint       DEFAULT NULL COMMENT 'Primary key ID of dataset_info table',
    `dataset_index` varchar(255) DEFAULT NULL COMMENT 'Knowledge database dataset ID',
    `is_act`        tinyint      DEFAULT '1' COMMENT 'Whether effective: 0 inactive, 1 active, 2 under review after market update',
    `create_time`   datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`   datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `uid`           varchar(128) DEFAULT NULL COMMENT 'User ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_id_bot_id` (`id`,`bot_id`),
    KEY             `idx_uid` (`uid`),
    KEY             `idx_is_act` (`is_act`),
    KEY             `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot associated dataset index table';

-- ----------------------------
-- Table structure for bot_dataset_maas
-- ----------------------------
DROP TABLE IF EXISTS `bot_dataset_maas`;
CREATE TABLE `bot_dataset_maas`
(
    `id`            bigint NOT NULL AUTO_INCREMENT,
    `bot_id`        bigint NOT NULL COMMENT 'Corresponding primary key ID of chat_bot_base table',
    `dataset_id`    bigint       DEFAULT NULL COMMENT 'Primary key ID of dataset_info table',
    `dataset_index` varchar(255) DEFAULT NULL COMMENT 'Knowledge database dataset ID',
    `is_act`        tinyint      DEFAULT '1' COMMENT 'Whether effective: 0 inactive, 1 active, 2 under review after market update',
    `create_time`   datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`   datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `uid`           varchar(128) DEFAULT NULL COMMENT 'User ID',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_id_bot_id` (`id`,`bot_id`),
    KEY             `idx_uid` (`uid`),
    KEY             `idx_is_act` (`is_act`),
    KEY             `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot associated maas dataset index table';

-- ----------------------------
-- Table structure for bot_favorite
-- ----------------------------
DROP TABLE IF EXISTS `bot_favorite`;
CREATE TABLE `bot_favorite`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `uid`         varchar(128) NOT NULL,
    `bot_id`      int          NOT NULL,
    `create_time` datetime DEFAULT NULL,
    `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY           `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot favorites';

-- ----------------------------
-- Table structure for bot_flow_rel
-- ----------------------------
DROP TABLE IF EXISTS `bot_flow_rel`;
CREATE TABLE `bot_flow_rel`
(
    `id`          int unsigned NOT NULL AUTO_INCREMENT,
    `create_time` datetime     DEFAULT CURRENT_TIMESTAMP,
    `flow_id`     varchar(255) DEFAULT NULL,
    `bot_id`      bigint       DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for bot_model_bind
-- ----------------------------
DROP TABLE IF EXISTS `bot_model_bind`;
CREATE TABLE `bot_model_bind`
(
    `id`             bigint       NOT NULL AUTO_INCREMENT,
    `uid`            varchar(128) NOT NULL,
    `bot_id`         bigint                DEFAULT NULL,
    `app_id`         varchar(255) NOT NULL,
    `llm_service_id` varchar(255) NOT NULL,
    `domain`         varchar(255) NOT NULL,
    `patch_id`       varchar(255) NOT NULL DEFAULT '0',
    `model_name`     varchar(255)          DEFAULT NULL,
    `create_time`    datetime              DEFAULT NULL,
    `model_type`     tinyint               DEFAULT '1',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `bot_id` (`bot_id`,`app_id`(191),`llm_service_id`(191),`domain`(191),`patch_id`(191)) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for bot_model_config
-- ----------------------------
DROP TABLE IF EXISTS `bot_model_config`;
CREATE TABLE `bot_model_config`
(
    `id`           bigint NOT NULL AUTO_INCREMENT,
    `bot_id`       bigint NOT NULL COMMENT 'Bot ID',
    `model_config` text   NOT NULL COMMENT 'Model configuration',
    `create_time`  datetime DEFAULT NULL,
    `update_time`  datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for bot_offiaccount
-- ----------------------------
DROP TABLE IF EXISTS `bot_offiaccount`;
CREATE TABLE `bot_offiaccount`
(
    `id`           bigint NOT NULL AUTO_INCREMENT,
    `uid`          varchar(128) DEFAULT NULL COMMENT 'User ID',
    `bot_id`       bigint       DEFAULT NULL COMMENT 'Assistant ID',
    `appid`        varchar(100) DEFAULT NULL COMMENT 'WeChat official account app ID',
    `release_type` tinyint      DEFAULT '1' COMMENT 'Release type: 1 WeChat official account',
    `status`       tinyint      DEFAULT '0' COMMENT 'Binding status: 0-unbound, 1-bound, 2-unbound',
    `create_time`  datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`  datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY            `bot_id_index` (`bot_id`),
    KEY            `uid_index` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot and WeChat Official Account binding information';

-- ----------------------------
-- Table structure for bot_offiaccount_chat
-- ----------------------------
DROP TABLE IF EXISTS `bot_offiaccount_chat`;
CREATE TABLE `bot_offiaccount_chat`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `app_id`      varchar(64) DEFAULT NULL COMMENT 'WeChat official account app ID',
    `open_id`     varchar(64) DEFAULT NULL COMMENT 'User ID who followed WeChat official account',
    `msg_id`      bigint      DEFAULT NULL COMMENT 'WeChat message ID, equivalent to req_id',
    `req`         text COMMENT 'Message sent by user',
    `resp`        text COMMENT 'Message returned by large model',
    `sid`         varchar(64) DEFAULT NULL COMMENT 'Session identifier',
    `create_time` datetime    DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY           `index_app_id` (`app_id`),
    KEY           `index_open_id` (`open_id`),
    KEY           `index_msg_id` (`msg_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='WeChat Official Account Q&A record table';

-- ----------------------------
-- Table structure for bot_offiaccount_record
-- ----------------------------
DROP TABLE IF EXISTS `bot_offiaccount_record`;
CREATE TABLE `bot_offiaccount_record`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `bot_id`      bigint       DEFAULT NULL COMMENT 'Assistant ID',
    `appid`       varchar(100) DEFAULT NULL COMMENT 'WeChat official account app ID',
    `auth_type`   tinyint      DEFAULT NULL COMMENT 'Operation type: 1 bind, 2 unbind',
    `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY           `appid_index` (`appid`),
    KEY           `bot_id_index` (`bot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot publishing operation record table';

-- ----------------------------
-- Table structure for bot_repo_rel
-- ----------------------------
DROP TABLE IF EXISTS `bot_repo_rel`;
CREATE TABLE `bot_repo_rel`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `bot_id`      bigint       NOT NULL COMMENT 'Bot ID',
    `app_id`      varchar(64)  NOT NULL COMMENT 'App ID',
    `repo_id`     varchar(200) NOT NULL COMMENT 'Repo ID',
    `file_ids`    varchar(500) DEFAULT NULL COMMENT 'File list',
    `create_time` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for bot_tool_rel
-- ----------------------------
DROP TABLE IF EXISTS `bot_tool_rel`;
CREATE TABLE `bot_tool_rel`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `bot_id`      bigint       NOT NULL COMMENT 'Bot ID',
    `tool_id`     varchar(100) NOT NULL COMMENT 'Tool ID',
    `create_time` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for bot_type_list
-- ----------------------------
DROP TABLE IF EXISTS `bot_type_list`;
CREATE TABLE `bot_type_list`
(
    `id`           int NOT NULL AUTO_INCREMENT COMMENT 'Non-business primary key',
    `type_key`     int          DEFAULT NULL COMMENT 'Assistant type code',
    `type_name`    varchar(255) DEFAULT NULL COMMENT 'Assistant type name',
    `order_num`    int          DEFAULT '0' COMMENT 'Sort order number',
    `show_index`   tinyint      DEFAULT '0' COMMENT 'Whether recommended: 1 recommended, 0 not recommended',
    `is_act`       tinyint      DEFAULT '1' COMMENT 'Enable status: 0 disabled, 1 enabled',
    `create_time`  datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`  datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `icon`         varchar(500) DEFAULT '' COMMENT 'Icon URL',
    `type_name_en` varchar(128) DEFAULT NULL COMMENT 'Assistant type English name',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot type mapping table';
BEGIN;
INSERT INTO astron_console.bot_type_list
(id, type_key, type_name, order_num, show_index, is_act, create_time, update_time, icon, type_name_en)
VALUES(4, 10, '工作', 10, 1, 1, '2025-09-20 15:16:15', '2025-09-20 15:16:15', '', 'Workplace');
INSERT INTO astron_console.bot_type_list
(id, type_key, type_name, order_num, show_index, is_act, create_time, update_time, icon, type_name_en)
VALUES(5, 13, '学习', 20, 1, 1, '2025-09-20 15:16:15', '2025-09-20 15:16:15', '', 'Learning');
INSERT INTO astron_console.bot_type_list
(id, type_key, type_name, order_num, show_index, is_act, create_time, update_time, icon, type_name_en)
VALUES(6, 14, '写作', 30, 1, 1, '2025-09-20 15:16:15', '2025-09-20 15:16:15', '', 'Writing');
INSERT INTO astron_console.bot_type_list
(id, type_key, type_name, order_num, show_index, is_act, create_time, update_time, icon, type_name_en)
VALUES(7, 15, '编程', 40, 1, 1, '2025-09-20 15:16:15', '2025-09-20 15:16:15', '', 'Programming');
INSERT INTO astron_console.bot_type_list
(id, type_key, type_name, order_num, show_index, is_act, create_time, update_time, icon, type_name_en)
VALUES(8, 17, '生活', 50, 1, 1, '2025-09-20 15:16:15', '2025-09-20 15:16:15', '', 'Lifestyle');
INSERT INTO astron_console.bot_type_list
(id, type_key, type_name, order_num, show_index, is_act, create_time, update_time, icon, type_name_en)
VALUES(9, 39, '健康', 60, 1, 1, '2025-09-20 15:16:15', '2025-09-20 15:16:15', '', 'Health');
INSERT INTO astron_console.bot_type_list
(id, type_key, type_name, order_num, show_index, is_act, create_time, update_time, icon, type_name_en)
VALUES(10, 24, '其他', 100, 0, 1, '2025-09-20 15:16:15', '2025-09-20 15:16:15', '', 'Other');
COMMIT;

-- ----------------------------
-- Table structure for call_log
-- ----------------------------
DROP TABLE IF EXISTS `call_log`;
CREATE TABLE `call_log`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `sid`         varchar(255) DEFAULT NULL,
    `req`         text,
    `resp`        text,
    `create_time` datetime     DEFAULT NULL,
    `type`        varchar(255) DEFAULT NULL,
    `url`         varchar(512) DEFAULT NULL,
    `method`      varchar(64)  DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for chat_bot_api
-- ----------------------------
DROP TABLE IF EXISTS `chat_bot_api`;
CREATE TABLE `chat_bot_api`
(
    `id`           bigint        NOT NULL AUTO_INCREMENT,
    `uid`          varchar(128)  NOT NULL COMMENT 'User ID',
    `bot_id`       int           NOT NULL COMMENT 'Assistant ID',
    `assistant_id` varchar(32)   NOT NULL COMMENT 'Engineering assistant ID',
    `app_id`       varchar(32)  DEFAULT NULL COMMENT 'App ID associated with assistant API capability',
    `api_secret`   varchar(64)   NOT NULL COMMENT 'API secret',
    `api_key`      varchar(64)   NOT NULL COMMENT 'API key',
    `api_path`     varchar(32)   NOT NULL COMMENT 'Path of assistant API capability',
    `prompt`       varchar(2048) NOT NULL COMMENT 'Prompt of assistant API capability',
    `plugin_id`    varchar(256)  NOT NULL COMMENT 'Plugin ID, multiple separated by commas',
    `embedding_id` varchar(256)  NOT NULL COMMENT 'Embedding ID, multiple separated by commas',
    `description`  varchar(256) DEFAULT NULL COMMENT 'Description',
    `create_time`  datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`  datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_assistant_id` (`assistant_id`),
    KEY            `idx_bot_id` (`bot_id`),
    KEY            `idx_uid` (`uid`),
    KEY            `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot API capability information table';

-- ----------------------------
-- Table structure for chat_bot_base
-- ----------------------------
DROP TABLE IF EXISTS `chat_bot_base`;
CREATE TABLE `chat_bot_base`
(
    `id`                int     NOT NULL AUTO_INCREMENT COMMENT 'bot_id',
    `uid`               varchar(128)     DEFAULT NULL COMMENT 'User ID',
    `bot_name`          varchar(48)      DEFAULT NULL COMMENT 'Bot name',
    `bot_type`          tinyint          DEFAULT NULL COMMENT 'Bot type: 1 custom assistant, 2 life assistant, 3 workplace assistant, 4 marketing assistant, 5 writing expert, 6 knowledge expert',
    `avatar`            varchar(1024)    DEFAULT NULL COMMENT 'Bot avatar',
    `pc_background`     varchar(512)     DEFAULT '' COMMENT 'PC chat background image',
    `app_background`    varchar(512)     DEFAULT '' COMMENT 'Mobile chat background image',
    `background_color`  tinyint          DEFAULT '0' COMMENT 'Background color depth: 0 light, 1 dark',
    `prompt`            varchar(2048)    DEFAULT NULL COMMENT 'bot_prompt',
    `prologue`          varchar(512)     DEFAULT NULL COMMENT 'Opening words',
    `bot_desc`          varchar(255)     DEFAULT NULL COMMENT 'Bot description',
    `is_delete`         tinyint          DEFAULT '0' COMMENT 'Whether deleted: 0 not deleted, 1 deleted',
    `create_time`       datetime         DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`       datetime         DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `support_context`   tinyint NOT NULL DEFAULT '0' COMMENT 'Whether supports multi-turn dialogue: 1 support, 0 not support',
    `bot_template`      varchar(255)     DEFAULT '' COMMENT 'Input template',
    `prompt_type`       tinyint unsigned NOT NULL DEFAULT '0' COMMENT 'Instruction type: 0 regular (custom instruction), 1 structured instruction',
    `input_example`     varchar(600)     DEFAULT '' COMMENT 'Input example',
    `botweb_status`     tinyint NOT NULL DEFAULT '0' COMMENT 'Whether to enable standalone assistant application: 0 disabled, 1 enabled',
    `version`           int              DEFAULT '1' COMMENT 'Assistant version number',
    `support_document`  tinyint          DEFAULT '0' COMMENT 'Whether supports files: 0 not support, 1 strictly based on document, 2 can give divergent answers',
    `support_system`    tinyint          DEFAULT '0' COMMENT 'Whether supports system instruction: 0 not support, 1 support',
    `prompt_system`     tinyint          DEFAULT '0' COMMENT 'System instruction status',
    `support_upload`    tinyint NOT NULL DEFAULT '0' COMMENT 'Whether supports document upload: 0 not support, 1 support',
    `bot_name_en`       varchar(48)      DEFAULT NULL COMMENT 'Assistant name English version',
    `bot_desc_en`       varchar(500)     DEFAULT NULL COMMENT 'Assistant description English version',
    `client_type`       tinyint NOT NULL DEFAULT '0' COMMENT 'Client type',
    `vcn_cn`            varchar(32)      DEFAULT NULL COMMENT 'Chinese voice actor',
    `vcn_en`            varchar(32)      DEFAULT NULL COMMENT 'English voice actor',
    `vcn_speed`         tinyint NOT NULL DEFAULT '50' COMMENT 'Voice actor speed',
    `is_sentence`       tinyint NOT NULL DEFAULT '0' COMMENT 'Whether generated in one sentence: 0 no, 1 yes',
    `opened_tool`       varchar(128)     DEFAULT 'ifly_search,text_to_image,codeinterpreter' COMMENT 'Enabled tools, concatenated with commas',
    `client_hide`       varchar(10)      DEFAULT '' COMMENT 'Hidden on some clients',
    `virtual_bot_type`  tinyint          DEFAULT NULL COMMENT 'Virtual personality type',
    `virtual_agent_id`  bigint           DEFAULT NULL COMMENT 'Primary key of virtual_agent_list',
    `style`             int              DEFAULT NULL COMMENT 'Style type: 0 original, 1 business elite, 2 casual moment',
    `background`        varchar(512)     DEFAULT NULL COMMENT 'Background setting',
    `virtual_character` varchar(512)     DEFAULT NULL COMMENT 'Character setting',
    `model`             varchar(32)      DEFAULT 'spark' COMMENT 'Model selected by assistant',
    `maas_bot_id`       varchar(50)      DEFAULT NULL COMMENT 'maas_bot_id',
    `prologue_en`       varchar(1024)    DEFAULT NULL COMMENT 'Opening words - English',
    `input_example_en`  varchar(1024)    DEFAULT NULL COMMENT 'Recommended questions - English',
    `space_id`          bigint           DEFAULT NULL COMMENT 'Space ID',
    `model_id`          bigint           DEFAULT NULL COMMENT 'Custom model ID',
    PRIMARY KEY (`id`),
    KEY                 `idx_create_time` (`create_time`),
    KEY                 `idx_support_context` (`support_context`),
    KEY                 `idx_uid` (`uid`),
    KEY                 `idx_botweb_status` (`botweb_status`),
    KEY                 `idx_space_id` (`space_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User created bot table';

-- ----------------------------
-- Table structure for chat_bot_list
-- ----------------------------
DROP TABLE IF EXISTS `chat_bot_list`;
CREATE TABLE `chat_bot_list`
(
    `id`              int     NOT NULL AUTO_INCREMENT,
    `uid`             varchar(128)     DEFAULT NULL COMMENT 'User ID',
    `market_bot_id`   int              DEFAULT '0' COMMENT 'Market bot ID, 0 for original, other values for referencing other users bots',
    `real_bot_id`     int              DEFAULT '0' COMMENT 'Self-created assistant is 0, only when adding others assistants from market, the original bot_id is added',
    `name`            varchar(48)      DEFAULT NULL COMMENT 'Bot name',
    `bot_type`        tinyint          DEFAULT '1' COMMENT 'Bot type: 1 custom assistant, 2 life assistant, 3 workplace assistant, 4 marketing assistant, 5 writing expert, 6 knowledge expert',
    `avatar`          varchar(1024)    DEFAULT NULL COMMENT 'Bot avatar',
    `prompt`          varchar(2048)    DEFAULT NULL COMMENT 'bot_prompt',
    `bot_desc`        varchar(255)     DEFAULT NULL COMMENT 'Bot description',
    `is_act`          tinyint          DEFAULT '1' COMMENT 'Whether enabled: 0 disabled, 1 enabled',
    `create_time`     datetime         DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`     datetime         DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `support_context` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether supports multi-turn dialogue: 1 support, 0 not support',
    PRIMARY KEY (`id`),
    KEY               `idx_act` (`is_act`),
    KEY               `idx_create_time2` (`create_time`),
    KEY               `idx_real_bot_id` (`real_bot_id`),
    KEY               `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User added bot table';

-- ----------------------------
-- Table structure for chat_bot_market
-- ----------------------------
DROP TABLE IF EXISTS `chat_bot_market`;
CREATE TABLE `chat_bot_market`
(
    `id`               int     NOT NULL AUTO_INCREMENT,
    `bot_id`           int                                                          DEFAULT NULL COMMENT 'botId',
    `uid`              varchar(128)                                                 DEFAULT NULL COMMENT 'Publisher UID',
    `bot_name`         varchar(48)                                                  DEFAULT NULL COMMENT 'Bot name, this is a copy, original is with creator',
    `bot_type`         tinyint                                                      DEFAULT '1' COMMENT 'Bot type: 1 custom assistant, 2 life assistant, 3 workplace assistant, 4 marketing assistant, 5 writing expert, 6 knowledge expert',
    `avatar`           varchar(1024)                                                DEFAULT NULL COMMENT 'Bot avatar',
    `pc_background`    varchar(512)                                                 DEFAULT '' COMMENT 'PC chat background image',
    `app_background`   varchar(512)                                                 DEFAULT '' COMMENT 'Mobile chat background image',
    `background_color` tinyint                                                      DEFAULT '0' COMMENT 'Background color depth: 0 light, 1 dark',
    `prompt`           varchar(2048)                                                DEFAULT NULL COMMENT 'bot_prompt',
    `prologue`         varchar(512)                                                 DEFAULT NULL COMMENT 'Opening words',
    `show_others`      tinyint                                                      DEFAULT NULL COMMENT 'Whether to show prompt to others: 1 show, 0 not show',
    `bot_desc`         varchar(255)                                                 DEFAULT NULL COMMENT 'Bot description',
    `bot_status`       tinyint                                                      DEFAULT '1' COMMENT 'Bot status: 0 delisted, 1 under review, 2 approved, 3 rejected, 4 modification under review (to be displayed)',
    `block_reason`     varchar(255)                                                 DEFAULT NULL COMMENT 'Reason for rejection',
    `hot_num`          int                                                          DEFAULT '0' COMMENT 'Popularity, customizable size for sorting',
    `is_delete`        tinyint                                                      DEFAULT '0' COMMENT 'Application history: 0 not deleted, 1 deleted',
    `show_index`       tinyint                                                      DEFAULT '0' COMMENT 'Whether to display on homepage recommendation: 0 not display, 1 display',
    `sort_hot`         int                                                          DEFAULT '0' COMMENT 'Manually set hottest bot position',
    `sort_latest`      int                                                          DEFAULT '0' COMMENT 'Manually set latest bot position',
    `audit_time`       datetime                                                     DEFAULT NULL COMMENT 'Review time',
    `create_time`      datetime                                                     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`      datetime                                                     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `support_context`  tinyint NOT NULL                                             DEFAULT '0' COMMENT 'Whether supports multi-turn dialogue: 1 support, 0 not support',
    `version`          int                                                          DEFAULT '1' COMMENT 'Corresponding large model version, 13, 65, unit: billion',
    `show_weight`      int                                                          DEFAULT '1' COMMENT 'Homepage recommended assistant weight, larger number comes first',
    `score`            int                                                          DEFAULT NULL COMMENT 'Score given upon approval',
    `client_hide`      varchar(10)                                                  DEFAULT '' COMMENT 'Hidden on some clients',
    `model`            varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'Corresponding large model type',
    `opened_tool`      varchar(255)                                                 DEFAULT NULL COMMENT 'Enabled tools',
    `publish_channels` varchar(255)                                                 DEFAULT NULL COMMENT 'Publishing channels: MARKET,API,WECHAT,MCP comma separated',
    `model_id`         bigint                                                       DEFAULT NULL COMMENT 'Custom model ID',
    `support_document`  tinyint NOT NULL                                             DEFAULT '0' COMMENT 'Does it support the knowledge base? 0 - Not supported, 1 - Supported',
    PRIMARY KEY (`id`),
    KEY                `idx_bot_id` (`bot_id`),
    KEY                `idx_create_time3` (`create_time`),
    KEY                `uid_index` (`uid`),
    KEY                `idx_bot_status` (`bot_status`,`bot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bot market table';

-- ----------------------------
-- Table structure for chat_bot_prompt_struct
-- ----------------------------
DROP TABLE IF EXISTS `chat_bot_prompt_struct`;
CREATE TABLE `chat_bot_prompt_struct`
(
    `id`           bigint                                                         NOT NULL AUTO_INCREMENT,
    `bot_id`       int                                                            NOT NULL COMMENT 'chat_bot_id.id',
    `prompt_key`   varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci   NOT NULL COMMENT 'Custom instruction - key',
    `prompt_value` varchar(2550) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT 'Custom instruction - value',
    `create_time`  datetime                                                                DEFAULT NULL,
    `update_time`  datetime                                                                DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY            `idx_bot_id` (`bot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Structured instruction';

-- ----------------------------
-- Table structure for chat_bot_remove
-- ----------------------------
DROP TABLE IF EXISTS `chat_bot_remove`;
CREATE TABLE `chat_bot_remove`
(
    `id`           int NOT NULL AUTO_INCREMENT,
    `bot_id`       int           DEFAULT NULL COMMENT 'botId',
    `uid`          varchar(128)  DEFAULT NULL COMMENT 'Publisher UID',
    `bot_name`     varchar(48)   DEFAULT NULL COMMENT 'Bot name, this is a copy, original is with creator',
    `bot_type`     tinyint       DEFAULT '1' COMMENT 'Bot type: 1 custom assistant, 2 life assistant, 3 workplace assistant, 4 marketing assistant, 5 writing expert, 6 knowledge expert',
    `avatar`       varchar(512)  DEFAULT NULL COMMENT 'Bot avatar URL',
    `prompt`       varchar(2048) DEFAULT NULL COMMENT 'bot_prompt',
    `bot_desc`     varchar(255)  DEFAULT NULL COMMENT 'Bot description',
    `block_reason` varchar(255)  DEFAULT NULL COMMENT 'Reason for rejection',
    `is_delete`    tinyint       DEFAULT '0' COMMENT 'Application history: 0 not deleted, 1 deleted',
    `audit_time`   datetime      DEFAULT NULL COMMENT 'Review time',
    `create_time`  datetime      DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`  datetime      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY            `idx_bot_id` (`bot_id`),
    KEY            `idx_bot_type` (`bot_type`),
    KEY            `idx_create_time4` (`create_time`),
    KEY            `uid_index` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Delisted bot history table';

-- ----------------------------
-- Table structure for chat_file_req
-- ----------------------------
DROP TABLE IF EXISTS `chat_file_req`;
CREATE TABLE `chat_file_req`
(
    `id`            bigint       NOT NULL AUTO_INCREMENT,
    `file_id`       varchar(64)  NOT NULL COMMENT 'Document Q&A file ID',
    `chat_id`       bigint       NOT NULL COMMENT 'Chat ID',
    `req_id`        bigint                DEFAULT NULL COMMENT 'req_id',
    `uid`           varchar(128) NOT NULL COMMENT 'Owner UID',
    `create_time`   datetime              DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`   datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `client_type`   tinyint      NOT NULL DEFAULT '0' COMMENT 'Client type: 0 unknown, 1 PC, 2 H5 mainly for statistics',
    `deleted`       tinyint      NOT NULL DEFAULT '0' COMMENT 'Whether deleted: 0 not deleted, 1 deleted',
    `business_type` tinyint      NOT NULL DEFAULT '0' COMMENT 'Document type: 0 long document, 1 long audio, 2 long video, 3 OCR',
    PRIMARY KEY (`id`),
    KEY             `idx_chatid_uid_fileid` (`chat_id`,`uid`,`file_id`),
    KEY             `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chatfile Q&A binding information';

-- ----------------------------
-- Table structure for chat_file_user
-- ----------------------------
DROP TABLE IF EXISTS `chat_file_user`;
CREATE TABLE `chat_file_user`
(
    `id`                  bigint       NOT NULL AUTO_INCREMENT,
    `file_id`             varchar(64)           DEFAULT NULL COMMENT 'Document Q&A file ID',
    `uid`                 varchar(128) NOT NULL COMMENT 'Owner UID',
    `file_url`            varchar(1024)         DEFAULT NULL COMMENT 'File URL',
    `file_name`           varchar(128)          DEFAULT NULL COMMENT 'File name',
    `file_size`           bigint                DEFAULT NULL COMMENT 'File size',
    `file_pdf_url`        varchar(1024)         DEFAULT NULL COMMENT 'File PDF URL',
    `create_time`         datetime              DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`         datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `deleted`             tinyint      NOT NULL DEFAULT '0' COMMENT 'Whether deleted: 0 not deleted, 1 deleted',
    `client_type`         tinyint      NOT NULL DEFAULT '0' COMMENT 'Client type: 0 unknown, 1 PC, 2 H5 mainly for statistics',
    `business_type`       tinyint      NOT NULL DEFAULT '0' COMMENT 'Document type: 0 long document, 1 long audio, 2 long video, 3 OCR',
    `display`             tinyint      NOT NULL DEFAULT '0' COMMENT 'Whether to display in history knowledge base: 0 display, 1 not display',
    `file_status`         tinyint      NOT NULL DEFAULT '1' COMMENT 'Document status: 0 unprocessed, 1 processing, 2 completed, 3 failed',
    `file_business_key`   varchar(1024)         DEFAULT NULL COMMENT 'Frontend maintained file unique key',
    `extra_link`          varchar(1024)         DEFAULT NULL COMMENT 'Video external link processing',
    `document_type`       tinyint               DEFAULT '1' COMMENT 'Document classification: 1 Spark document, 2 Zhiwen, see light_app_detail.additional_info field',
    `file_index`          int                   DEFAULT NULL COMMENT 'Daily upload count per user',
    `scene_type_id`       bigint                DEFAULT NULL COMMENT 'File scenario: related to document_scene_type table',
    `icon`                varchar(1024)         DEFAULT NULL COMMENT 'Favorite icon display',
    `collect_origin_from` varchar(1024)         DEFAULT NULL COMMENT 'Favorite content source',
    `task_id`             varchar(100)          DEFAULT NULL COMMENT 'RAG-v2 version task ID',
    PRIMARY KEY (`id`),
    KEY                   `chat_file_user_file_id_IDX` (`file_id`) USING BTREE,
    KEY                   `chat_file_user_uid_IDX` (`uid`) USING BTREE,
    KEY                   `chat_file_user_create_time_IDX` (`create_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User file information';

-- ----------------------------
-- Table structure for chat_info
-- ----------------------------
DROP TABLE IF EXISTS `chat_info`;
CREATE TABLE `chat_info`
(
    `id`              bigint NOT NULL AUTO_INCREMENT,
    `app_id`          varchar(255) DEFAULT NULL,
    `bot_id`          varchar(255) DEFAULT NULL,
    `flow_id`         varchar(255) DEFAULT NULL,
    `sub`             varchar(255) DEFAULT NULL COMMENT 'Type: agent, workflow',
    `caller`          varchar(255) DEFAULT NULL COMMENT 'Caller',
    `log_caller`      varchar(32)  DEFAULT '',
    `uid`             varchar(255) DEFAULT NULL,
    `sid`             varchar(255) DEFAULT NULL,
    `question`        text,
    `answer`          text,
    `status_code`     int          DEFAULT NULL,
    `message`         text COMMENT 'Error message',
    `total_cost_time` int          DEFAULT NULL COMMENT 'Total cost time',
    `first_cost_time` int          DEFAULT NULL COMMENT 'First frame cost time',
    `token`           int          DEFAULT NULL COMMENT 'Token consumption',
    `create_time`     datetime     DEFAULT NULL COMMENT 'Conversation creation time',
    PRIMARY KEY (`id`),
    KEY               `app_id` (`app_id`),
    KEY               `bot_id` (`bot_id`),
    KEY               `sid` (`sid`),
    KEY               `chat_info_index_6` (`flow_id`),
    KEY               `log_caller` (`log_caller`),
    KEY               `status_code` (`status_code`),
    KEY               `chat_info_bot_id_IDX` (`bot_id`,`sub`,`caller`,`create_time`) USING BTREE,
    KEY               `idx_sub_create_time` (`sub`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for chat_list
-- ----------------------------
DROP TABLE IF EXISTS `chat_list`;
CREATE TABLE `chat_list`
(
    `id`                 bigint   NOT NULL AUTO_INCREMENT COMMENT 'Non-business primary key',
    `uid`                varchar(128)      DEFAULT NULL COMMENT 'User ID',
    `title`              varchar(255)      DEFAULT NULL COMMENT 'Chat list topic',
    `is_delete`          tinyint           DEFAULT '0' COMMENT 'Whether deleted: 0 not delete, 1 delete',
    `enable`             tinyint           DEFAULT '1' COMMENT 'Enable status: 1 available, 0 unavailable',
    `bot_id`             int               DEFAULT '0' COMMENT 'Assistant ID',
    `sticky`             tinyint  NOT NULL DEFAULT '0' COMMENT 'Whether pinned: 0 not pinned, 1 pinned',
    `create_time`        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`        datetime          DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Modification time',
    `is_model`           tinyint  NOT NULL DEFAULT '0' COMMENT 'Whether multimodal: 0 no, 1 yes',
    `enabled_plugin_ids` varchar(255)      DEFAULT '' COMMENT 'Currently enabled plugin IDs for this conversation list',
    `is_botweb`          tinyint  NOT NULL DEFAULT '0' COMMENT 'Whether assistant WEB application: 0 no, 1 yes',
    `file_id`            varchar(64)       DEFAULT NULL COMMENT 'Document Q&A ID',
    `root_flag`          tinyint  NOT NULL DEFAULT '1' COMMENT 'Whether root chat: 1 yes, 0 no',
    `personality_id`     bigint            DEFAULT '0' COMMENT 'Personality chat_personality_base primary key ID',
    `gcl_id`             bigint            DEFAULT '0' COMMENT 'Group chat primary key ID, 0 means not group chat',
    PRIMARY KEY (`id`, `create_time`),
    KEY                  `chat_list_create_time_IDX` (`create_time`),
    KEY                  `idx_bot_id` (`bot_id`),
    KEY                  `idx_uid_bid_ctime` (`uid`,`bot_id`,`create_time`),
    KEY                  `chat_list_file_id_idx` (`file_id`),
    KEY                  `idx_pid_uid` (`personality_id`,`uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat list table';

-- ----------------------------
-- Table structure for chat_reanwser_records
-- ----------------------------
DROP TABLE IF EXISTS `chat_reanwser_records`;
CREATE TABLE `chat_reanwser_records`
(
    `id`          bigint   NOT NULL AUTO_INCREMENT COMMENT 'Non-business primary key',
    `uid`         varchar(128)      DEFAULT NULL COMMENT 'User ID',
    `chat_id`     bigint            DEFAULT NULL COMMENT 'Chat ID',
    `req_id`      bigint            DEFAULT NULL COMMENT 'Req ID before regeneration, for locating historical context position',
    `ask`         varchar(8000)     DEFAULT NULL COMMENT 'Prompt content',
    `answer`      varchar(8000)     DEFAULT NULL COMMENT 'Reply content',
    `ask_time`    datetime          DEFAULT NULL COMMENT 'Question record time',
    `answer_time` datetime          DEFAULT NULL COMMENT 'Answer record time',
    `sid`         varchar(64)       DEFAULT NULL COMMENT 'Reply SID',
    `answer_type` tinyint           DEFAULT NULL COMMENT 'Reply type: 0 system, 1 quick fix (not used by API), 2 large model, 3 abort',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime          DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`, `create_time`),
    KEY           `uid_index` (`uid`),
    KEY           `chat_index` (`chat_id`),
    KEY           `idx_sid` (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat re-answer record table';

-- ----------------------------
-- Table structure for chat_reason_records
-- ----------------------------
DROP TABLE IF EXISTS `chat_reason_records`;
CREATE TABLE `chat_reason_records`
(
    `id`                    bigint       NOT NULL AUTO_INCREMENT,
    `uid`                   varchar(128) NOT NULL COMMENT 'User ID',
    `chat_id`               bigint       NOT NULL COMMENT 'Chat session ID',
    `req_id`                bigint       NOT NULL COMMENT 'Request ID',
    `content`               longtext     NOT NULL COMMENT 'Reasoning thinking content',
    `thinking_elapsed_secs` bigint                DEFAULT '0' COMMENT 'Thinking elapsed time (seconds)',
    `type`                  varchar(50)           DEFAULT NULL COMMENT 'Reasoning type (e.g.: x1_math)',
    `create_time`           datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`           datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`, `create_time`),
    KEY                     `idx_uid` (`uid`),
    KEY                     `idx_chat_id` (`chat_id`),
    KEY                     `idx_req_id` (`req_id`),
    KEY                     `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat thinking record table';

-- ----------------------------
-- Table structure for chat_req_model
-- ----------------------------
DROP TABLE IF EXISTS `chat_req_model`;
CREATE TABLE `chat_req_model`
(
    `id`          int          NOT NULL AUTO_INCREMENT,
    `uid`         varchar(128) NOT NULL COMMENT 'User ID',
    `chat_id`     bigint                DEFAULT NULL COMMENT 'Chat window ID',
    `chat_req_id` bigint       NOT NULL COMMENT 'Chat request ID',
    `type`        tinyint      NOT NULL DEFAULT '1' COMMENT 'Multimodal type, refer to MultiModelEnum',
    `url`         varchar(2048)         DEFAULT NULL COMMENT 'Resource URL',
    `status`      tinyint      NOT NULL DEFAULT '0' COMMENT 'Review status',
    `need_his`    tinyint               DEFAULT '1' COMMENT 'Whether to concatenate history: 0 no, 1 yes',
    `img_desc`    varchar(2048)         DEFAULT NULL COMMENT 'Image and other multimodal input description',
    `intention`   varchar(255)          DEFAULT NULL COMMENT 'Image intention: document for documents, universal for natural images',
    `ocr_result`  text COMMENT 'OCR recognition result',
    `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Modification time',
    `data_id`     varchar(64)           DEFAULT NULL COMMENT 'Multimodal image ID, stores sse ID here, identifies which image for engineering institute',
    PRIMARY KEY (`id`, `create_time`),
    KEY           `idx_uid` (`uid`),
    KEY           `idx_req_id` (`chat_req_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Multimodal request table';

-- ----------------------------
-- Table structure for chat_req_records
-- ----------------------------
DROP TABLE IF EXISTS `chat_req_records`;
CREATE TABLE `chat_req_records`
(
    `id`          bigint   NOT NULL AUTO_INCREMENT,
    `chat_id`     bigint   NOT NULL COMMENT 'Chat ID',
    `uid`         varchar(128)      DEFAULT NULL COMMENT 'User ID',
    `message`     varchar(8000)     DEFAULT NULL COMMENT 'Question content',
    `client_type` tinyint           DEFAULT '0' COMMENT 'Client type when user asks: 0 unknown, 1 PC, 2 H5 mainly for statistics',
    `model_id`    int               DEFAULT NULL COMMENT 'Multimodal related ID',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime          DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `date_stamp`  int               DEFAULT NULL COMMENT 'cmp_core.BigdataServicesMonitorDaily',
    `new_context` tinyint  NOT NULL DEFAULT '1' COMMENT 'Bot new context: 1 yes, 0 no',
    PRIMARY KEY (`id`, `create_time`),
    KEY           `idx_chat_id` (`chat_id`),
    KEY           `idx_create_time` (`create_time`),
    KEY           `idx_date_stamp` (`date_stamp`),
    KEY           `idx_uid_chatId` (`uid`,`chat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat request record table';

-- ----------------------------
-- Table structure for chat_resp_alltool_data
-- ----------------------------
DROP TABLE IF EXISTS `chat_resp_alltool_data`;
CREATE TABLE `chat_resp_alltool_data`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `uid`         varchar(128) DEFAULT NULL COMMENT 'User ID',
    `chat_id`     bigint       DEFAULT NULL COMMENT 'Chat ID',
    `req_id`      bigint       DEFAULT NULL COMMENT 'Request ID',
    `seq_no`      varchar(100) DEFAULT NULL COMMENT 'Sequence number, like p1, p2',
    `tool_data`   text COMMENT 'All tools data to be stored for each frame returned structural data',
    `tool_name`   varchar(100) DEFAULT NULL COMMENT 'All tools type name',
    `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY           `chat_resp_alltool_data_uid_IDX` (`uid`) USING BTREE,
    KEY           `chat_resp_alltool_data_chat_id_IDX` (`chat_id`) USING BTREE,
    KEY           `chat_resp_alltool_data_req_id_IDX` (`req_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Large model returns all tools paragraph data, one QA returns multiple alltools paragraph data';

-- ----------------------------
-- Table structure for chat_resp_model
-- ----------------------------
DROP TABLE IF EXISTS `chat_resp_model`;
CREATE TABLE `chat_resp_model`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `uid`         varchar(128) NOT NULL COMMENT 'User ID',
    `chat_id`     bigint                DEFAULT NULL COMMENT 'Chat window ID',
    `req_id`      bigint       NOT NULL COMMENT 'Chat question ID, multimodal records may be stored before answers, so use req ID for association',
    `content`     varchar(8000)         DEFAULT NULL COMMENT 'Multimodal return content',
    `type`        varchar(32)  NOT NULL DEFAULT 'text' COMMENT 'Multimodal output type: text, image, audio, video',
    `need_his`    tinyint               DEFAULT '1' COMMENT 'Whether to concatenate history: 0 no, 1 yes',
    `url`         text COMMENT 'Multimodal resource URL address',
    `status`      tinyint      NOT NULL DEFAULT '0' COMMENT 'Resource status: 0 available, 1 unavailable',
    `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Modification time',
    `data_id`     varchar(64)           DEFAULT NULL COMMENT 'Large model generated resource ID, to be passed back for concatenating history',
    `water_url`   text COMMENT 'Watermarked resource URL',
    PRIMARY KEY (`id`, `create_time`),
    KEY           `idx_uid` (`uid`),
    KEY           `idx_chat_id` (`chat_id`),
    KEY           `idx_create_time` (`create_time`),
    KEY           `idx_req_id` (`req_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Multimodal response record table';

-- ----------------------------
-- Table structure for chat_resp_records
-- ----------------------------
DROP TABLE IF EXISTS `chat_resp_records`;
CREATE TABLE `chat_resp_records`
(
    `id`          bigint   NOT NULL AUTO_INCREMENT,
    `uid`         varchar(128)                                                  DEFAULT NULL COMMENT 'User ID',
    `chat_id`     bigint                                                        DEFAULT NULL COMMENT 'Chat ID',
    `req_id`      bigint                                                        DEFAULT NULL COMMENT 'Chat question ID, one question to one answer',
    `sid`         varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'Engine serial number SID',
    `answer_type` tinyint                                                       DEFAULT '2' COMMENT 'Answer type: 1 hotfix, 2 gpt',
    `message`     mediumtext COMMENT 'Answer message',
    `create_time` datetime NOT NULL                                             DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime                                                      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `date_stamp`  int                                                           DEFAULT NULL COMMENT 'cmp_core.BigdataServicesMonitorDaily',
    PRIMARY KEY (`id`, `create_time`),
    KEY           `idx_chat_id` (`chat_id`),
    KEY           `idx_create_time` (`create_time`),
    KEY           `idx_reqId` (`req_id`),
    KEY           `idx_sid` (`sid`),
    KEY           `idx_uid_chatId` (`uid`,`chat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=406 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat response record table';

-- ----------------------------
-- Table structure for chat_token_records
-- ----------------------------
DROP TABLE IF EXISTS `chat_token_records`;
CREATE TABLE `chat_token_records`
(
    `id`                bigint NOT NULL AUTO_INCREMENT,
    `sid`               varchar(64) DEFAULT NULL COMMENT 'Session identifier',
    `prompt_tokens`     int         DEFAULT NULL COMMENT 'Prompt token count',
    `question_tokens`   int         DEFAULT NULL COMMENT 'Current question token count',
    `completion_tokens` int         DEFAULT NULL COMMENT 'Response completion token count',
    `total_tokens`      int         DEFAULT NULL COMMENT 'Total token count',
    `create_time`       datetime    DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`       datetime    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY                 `idx_create_time` (`create_time`),
    KEY                 `idx_sid` (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat token record table';

-- ----------------------------
-- Table structure for chat_trace_source
-- ----------------------------
DROP TABLE IF EXISTS `chat_trace_source`;
CREATE TABLE `chat_trace_source`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `uid`         varchar(128) DEFAULT NULL COMMENT 'User ID',
    `chat_id`     bigint       DEFAULT NULL COMMENT 'Chat ID',
    `req_id`      bigint       DEFAULT NULL COMMENT 'Request ID',
    `content`     text COMMENT 'Trace content, JSON array of one frame',
    `type`        varchar(50)  DEFAULT 'search' COMMENT 'Trace type: search for search trace, others for supplementary',
    `create_time` datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time` datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`),
    KEY           `chat_trace_source_chat_id_IDX` (`chat_id`) USING BTREE,
    KEY           `chat_trace_source_type_IDX` (`type`) USING BTREE,
    KEY           `chat_trace_source_uid_IDX` (`uid`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat trace information storage table';

-- ----------------------------
-- Table structure for chat_tree_index
-- ----------------------------
DROP TABLE IF EXISTS `chat_tree_index`;
CREATE TABLE `chat_tree_index`
(
    `id`             bigint   NOT NULL AUTO_INCREMENT,
    `root_chat_id`   bigint   NOT NULL COMMENT 'Root chat ID',
    `parent_chat_id` bigint   NOT NULL COMMENT 'Parent chat ID',
    `child_chat_id`  bigint   NOT NULL COMMENT 'Child chat ID',
    `uid`            varchar(128)      DEFAULT NULL COMMENT 'uid',
    `create_time`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`, `create_time`),
    KEY              `chat_tree_index_uid_IDX` (`uid`),
    KEY              `chat_tree_index_root_chat_id_IDX` (`root_chat_id`),
    KEY              `idx_child_chat_id` (`child_chat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=957447502 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Chat history tree linked list information';

-- ----------------------------
-- Table structure for chat_user
-- ----------------------------
DROP TABLE IF EXISTS `chat_user`;
CREATE TABLE `chat_user`
(
    `id`             bigint       NOT NULL AUTO_INCREMENT COMMENT 'Non-business primary key',
    `uid`            varchar(128) DEFAULT NULL COMMENT 'Empty if user is not logged in or not registered',
    `name`           varchar(255) DEFAULT NULL COMMENT 'User name',
    `avatar`         varchar(512) DEFAULT NULL COMMENT 'Avatar',
    `nickname`       varchar(255) DEFAULT NULL COMMENT 'User nickname',
    `mobile`         varchar(255) NOT NULL COMMENT 'Mobile number, no authenticity check, only duplicate check',
    `is_able`        tinyint      DEFAULT '0' COMMENT 'Activation status: 0 for active, 1 for inactive, 2 for frozen',
    `create_time`    datetime     DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    `update_time`    datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    `user_agreement` tinyint      DEFAULT '0' COMMENT 'Whether agreed to user agreement: 0 not agreed, 1 agreed',
    `date_stamp`     int          DEFAULT NULL COMMENT 'cmp_core.BigdataServicesMonitorDaily',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uid_unique_index` (`uid`),
    KEY              `idx_create_time` (`create_time`),
    KEY              `index_mobile` (`mobile`),
    KEY              `idx_nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='GPT user authorization information table';

-- ----------------------------
-- Table structure for config_info
-- ----------------------------
DROP TABLE IF EXISTS `config_info`;
CREATE TABLE `config_info`
(
    `id`          bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key, starting from 10000',
    `category`    varchar(64)   DEFAULT NULL COMMENT 'Configuration category',
    `code`        varchar(128)  DEFAULT NULL COMMENT 'Configuration code, key',
    `name`        varchar(255)  DEFAULT NULL COMMENT 'Configuration name',
    `value`       text COMMENT 'Configuration content, value',
    `is_valid`    tinyint       DEFAULT NULL COMMENT 'Whether effective, 0-invalid, 1-valid',
    `remarks`     varchar(1000) DEFAULT NULL COMMENT 'Remarks, comments',
    `create_time` datetime      DEFAULT '2000-01-01 00:00:00' COMMENT 'Creation time',
    `update_time` datetime      DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1823 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Configuration table';

-- ----------------------------
-- Records of config_info
-- ----------------------------
BEGIN;
INSERT INTO astron_console.config_info (id,category,code,name,value,is_valid,remarks,create_time,update_time) VALUES
	 (1019,'DOCUMENT_LINK','1','SparkBotHelpDoc','https://experience.pro.iflyaicloud.com/aicloud-sparkbot-doc/',1,'你好','2023-08-17 00:00:00','2024-09-03 11:51:23'),
	 (1021,'COMPRESSED_FOLDER','1','SparkBotSDK','https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/sdk%E6%8E%A5%E5%85%A5%E8%AF%B4%E6%98%8E.zip',1,'','2000-01-01 00:00:00','2024-06-27 10:35:15'),
	 (1023,'SPARKBOT_CONFIG','1','SparkBotApi','{"sdkHtml":"<div className=\\"sdk-content\\">\\n      <p className=\\"title\\">Sparkbot接入文档</p>\\n      <h1>JS SDK</h1>\\n      <p>\\n        安装之前，请确保您已通过我们的平台注册或我们已为您提供了<b>AppId</b>。\\n        如果没有密钥，您将无法使用该SDK。\\n      </p>\\n      <hr></hr>\\n      <h2>JS SDK</h2>\\n      <p>\\n        要将 Sparkbot 与 JS SDK 一起使用，您需要在 HTML 文件中包含脚本标签。\\n      </p>\\n      <h3>浮动机器人</h3>\\n      <p style={{ margin: ''20px 0'' }}>\\n        浮动机器人非常简单。 只需将这 2 个脚本标签添加到您的 HTML 中即可。\\n      </p>\\n      <div className=\\"code-content\\">\\n        <div className=\\"code-container\\">\\n          <span className=\\"normal\\">&lt;</span>\\n          <span className=\\"tagColor\\">script&nbsp;</span>\\n          <span className=\\"light\\" style={{ whiteSpace: ''nowrap'' }}>\\n            src=''https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/Sparkbot.js''\\n            <span className=\\"normal\\">&gt;</span>\\n            <span className=\\"normal\\">&lt;/</span>\\n            <span className=\\"tagColor\\">script</span>\\n            <span className=\\"normal\\"> &gt;</span>\\n          </span>\\n          <br></br>\\n          <span className=\\"normal\\">&lt;</span>\\n          <span className=\\"tagColor\\">script</span>\\n          <span className=\\"normal\\"> &gt;</span>\\n          <br></br>\\n          <span style={{ marginLeft: 10 }}>Sparkbot</span>\\n          <span className=\\"normal\\">.</span>\\n          <span className=\\"tagColor\\">init</span>\\n          <span className=\\"normal\\">(&#123;</span>\\n          <br></br>\\n          <span className=\\"light\\" style={{ marginLeft: 20 }}>\\n            appId: ''您的appId'',\\n            <br></br>\\n            <span style={{ marginLeft: 20 }}>apiKey: ''您的apiKey'',</span>\\n            <br></br>\\n            <span style={{ marginLeft: 20 }}>apiSecret: ''您的apiSecret''</span>\\n            <br></br>\\n          </span>\\n          <span className=\\"normal\\" style={{ marginLeft: 10 }}>\\n            &#125;)\\n          </span>\\n          <br></br>\\n          <span className=\\"normal\\">&lt;/</span>\\n          <span className=\\"tagColor\\">script</span>\\n          <span className=\\"normal\\"> &gt;</span>\\n        </div>\\n      </div>\\n    </div>","sdkMd":"/pro-bucket/sparkBot/README.md"}',1,'','2000-01-01 00:00:00','2024-06-27 10:35:15'),
	 (1027,'FILE_MANAGE_CONFIG','','MAX_FOLDER_DEEP','5',1,'用于控制文件目录树的最大层级','2000-01-01 00:00:00','2024-06-27 10:35:15'),
	 (1029,'SPARKBOT_DEFAULT_APP','1','sparkbot默认应用','{"name":"SparkBot默认应用","description":"SparkBot默认创建的应用","businessInfo":{"applyUserSource":1,"applyUserCode":"system","applyUserDepart":"AI应用平台研发部","groupName":"核心研发平台","groupId":1003,"productName":"AI应用平台研发部","productId":10213},"isLocalAuth":0}',1,'','2000-01-01 00:00:00','2025-02-19 15:08:46'),
	 (1031,'SPARKBOT_DEFAULT_RELATION_CAPACITY','1','sparkbot应用默认关联的能力','{"largeModelId":99,"name":"通用大模型","type":1}',1,'','2000-01-01 00:00:00','2023-12-05 20:32:40'),
	 (1033,'SPARKBOT_DEFAULT_APPLY_INFO','1','外部用户Spartbot平台默认申请','{"account":"xxzhang23","accountName":"张想信","departmentInfo":"AI工程院飞云平台产品部","describe":"外部用户Spartbot平台默认申请","superiorInfo":"xxzhang23","largeModel":"通用大模型","domain":"general"}',1,'','2000-01-01 00:00:00','2023-12-05 20:32:40'),
	 (1035,'BOT_COUNT_LIMIT','1','10','用户创建bot数已达上限',1,'','2000-01-01 00:00:00','2023-12-06 13:30:51'),
	 (1037,'TEXT_GENERATION_MODELS','1','spark','讯飞星火',1,'','2000-01-01 00:00:00','2023-12-10 14:40:57'),
	 (1039,'MODEL_DEFAULT_CONFIGS','spark','spark模型默认配置','[{"key":"temperature","nmae":"随机性","min":0,"max":2,"default":1,"enabled":true},{"key":"max_tokens","nmae":"单次回复限制","min":10,"max":1000,"default":256,"enabled":true}]',1,'','2000-01-01 00:00:00','2023-12-10 15:04:22'),
	 (1041,'DEFAULT_SLICE_RULES','1','默认切片规则','{"type":0,"seperator":["\\n"],"lengthRange":[16,1024]}',1,'','2000-01-01 00:00:00','2024-06-20 20:09:51'),
	 (1043,'CUSTOM_SLICE_RULES','1','自定义切片模板','{"type":1,"seperator":["\\n"],"lengthRange":[16,1024]}',1,'','2000-01-01 00:00:00','2024-06-20 20:09:54'),
	 (1045,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_10@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1047,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_11@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1049,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_12@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1051,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_13@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1053,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_14@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1055,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_15@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1057,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_16@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1059,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_17@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1061,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_18@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1063,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_19@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1065,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_1@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1067,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_20@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1069,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_21@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1071,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_22@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1073,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_23@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1075,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_24@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1077,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_25@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1079,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_26@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1081,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_27@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1083,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_28@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1085,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_29@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1087,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_2@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1089,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_30@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1091,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_31@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1093,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_32@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1095,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_33@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1097,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_34@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1099,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_35@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1101,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_36@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1103,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_37@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1105,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_38@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1107,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_39@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1109,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_3@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1111,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_40@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1113,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_41@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1115,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_42@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1117,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_4@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1119,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_5@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1121,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_6@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1123,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_7@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1125,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_8@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1127,'ICON','common','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/emojiitem_00_9@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1133,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_10@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1135,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_11@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1137,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_12@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1139,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_13@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1141,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_14@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1143,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_15@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1145,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_1@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1147,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_2@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1149,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_3@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1151,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_4@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1153,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_5@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1155,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_6@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1157,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_7@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1159,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_8@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1161,'ICON','sport','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/sport/emojiiteam_01_9@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1163,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_10@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1165,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_11@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1167,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_12@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1169,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_13@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1171,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_14@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1173,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_15@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1175,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_1@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1177,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_2@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1179,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_3@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1181,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_4@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1183,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_5@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1185,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_6@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1187,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_7@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1189,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_8@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1191,'ICON','plant','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/plant/emojiiteam_02_9@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1193,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_10@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1195,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_11@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1197,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_12@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1199,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_13@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1201,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_14@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1203,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_15@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1205,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_1@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1207,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_2@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1209,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_3@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1211,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_4@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1213,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_5@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1215,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_6@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1217,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_7@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1219,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_8@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1221,'ICON','explore','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/explore/emojiitem_03_9@2x.png',1,'','2000-01-01 00:00:00','2025-10-09 15:54:35'),
	 (1223,'COLOR','1','#FFEAD5','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:37'),
	 (1225,'COLOR','1','#E7FFD5','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:46'),
	 (1227,'COLOR','1','#D5FFED','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:46'),
	 (1229,'COLOR','1','#D5E8FF','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:46'),
	 (1231,'COLOR','1','#DDD5FF','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:46'),
	 (1233,'COLOR','1','#FFD5E2','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:46'),
	 (1235,'COLOR','1','#DCDEE8','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:46'),
	 (1237,'COLOR','1','#ECEEF6','',1,'','2000-01-01 00:00:00','2023-12-14 14:51:46'),
	 (1239,'DEFAULT_BOT_MODEL_CONFIG','1','默认模型配置','{"modelConfig":{"prePrompt":"","userInputForm":[],"speechToText":{"enabled":false},"suggestedQuestionsAfterAnswer":{"enabled":false},"retrieverResource":{"enabled":false},"conversationStarter":{"enabled":false,"openingRemark":""},"feedback":{"enabled":false,"like":{"enabled":false},"dislike":{"enabled":false}},"model":{"name":"spark_V3.5","model":"spark_V3.5","completionParams":{"maxTokens":512,"temperature":0.5}},"repoConfigs":{"topK":3,"scoreThreshold":0.3,"scoreThresholdEnabled":true,"reposet":[]}}}',1,'','2000-01-01 00:00:00','2024-04-25 15:36:43'),
	 (1243,'TOOL_ICON','tool','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','icon/tool/tool01.png',1,'','2000-01-01 00:00:00','2024-01-23 17:42:52'),
	 (1245,'TOOL_ICON','tool','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','icon/tool/tool02.png',1,'','2000-01-01 00:00:00','2024-01-23 17:42:52'),
	 (1247,'OPEN_API_REPO_APPID','1','开发接口过滤知识库ID新增APPID','453f52a2',1,'','2000-01-01 00:00:00','2024-05-21 16:18:27'),
	 (1249,'INNER_BOT','1','就餐助手','{"name":"就餐助手","code":1,"description":"就餐助手","avatarIcon":"http://oss-beijing-m8.openstorage.cn/SparkBotDev/icon/explore/emojiitem_03_9@2x.png","requestData":{"appid":"5d29ff2f","bot_id":"69027824b6eb4558a4e39060967ea87b","question":"","upstream_kwargs":{"432517259949379584":{"callType":"pc","userAccount":"qcliu"}}},"examples":["今天有什么菜？","今天的菜有土豆吗？","明天有什么吃的？"]}',0,'','2000-01-01 00:00:00','2024-05-13 16:17:28'),
	 (1251,'MODEL_LIST','spark_V3','星火大模型3.0','',1,'','2000-01-01 00:00:00','2024-04-18 15:30:31'),
	 (1253,'MODEL_LIST','spark_V3.5','星火大模型3.5','',1,'','2000-01-01 00:00:00','2024-04-18 15:30:23'),
	 (1255,'INNER_BOT','2','生活助手','{
    "name": "生活助手",
    "code": 2,
    "description": "生活助手",
    "avatarIcon": "http://oss-beijing-m8.openstorage.cn/SparkBotDev/icon/explore/emojiitem_03_9@2x.png",
    "requestData": {
        "appid": "5d29ff2f",
        "bot_id": "ae43a8b628d343d89f1cef5c4c0248a7",
        "question": "",
        "upstream_kwargs": {
            "420914424866541568": {
                "callType": "pc",
                "userAccount": "qcliu"
            }
        }
    },
    "examples": [
        "帮我搜一下安徽风景好的景点 ",
        "查一下明天的天气情况",
        "到南京的高铁多少钱"
    ]
}',1,'','2000-01-01 00:00:00','2024-05-13 17:56:47'),
	 (1257,'INNER_BOT','3','工作助手','{"name":"工作助手","code":3,"description":"工作助手","avatarIcon":"http://oss-beijing-m8.openstorage.cn/SparkBotDev/icon/explore/emojiitem_03_9@2x.png","requestData":{"appid":"5d29ff2f","bot_id":"1075c67f3cfb4bb58df09dc7475851b8","question":"","upstream_kwargs":{"420914424866541568":{"callType":"pc","userAccount":"qcliu"}}},"examples":["帮我生成一个ppt","帮我生成一份简历 ","帮我生成一个思维导图"]}',0,'','2000-01-01 00:00:00','2024-05-13 16:19:28'),
	 (1259,'AUTH_APPLY','RECEIVER_EMAIL','','yachen11@iflytek.com',1,NULL,'2023-06-12 18:15:53','2024-05-12 16:06:57'),
	 (1261,'AUTH_APPLY','COPE_USER_EMAIL',NULL,'yxyan@iflytek.com,leifang10@iflytek.com',1,NULL,'2023-06-12 18:15:53','2025-03-27 16:28:38'),
	 (1263,'AUTH_APPLY','RECEIVER_ERROR_EMAIL',NULL,'tctan@iflytek.com',1,NULL,'2023-06-28 10:50:48','2024-04-29 17:35:39'),
	 (1265,'LLM','domain-open','开源模型domain','xscnllama38bi,llama3-70b-instruct,qwen-7b-instruct',1,NULL,'2000-01-01 00:00:00','2024-07-25 10:36:06'),
	 (1267,'LLM','domain','Spark3.5 Max','generalv3.5',1,'bm3.5','2000-01-01 00:00:00','2024-07-03 16:23:39'),
	 (1269,'LLM','domain','Spark Pro','generalv3',1,'bm3','2000-01-01 00:00:00','2024-07-03 16:23:35'),
	 (1271,'LLM','domain','Spark Lite','general',1,'cbm','2000-01-01 00:00:00','2024-07-03 16:23:26'),
	 (1273,'LLM_CHANNEL_DOMAIN','cbm','Spark Lite','general',1,NULL,'2000-01-01 00:00:00','2024-07-03 18:01:57'),
	 (1275,'LLM_CHANNEL_DOMAIN','bm3','Spark Pro','generalv3',1,NULL,'2000-01-01 00:00:00','2024-07-03 18:01:57'),
	 (1277,'LLM_CHANNEL_DOMAIN','bm3.5','Spark3.5 Max','generalv3.5',1,NULL,'2000-01-01 00:00:00','2024-07-03 18:01:57'),
	 (1279,'LLM_DOMAIN_CHANNEL','general','Spark Lite','cbm',1,NULL,'2000-01-01 00:00:00','2024-07-03 18:01:58'),
	 (1281,'LLM_DOMAIN_CHANNEL','generalv3','Spark Pro','bm3',1,NULL,'2000-01-01 00:00:00','2024-07-03 18:01:58'),
	 (1283,'LLM_DOMAIN_CHANNEL','generalv3.5','Spark3.5 Max','bm3.5',1,NULL,'2000-01-01 00:00:00','2024-07-03 18:01:58'),
	 (1285,'DEFAULT_BOT_MODEL_CONFIG','generalv3','默认模型配置','{
    "modelConfig": {
        "prePrompt": "",
        "userInputForm": [],
        "speechToText": {
            "enabled": false
        },
        "suggestedQuestionsAfterAnswer": {
            "enabled": false
        },
        "retrieverResource": {
            "enabled": false
        },
        "conversationStarter": {
            "enabled": false,
            "openingRemark": ""
        },
        "feedback": {
            "enabled": false,
            "like": {
                "enabled": false
            },
            "dislike": {
                "enabled": false
            }
        },
        "model": {
            "domain": "generalv3",
            "model": "generalv3",
            "completionParams": {
                "maxTokens": 512,
                "temperature": 0.5,
                "topK": 1
            },
            "api": "wss://spark-api.xf-yun.com/v3.1/chat",
            "llmId": 3,
            "llmSource": 1,
            "patchId": [
                "0"
            ]
        },
        "repoConfigs": {
            "topK": 3,
            "scoreThreshold": 0.3,
            "scoreThresholdEnabled": true,
            "reposet": []
        }
    }
}',0,'','2000-01-01 00:00:00','2024-06-26 17:54:40'),
	 (1287,'DEFAULT_BOT_MODEL_CONFIG','generalv3.5','默认模型配置','{
    "modelConfig": {
        "prePrompt": "",
        "userInputForm": [],
        "speechToText": {
            "enabled": false
        },
        "suggestedQuestionsAfterAnswer": {
            "enabled": false
        },
        "retrieverResource": {
            "enabled": true
        },
        "conversationStarter": {
            "enabled": false,
            "openingRemark": ""
        },
        "feedback": {
            "enabled": true,
            "like": {
                "enabled": true
            },
            "dislike": {
                "enabled": true
            }
        },
        "model": {
            "domain": "generalv3.5",
            "model": "generalv3.5",
            "completionParams": {
                "maxTokens": 512,
                "temperature": 0.5,
                "topK": 1
            },
            "api": "wss://spark-api.xf-yun.com/v3.5/chat",
            "llmId": 5,
            "llmSource": 1,
            "patchId": [
                "0"
            ]
        },
        "repoConfigs": {
            "topK": 3,
            "scoreThreshold": 0.4,
            "scoreThresholdEnabled": true,
            "reposet": []
        }
    }
}',0,'','2000-01-01 00:00:00','2024-06-26 17:54:40'),
	 (1289,'DEFAULT_BOT_MODEL_CONFIG','general','默认模型配置','{
    "modelConfig": {
        "prePrompt": "",
        "userInputForm": [],
        "speechToText": {
            "enabled": false
        },
        "suggestedQuestionsAfterAnswer": {
            "enabled": false
        },
        "retrieverResource": {
            "enabled": false
        },
        "conversationStarter": {
            "enabled": false,
            "openingRemark": ""
        },
        "feedback": {
            "enabled": false,
            "like": {
                "enabled": false
            },
            "dislike": {
                "enabled": false
            }
        },
        "model": {
            "domain": "general",
            "model": "general",
            "completionParams": {
                "maxTokens": 512,
                "temperature": 0.5,
                "topK": 1
            },
            "api": "wss://spark-api.xf-yun.com/v1.1/chat",
            "llmId": 1,
            "llmSource": 1,
            "patchId": [
                "0"
            ]
        },
        "repoConfigs": {
            "topK": 3,
            "scoreThreshold": 0.3,
            "scoreThresholdEnabled": true,
            "reposet": []
        }
    }
}',0,'','2000-01-01 00:00:00','2024-06-26 17:54:40'),
	 (1291,'TEMPLATE','prompt-enhance','1','你是一个prompt优化大师，你会得到一个助手的名字和简单描述，你需要根据这些信息，为助手生成一个合适的角色描述、详细的技能说明、相关约束信息，输出为markdown格式。你需要按照以下格式进行组织输出内容：
````````````markdown
## 角色
你是一个[助手的角色]，[助手的角色描述]。

## 技能
1. [技能 1 的描述]：
  - [技能 1 的具体内容]。
  - [技能 1 的具体内容]。
2. [技能 2 的描述]：
  - [技能 2 的具体内容]。
  - [技能 2 的具体内容]。

## 限制
- [限制 1 的描述]。
- [限制 2 的描述]。
````````````

以下是一些例子：
示例1：
输入：
助手名字: 金融分析助手
助手描述: 1. 分析上市公司最新的年报财报；2. 获取上市公司的最新新闻；

输出：
````````````markdown
## 角色
你是一个金融分析师，会利用最新的信息和数据来分析公司的财务状况、市场趋势和行业动态，以帮助客户做出明智的投资决策。

## 技能
1. 分析上市公司最新的年报财报：
  - 使用财务分析工具和技巧，对公司的财务报表进行详细的分析和解读。
  - 评估公司的财务健康状况，包括营收、利润、资产负债表、现金流量等方面。
  - 分析公司的财务指标，如利润率、偿债能力、周转率等，以评估其盈利能力和风险水平。
  - 比较公司的财务表现与同行业其他公司的平均水平，以评估其相对竞争力。
2. 获取上市公司的最新新闻：
  - 使用新闻来源和数据库，定期获取上市公司的最新新闻和公告。
  - 分析新闻对公司股价和投资者情绪的潜在影响。
  - 关注公司的重大事件，如合并收购、产品发布、管理层变动等，以及这些事件对公司未来发展的影响。
  - 结合财务分析和新闻分析，提供对公司的综合评估和投资建议。

## 限制
- 只讨论与金融分析相关的内容，拒绝回答与金融分析无关的话题。
- 所有的输出内容必须按照给定的格式进行组织，不能偏离框架要求。
- 分析部分不能超过 100 字。
````````````

示例2：
输入：
助手名字: 前端开发助手
助手描述: 你的角色是前端开发，能帮助我把图片制作成html页面，css使用tailwind.css，ui库使用antd

输出：
````````````markdown
# 角色
你是一个前端开发工程师，可以使用 HTML、CSS 和 JavaScript 等技术构建网站和应用程序。

## 技能
1. 将图片制作成 HTML 页面
  - 当用户需要将图片制作成 HTML 页面时，你可以根据用户提供的图片和要求，使用 HTML 和 CSS 等技术构建一个页面。
  - 在构建页面时，你可以使用 Tailwind CSS 来简化 CSS 样式的编写，并使用 Antd 库来提供丰富的 UI 组件。
  - 构建完成后，你可以将页面代码返回给用户，以便用户可以将其部署到服务器上或在本地查看。

2. 提供前端开发相关的建议和帮助
  - 当用户需要前端开发相关的建议和帮助时，你可以根据用户的问题，提供相关的建议和帮助。
  - 你可以提供关于 HTML、CSS、JavaScript 等前端技术的建议和帮助，也可以提供关于前端开发工具和流程的建议和帮助。

## 限制
- 只讨论与前端开发相关的内容，拒绝回答与前端开发无关的话题。
- 所输出的内容必须按照给定的格式进行组织，不能偏离框架要求。
````````````

输入：
助手名字: {assistant_name}
助手描述: {assistant_description}

输出：
',1,NULL,'2000-01-01 00:00:00','2024-05-11 21:52:12'),
	 (1293,'TEMPLATE','next-question-advice','1','现在你需要根据问题生成用户可能就这个问题提出的三个后续问题，回答的数据格式为json array，下面是一些问题和回答的例子

问题：我饿了
回答：[''最近有什么餐厅'',''推荐一点好吃的'',''推荐一下附近的小吃'']

现在根据下述问题给出回答
问题：{q}
回答：',1,NULL,'2000-01-01 00:00:00','2024-06-22 15:19:34'),
	 (1295,'LLM','domain-filter','货架过滤器-domain维度','general,generalv3,generalv3.5,xscnllama38bi',1,'','2000-01-01 00:00:00','2024-05-29 14:25:52'),
	 (1297,'LLM','function-call','true','generalv3.5',1,'','2000-01-01 00:00:00','2024-06-07 15:30:54'),
	 (1299,'LLM','function-call','false','xscnllama38bi,xsfalcon7b,general,generalv3',1,'','2000-01-01 00:00:00','2024-06-07 15:30:50'),
	 (1301,'DOCUMENT_LINK','SparkBotHelpDoc','1','https://experience.pro.iflyaicloud.com/aicloud-sparkbot-doc/',1,'','2023-08-17 00:00:00','2023-09-19 14:55:17'),
	 (1303,'LLM','serviceId-filter','货架过滤器-serviceId维度','cbm,bm3,bm3.5,xscnllama38bi,xsfalcon7b,xsc4aicr35b',1,'','2000-01-01 00:00:00','2024-06-22 14:43:24'),
	 (1305,'SPECIAL_USER','1','特殊用户，目前包括段明，豪哥，天诚','1909,2229,1695',1,NULL,'2000-01-01 00:00:00','2024-06-27 10:35:20'),
	 (1307,'SPECIAL_MODEL','10000001','llama3-70b-instruct','{"llmSource":1,"llmId":10000001,"name":"llama3-70b-instruct","patchId":"0","domain":"llama3-70b-instruct","serviceId":"llama3-70b-instruct","status":1,"info":"","icon":"","tag":[],"url":"abc","modelId":0}',0,NULL,'2000-01-01 00:00:00','2025-03-24 19:52:28'),
	 (1309,'LLM','question-type','','general,generalv3',1,'','2000-01-01 00:00:00','2024-06-13 19:25:39'),
	 (1311,'PROMPT','judge-is-bot-create','判断是否是创建bot的prompt','system_template = """你是一个Bot创建判定助手，你需要根据用户的输入信息，来判断用户是否要创建或者声明bot助手。输出格式如下：
{
    "isCreateBot": "true/false"
}

以下是一些例子：
示例1：
输入:
你是一个海报生成助手

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "true"
}

示例2：
输入:
你好

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "false"
}

示例3：
输入:
你是一个天气查询助手，可以帮我查询天气

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "true"
}

示例4：
输入:
帮我创建一个前端开发助手

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "true"
}
"""


human_template = f"""
输入:
{content}

根据上述输入判断是否要创建或声明bot助手:
"""',1,NULL,'2000-01-01 00:00:00','2024-06-11 19:52:55'),
	 (1313,'PROMPT','bot-name-desc','','你是一个名字生成和描述生成助手，你会得到用户关于助手的描述，你需要根据这些信息，为助手生成一个合适的名字和角色描述。输出格式如下，数据结构为标准的json格式：
{
    "name": "助手的名字",
    "desc": "助手的描述"
}

以下是一些例子：
示例1：
输入:
你是一个海报生成助手

根据上述输入的描述生成名字和角色描述:
{
    "name": "海报生成助手",
    "desc": "海报生成助手可以根据用户的需求和喜好，快速生成各种风格和主题的海报。无论是商业广告、活动宣传还是个人用途，海报生成助手都能提供满意的解决方案。"
}

示例2：
输入:
你是一个天气查询助手，能够查询指定城市指定日期的天气

根据上述输入的描述生成名字和角色描述:
{
    "name": "天气查询助手",
    "desc": "天气查询助手能够准确查询指定城市在指定日期的天气情况。只需输入城市名和日期，天气查询助手都能提供详细的天气预报信息。"
}


示例3：
输入:
创建一个前端开发助手

根据上述输入的描述生成名字和角色描述:
{
    "name": "前端开发助手",
    "desc": "一个专门为前端开发提供帮助的助手，可以帮助用户解决各种前端开发的问题，包括但不限于HTML、CSS、JavaScript等。"
}

输入:
{content}

根据上述输入的描述生成名字和角色描述:
',1,NULL,'2000-01-01 00:00:00','2024-05-31 14:37:04'),
	 (1315,'PROMPT','bot-name-desc-prompt','','你是一个名字生成和描述生成和prompt优化助手，你会得到用户关于助手的描述，你需要根据这些信息，为助手生成一个合适的名字和角色描述，以及为助手生成一个markdown格式的合适的角色描述、详细的技能说明、相关约束信息的提示词。输出格式如下，数据结构为标准的json格式：
{
    "name": "助手的名字",
    "desc": "助手的描述",
    "prompt": "````````````markdown
## 角色
你是一个[助手的角色]，[助手的角色描述]。

## 技能
1. [技能 1 的描述]：
  - [技能 1 的具体内容]。
  - [技能 1 的具体内容]。
2. [技能 2 的描述]：
  - [技能 2 的具体内容]。
  - [技能 2 的具体内容]。

## 限制
- [限制 1 的描述]。
- [限制 2 的描述]。
````````````"
}

以下是一些例子：
示例1：
输入:
你是一个金融分析助手，能够分析上市公司最新的年报财报和获取上市公司的最新新闻

根据上述输入的描述生成名字、角色描述和提示词:
{
    "name": "金融分析助手",
    "desc": "金融分析助手专注于分析上市公司的最新年报财报，以及获取和整理上市公司的最新新闻。无论是投资者、分析师还是对金融市场感兴趣的个人，都能通过这个助手获得有价值的信息和深入的分析。"
    "prompt": "````````````markdown
## 角色
你是一个金融分析助手，专注于为投资者、分析师以及对金融市场感兴趣的个人提供上市公司的最新年报财报分析和最新新闻整理。通过深入的数据分析和市场动态追踪，你帮助用户做出更加明智的投资决策。

## 技能
1. 分析上市公司最新的年报财报：
  - 利用专业的财务分析工具，对上市公司的年度财务报表进行详细解读，包括但不限于利润表、资产负债表和现金流量表。
  - 评估公司的盈利能力、资产负债结构、现金流状况及财务健康度，识别潜在的财务风险和机会。
  - 对比分析公司与同行业其他竞争者的财务表现，揭示公司在行业中的竞争地位。
  - 基于财务数据，提供对公司未来发展趋势的预测和建议。
2. 获取和整理上市公司的最新新闻：
  - 实时监控和收集来自各大新闻源、社交媒体和公司公告的上市公司相关新闻。
  - 筛选和整理关键信息，如重大事件、管理层变动、新产品发布等，评估这些新闻对公司股价和市场情绪的可能影响。
  - 结合财报分析结果和最新新闻，为用户提供全面、多角度的市场洞察。
  - 定期更新信息，确保用户能够获得最新的市场动态和公司发展情况。

## 限制
- 只提供与上市公司财务分析和市场新闻相关的信息和分析，不涉及非上市公司或个别股票的具体投资建议。
- 所有分析内容均基于公开可获得的数据和信息，不包含内幕信息或未公开数据。
- 分析结果仅供参考，用户应结合自己的判断和风险承受能力做出投资决策。
````````````"
}

示例2：
输入:
你是一个天气查询助手，能够查询指定城市指定日期的天气

根据上述输入的描述生成名字、角色描述和提示词:
{
    "name": "天气查询助手",
    "desc": "天气查询助手能够准确查询指定城市在指定日期的天气情况。只需输入城市名和日期，天气查询助手都能提供详细的天气预报信息。"
    "prompt": "````````````markdown
## 角色
你是一个天气查询专家，能够提供准确且详细的天气预报信息。

## 技能
1. 查询指定城市在指定日期的天气情况：
  - 当用户提供城市名和日期时，你可以查询并返回该城市在该日期的详细天气预报信息。
  - 提供的天气预报信息包括但不限于温度、湿度、风速、风向、降水概率等。
  - 你还可以提供当天的日出和日落时间，以及月相信息。
2. 分析天气变化趋势：
  - 根据历史和实时数据，分析并预测未来几天的天气变化趋势。
  - 提供穿衣、出行等生活建议，帮助用户根据天气变化做出合理安排。

## 限制
- 只讨论与天气查询相关的内容，拒绝回答与天气无关的话题。
- 所有的输出内容必须按照给定的格式进行组织，不能偏离框架要求。
- 只能提供到指定日期的天气预报，无法预测超过该日期的天气情况。
````````````"
}


示例3：
输入:
你是一个前端开发助手

根据上述输入的描述生成名字、角色描述和提示词:
{
    "name": "前端开发助手",
    "desc": "一个专门为前端开发提供帮助的助手，可以帮助用户解决各种前端开发的问题，包括但不限于HTML、CSS、JavaScript等。"
    "prompt": "````````````markdown
## 角色
你是一个前端开发助手，专门为前端开发者提供帮助和解决方案。无论是HTML、CSS还是JavaScript的问题，你都能提供专业的指导和支持。

## 技能
1. HTML问题解答：
  - 当用户遇到HTML相关的问题时，你可以提供详细的解答和解决方案。
  - 你可以帮助用户理解HTML的基础知识，如标签、属性、文档结构等。
  - 你还可以提供关于HTML5新特性的相关信息和使用方法。
2. CSS问题解答：
  - 当用户遇到CSS相关的问题时，你可以提供详细的解答和解决方案。
  - 你可以帮助用户理解CSS的基础知识，如选择器、盒模型、布局方式等。
  - 你还可以提供关于CSS3新特性的相关信息和使用方法。
3. JavaScript问题解答：
  - 当用户遇到JavaScript相关的问题时，你可以提供详细的解答和解决方案。
  - 你可以帮助用户理解JavaScript的基础知识，如变量、函数、对象、数组等。
  - 你还可以提供关于JavaScript高级主题的相关信息和使用方法，如闭包、原型链、异步编程等。
4. 前端开发工具的使用：
  - 当用户需要使用前端开发工具时，你可以提供相关的指导和建议。
  - 你可以帮助用户理解和使用各种前端开发工具，如版本控制系统（如Git）、包管理器（如npm）、构建工具（如Webpack）等。

## 限制
- 只讨论与前端开发相关的内容，拒绝回答与前端开发无关的话题。
- 所有的输出内容必须按照给定的格式进行组织，不能偏离框架要求。
````````````"
}

输入:
{content}

根据上述输入的描述生成名字、角色描述和提示词:',1,NULL,'2000-01-01 00:00:00','2024-05-31 14:33:10'),
	 (1317,'PROMPT','bot-prologue-question','','你是一个生成开场白和预置问题的助手。接下来，你会收到一段关于任务助手的描述，你需要带入描述中的角色，以描述中的角色身份生成一段开场白，同时你还需要站在用户的角度生成几个用户可能的提问。输出格式如下，数据结构为标准的json格式：
{
    "prologue": "开场白内容",
    "question": ["问题1", "问题2", "问题3"]
}

下面是一些示例
例子1: 
输入描述:
# 角色
你是一个可以帮助用户在家赚钱的机器人，你可以提供各种赚钱的途径和方法，帮助用户实现财务自由。

## 技能
### 技能 1: 提供赚钱途径
1. 当用户需要赚钱途径时，你可以根据用户的兴趣、技能和时间等因素，提供一些适合在家赚钱的途径和方法，如网络兼职、自媒体创作、电商创业等。
2. 你需要向用户详细介绍每种途径的操作流程、注意事项和收益情况等，以便用户做出选择。
3. 你还可以根据用户的需求和情况，提供一些个性化的建议和指导，帮助用户更好地开展赚钱活动。

### 技能 2: 提供赚钱技巧
1. 当用户需要赚钱技巧时，你可以向用户提供一些实用的赚钱技巧，如如何提高工作效率、如何节省成本、如何增加收入等。
2. 你需要向用户详细介绍每种技巧的操作方法和注意事项，以便用户能够正确地运用这些技巧。
3. 你还可以根据用户的需求和情况，提供一些个性化的建议和指导，帮助用户更好地实现财务自由。

### 技能 3: 提供创业指导
1. 当用户需要创业指导时，你可以向用户提供一些创业的基本知识和方法，如如何选择创业项目、如何制定创业计划、如何筹集创业资金等。
2. 你需要向用户详细介绍每种方法的操作流程和注意事项，以便用户能够正确地开展创业活动。
3. 你还可以根据用户的需求和情况，提供一些个性化的建议和指导，帮助用户更好地实现创业目标。

## 限制
- 只讨论与赚钱有关的内容，拒绝回答与赚钱无关的话题。
- 所输出的内容必须按照给定的格式进行组织，不能偏离框架要求。

根据上述输入的描述生成开场白和预置问题:
{
    "prologue": "你好，我是一个可以帮助你在家赚钱的机器人，很高兴认识你。",
    "question": ["如何使用你的服务来在家赚钱?", "你能提供哪些在家赚钱的建议和技巧?", "你的服务如何帮助我实现财务自由?"]
}


例子2: 
输入描述:
# 角色：Excel全能助手
## 个人简介
- 版本：1.0
- 语言：中文
- 描述：我是一名Excel全能助手，专注于帮助用户解决Excel相关的问题和提供高效的数据处理方案。

## 功能特点
- 数据处理：熟练掌握Excel的各种数据处理功能，包括筛选、排序、合并、拆分、透视表等，能够帮助用户快速处理大量数据。
- 公式应用：精通Excel的各种常用公式和函数，能够帮助用户进行复杂的数据计算和分析，提供准确的结果。
- 数据可视化：熟悉Excel的图表功能，能够帮助用户将数据以直观的方式展示，制作出美观、清晰的图表。
- 自动化操作：了解Excel的宏和VBA编程，能够帮助用户实现自动化操作，提高工作效率。

## 使用指南
1. 数据处理：
   - 使用筛选功能，快速筛选出符合条件的数据。
   - 利用排序功能，对数据进行升序或降序排列。
   - 使用合并和拆分功能，将多个单元格合并为一个或将一个单元格拆分为多个。
   - 利用透视表功能，对大量数据进行汇总和分析。

2. 公式应用：
   - 使用常用公式，如SUM、AVERAGE、MAX、MIN等，进行数据计算。
   - 利用逻辑函数，如IF、AND、OR等，进行条件判断和逻辑运算。
   - 使用VLOOKUP和HLOOKUP函数，进行数据查找和匹配。
   - 利用COUNTIF和SUMIF函数，进行条件统计和求和。

3. 数据可视化：
   - 利用图表功能，选择合适的图表类型，如柱状图、折线图、饼图等，展示数据。
   - 调整图表的样式和布局，使其更加美观和易读。
   - 添加数据标签和图例，增加图表的信息量和可读性。

4. 自动化操作：
   - 利用宏录制功能，记录一系列操作步骤，实现自动化操作。
   - 使用VBA编程，编写自定义的宏，实现更复杂的自动化操作。
   - 将宏和VBA代码应用到Excel工作簿中，提高工作效率和准确性。

## 使用建议
- 熟悉Excel的快捷键和常用操作，可以提高工作效率。
- 在处理大量数据时，先备份原始数据，以防误操作导致数据丢失。
- 学习和掌握Excel的高级功能和技巧，可以更好地应对复杂的数据处理需求。
- 及时保存和备份Excel文件，以防止意外情况导致数据丢失。

根据上述输入的描述生成开场白和预置问题:
{
    "prologue": "你好，我是一名Excel全能助手，可以帮助你解决Excel相关的问题和提供高效的数据处理方案。",
    "question": ["如何快速处理大量数据?", "如何使用Excel进行复杂的数据计算和分析?", "如何将数据以直观的方式展示，制作出美观、清晰的图表?"]
}

你必须使用上述格式输出结果。

输入描述:
{content}

根据上述输入的描述生成开场白和预置问题:',1,NULL,'2000-01-01 00:00:00','2024-05-31 14:36:26'),
	 (1319,'INNER_BOT','interact','交互式创建','{"name":"就餐助手","code":1,"description":"就餐助手","avatarIcon":"http://oss-beijing-m8.openstorage.cn/SparkBotDev/icon/explore/emojiitem_03_9@2x.png","requestData":{"appid":"4d2e8665","bot_id":"bedd1e25a11b41d487cc28f5de82695a","question":"","upstream_kwargs":{"420914424866541568":{"callType":"pc","userAccount":"qcliu"}}},"examples":["今天有什么菜？","今天的菜有土豆吗？","明天有什么吃的？"]}',1,'','2000-01-01 00:00:00','2024-05-31 11:09:23'),
	 (1321,'DOCUMENT_LINK','ApiDoc','1','https://in.iflyaicloud.com/aicloud-sparkbot-doc/Docx/04-Sparkbot%20API%EF%BC%88%E4%B8%93%E4%B8%9A%E7%89%88%EF%BC%89/1.2.9_workflow_api.html',1,'','2023-08-17 00:00:00','2025-02-26 14:32:11'),
	 (1323,'CONSULT','RECEIVER_EMAIL','','rfge@iflytek.com',1,NULL,'2023-06-12 18:15:53','2024-06-24 10:04:09'),
	 (1325,'CONSULT','COPE_USER_EMAIL','','mkzhang4@iflytek.com,haojin@iflytek.com',1,NULL,'2023-06-12 18:15:53','2024-06-24 10:04:32'),
	 (1326,'TAG','BOT_TAGS','生活','',1,NULL,'2023-06-12 18:15:53','2024-06-07 16:59:24'),
	 (1327,'TAG','BOT_TAGS','教育','',1,NULL,'2023-06-12 18:15:53','2024-06-07 16:59:24'),
	 (1328,'TAG','TOOL_TAGS','生活','',0,NULL,'2023-06-12 18:15:53','2024-06-13 23:29:11'),
	 (1329,'TAG','TOOL_TAGS','旅行','',0,NULL,'2023-06-12 18:15:53','2024-06-13 23:29:11'),
	 (1331,'PROMPT','bot-name-desc-response','','system_template = """你是一个Bot创建询问助手，你会得到用户创建bot的指令信息，你需要根据这些信息，生成助手的名称和描述以及对用户的回复。输出格式如下：
{
    "name": "助手名称",
    "description": "对助手的描述",
    "response": "回复用户，然后询问助手的名称和描述是否满足要求，最后询问用户是否要创建这个bot"
}

以下是一些例子：
示例1：
输入:
创建一个PPT生成助手

输出:
{
    "name": "PPT 魔法助手",
    "description": "这是一个能辅助你生成 PPT 的机器人",
    "response": "好呀，我有个关于这个新机器人的建议。
名称：PPT 魔法助手
描述：这是一个能辅助你生成 PPT 的机器人。
如果你同意这个名称和描述，我就开始创建这个机器人，不过这个过程大概需要 30 秒哦。请问你确认创建这个 PPT 魔法助手机器人吗？"
}

示例2：
输入:
创建一个PPT生成助手

输出:
{
    "name": "天气小灵通",
    "description": "能够为你提供准确天气信息的机器人",
    "response": "好呀，我觉得可以叫“天气小灵通”，描述是“能够为你提供准确天气信息的机器人”。你觉得这个名字和描述可以吗？如果可以，我就开始创建这个机器人哦，但这个过程大概需要 30 秒。你确认创建这个“天气小灵通”机器人吗？"
}

示例3：
输入:
创建一个文章生成助手

输出:
{
    "name": "创意文曲星",
    "description": "能快速生成各类文章的智能助手",
    "response": "那可以取名为“创意文曲星”，描述是“能快速生成各类文章的智能助手”。你觉得这个名字和描述符合你的需求吗？如果符合，我将为你创建这个“创意文曲星”机器人，这大约需要 30 秒钟的时间。请问你确认创建这个机器人吗？"
}

"""

human_template = f"""
输入:
{content}

输出:
"""',1,NULL,'2000-01-01 00:00:00','2024-06-11 19:57:42'),
	 (1333,'PROMPT','judge-confirm-create-bot','','system_template = """你是一个Bot创建判定助手，你需要根据对话历史，来判断用户最新意图是否要创建或者声明bot助手。输出格式如下：
{
    "isCreateBot": "true/false"
}

以下是一些例子：
示例1：
输入:
history:
{"role": "assistant", "content": "好呀，我有个关于你的新机器人的建议。
名称：代码精灵
描述：这是一个能辅助你进行代码编写的机器人。
如果你同意这个名称和描述，我就开始创建这个机器人哦，但要注意这个过程大概需要 30 秒。请问你确认创建这个代码精灵机器人吗？"}
{"role": "user", "content": "你好"}

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "false"
}

示例2：
输入:
history:
{"role": "assistant", "content": "好呀，我觉得可以叫“气象小灵通”，描述是“能够为你提供实时天气信息的机器人”。你觉得这个名字和描述可以吗？如果可以，我就开始创建这个机器人哦，大概需要 30 秒。"}
{"role": "user", "content": "创建"}

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "true"
}

示例3：
输入:
history:
{"role": "assistant", "content": "好呀，我有个关于这个新机器人的建议。
名称：PPT 创作精灵
描述：这是一个能协助你生成 PPT 的机器人。
如果你同意这个名称和描述，我就开始创建这个机器人，不过这个过程大概需要 30 秒哦。请问你确认创建这个 PPT 创作精灵机器人吗？"}
{"role": "user", "content": "不可以"}

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "false"
}

示例4：
输入:
history:
{"role": "assistant", "content": "好呀，我有个关于这个机器人的想法。
名称：景点智多星
描述：可以为你查询各种景点信息的机器人。
你觉得这个名称和描述可以吗？如果可以，我就开始创建这个机器人哦。"}
{"role": "user", "content": "嗯"}

根据上述输入判断是否要创建bot:
{
    "isCreateBot": "true"
}
"""

human_template = f"""
输入:
history:
{{"role": "assistant", "content": {assistant_content}}}
{{"role": "user", "content": {user_content}}}

根据上述输入判断是否要创建或声明bot助手:
"""',1,NULL,'2000-01-01 00:00:00','2024-06-12 11:22:16'),
	 (1335,'PROMPT','do-not-create-bot','','system_template = """你是一个Bot创建判定助手，你需要根据对话历史，来判断用户最新意图是否要停止创建bot助手还是不满意助手名称和描述。输出格式如下：
{
    "doNotCreateBot": "true/false",
    "response": "根据用户意图回复用户"
}

以下是一些例子：
示例1：
输入:
history:
{"role": "assistant", "content": "好呀，我有个关于你的新机器人的建议。
名称：代码精灵
描述：这是一个能辅助你进行代码编写的机器人。
如果你同意这个名称和描述，我就开始创建这个机器人哦，但要注意这个过程大概需要 30 秒。请问你确认创建这个代码精灵机器人吗？"}
{"role": "user", "content": "你好"}

输出:
{
    "doNotCreateBot": "true",
    "response": "你好！有什么我可以帮助你的吗？"
}

示例2：
输入:
history:
{"role": "assistant", "content": "好呀，我觉得可以叫“气象小灵通”，描述是“能够为你提供实时天气信息的机器人”。你觉得这个名字和描述可以吗？如果可以，我就开始创建这个机器人哦，大概需要 30 秒。"}
{"role": "user", "content": "不创建"}

输出:
{
    "doNotCreateBot": "true",
    "response": "好的。如果你之后还有创建 Bot 的需求，随时可以告诉我。"
}

示例3：
输入:
history:
{"role": "assistant", "content": "好呀，我有个关于这个新机器人的建议。
名称：PPT 创作精灵
描述：这是一个能协助你生成 PPT 的机器人。
如果你同意这个名称和描述，我就开始创建这个机器人，不过这个过程大概需要 30 秒哦。请问你确认创建这个 PPT 创作精灵机器人吗？"}
{"role": "user", "content": "不可以"}

输出:
{
    "doNotCreateBot": "false",
    "response": "那你对这个机器人的名称和描述有什么具体要求呢？"
}
"""

human_template = f"""
输入:
history:
{{"role": "assistant", "content": {assistant_content}}}
{{"role": "user", "content": {user_content}}}

输出:
"""',1,NULL,'2000-01-01 00:00:00','2024-06-12 15:00:42'),
	 (1337,'PROMPT','update-name-desc-response','','system_template = """你是一个Bot创建询问助手，你会得到原来的助手名称和描述以及用户的更改要求，你需要根据这些信息，更新助手的名称和描述以及生成对用户的回复。输出格式如下：
{
    "name": "助手名称",
    "description": "对助手的描述",
    "response": "回复用户，然后询问助手的名称和描述是否满足要求，最后询问用户是否要创建这个bot"
}

以下是一些例子：
示例1：
输入:
{
    "name": "前端小能手",
    "description": "这是一个能为你解决前端相关问题并提供技术支持的机器人。",
    "requirement": "名字改成前端达人"
}

输出:
{
    "name": "前端达人",
    "description": "能够熟练处理前端各类事务的达人",
    "response": "那描述改成“能够熟练处理前端各类事务的达人”，这样可以吗？如果可以，我就为你创建这个 Bot 啦。"
}

示例2：
输入:
{
    "name": "文玩鉴宝师",
    "description": "这是一个能帮助你鉴定文玩并提供相关知识的机器人。",
    "requirement": "我想起个古董专家"
}

输出:
{
    "name": "古董专家",
    "description": "能专业鉴定古董并给出详细分析的机器人",
    "response": "那描述可以是“能专业鉴定古董并给出详细分析的机器人”，这样的名称和描述你满意吗？如果满意，我将为你创建这个 Bot。"
}

示例3：
输入:
{
    "name": "古董专家",
    "description": "能专业鉴定古董并给出详细分析的机器人",
    "requirement": "我想要描述详细一点"
}

输出:
{
    "name": "古董专家",
    "description": "这是一个能够凭借专业知识和丰富经验，对各种古董进行精准鉴定和详细分析，为你提供准确可靠的鉴定结果和全面深入的古董知识讲解的机器人。",
    "response": "名称：古董专家
描述：这是一个能够凭借专业知识和丰富经验，对各种古董进行精准鉴定和详细分析，为你提供准确可靠的鉴定结果和全面深入的古董知识讲解的机器人。
你对这个名称和描述满意吗？如果满意，我将为你创建这个机器人。"
}
"""

human_template = f"""
输入:
{{
    "name": {name},
    "description": {description},
    "requirement": {content}
}}

输出:
"""',1,NULL,'2000-01-01 00:00:00','2024-06-11 20:06:46'),
	 (1339,'PROMPT','prologue','开场白生成','你是一个生成开场白的助手。接下来，你会收到一段关于任务助手的描述，你需要代入描述中的角色，以描述中的角色身份生成一段开场白：

下面是一些示例
例子1: 
输入描述:
名称：在家赚钱的机器人
描述：一个可以帮助用户在家赚钱的机器人，可以提供各种赚钱的途径和方法，帮助用户实现财务自由

根据上述输入的描述生成开场白:
你好，我是一个可以帮助你在家赚钱的机器人，可以提供各种赚钱的途径和方法，帮助你实现财务自由，很高兴认识你。


例子2: 
输入描述:
名称：Excel全能助手
描述：解决Excel相关的问题和提供高效的数据处理方案

根据上述输入的描述生成开场白:
你好，我是一名Excel全能助手，可以帮助你解决Excel相关的问题和提供高效的数据处理方案。

你必须使用上述格式输出结果。

输入描述:
名称：{name}
描述：{desc}

根据上述输入的描述生成开场白:',1,NULL,'2000-01-01 00:00:00','2024-06-20 14:24:43'),
	 (1341,'LLM_FILTER','plan','大模型过滤器','generalv3,generalv3.5,4.0Ultra,pro-128k',0,'1','2000-01-01 00:00:00','2025-08-13 11:31:56'),
	 (1345,'TAG','TOOL_TAGS','交通出行','',1,NULL,'2024-06-26 09:54:25','2024-09-29 14:13:00'),
	 (1347,'TAG','TOOL_TAGS','休闲娱乐',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1349,'TAG','TOOL_TAGS','医药健康',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1351,'TAG','TOOL_TAGS','影视音乐',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1353,'TAG','TOOL_TAGS','教育百科',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1355,'TAG','TOOL_TAGS','新闻资讯',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1357,'TAG','TOOL_TAGS','母婴儿童',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1359,'TAG','TOOL_TAGS','生活常用',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1361,'TAG','TOOL_TAGS','金融理财',NULL,1,NULL,'2024-06-26 09:54:25','2024-06-26 09:54:25'),
	 (1363,'SPECIAL_MODEL_CONFIG','10000001','llama3-70b-instruct','{"patchId":null,"domain":"llama3-70b-instruct","appId":null,"name":"llama3-70b-instruct","id":10000001,"source":1,"serviceId":"llama3-70b-instruct","type":1,"serverId":"llama3-70b-instruct","config":{"serviceIdkeys":["bm3.5"],"serviceBlock":{"bm3.5":[{"fields":[{"standard":true,"constraintType":"range","default":2048,"constraintContent":[{"name":1},{"name":8192}],"name":"回答的tokens的最大长度","revealed":true,"support":true,"fieldType":"int","initialValue":2048,"key":"max_tokens","required":true,"desc":"最小值是1, 最大值是8192"},{"standard":true,"constraintContent":[{"name":0},{"name":1}],"precision":0.1,"required":true,"constraintType":"range","default":0.5,"name":"核采样阈值","revealed":true,"support":true,"fieldType":"float","initialValue":0.5,"key":"temperature","desc":"取值范围 (0，1]"},{"standard":true,"constraintType":"range","default":4,"constraintContent":[{"name":1},{"name":6}],"name":"从k个中随机选择一个(非等概率)","revealed":true,"support":true,"fieldType":"int","initialValue":4,"key":"top_k","required":true,"desc":"最小值1，最大值6"},{"constraintType":"enum","default":"default","constraintContent":[{"name":"strict","label":"strict","value":"strict","desc":"严格审核策略"},{"name":"moderate","label":"moderate","value":"moderate","desc":"中等审核策略"},{"name":"show","label":"show","value":"show","desc":"演示场景的审核策略"},{"name":"default","label":"default","value":"default","desc":"默认的审核策略"}],"name":"内容审核的严格程度","fieldType":"string","support":true,"initialValue":"default","required":false,"key":"auditing","desc":"strict表示严格审核策略；moderate表示中等审核策略；show表示演示场景审核策略；default表示默认的审核程度；（需继续下调策略需要申请）"},{"constraintType":"enum","default":"generalv3","constraintContent":[{"name":"generalv3","label":"generalv3","value":"generalv3","desc":"星火3.0"}],"name":"需要使用的领域","fieldType":"string","support":true,"initialValue":"generalv3","required":true,"key":"domain","desc":""}],"key":"generalv3"}]},"featureBlock":{},"payloadBlock":{},"acceptBlock":{},"protocolType":1,"serviceId":"bm3.5"},"url":"llama3-70b-instruct"}',1,NULL,'2000-01-01 00:00:00','2024-11-28 15:55:51'),
	 (1365,'PATCH_ID','0','','generalv3.5',1,'','2000-01-01 00:00:00','2024-06-26 17:24:48'),
	 (1367,'DEFAULT_BOT_MODEL_CONFIG','general','默认模型配置','{"modelConfig":{"prePrompt":"","userInputForm":[],"speechToText":{"enabled":false},"suggestedQuestionsAfterAnswer":{"enabled":false},"retrieverResource":{"enabled":false},"conversationStarter":{"enabled":false,"openingRemark":""},"feedback":{"enabled":false,"like":{"enabled":false},"dislike":{"enabled":false}},"repoConfigs":{"topK":3,"scoreThreshold":0.3,"scoreThresholdEnabled":true,"reposet":[]},"models":{"plan":{"domain":"general","model":"general","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v1.1/chat","llmId":1,"llmSource":1,"serviceId":"cbm"},"summary":{"domain":"general","model":"general","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v1.1/chat","llmId":1,"llmSource":1,"serviceId":"cbm"}}}}',1,'','2000-01-01 00:00:00','2024-07-11 14:41:38'),
	 (1369,'DEFAULT_BOT_MODEL_CONFIG','generalv3','默认模型配置','{"modelConfig":{"prePrompt":"","userInputForm":[],"speechToText":{"enabled":false},"suggestedQuestionsAfterAnswer":{"enabled":false},"retrieverResource":{"enabled":false},"conversationStarter":{"enabled":false,"openingRemark":""},"feedback":{"enabled":false,"like":{"enabled":false},"dislike":{"enabled":false}},"models":{"plan":{"domain":"generalv3","model":"generalv3","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v3.1/chat","llmId":3,"llmSource":1,"serviceId":"bm3"},"summary":{"domain":"generalv3","model":"generalv3","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v3.1/chat","llmId":3,"llmSource":1,"serviceId":"bm3"}},"repoConfigs":{"topK":3,"scoreThreshold":0.3,"scoreThresholdEnabled":true,"reposet":[]}}}',1,'','2000-01-01 00:00:00','2024-07-11 14:42:08'),
	 (1371,'DEFAULT_BOT_MODEL_CONFIG','generalv3.5','默认模型配置','{"modelConfig":{"prePrompt":"","userInputForm":[],"speechToText":{"enabled":false},"suggestedQuestionsAfterAnswer":{"enabled":false},"retrieverResource":{"enabled":false},"conversationStarter":{"enabled":false,"openingRemark":""},"feedback":{"enabled":false,"like":{"enabled":false},"dislike":{"enabled":false}},"models":{"plan":{"domain":"generalv3.5","model":"generalv3.5","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v3.5/chat","llmId":5,"llmSource":1,"patchId":["0"],"serviceId":"bm3.5"},"summary":{"domain":"generalv3.5","model":"generalv3.5","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v3.5/chat","llmId":5,"llmSource":1,"patchId":["0"],"serviceId":"bm3.5"}},"repoConfigs":{"topK":3,"scoreThreshold":0.3,"scoreThresholdEnabled":true,"reposet":[]}}}',1,'','2000-01-01 00:00:00','2024-07-11 14:42:37'),
	 (1373,'LLM','finetune','','cbm,bm3',1,'','2000-01-01 00:00:00','2024-07-01 17:37:13'),
	 (1375,'LLM','domain','Spark4.0 Ultra','4.0Ultra',1,'bm4','2000-01-01 00:00:00','2024-07-03 17:48:23'),
	 (1377,'LLM_CHANNEL_DOMAIN','bm4','Spark4.0 Ultra','4.0Ultra',1,NULL,'2000-01-01 00:00:00','2024-07-03 17:51:58'),
	 (1379,'DEFAULT_BOT_MODEL_CONFIG','4.0Ultra','默认模型配置','{"modelConfig":{"prePrompt":"","userInputForm":[],"speechToText":{"enabled":false},"suggestedQuestionsAfterAnswer":{"enabled":false},"retrieverResource":{"enabled":false},"conversationStarter":{"enabled":false,"openingRemark":""},"feedback":{"enabled":false,"like":{"enabled":false},"dislike":{"enabled":false}},"models":{"plan":{"domain":"4.0Ultra","model":"4.0Ultra","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v4.0/chat","llmId":110,"llmSource":1,"patchId":["0"],"serviceId":"bm4"},"summary":{"domain":"4.0Ultra","model":"4.0Ultra","completionParams":{"maxTokens":512,"temperature":0.5,"topK":1},"api":"wss://spark-api.xf-yun.com/v4.0/chat","llmId":110,"llmSource":1,"patchId":["0"],"serviceId":"bm4"}},"repoConfigs":{"topK":3,"scoreThreshold":0.3,"scoreThresholdEnabled":true,"reposet":[]}}}',1,'','2000-01-01 00:00:00','2024-07-11 14:43:02'),
	 (1381,'LLM_DOMAIN_CHANNEL','4.0Ultra','Spark4.0 Ultra','bm4',1,NULL,'2000-01-01 00:00:00','2024-07-03 17:52:00'),
	 (1383,'LLM_FILTER','plan','大模型过滤器','xdeepseekr1,xdeepseekv3,x1,xop3qwen30b,xop3qwen235b,bm4',1,'bm3,bm3.5,bm4,pro-128k,xqwen257bchat,xqwen72bchat,xqwen257bchat,xsparkprox,xdeepseekr1,xdeepseekv3','2000-01-01 00:00:00','2025-05-21 15:37:39'),
	 (1385,'LLM_FILTER','summary','大模型过滤器','xdeepseekr1,xdeepseekv3,x1,xop3qwen30b,xop3qwen235b,bm4',1,'bm3,bm3.5,bm4,pro-128k,xqwen257bchat,xqwen72bchat,xqwen257bchat,xsparkprox,xdeepseekr1,xdeepseekv3','2000-01-01 00:00:00','2025-05-21 15:37:40'),
	 (1387,'LLM','base-model','cbm','general',1,'Spark Lite','2000-01-01 00:00:00','2024-07-08 11:05:19'),
	 (1389,'LLM','base-model','bm3','generalv3',1,'Spark Pro','2000-01-01 00:00:00','2024-07-08 11:06:14'),
	 (1391,'LLM','base-model','bm3.5','generalv3.5',1,'Spark Max','2000-01-01 00:00:00','2024-07-08 11:06:19'),
	 (1393,'LLM','base-model','bm4','4.0Ultra',1,'Spark4.0 Ultra','2000-01-01 00:00:00','2024-07-08 11:06:09'),
	 (1395,'SPECIAL_MODEL','10000002','qwen-7b-instruct','{"llmSource":1,"llmId":10000002,"name":"qwen-7b-instruct","patchId":"0","domain":"qwen-7b-instruct","serviceId":"qwen-7b-instruct","status":1,"info":"","icon":"","tag":[],"url":"abc","modelId":0}',0,NULL,'2000-01-01 00:00:00','2025-03-24 19:52:28'),
	 (1397,'SPECIAL_MODEL_CONFIG','10000002','qwen-7b-instruct','{"patchId":null,"domain":"qwen-7b-instruct","appId":null,"name":"qwen-7b-instruct","id":10000002,"source":1,"serviceId":"qwen-7b-instruct","type":1,"serverId":"qwen-7b-instruct","config":{"serviceIdkeys":["bm3.5"],"serviceBlock":{"bm3.5":[{"fields":[{"standard":true,"constraintType":"range","default":2048,"constraintContent":[{"name":1},{"name":8192}],"name":"最大回复长度","revealed":true,"support":true,"fieldType":"int","initialValue":2048,"key":"max_tokens","required":true,"desc":"最小值是1, 最大值是8192。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"},{"standard":true,"constraintContent":[{"name":0},{"name":1}],"precision":0.1,"required":true,"constraintType":"range","default":0.5,"name":"核采样阈值","revealed":true,"support":true,"fieldType":"float","initialValue":0.5,"key":"temperature","desc":"取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"},{"standard":true,"constraintType":"range","default":4,"constraintContent":[{"name":1},{"name":6}],"name":"生成多样性","revealed":true,"support":true,"fieldType":"int","initialValue":4,"key":"top_k","required":true,"desc":"\\"调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"},{"constraintType":"enum","default":"default","constraintContent":[{"name":"strict","label":"strict","value":"strict","desc":"严格审核策略"},{"name":"moderate","label":"moderate","value":"moderate","desc":"中等审核策略"},{"name":"show","label":"show","value":"show","desc":"演示场景的审核策略"},{"name":"default","label":"default","value":"default","desc":"默认的审核策略"}],"name":"内容审核的严格程度","fieldType":"string","support":true,"initialValue":"default","required":false,"key":"auditing","desc":"strict表示严格审核策略；moderate表示中等审核策略；show表示演示场景审核策略；default表示默认的审核程度；（需继续下调策略需要申请）"},{"constraintType":"enum","default":"generalv3","constraintContent":[{"name":"generalv3","label":"generalv3","value":"generalv3","desc":"星火3.0"}],"name":"需要使用的领域","fieldType":"string","support":true,"initialValue":"generalv3","required":true,"key":"domain","desc":""}],"key":"generalv3"}]},"featureBlock":{},"payloadBlock":{},"acceptBlock":{},"protocolType":1,"serviceId":"bm3.5"},"url":"qwen-7b-instruct"}',1,NULL,'2000-01-01 00:00:00','2024-11-28 15:56:36'),
	 (1399,'LLM_SCENE_FILTER','workflow','iflyaicloud','lmg5gtbs0,lmyvosz36,lm0dy3kv0,lm479a5b8,lme990528,lmxa5e22s,lmt4do9o3,lm1evo7j,lmy3b394q,lmt2br78l,lm4rar7p2,lmt2br78l,lm4onxj7h,lme693475,lmbXtIcNp,lm27ebHkj,lm9ze3hwc',1,NULL,'2000-01-01 00:00:00','2025-02-27 19:15:13'),
	 (1401,'gemma','url',NULL,'1',0,NULL,'2000-01-01 00:00:00','2024-11-21 16:48:20'),
	 (1403,'display','0828',NULL,'0',1,NULL,'2000-01-01 00:00:00','2024-08-26 20:34:56'),
	 (1405,'EFFECT_EVAL','base-model-list-filter','1','gemma_2b_chat,gemma2_9b_it',1,NULL,'2000-01-01 00:00:00','2024-09-10 16:09:15'),
	 (1407,'DOCUMENT_LINK','eval-set-template','1','https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/%E6%A8%A1%E7%89%88.csv',1,'','2023-08-17 00:00:00','2024-08-27 11:13:38'),
	 (1409,'MODEL_TRAIN_TYPE','2423718913705984','gemma_2b','0',1,NULL,'2000-01-01 00:00:00','2024-09-11 16:41:20'),
	 (1411,'MODEL_TRAIN_TYPE','2425335862888448','gemma_9b','1',1,NULL,'2000-01-01 00:00:00','2024-09-11 16:41:20'),
	 (1413,'SPECIAL_MODEL','10000003','xqwen257bchat','{"llmSource":1,"llmId":10000003,"name":"xqwen257bchat","patchId":"0","domain":"xqwen257bchat","serviceId":"xqwen257bchat","status":1,"info":"","icon":"","tag":[],"url":"wss://xingchen-api.cn-huabei-1.xf-yun.com/v1.1/chat","modelId":0}',0,'','2000-01-01 00:00:00','2025-03-24 19:52:28'),
	 (1415,'SPECIAL_MODEL_CONFIG','10000003','xqwen257bchat','{"patchId":null,"domain":"xqwen257bchat","appId":null,"name":"xqwen257bchat","id":127,"source":1,"serviceId":"xqwen257bchat","type":1,"serverId":"xqwen257bchat","config":{"serviceIdkeys":["xqwen257bchat"],"serviceBlock":{"xqwen257bchat":[{"fields":[{"standard":true,"constraintType":"range","default":2048,"constraintContent":[{"name":1},{"name":8192}],"name":"最大回复长度","revealed":true,"support":true,"fieldType":"int","initialValue":2048,"key":"max_tokens","required":true,"desc":"最小值是1, 最大值是8192。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"},{"standard":true,"constraintContent":[{"name":0},{"name":1}],"precision":0.1,"required":true,"constraintType":"range","default":0.5,"name":"核采样阈值","revealed":true,"support":true,"fieldType":"float","initialValue":0.5,"key":"temperature","desc":"取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"},{"standard":true,"constraintType":"range","default":4,"constraintContent":[{"name":1},{"name":6}],"name":"生成多样性","revealed":true,"support":true,"fieldType":"int","initialValue":4,"key":"top_k","required":true,"desc":"\\"调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"},{"constraintType":"enum","default":"default","constraintContent":[{"name":"strict","label":"strict","value":"strict","desc":"严格审核策略"},{"name":"moderate","label":"moderate","value":"moderate","desc":"中等审核策略"},{"name":"show","label":"show","value":"show","desc":"演示场景的审核策略"},{"name":"default","label":"default","value":"default","desc":"默认的审核策略"}],"name":"内容审核的严格程度","fieldType":"string","support":true,"initialValue":"default","required":false,"key":"auditing","desc":"strict表示严格审核策略；moderate表示中等审核策略；show表示演示场景审核策略；default表示默认的审核程度；（需继续下调策略需要申请）"},{"constraintType":"enum","default":"xqwen257bchat","constraintContent":[{"name":"generalv3","label":"generalv3","value":"generalv3","desc":"星火3.0"}],"name":"需要使用的领域","fieldType":"string","support":true,"initialValue":"xqwen257bchat","required":true,"key":"domain","desc":""}],"key":"xqwen257bchat"}]},"featureBlock":{},"payloadBlock":{},"acceptBlock":{},"protocolType":1,"serviceId":"xqwen257bchat"},"url":"wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat"}',1,'','2000-01-01 00:00:00','2024-12-11 11:17:01'),
	 (1417,'SPECIAL_MODEL','10000004','xqwen72bchat','{"llmSource":1,"llmId":10000004,"name":"xqwen72bchat","patchId":"0","domain":"xqwen72bchat","serviceId":"xqwen72bchat","status":1,"info":"","icon":"","tag":[],"url":"wss://xingchen-api.cn-huabei-1.xf-yun.com/v1.1/chat","modelId":0}',0,'','2000-01-01 00:00:00','2024-10-15 15:44:09'),
	 (1419,'SPECIAL_MODEL_CONFIG','10000004','xqwen72bchat','{"patchId":null,"domain":"xqwen72bchat","appId":null,"name":"xqwen72bchat","id":125,"source":1,"serviceId":"xqwen72bchat","type":1,"serverId":"xqwen72bchat","config":{"serviceIdkeys":["xqwen72bchat"],"serviceBlock":{"xqwen72bchat":[{"fields":[{"standard":true,"constraintType":"range","default":2048,"constraintContent":[{"name":1},{"name":8192}],"name":"最大回复长度","revealed":true,"support":true,"fieldType":"int","initialValue":2048,"key":"max_tokens","required":true,"desc":"最小值是1, 最大值是8192。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"},{"standard":true,"constraintContent":[{"name":0},{"name":1}],"precision":0.1,"required":true,"constraintType":"range","default":0.5,"name":"核采样阈值","revealed":true,"support":true,"fieldType":"float","initialValue":0.5,"key":"temperature","desc":"取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"},{"standard":true,"constraintType":"range","default":4,"constraintContent":[{"name":1},{"name":6}],"name":"生成多样性","revealed":true,"support":true,"fieldType":"int","initialValue":4,"key":"top_k","required":true,"desc":"\\"调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"},{"constraintType":"enum","default":"default","constraintContent":[{"name":"strict","label":"strict","value":"strict","desc":"严格审核策略"},{"name":"moderate","label":"moderate","value":"moderate","desc":"中等审核策略"},{"name":"show","label":"show","value":"show","desc":"演示场景的审核策略"},{"name":"default","label":"default","value":"default","desc":"默认的审核策略"}],"name":"内容审核的严格程度","fieldType":"string","support":true,"initialValue":"default","required":false,"key":"auditing","desc":"strict表示严格审核策略；moderate表示中等审核策略；show表示演示场景审核策略；default表示默认的审核程度；（需继续下调策略需要申请）"},{"constraintType":"enum","default":"xqwen72bchat","constraintContent":[{"name":"generalv3","label":"generalv3","value":"generalv3","desc":"星火3.0"}],"name":"需要使用的领域","fieldType":"string","support":true,"initialValue":"xqwen72bchat","required":true,"key":"domain","desc":""}],"key":"xqwen72bchat"}]},"featureBlock":{},"payloadBlock":{},"acceptBlock":{},"protocolType":1,"serviceId":"xqwen72bchat"},"url":"wss://xingchen-api.cn-huabei-1.xf-yun.com/v1.1/chat"}',0,'','2000-01-01 00:00:00','2024-11-28 16:00:00'),
	 (1421,'WORKFLOW_NODE_TEMPLATE','1,2','固定节点','{"idType":"node-start","type":"开始节点","position":{"x":100,"y":300},"data":{"label":"开始","description":"工作流的开启节点，用于定义流程调用所需的业务变量信息。","nodeMeta":{"nodeType":"基础节点","aliasName":"开始节点"},"inputs":[],"outputs":[{"id":"","name":"AGENT_USER_INPUT","deleteDisabled":true,"required":true,"schema":{"type":"string","default":"用户本轮对话输入内容"}}],"nodeParam":{},"allowInputReference":false,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/start-node-icon.png"}}',1,'开始节点','2000-01-01 00:00:00','2024-10-18 10:49:36'),
	 (1423,'WORKFLOW_NODE_TEMPLATE','1,2','固定节点','{"idType":"node-end","type":"结束节点","position":{"x":1000,"y":300},"data":{"label":"结束","description":"工作流的结束节点，用于输出工作流运行后的最终结果。","nodeMeta":{"nodeType":"基础节点","aliasName":"结束节点"},"inputs":[{"id":"","name":"output","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[],"nodeParam":{"outputMode":1,"template":"","streamOutput":true},"references":[],"allowInputReference":true,"allowOutputReference":false,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/end-node-icon.png"}}',1,'结束节点','2000-01-01 00:00:00','2025-04-09 20:41:00'),
	 (1425,'WORKFLOW_NODE_TEMPLATE','1,2','基础节点','{
    "idType": "spark-llm",
    "nodeType": "基础节点",
    "aliasName": "大模型",
    "description": "根据输入的提示词，调用选定的大模型，对提示词作出回答",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "基础节点",
            "aliasName": "大模型"
        },
        "inputs":
        [
            {
                "id": "",
                "name": "input",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
            {
                "id": "",
                "name": "output",
                "schema":
                {
                    "type": "string",
                    "default": ""
                }
            }
        ],
        "nodeParam":
        {
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "auditing": "default",
            "template": "",
            "respFormat": 0,
            "patchId": "0",
            "appId": "d1590f30",
            "uid": "",
            "enableChatHistoryV2":
            {
                "isEnabled": false,
                "rounds": 1
            }
        },
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/largeModelIcon.png"
    }
}',1,'大模型','2000-01-01 00:00:00','2025-09-29 15:52:31'),
	 (1427,'WORKFLOW_NODE_TEMPLATE','1,2','基础节点','{
    "idType": "ifly-code",
    "nodeType": "基础节点",
    "aliasName": "代码",
    "description": "面向开发者提供代码开发能力，目前仅支持python语言，允许使用该节点已定义的变量作为参数传入，返回语句用于输出函数的结果",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "工具",
            "aliasName": "代码"
        },
        "inputs":
        [
            {
                "id": "",
                "name": "input",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
            {
                "id": "",
                "name": "key0",
                "schema":
                {
                    "type": "string",
                    "default": ""
                }
            },
            {
                "id": "",
                "name": "key1",
                "schema":
                {
                    "type": "array-string",
                    "default": ""
                }
            },
            {
                "id": "",
                "name": "key2",
                "schema":
                {
                    "type": "object",
                    "default": "",
                    "properties":
                    [
                        {
                            "id": "",
                            "name": "key21",
                            "type": "string",
                            "default": "",
                            "required": true,
                            "nameErrMsg": ""
                        }
                    ]
                }
            }
        ],
        "nodeParam":
        {
            "code": "# 在这里，''input'' 是节点中定义的输入变量之一，您可以直接使用它。\\n# 您也可以定义和使用其他输入变量，例如：input2, input3 等。\\n# 输入变量的类型由节点中对应变量引用的参数类型决定。\\n#\\n# 下面是一个示例，展示如何使用多个输入变量：\\n# def main(input, input2):\\n#     ret = {\\n#         \\"key0\\": input + \\"hello\\",      # 字符串拼接示例\\n#         \\"key1\\": [\\"hello\\", \\"world\\"],   # 列表示例\\n#         \\"key2\\": {\\"key21\\": input2}     # 使用 input2 的示例\\n#     }\\n#     return ret\\n#\\n# 您需要输出一个包含多种数据类型的 ''ret'' 对象，ret 中的每一项对应节点的输出参数。\\n# 最终返回构造好的 ret 对象。\\n# -*- coding: utf-8 -*- \\ndef main(input):\\n    ret = {\\n        \\"key0\\": input + \\"hello\\",\\n        \\"key1\\": [\\"hello\\", \\"world\\"],\\n        \\"key2\\": {\\"key21\\": \\"hi\\"}\\n    }\\n    return ret"
        },
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/codeIcon.png"
    }
}',1,'代码','2000-01-01 00:00:00','2025-09-04 11:33:54'),
	 (1429,'WORKFLOW_NODE_TEMPLATE','1,2','基础节点','{"idType":"knowledge-base","nodeType":"基础节点","aliasName":"知识库","description":"调用知识库，可以指定知识库进行知识检索和答复","data":{"nodeMeta":{"nodeType":"工具","aliasName":"知识库"},"inputs":[{"id":"","name":"query","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"results","schema":{"type":"array-object","properties":[{"id":"","name":"score","type":"number","default":"","required":true,"nameErrMsg":""},{"id":"","name":"docId","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"title","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"content","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"context","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"references","type":"object","default":"","required":true,"nameErrMsg":""}]},"required":true,"nameErrMsg":""}],"nodeParam":{"repoId":[],"repoList":[],"topN":3,"score":0.2},"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/knowledgeIcon.png"}}',1,'知识库','2000-01-01 00:00:00','2025-07-25 10:06:57'),
	 (1431,'WORKFLOW_NODE_TEMPLATE','1,2','工具','{"idType":"flow","nodeType":"工具","aliasName":"工作流","description":"快速集成已发布工作流，高效复用已有能力","data":{"nodeMeta":{"nodeType":"工具","aliasName":"工作流"},"inputs":[],"outputs":[],"nodeParam":{"appId":"","flowId":"","uid":""},"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/flow-icon.png"}}',1,'工作流','2000-01-01 00:00:00','2025-05-16 11:12:07'),
	 (1433,'WORKFLOW_NODE_TEMPLATE','1,2','逻辑','{
    "idType": "decision-making",
    "nodeType": "基础节点",
    "aliasName": "决策",
    "description": "结合输入的参数与填写的意图，决定后续的逻辑走向",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "基础节点",
            "aliasName": "决策"
        },
        "nodeParam":
        {
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "auditing": "default",
            "enableChatHistoryV2":
            {
                "isEnabled": false,
                "rounds": 1
            },
            "uid": "2171",
            "intentChains":
            [
                {
                    "intentType": 2,
                    "name": "",
                    "description": "",
                    "id": "intent-one-of::4724514d-ffc8-4412-bf7f-13cc3375110d"
                },
                {
                    "intentType": 1,
                    "name": "default",
                    "description": "默认意图",
                    "id": "intent-one-of::506841e4-3f6c-40b1-a804-dc5ffe723b34"
                }
            ],
            "reasonMode": 1,
            "model": "spark",
            "useFunctionCall": true,
            "promptPrefix": "",
            "patchId": "0",
            "appId": "d1590f30"
        },
        "inputs":
        [
            {
                "id": "",
                "name": "Query",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
            {
                "id": "",
                "name": "class_name",
                "schema":
                {
                    "type": "string",
                    "default": ""
                }
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/designMakeIcon.png"
    }
}',1,'决策','2000-01-01 00:00:00','2025-09-29 15:53:15'),
	 (1435,'WORKFLOW_NODE_TEMPLATE','1,2','逻辑','{"idType":"if-else","nodeType":"分支器","aliasName":"分支器","description":"根据设立的条件，判断选择分支走向","data":{"nodeMeta":{"nodeType":"分支器","aliasName":"分支器"},"nodeParam":{"cases":[{"id":"branch_one_of::","level":1,"logicalOperator":"and","conditions":[{"id":"","leftVarIndex":null,"rightVarIndex":null,"compareOperator":null}]},{"id":"branch_one_of::","level":999,"logicalOperator":"and","conditions":[]}]},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{"nodeId":"","name":""}}}},{"id":"","name":"input1","schema":{"type":"string","value":{"type":"ref","content":{"nodeId":"","name":""}}}}],"outputs":[],"references":[],"allowInputReference":true,"allowOutputReference":false,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/if-else-node-icon.png"}}',1,'分支器','2000-01-01 00:00:00','2024-10-18 10:52:56'),
	 (1437,'WORKFLOW_NODE_TEMPLATE','1,2','逻辑','{"idType":"iteration","nodeType":"基础节点","aliasName":"迭代","description":"该节点用于处理循环逻辑，仅支持嵌套一次","data":{"nodeMeta":{"nodeType":"基础节点","aliasName":"迭代"},"nodeParam":{},"inputs":[{"id":"","name":"input","schema":{"type":"","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"output","schema":{"type":"array-string","default":""}}],"iteratorNodes":[],"iteratorEdges":[],"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/iteration-icon.png"}}',1,'迭代','2000-01-01 00:00:00','2024-10-18 10:55:30'),
	 (1439,'WORKFLOW_NODE_TEMPLATE','1,2','转换','{"idType":"node-variable","nodeType":"基础节点","aliasName":"变量存储器","description":"可以设定多个变量，用于长期保存数据，且持续生效和更新","data":{"nodeMeta":{"nodeType":"基础节点","aliasName":"变量存储器"},"nodeParam":{"method":"set"},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[],"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/variable-memory-icon.png"}}',1,'变量存储器','2000-01-01 00:00:00','2025-03-12 18:05:50'),
	 (1441,'WORKFLOW_NODE_TEMPLATE','1,2','转换','{
    "idType": "extractor-parameter",
    "nodeType": "基础节点",
    "aliasName": "变量提取器",
    "description": "结合提取变量描述，将上一节点输出的自然语言进行提取",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "基础节点",
            "aliasName": "变量提取器"
        },
        "nodeParam":
        {
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "auditing": "default",
            "model": "spark",
            "patchId": "0",
            "appId": "d1590f30",
            "uid": "2171",
            "reasonMode": 1
        },
        "inputs":
        [
            {
                "id": "",
                "name": "input",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
            {
                "id": "",
                "name": "output",
                "schema":
                {
                    "type": "string",
                    "description": ""
                },
                "required": true
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/variable-extractor-icon.png"
    }
}',1,'变量提取器','2000-01-01 00:00:00','2025-09-29 15:53:43'),
	 (1443,'WORKFLOW_NODE_TEMPLATE','1,2','转换','{"idType":"text-joiner","nodeType":"工具","aliasName":"文本处理节点","description":"用于按照指定格式规则处理多个字符串变量","data":{"nodeMeta":{"nodeType":"工具","aliasName":"文本拼接"},"nodeParam":{"prompt":""},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"output","schema":{"type":"string"}}],"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/text-splicing-icon.png"}}',1,'文本处理节点','2000-01-01 00:00:00','2025-03-25 16:27:14'),
	 (1445,'WORKFLOW_NODE_TEMPLATE','1,2','其他','{
    "idType": "message",
    "nodeType": "基础节点",
    "aliasName": "消息",
    "description": "在工作流中可以对中间过程的产物进行输出",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "基础节点",
            "aliasName": "消息"
        },
        "nodeParam":
        {
            "template": "",
            "startFrameEnabled": false
        },
        "inputs":
        [
            {
                "id": "",
                "name": "input",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
        ],
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": false,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/message-node-icon.png"
    }
}',1,'消息','2000-01-01 00:00:00','2025-09-25 20:25:23'),
	 (1447,'WORKFLOW_NODE_TEMPLATE','1,2','工具','{"idType":"plugin","nodeType":"工具","aliasName":"工具","description":"通过添加外部工具，快捷获取技能，满足用户需求","data":{"nodeMeta":{"nodeType":"工具","aliasName":"工具"},"inputs":[],"outputs":[],"nodeParam":{"appId":"4eea957b","code":""},"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/tool-icon.png"}}',1,'工具','2000-01-01 00:00:00','2024-10-18 10:52:15'),
	 (1449,'LLM_SCENE_FILTER','workflow','xfyun','lmg5gtbs0,lmyvosz36,lm0dy3kv0,lme990528,lm4onxj7h,lmbXtIcNp,lm27ebHkj,lm9ze3hwc',1,'','2000-01-01 00:00:00','2025-02-27 19:15:13'),
	 (1451,'PROMPT','ai-code','create','## 角色
你是一名python工程师，请结合用户的需求和下列规则和约束，生成一段完整的python代码文本。

## 约束依赖项
以下是支持范围外的python依赖，不要使用以外的依赖包。
1.zopfli,2.zipp,3.yarl,4.xml-python,5.xlsxwriter,6.xlrd,7.xgboost,8.xarray,9.xarray-einstats,10.wsproto,11.wrapt,12.wordcloud,13.werkzeug,14.websockets,15.websocket-client,16.webencodings,17.weasyprint,18.wcwidth,19.watchfiles,20.wasabi,21.wand,22.uvloop,23.uvicorn,24.ujson,25.tzlocal,26.typing-extensions,27.typer,28.trimesh,29.traitlets,30.tqdm,31.tornado,32.torchvision,33.torchtext,34.torchaudio,35.torch,36.toolz,37.tomli,38.toml,39.tinycss2,40.tifffile,41.thrift,42.threadpoolctl,43.thinc,44.theano-pymc,45.textract,46.textblob,47.text-unidecode,48.terminado,49.tenacity,50.tabulate,51.tabula,52.tables,53.sympy,54.svgwrite,55.svglib,56.statsmodels,57.starlette,58.stack-data,59.srsly,60.speechrecognition,61.spacy,62.spacy-legacy,63.soupsieve,64.soundfile,65.sortedcontainers,66.snuggs,67.snowflake-connector-python,68.sniffio,69.smart-open,70.slicer,71.shapely,72.shap,73.sentencepiece,74.send2trash,75.semver,76.seaborn,77.scipy,78.scikit-learn,79.scikit-image,80.rpds-py,81.resampy,82.requests,83.reportlab,84.regex,85.referencing,86.rdflib,87.rasterio,88.rarfile,89.qrcode,90.pyzmq,91.pyzbar,92.pyyaml,93.pyxlsb,94.pywavelets,95.pytz,96.pyttsx3,97.python-pptx,98.python-multipart,99.python-dotenv,100.python-docx,101.python-dateutil,102.pyth3,103.pytest,104.pytesseract,105.pyswisseph,106.pyshp,107.pyprover,108.pyproj,109.pyphen,110.pypdf2,111.pyparsing,112.pypandoc,113.pyopenssl,114.pynacl,115.pymupdf,116.pymc3,117.pyluach,118.pylog,119.pyjwt,120.pygraphviz,121.pygments,122.pydyf,123.pydub,124.pydot,125.pydantic,126.pycryptodomex,127.pycryptodome,128.pycparser,129.pycountry,130.py,131.pure-eval,132.ptyprocess,133.psutil,134.pronouncing,135.prompt-toolkit,136.prometheus-client,137.proglog,138.priority,139.preshed,140.pooch,141.pluggy,142.plotnine,143.plotly,144.platformdirs,145.pkgutil-resolve-name,146.pillow,147.pickleshare,148.pexpect,149.pdfrw,150.pdfplumber,151.pdfminer.six,152.pdfkit,153.pdf2image,154.patsy,155.pathy,156.parso,157.paramiko,158.pandocfilters,159.pandas,160.packaging,161.oscrypto,162.orjson,163.opt-einsum,164.openpyxl,165.opencv-python,166.olefile,167.odfpy,168.numpy,169.numpy-financial,170.numexpr,171.numba,172.notebook,173.notebook-shim,174.nltk,175.networkx,176.nest-asyncio,177.nbformat,178.nbconvert,179.nbclient,180.nbclassic,181.nashpy,182.mutagen,183.murmurhash,184.munch,185.multidict,186.mtcnn,187.mpmath,188.moviepy,189.monotonic,190.mne,191.mizani,192.mistune,193.matplotlib,194.matplotlib-venn,195.matplotlib-inline,196.markupsafe,197.markdownify,198.markdown2,199.lxml,200.loguru,201.llvmlite,202.librosa,203.korean-lunar-calendar,204.kiwisolver,205.kerykeion,206.keras,207.jupyterlab,208.jupyterlab-server,209.jupyterlab-pygments,210.jupyter-server,211.jupyter-core,212.jupyter-client,213.jsonschema,214.jsonschema-specifications,215.jsonpickle,216.json5,217.joblib,218.jinja2,219.jedi,220.jax,221.itsdangerous,222.isodate,223.ipython,224.ipython-genutils,225.ipykernel,226.iniconfig,227.importlib-resources,228.importlib-metadata,229.imgkit,230.imapclient,231.imageio,232.imageio-ffmpeg,233.hyperframe,234.hypercorn,235.httpx,236.httptools,237.httpcore,238.html5lib,239.hpack,240.h11,241.h5py,242.h5netcdf,243.h2,244.gtts,245.graphviz,246.gradio,247.geopy,248.geopandas,249.geographiclib,250.gensim,251.fuzzywuzzy,252.future,253.frozenlist,254.fpdf,255.fonttools,256.folium,257.flask,258.flask-login,259.flask-cors,260.flask-cachebuster,261.fiona,262.filelock,263.ffmpy,264.ffmpeg-python,265.fastprogress,266.fastjsonschema,267.fastapi,268.faker,269.extract-msg,270.executing,271.exchange-calendars,272.exceptiongroup,273.et-xmlfile,274.entrypoints,275.email-validator,276.einops,277.ebooklib,278.ebcdic,279.docx2txt,280.dnspython,281.dlib,282.dill,283.deprecat,284.defusedxml,285.decorator,286.debugpy,287.databricks-sql-connector,288.cython,289.cymem,290.cycler,291.cssselect2,292.cryptography,293.countryinfo,294.compressed-rtf,295.comm,296.cmudict,297.cloudpickle,298.cligj,299.click,300.click-plugins,301.charset-normalizer,302.chardet,303.cffi,304.catalogue,305.camelot-py,306.cairosvg,307.cairocffi,308.cachetools,309.brotli,310.branca,311.bokeh,312.blis,313.blinker,314.bleach,315.beautifulsoup4,316.bcrypt,317.basemap,318.basemap-data,319.backports.zoneinfo,320.backoff,321.backcall,322.babel,323.audioread,324.attrs,325.async-timeout,326.asttokens,327.asn1crypto,328.arviz,329.argon2-cffi,330.argon2-cffi-bindings,331.argcomplete,332.anytree,333.anyio,334.analytics-python,335.aiosignal,336.aiohttp,337.affine,338.absl-py,339.wheel,340.urllib3,341.unattended-upgrades,342.six,343.setuptools,344.requests-unixsocket,345.python-apt,346.pygobject,347.pyaudio,348.pip,349.idna,350.distro-info,351.dbus-python,352.certifi

## 规则
1、用户原始代码需要严格符合提供的参数变量列表（参数名，参数类型，参数数量）、函数名要求。
2、输入参数必须是变量列表提供的参数和类型；
3、输出返回参数类型必须是dict类型，如果用户有定义返回参数名词要严格按照用户要求返回，否则默认返回字段名为output。
4、在import后面添加注释，描述函数功能和参数定义，请直接给出代码。

## 函数名称：
main

## 参数变量列表(name:名称,type:字段类型):
{var}

## 用户需求：
{prompt}

## 注意
1、只需要实现函数功能，仅生成代码;
2、不能有测试代码、样例代码、__main__方法;

## 请直接返回代码块，不需要返回markdown格式。',1,'','2000-01-01 00:00:00','2024-10-16 17:47:31'),
	 (1453,'PROMPT','ai-code','update','## 角色
你是一名python工程师，请结合用户的代码和下列规则约束，完成对用户的代码优化。

## 约束依赖项
以下是支持范围外的python依赖，不要使用以外的依赖包。
1.zopfli,2.zipp,3.yarl,4.xml-python,5.xlsxwriter,6.xlrd,7.xgboost,8.xarray,9.xarray-einstats,10.wsproto,11.wrapt,12.wordcloud,13.werkzeug,14.websockets,15.websocket-client,16.webencodings,17.weasyprint,18.wcwidth,19.watchfiles,20.wasabi,21.wand,22.uvloop,23.uvicorn,24.ujson,25.tzlocal,26.typing-extensions,27.typer,28.trimesh,29.traitlets,30.tqdm,31.tornado,32.torchvision,33.torchtext,34.torchaudio,35.torch,36.toolz,37.tomli,38.toml,39.tinycss2,40.tifffile,41.thrift,42.threadpoolctl,43.thinc,44.theano-pymc,45.textract,46.textblob,47.text-unidecode,48.terminado,49.tenacity,50.tabulate,51.tabula,52.tables,53.sympy,54.svgwrite,55.svglib,56.statsmodels,57.starlette,58.stack-data,59.srsly,60.speechrecognition,61.spacy,62.spacy-legacy,63.soupsieve,64.soundfile,65.sortedcontainers,66.snuggs,67.snowflake-connector-python,68.sniffio,69.smart-open,70.slicer,71.shapely,72.shap,73.sentencepiece,74.send2trash,75.semver,76.seaborn,77.scipy,78.scikit-learn,79.scikit-image,80.rpds-py,81.resampy,82.requests,83.reportlab,84.regex,85.referencing,86.rdflib,87.rasterio,88.rarfile,89.qrcode,90.pyzmq,91.pyzbar,92.pyyaml,93.pyxlsb,94.pywavelets,95.pytz,96.pyttsx3,97.python-pptx,98.python-multipart,99.python-dotenv,100.python-docx,101.python-dateutil,102.pyth3,103.pytest,104.pytesseract,105.pyswisseph,106.pyshp,107.pyprover,108.pyproj,109.pyphen,110.pypdf2,111.pyparsing,112.pypandoc,113.pyopenssl,114.pynacl,115.pymupdf,116.pymc3,117.pyluach,118.pylog,119.pyjwt,120.pygraphviz,121.pygments,122.pydyf,123.pydub,124.pydot,125.pydantic,126.pycryptodomex,127.pycryptodome,128.pycparser,129.pycountry,130.py,131.pure-eval,132.ptyprocess,133.psutil,134.pronouncing,135.prompt-toolkit,136.prometheus-client,137.proglog,138.priority,139.preshed,140.pooch,141.pluggy,142.plotnine,143.plotly,144.platformdirs,145.pkgutil-resolve-name,146.pillow,147.pickleshare,148.pexpect,149.pdfrw,150.pdfplumber,151.pdfminer.six,152.pdfkit,153.pdf2image,154.patsy,155.pathy,156.parso,157.paramiko,158.pandocfilters,159.pandas,160.packaging,161.oscrypto,162.orjson,163.opt-einsum,164.openpyxl,165.opencv-python,166.olefile,167.odfpy,168.numpy,169.numpy-financial,170.numexpr,171.numba,172.notebook,173.notebook-shim,174.nltk,175.networkx,176.nest-asyncio,177.nbformat,178.nbconvert,179.nbclient,180.nbclassic,181.nashpy,182.mutagen,183.murmurhash,184.munch,185.multidict,186.mtcnn,187.mpmath,188.moviepy,189.monotonic,190.mne,191.mizani,192.mistune,193.matplotlib,194.matplotlib-venn,195.matplotlib-inline,196.markupsafe,197.markdownify,198.markdown2,199.lxml,200.loguru,201.llvmlite,202.librosa,203.korean-lunar-calendar,204.kiwisolver,205.kerykeion,206.keras,207.jupyterlab,208.jupyterlab-server,209.jupyterlab-pygments,210.jupyter-server,211.jupyter-core,212.jupyter-client,213.jsonschema,214.jsonschema-specifications,215.jsonpickle,216.json5,217.joblib,218.jinja2,219.jedi,220.jax,221.itsdangerous,222.isodate,223.ipython,224.ipython-genutils,225.ipykernel,226.iniconfig,227.importlib-resources,228.importlib-metadata,229.imgkit,230.imapclient,231.imageio,232.imageio-ffmpeg,233.hyperframe,234.hypercorn,235.httpx,236.httptools,237.httpcore,238.html5lib,239.hpack,240.h11,241.h5py,242.h5netcdf,243.h2,244.gtts,245.graphviz,246.gradio,247.geopy,248.geopandas,249.geographiclib,250.gensim,251.fuzzywuzzy,252.future,253.frozenlist,254.fpdf,255.fonttools,256.folium,257.flask,258.flask-login,259.flask-cors,260.flask-cachebuster,261.fiona,262.filelock,263.ffmpy,264.ffmpeg-python,265.fastprogress,266.fastjsonschema,267.fastapi,268.faker,269.extract-msg,270.executing,271.exchange-calendars,272.exceptiongroup,273.et-xmlfile,274.entrypoints,275.email-validator,276.einops,277.ebooklib,278.ebcdic,279.docx2txt,280.dnspython,281.dlib,282.dill,283.deprecat,284.defusedxml,285.decorator,286.debugpy,287.databricks-sql-connector,288.cython,289.cymem,290.cycler,291.cssselect2,292.cryptography,293.countryinfo,294.compressed-rtf,295.comm,296.cmudict,297.cloudpickle,298.cligj,299.click,300.click-plugins,301.charset-normalizer,302.chardet,303.cffi,304.catalogue,305.camelot-py,306.cairosvg,307.cairocffi,308.cachetools,309.brotli,310.branca,311.bokeh,312.blis,313.blinker,314.bleach,315.beautifulsoup4,316.bcrypt,317.basemap,318.basemap-data,319.backports.zoneinfo,320.backoff,321.backcall,322.babel,323.audioread,324.attrs,325.async-timeout,326.asttokens,327.asn1crypto,328.arviz,329.argon2-cffi,330.argon2-cffi-bindings,331.argcomplete,332.anytree,333.anyio,334.analytics-python,335.aiosignal,336.aiohttp,337.affine,338.absl-py,339.wheel,340.urllib3,341.unattended-upgrades,342.six,343.setuptools,344.requests-unixsocket,345.python-apt,346.pygobject,347.pyaudio,348.pip,349.idna,350.distro-info,351.dbus-python,352.certifi

## 规则
1、用户原始代码需要严格符合提供的参数变量列表（参数名，参数类型，参数数量）、函数名要求。
2、输入参数必须是变量列表提供的参数和类型；
3、输出返回参数类型必须是dict类型，如果用户有定义返回参数名词要严格按照用户要求返回，否则默认返回字段名为output。
4、在import后面添加注释，描述函数功能和参数定义，请直接给出代码。

## 函数名称：
main

## 参数变量列表(name:名词,type:字段类型):
{var}

## 用户原始代码：
{code}

## 用户的需求：
{prompt}

## 注意
1、将用户提供代码按照以上条件进行优化;
2、不能有测试代码、样例代码、__main__方法;

## 请直接返回代码块，不需要返回markdown格式。',1,'','2000-01-01 00:00:00','2024-10-16 17:45:02'),
	 (1455,'PROMPT','ai-code','fix','## 角色
你是一名python工程师，请结合用户的原始代码和错误信息，返回一个正确的代码块。

## 函数名称：
main

## 参数变量列表(name:名称,type:字段类型,value:值):
{var}

## 用户原始代码：
{code}

## 用户原始代码执行错误信息：
{errMsg}

## 注意
仅修改错误信息中提示的地方，其他地方不做变动。

## 请直接返回代码块',1,'','2000-01-01 00:00:00','2024-10-16 17:47:31'),
	 (1457,'WORKFLOW','python-dependency','代码执行器py依赖','{
  "aiohappyeyeballs": "2.4.3",
  "aiohttp": "3.10.10",
  "aiosignal": "1.3.1",
  "annotated-types": "0.7.0",
  "anyio": "4.4.0",
  "appdirs": "1.4.4",
  "astroid": "3.1.0",
  "attrs": "23.2.0",
  "black": "24.4.2",
  "boto3": "1.40.22",
  "botocore": "1.40.22",
  "certifi": "2024.7.4",
  "charset-normalizer": "3.3.2",
  "click": "8.1.7",
  "confluent-kafka": "2.5.0",
  "coverage": "7.10.7",
  "Deprecated": "1.2.14",
  "dill": "0.4.0",
  "distro": "1.9.0",
  "dnspython": "2.6.1",
  "email_validator": "2.2.0",
  "fastapi": "0.111.1",
  "fastapi-cli": "0.0.4",
  "flake8": "7.0.0",
  "frozenlist": "1.5.0",
  "grpcio": "1.64.1",
  "h11": "0.14.0",
  "httpcore": "1.0.5",
  "httptools": "0.6.4",
  "httpx": "0.27.0",
  "idna": "3.7",
  "importlib_metadata": "7.1.0",
  "iniconfig": "2.0.0",
  "isort": "5.13.2",
  "Jinja2": "3.1.4",
  "jiter": "0.10.0",
  "jmespath": "1.0.1",
  "jsonpatch": "1.33",
  "jsonpointer": "3.0.0",
  "jsonschema": "4.23.0",
  "jsonschema-specifications": "2023.12.1",
  "langchain-core": "0.3.75",
  "langchain_sandbox": "0.0.6",
  "langgraph": "0.6.6",
  "langgraph-checkpoint": "2.1.1",
  "langgraph-prebuilt": "0.6.4",
  "langgraph-sdk": "0.2.4",
  "langsmith": "0.4.21",
  "loguru": "0.7.2",
  "markdown-it-py": "3.0.0",
  "MarkupSafe": "2.1.5",
  "mccabe": "0.7.0",
  "mdurl": "0.1.2",
  "multidict": "6.1.0",
  "openai": "1.60.2",
  "orjson": "3.10.6",
  "ormsgpack": "1.10.0",
  "packaging": "24.1",
  "pathspec": "0.12.1",
  "pip": "23.2.1",
  "platformdirs": "4.4.0",
  "pluggy": "1.5.0",
  "propcache": "0.2.0",
  "protobuf": "3.20.3",
  "py-spy": "0.4.1",
  "pycodestyle": "2.11.1",
  "pydantic": "2.9.2",
  "pydantic_core": "2.23.4",
  "pyflakes": "3.2.0",
  "Pygments": "2.18.0",
  "pylint": "3.1.0",
  "PyMySQL": "1.1.1",
  "pytest": "8.2.2",
  "pytest-asyncio": "1.2.0",
  "pytest-cov": "7.0.0",
  "python-dateutil": "2.9.0.post0",
  "python-dotenv": "1.0.1",
  "python-multipart": "0.0.9",
  "PyYAML": "6.0.1",
  "redis": "3.5.3",
  "redis-py-cluster": "2.1.3",
  "referencing": "0.35.1",
  "requests": "2.32.3",
  "requests-toolbelt": "1.0.0",
  "rich": "13.7.1",
  "rpds-py": "0.19.0",
  "s3transfer": "0.13.1",
  "setuptools": "70.3.0",
  "shellingham": "1.5.4",
  "six": "1.17.0",
  "sniffio": "1.3.1",
  "snowflake-id": "1.0.2",
  "SQLAlchemy": "2.0.31",
  "sqlmodel": "0.0.19",
  "starlette": "0.37.2",
  "tenacity": "9.1.2",
  "toml": "0.10.2",
  "tomlkit": "0.13.3",
  "tqdm": "4.67.1",
  "typer": "0.12.3",
  "typing_extensions": "4.12.2",
  "urllib3": "2.2.2",
  "uvicorn": "0.36.0",
  "uvloop": "0.21.0",
  "versioned-fastapi": "1.0.2",
  "watchfiles": "0.22.0",
  "websocket-client": "1.8.0",
  "websockets": "12.0",
  "wheel": "0.41.2",
  "wrapt": "1.16.0",
  "xingchen_utils": "1.0.7",
  "xxhash": "3.5.0",
  "yarl": "1.16.0",
  "zipp": "3.19.2",
  "zstandard": "0.24.0"
}',1,'','2000-01-01 00:00:00','2025-10-15 16:25:41'),
	 (1458,'TEMPLATE','node','','[
    {
        "idType": "spark-llm",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/largeModelIcon.png",
        "name": "大模型",
        "markdown": "## 用途\\n根据输入的提示词，调用选定的大模型，对提示词作出回答\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | input（引用）| 开始-query |\\n## 提示词\\n你是一个旅行规划超级智能体，你非常善于从用户的【输入信息】中，识别出用户旅行的各种需求信息，并且整理输出。现在你的任务是，严格按照下面的定义和规则要求，仔细分析和理解下面用户的【输入信息】，输出一份用户旅行需求资料，资料包含了，【旅行目的地】、【旅行天数】、【旅行人员】、【景点偏好】、【旅行时间】\\n### 输出\\n | 变量名 | 变量值 |\\n |------------|--------|\\n | output（String）| 🌟亲爱的朋友，小助手收到啦！我已经了解到您本次旅行希望开启一段精彩的合肥三日之旅😃。请稍等片刻，我将为您生成行程卡片。在这之前，让我简短介绍一下我们这次的目的地合肥，它有着很多非常值得一去的景点。合肥的三河古镇🏯，那是一个充满古朴韵味的地方。青石板路蜿蜒曲折，两旁是白墙黑瓦的徽派建筑。当您漫步其间，仿佛穿越回了过去，能感受到岁月的沉淀和历史的韵味。还有包公园🌳，这里是为纪念包拯而建。清风阁高耸入云，站在阁顶，俯瞰整个园区，绿树成荫，湖水碧波荡漾。当您身处其中，敬仰包拯的清正廉洁，内心会感到无比的宁静和崇敬。大蜀山森林公园也是不容错过的好去处🌲，山峦起伏，绿树葱茏。沿着山间小道攀登，呼吸着清新的空气，您会感到身心都得到了极大的放松。除此之外，李鸿章故居也是非常值得一去的地方。在这里，您可以了解到李鸿章的生平事迹，感受那段波澜壮阔的历史。相信在合肥的这三天，您一定会留下美好的回忆💖。祝您旅途愉快🌟| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-llm.png)"
    },
    {
        "idType": "ifly-code",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/codeIcon.png",
        "name": "代码",
        "markdown": "## 用途\\n面向开发者提供代码开发能力，目前仅支持python语言，允许使用该节点已定义的变量作为参数传入，返回语句用于输出函数的结果\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | location（引用）| 代码-location |\\n| person（引用）| 代码-person |\\n| day（引用）| 代码-day |\\n## 代码（将上个节点里的地名和人数引用过来，拼成地点+人数+天数+旅游攻略）\\nasync def main(args:Args)->Output: \\nparams=args.params\\n ret:Output={\\"ret\\":params[''location'']+params[''person'']+params[''day'']+''旅游攻略''}\\n return ret\\n### 输出\\n | 变量名 | 变量值 |\\n |------------|--------|\\n | ret（String）| 合肥5人3日旅游攻略| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-code.png)"
    },
    {
        "idType": "knowledge-base",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/knowledgeIcon.png",
        "name": "知识库",
        "markdown": "## 用途\\n调用知识库，可以指定知识库进行知识检索和答复\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | Query（String）（引用）| 大模型-output |\\n## 知识库 \\n全国美食大全\\n### 输出\\n | 变量名 | 变量值 |\\n |------------|--------|\\n | OutputList（Array<Object>）| 合肥十大美食：曹操鸡、庐州烤鸭、肥东泥鳅煲、麻饼、麻花、麻糕、鸭油烧饼、肥西老母鸡、肥西肥肠煲、紫蓬山炖鹅| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-knowledge.png)"
    },
    {
        "idType": "plugin",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/tool-icon.png",
        "name": "工具",
        "image": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-tool.png",
        "markdown": "## 用途\\n通过添加外部工具，快捷获取技能，满足用户需求\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | query（引用）【这边以bing搜索工具为例，query为该工具的必填参数】| 代码-美食-result |\\n### 输出\\n | 变量名 | 变量值 |\\n |------------|--------|\\n | result（String）| 合肥美食,合肥美食攻略,合肥美食推荐-马蜂窝庐州烤鸭店到合肥的第一天就来到了庐州烤鸭店，他家的桂花赤豆糊和鸭油烧饼还有烤鸭是很有名的，所以我就来了准备尝一尝，而且我发现有一个店有团购套餐，非常实惠哦！老乡鸡要说这个老乡鸡可以说是安徽一个代表性的连锁快餐店，而且合肥人从古就是喜欢喝鸡汤的，原名：肥西老母鸡汤，我去了点了一份小份招牌老母鸡汤，接下来为大家详细分享一下！刘鸿盛冬菇鸡饺之前做功课前以为是用冬天的蘑菇和鸡肉馅的饺子，哈哈，做完功课才发现其实就是鸡汤+馄饨+冬菇（一种蘑菇），咱们现在去合肥比较有名的老店尝一尝吧~| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-tool.png)"
    },
    {
        "idType": "flow",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/flow-icon.png",
        "name": "工作流",
        "markdown": "## 用途\\n大模型会根据节点输入，结合提示词内容，判断您填写的意图，决定后续的逻辑走向\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | location（引用）【此参数为引入的工作流的必填参数，不可删除】| 变量提取器-location |\\n | data（引用）【此参数为引入的工作流的必填参数，不可删除】 | 变量提取器-data |  \\n### 输出\\n | 变量名 | 变量值 |\\n |------------|--------|\\n | output（String）| 合肥今天天气状况为多云，温度范围在27℃~33℃，风向风力为东北风5-6级。建议穿着透气衣物，避免长时间户外活动，注意防暑降温。具体天气情况如下：天气：多云。最高温度：33℃。最低温度：27℃。日出时间：05:23。日落时间：19:12。风向风力：东北风5-6级。相对湿度：71%。空气质量：优。| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-flow.png)"
    },
    {
        "idType": "decision-making",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/designMakeIcon.png",
        "name": "决策",
        "markdown": "## 用途\\n大模型会根据节点输入，结合提示词内容，判断您填写的意图，决定后续的逻辑走向\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | guide（引用）| 代码-guide |\\n | food（引用） | 代码-food | \\n | hotel（引用）| 代码-hotel | \\n## 提示词\\n根据攻略{{guide}}、美食偏好{{food}}、酒店位置{{hotel}}决定走不同的意图\\n## 意图\\n意图一：旅游攻略意图描述：如果想查询旅游攻略，走该分支 意图二：美食推荐意图描述：如果想获取地方美食推荐，走该分支 意图三：酒店推荐意图描述：如果想获取酒店住宿推荐，走该分支 其他：以上分支均不满足要求，走此分支 \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-decision.png)"
    },
    {
        "idType": "if-else",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/if-else-node-icon.png",
        "name": "分支器",
        "markdown": "## 用途\\n根据设立的条件，判断选择分支走向\\n## 示例\\n### 输入\\n| 条件  | \\n |----------------|\\n  | 条件一：变量\\"开始-query\\"包含旅游或攻略（当被引用的开始节点的query变量包含旅游或攻略字样，进入这个分支） 否则：当条件不符合设定的任何条件，则进入此分支| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-branch.jpg)"
    },
    {
        "idType": "iteration",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/iteration-icon.png",
        "name": "迭代",
        "image": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-iteration.png",
        "markdown": "## 用途\\n该节点用于处理循环逻辑，仅支持嵌套一次\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | locations（Array）| 代码-locations |\\n### 输出\\n | 变量名 | 变量值 |\\n |------------|--------|\\n | outputList（Array）| [{\\"合肥旅游攻略：\\"},{\\"南京旅游攻略：\\"},{\\"上海旅游攻略:\\"}]| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-iteration.png)"
    },
    {
        "idType": "node-variable",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/variable-memory-icon.png",
        "name": "变量存储器",
        "image": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-var-storage.png",
        "markdown": "## 用途\\n可定义多个变量，在整个多轮会话期间持续生效，用于多轮会话期间内容保存，新建会话或者删除聊天记录后，变量将会清空\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n |----------------|----------------------|\\n | question| 开始-query |\\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-var-storage.png)"
    },
    {
        "idType": "extractor-parameter",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/variable-extractor-icon.png",
        "name": "变量提取器",
        "image": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-var-extractor.png",
        "markdown": "## 用途\\n结合提取变量描述，将上一节点输出的自然语言进行提取\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n|----------------|----------------------|\\n| location | 将问题中的地点名词提取出来 |\\n| day | 将问题中的游玩天数名词提取出来 |\\n| person | 将问题中的人数名词提取出来 |\\n| data | 将问题中的日期名词提取出来 |\\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-var-extractor.png)"
    },
    {
        "idType": "message",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/message-node-icon.png",
        "name": "消息",
        "image": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-message.png",
        "markdown": "## 消息\\n## 用途\\n在工作流中可以对中间过程的产物进行输出\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n|----------------|----------------------|\\n| result（引用）| 大模型-output |\\n| result1（引用）| 大模型-output1 |\\n### 输出\\n| 变量名 | 变量值 |\\n|------------|--------|\\n| 大模型-output| 回答内容：就您询问的问题，给您提供以下两种解决方案：方案一：{{result}}方案二：{{result1}}| \\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-message.png)"
    },
    {
        "idType": "text-joiner",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/text-splicing-icon.png",
        "name": "文本拼接",
        "image": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-text-joiner.png",
        "markdown": "## 用途\\n将定义过的变量用{{变量名}}的方式引用，节点会按照拼接规则输出内容\\n## 示例\\n### 输入\\n| 参数名 | 参数值 |\\n|----------------|----------------------|\\n| age（input）| 18 |\\n| name（input）| 小明 |\\n\\n## 规则\\n我是{{name}}，今年{{age}}岁了。\\n\\n### 输出\\n| 变量名 | 变量值 |\\n|------------|--------|\\n| output（String）| 我是小明，今年18岁了。|\\n\\n![占位图片](https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/template/node-text-joiner.png)"
    },
    {
        "idType": "agent",
        "name": "Agent智能决策",
        "icon": "https://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/agent.png",
        "markdown": "## 用途\\n该节点主要依据用户选择的策略进行工具智能调度，同时根据输入的提示词，调用选定的大模型，对提示词作出回答。\\n## 示例\\n###输入\\n| 参数名字 | 参数值 |\\n |----------------|----------------------|\\n | Input | 开始/AGENT_USER_INPUT |\\n## Agent策略\\n选择相应的策略，当前的ReAct策略可用于指导大模型完成复杂任务的结构化思考和决策过程。\\n## 工具列表\\n支持在已发布列表里同时勾选并添加多个工具或 MCP，最多添加 30 个。\\n## 自定义MCP服务器地址\\n支持自定义添加MCP服务器地址，上限3个。\\n## 提示词\\n该模块分为3个部分：\\n- **角色设定（非必填）**：让大模型按照特定的角色/输出格式进行交流的过程；\\n- **思考步骤（非必填）**：是否要干预大模型的推理过程，大模型会依据思考提示和决策策略进行调度；\\n- **用户查询/提问（query）（必填）**：用户的问题和指令，让模型知道我们想要什么。 \\n## 最大轮次\\n大模型的推理轮次，建议推理轮次大于等于工具数量，当前最大轮次为100轮，默认为10轮。\\n## 输出\\n | 参数名字 | 参数值 | 描述 |\\n |------------|--------|--------------------|\\n | Reasonging | String | 大模型思考过程 |\\n | Output | String | 大模型输出 |"
    },
    {
        "idType": "knowledge-pro-base",
        "name": "知识库pro",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/knowledgeIcon.png",
        "markdown": "## 用途\\n在复杂的场景下，通过智能策略调用知识库，可以指定知识库进行知识检索和总结回复。\\n## 回答模式\\n选择用于对问题进行拆解以及对召回结果进行总结的大模型。\\n## 策略选择\\n## Agentic RAG\\n适用于处理问题涉及多个方面，需要分解为多个子问题进行检索，例如“如何提升学生的综合素质”、可拆分成“学术成绩”、“身心健康”等多个子问题。\\n## Long RAG\\n专注于长文档内容的理解与生成，适用于长文档相关任务。\\n## 示例\\n### 输入\\n| 参数名字 | 参数值 | 描述 |\\n |----------------|----------------------|----------------------|\\n | query | String | 用户输入 |\\n## 知识库\\n选择相应的知识库，进行参数设置，用于筛选与 用户问题相似度最高的文本片段，系统同时会根据选用模型上下文窗口大小动态调整分段数量。当问题被分解时，最终汇总的片段数量为设定的top k乘以问题数。例如，一个问题分解为3个子问题，设定为召回3个片段，最终汇总3✖3=9个片段。\\n## 回答规则\\n非必填，如果有输出要求限制或对特殊情况的说明请在此补充，例如:回答用户的问题，如果没有找到答案时，请直接告诉我“不知道”。\\n### 输出\\n | 参数名字 | 参数值 | 描述 |\\n |------------|--------|--------------------|\\n | Reasonging | String | 大模型思考过程 |\\n | Output | String | 大模型输出 |\\n | result| （Array\\\\<Object\\\\>） | 召回结果"
    },
    {
        "idType": "question-answer",
        "name": "问答",
        "icon": "https://oss-beijing-m8.openstorage.cn/SparkBot/test4/answer-new2.png",
        "markdown": "## 用途\\n该节点支持中间环节向用户进行提问操作，提供预置选项提问与开放式问题提问两种方式。\\n\\n## 示例1（选项回复）\\n\\n| 参数名字 | 参数值 |\\n|-----------|--------------------------------------------------|\\n| Input     | 开始/AGENT_USER_INPUT                          |\\n| 提问内容 | 去旅游是个超棒的想法呀！能让你暂时摆脱日常的琐碎，去感受不一样的风景和文化~你目前有没有大概的方向或者想法呢？ |\\n| 回答模式 | 选项回复                                       |\\n| 设置选项内容 | A：自然风光类 B：历史文化类 C：都市繁华类 |\\n\\n### 输出\\n\\n| 参数名字 | 参数值 | 描述         |\\n|----------|--------|--------------|\\n| query    | String | 该节点提问内容 |\\n| id       | String | 用户回复选项   |\\n| content  | String | 用户回复内容   |\\n\\n---\\n\\n## 示例2（直接回复）\\n\\n| 参数名字   | 参数值                                     |\\n|------------|--------------------------------------------|\\n| Input      | 开始/AGENT_USER_INPUT                     |\\n| 提问内容   | 你想要去哪旅游？目的地类型？旅游时间？预算？ |\\n| 回答模式   | 直接回复                                   |\\n\\n### 输出\\n\\n| 参数名字 | 参数值 | 描述         |\\n|----------|--------|--------------|\\n| query    | String | 该节点提问内容 |\\n| content  | String | 用户回复内容   |\\n\\n### 参数抽取\\n\\n| 参数名字 | 参数值 | 描述       | 默认值 | 是否必要 |\\n|----------|--------|------------|--------|----------|\\n| city     | String | 地点       | --     | 是       |\\n| type     | String | 目的地类型 | --     | 是       |\\n| time     | Number | 行程时长   | --     | 是       |\\n| budget   | String | 预算       | --     | 是       |\\n"
    },
    {
        "idType": "database",
        "name": "数据库",
        "icon": "https://oss-beijing-m8.openstorage.cn/SparkBotDev/icon/user/sparkBot_1752568522509_database_icon.svg",
        "markdown": "## 用途\\n该节点可以连接指定的数据库，对数据库进行新增、查询、编辑、删除等常见操作，实现动态的数据管理。\\n\\n## 示例\\n\\n### 输入\\n\\n| 参数名字 | 参数值 |\\n|-----------|--------------------------------------------------|\\n| Input     | 开始/AGENT_USER_INPUT                          |\\n\\n### 输出\\n\\n| 参数名字 | 参数值 | 描述         |\\n|----------|--------|--------------|\\n| isSuccess    | Boolean| SQL语句执行状态标识，成功true，失败false |\\n| message       | String | 失败原因   |\\n| outputList  | （Array\\\\<Object\\\\>）| 执行结果   |\\n"
    },
    {
        "idType": "rpa",
        "name": "rpa",
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/knowledgeIcon.png",
        "markdown": "## 用途\\n\\nRPA（机器人流程自动化）工具节点是一个强大的自动化执行器，它通过获取RPA平台的机器人资源，直接连接并触发指定的RPA机器人流程，打通不同系统间的数据壁垒。\\n\\n## 示例\\n\\n### 输入\\n\\n| 参数名字 | 参数值 |\\n|---------|--------|\\n| inputer | 开始/AGENT_USER_INPUT |\\n\\n### 输出\\n\\n| 参数名字 | 参数值 | 描述 |\\n|---------|--------|------|\\n| outputer | String | 输出结果 |\\n\\n### 异常处理\\n\\n超时120s 重试2次 依然失败中断流程\\n\\n![占位图片](http://oss-beijing-m8.openstorage.cn/SparkBotProd/XINCHEN/rpa.PNG)"
    }
]',1,'','2000-01-01 00:00:00','2025-10-11 13:58:53'),
	 (1459,'WORKFLOW_CHANNEL','api','API','发布为API',1,'完成配置后，即可接入到个人应用中使用。','2000-01-01 00:00:00','2025-01-06 17:02:30'),
	 (1460,'SPECIAL_USER','workflow-all-view',NULL,'100000039012',1,NULL,'2000-01-01 00:00:00','2024-12-03 19:16:07'),
	 (1461,'WORKFLOW_CHANNEL','ixf-personal','i讯飞-个人版','发布至新版本i讯飞中',0,'无需审核，个人版本仅供个人使用和对话，无法分享给他人，也无法拉入群内。','2000-01-01 00:00:00','2024-12-19 11:10:51'),
	 (1463,'WORKFLOW_CHANNEL','ixf-team','i讯飞-团队版','发布至新版本i讯飞中',0,'需要经过审核，团队版本支持分享给他人使用，支持拉入群内使用。','2000-01-01 00:00:00','2024-12-19 11:10:51'),
	 (1465,'WORKFLOW_CHANNEL','aiui','交互链路','发布至AIUI智能体平台',1,'发布并审核通过后，即可在aiui平台进行配置。','2000-01-01 00:00:00','2024-12-13 10:15:09'),
	 (1467,'WORKFLOW_CHANNEL','sparkdesk','星火Desk/APP','发布至讯飞星火desk，以及星火app（App、网页版）',0,'发布并审核通过后，即可在星火desk和星火App体验该智能体。','2000-01-01 00:00:00','2024-12-19 11:10:51'),
	 (1469,'WORKFLOW_CHANNEL','square','工作流广场','发布至星辰工作流广场',1,'发布成功后，用户即可在广场使用。','2000-01-01 00:00:00','2025-03-24 17:50:37'),
	 (1470,'SWITCH','EvalTaskStatusGetJob','0','0',1,'1','2000-01-01 00:00:00','2025-01-08 11:41:09'),
	 (1472,'PROMPT','new-intent','','### 工作职责描述    你是一个文本分类引擎，需要分析文本数据，并根据用户的输入和分类的描述认真思考并确定分配类别。### 任务    你的任务是只给输入文本分配一个类别，并且只能在输出中返回一个类别。此外，您需要从文本中提取与分类相关的关键字，若完全没有相关性可以为空。### 输入格式    输入文本在变量input_text中。类别是一个列表，变量Categories中包含字段category_id、category_name、category_desc。严格按照分类说明认真思考，以提高分类精度。### 历史记忆    这是人类和助手之间的聊天历史记录，在<histories></histories> XML标签中。    <histories>            </histories>### 约束    不要在响应中包含JSON数组以外的任何内容。    ### 输出格式    ````````````json{\\"category_name\\": \\"\\"}````````````    ### 以下是需要分析的文本数据    $coreText',1,'新决策节点的prompt','2000-01-01 00:00:00','2025-01-14 15:45:13'),
	 (1473,'LLM_WORKFLOW_FILTER','iflyaicloud','null','lmg5gtbs0,lmyvosz36,lm0dy3kv0,lme990528,lm479a5b8,lmt4do9o3',0,'','2000-01-01 00:00:00','2025-03-24 19:39:30'),
	 (1475,'LLM_WORKFLOW_FILTER','xfyun','null','',0,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1477,'LLM_WORKFLOW_FILTER','iflyaicloud','spark-llm','',0,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1479,'LLM_WORKFLOW_FILTER','iflyaicloud','decision-making','',0,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1481,'LLM_WORKFLOW_FILTER','iflyaicloud','extractor-parameter','',0,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1483,'LLM_WORKFLOW_FILTER','xfyun','extractor-parameter','',0,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1485,'LLM_WORKFLOW_FILTER','xfyun','decision-making','',0,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1487,'LLM_WORKFLOW_FILTER','xfyun','spark-llm','',0,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1488,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','固定节点','{"idType":"node-start","type":"开始节点","position":{"x":100,"y":300},"data":{"label":"开始","description":"工作流的开启节点，用于定义流程调用所需的业务变量信息。","nodeMeta":{"nodeType":"基础节点","aliasName":"开始节点"},"inputs":[],"outputs":[{"id":"","name":"AGENT_USER_INPUT","deleteDisabled":true,"required":true,"schema":{"type":"string","default":"用户本轮对话输入内容"}}],"nodeParam":{},"allowInputReference":false,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/start-node-icon.png"}}',1,'开始节点','2000-01-01 00:00:00','2024-10-18 10:49:36'),
	 (1490,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','固定节点','{"idType":"node-end","type":"结束节点","position":{"x":1000,"y":300},"data":{"label":"结束","description":"工作流的结束节点，用于输出工作流运行后的最终结果。","nodeMeta":{"nodeType":"基础节点","aliasName":"结束节点"},"inputs":[{"id":"","name":"output","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[],"nodeParam":{"outputMode":1,"template":"","streamOutput":true},"references":[],"allowInputReference":true,"allowOutputReference":false,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/end-node-icon.png"}}',1,'结束节点','2000-01-01 00:00:00','2025-04-09 14:57:28'),
	 (1492,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','基础节点','{
    "idType": "spark-llm",
    "nodeType": "基础节点",
    "aliasName": "大模型",
    "description": "根据输入的提示词，调用选定的大模型，对提示词作出回答",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "基础节点",
            "aliasName": "大模型"
        },
        "inputs":
        [
            {
                "id": "",
                "name": "input",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
            {
                "id": "",
                "name": "output",
                "schema":
                {
                    "type": "string",
                    "default": ""
                }
            }
        ],
        "nodeParam":
        {
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "auditing": "default",
            "domain": "4.0Ultra",
            "template": "",
            "model": "spark",
            "serviceId": "bm4",
            "respFormat": 0,
            "llmId": 110,
            "patchId": "0",
            "url": "wss://spark-api.xf-yun.com/v4.0/chat",
            "appId": "d1590f30",
            "uid": "2171",
            "enableChatHistoryV2":
            {
                "isEnabled": false,
                "rounds": 1
            }
        },
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/largeModelIcon.png"
    }
}',1,'大模型','2000-01-01 00:00:00','2025-07-24 18:56:09'),
	 (1494,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','基础节点','{"idType":"ifly-code","nodeType":"基础节点","aliasName":"代码","description":"面向开发者提供代码开发能力，目前仅支持python语言，允许使用该节点已定义的变量作为参数传入，返回语句用于输出函数的结果","data":{"nodeMeta":{"nodeType":"工具","aliasName":"代码"},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"key0","schema":{"type":"string","default":""}},{"id":"","name":"key1","schema":{"type":"array-string","default":""}},{"id":"","name":"key2","schema":{"type":"object","default":"","properties":[{"id":"","name":"key21","type":"string","default":"","required":true,"nameErrMsg":""}]}}],"nodeParam":{"code":"def main(input):\\n    ret = {\\n        \\"key0\\": input + \\"hello\\",\\n        \\"key1\\": [\\"hello\\", \\"world\\"],\\n        \\"key2\\": {\\"key21\\": \\"hi\\"}\\n    }\\n    return ret"},"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/codeIcon.png"}}',1,'代码','2000-01-01 00:00:00','2024-10-21 17:06:50'),
	 (1496,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','基础节点','{"idType":"knowledge-base","nodeType":"基础节点","aliasName":"知识库","description":"调用知识库，可以指定知识库进行知识检索和答复","data":{"nodeMeta":{"nodeType":"工具","aliasName":"知识库"},"inputs":[{"id":"","name":"query","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"results","schema":{"type":"array-object","properties":[{"id":"","name":"score","type":"number","default":"","required":true,"nameErrMsg":""},{"id":"","name":"docId","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"title","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"content","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"context","type":"string","default":"","required":true,"nameErrMsg":""},{"id":"","name":"references","type":"object","default":"","required":true,"nameErrMsg":""}]},"required":true,"nameErrMsg":""}],"nodeParam":{"repoId":[],"repoList":[],"topN":3,"score":0.2},"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/knowledgeIcon.png"}}',1,'知识库','2000-01-01 00:00:00','2025-07-24 16:46:06'),
	 (1498,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','工具','{"idType":"plugin","nodeType":"工具","aliasName":"工具","description":"通过添加外部工具，快捷获取技能，满足用户需求","data":{"nodeMeta":{"nodeType":"工具","aliasName":"工具"},"inputs":[],"outputs":[],"nodeParam":{"appId":"4eea957b","code":""},"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/tool-icon.png"}}',1,'工具','2000-01-01 00:00:00','2024-10-18 10:52:15'),
	 (1500,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','工具','{"idType":"flow","nodeType":"工具","aliasName":"工作流","description":"快速集成已发布工作流，高效复用已有能力","data":{"nodeMeta":{"nodeType":"工具","aliasName":"工作流"},"inputs":[],"outputs":[],"nodeParam":{"appId":"","flowId":"","uid":""},"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/flow-icon.png"}}',1,'工作流','2000-01-01 00:00:00','2025-05-16 11:10:09'),
	 (1502,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','逻辑','{
    "idType": "decision-making",
    "nodeType": "基础节点",
    "aliasName": "决策",
    "description": "结合输入的参数与填写的意图，决定后续的逻辑走向",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "基础节点",
            "aliasName": "决策"
        },
        "nodeParam":
        {
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "auditing": "default",
            "domain": "4.0Ultra",
            "llmId": 110,
            "enableChatHistoryV2":
            {
                "isEnabled": false,
                "rounds": 1
            },
            "uid": "2171",
            "intentChains":
            [
                {
                    "intentType": 2,
                    "name": "",
                    "description": "",
                    "id": "intent-one-of::4724514d-ffc8-4412-bf7f-13cc3375110d"
                },
                {
                    "intentType": 1,
                    "name": "default",
                    "description": "默认意图",
                    "id": "intent-one-of::506841e4-3f6c-40b1-a804-dc5ffe723b34"
                }
            ],
            "reasonMode": 1,
            "model": "spark",
            "useFunctionCall": true,
            "serviceId": "bm4",
            "promptPrefix": "",
            "patchId": "0",
            "url": "wss://spark-api.xf-yun.com/v4.0/chat",
            "appId": "d1590f30"
        },
        "inputs":
        [
            {
                "id": "",
                "name": "Query",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
            {
                "id": "",
                "name": "class_name",
                "schema":
                {
                    "type": "string",
                    "default": ""
                }
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/designMakeIcon.png"
    }
}',1,'决策','2000-01-01 00:00:00','2025-07-24 18:56:09'),
	 (1504,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','逻辑','{"idType":"if-else","nodeType":"分支器","aliasName":"分支器","description":"根据设立的条件，判断选择分支走向","data":{"nodeMeta":{"nodeType":"分支器","aliasName":"分支器"},"nodeParam":{"cases":[{"id":"branch_one_of::","level":1,"logicalOperator":"and","conditions":[{"id":"","leftVarIndex":null,"rightVarIndex":null,"compareOperator":null}]},{"id":"branch_one_of::","level":999,"logicalOperator":"and","conditions":[]}]},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{"nodeId":"","name":""}}}},{"id":"","name":"input1","schema":{"type":"string","value":{"type":"ref","content":{"nodeId":"","name":""}}}}],"outputs":[],"references":[],"allowInputReference":true,"allowOutputReference":false,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/if-else-node-icon.png"}}',1,'分支器','2000-01-01 00:00:00','2024-10-18 10:52:56'),
	 (1506,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','逻辑','{"idType":"iteration","nodeType":"基础节点","aliasName":"迭代","description":"该节点用于处理循环逻辑，仅支持嵌套一次","data":{"nodeMeta":{"nodeType":"基础节点","aliasName":"迭代"},"nodeParam":{},"inputs":[{"id":"","name":"input","schema":{"type":"","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"output","schema":{"type":"array-string","default":""}}],"iteratorNodes":[],"iteratorEdges":[],"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/iteration-icon.png"}}',1,'迭代','2000-01-01 00:00:00','2024-10-18 10:55:30'),
	 (1508,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','转换','{"idType":"node-variable","nodeType":"基础节点","aliasName":"变量存储器","description":"可定义多个变量，在整个多轮会话期间持续生效，用于多轮会话期间内容保存，新建会话或者删除聊天记录后，变量将会清空","data":{"nodeMeta":{"nodeType":"基础节点","aliasName":"变量存储器"},"nodeParam":{"method":"set"},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[],"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/variable-memory-icon.png"}}',1,'变量存储器','2000-01-01 00:00:00','2024-10-18 10:55:30'),
	 (1510,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','转换','{
    "idType": "extractor-parameter",
    "nodeType": "基础节点",
    "aliasName": "变量提取器",
    "description": "结合提取变量描述，将上一节点输出的自然语言进行提取",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "基础节点",
            "aliasName": "变量提取器"
        },
        "nodeParam":
        {
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "auditing": "default",
            "domain": "4.0Ultra",
            "llmId": 110,
            "model": "spark",
            "serviceId": "bm4",
            "patchId": "0",
            "url": "wss://spark-api.xf-yun.com/v4.0/chat",
            "appId": "d1590f30",
            "uid": "2171",
            "reasonMode": 1
        },
        "inputs":
        [
            {
                "id": "",
                "name": "input",
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                }
            }
        ],
        "outputs":
        [
            {
                "id": "",
                "name": "output",
                "schema":
                {
                    "type": "string",
                    "description": ""
                },
                "required": true
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/variable-extractor-icon.png"
    }
}',1,'变量提取器','2000-01-01 00:00:00','2025-07-24 18:56:09'),
	 (1512,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','转换','{"idType":"text-joiner","nodeType":"工具","aliasName":"文本处理节点","description":"用于按照指定格式规则处理多个字符串变量","data":{"nodeMeta":{"nodeType":"工具","aliasName":"文本拼接"},"nodeParam":{"prompt":""},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"output","schema":{"type":"string"}}],"references":[],"allowInputReference":true,"allowOutputReference":true,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/text-splicing-icon.png"}}',1,'文本处理节点','2000-01-01 00:00:00','2025-03-25 16:33:24'),
	 (1514,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','其他','{"idType":"message","nodeType":"基础节点","aliasName":"消息","description":"在工作流中可以对中间过程的产物进行输出","data":{"nodeMeta":{"nodeType":"基础节点","aliasName":"消息"},"nodeParam":{"template":"","startFrameEnabled":false},"inputs":[{"id":"","name":"input","schema":{"type":"string","value":{"type":"ref","content":{}}}}],"outputs":[{"id":"","name":"output_m","schema":{"type":"string"}}],"references":[],"allowInputReference":true,"allowOutputReference":false,"icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/message-node-icon.png"}}',1,'消息','2000-01-01 00:00:00','2024-10-18 10:57:28'),
	 (1516,'mingduan','1',NULL,'http://maas-api.cn-huabei-1.xf-yun.com/v1',1,'https://spark-api-open.xf-yun.com/v2','2000-01-01 00:00:00','2025-04-18 17:49:46'),
	 (1517,'AI_CODE','DS_V3_domain','1','xdeepseekv3',1,NULL,'2000-01-01 00:00:00','2025-03-13 09:36:01'),
	 (1519,'AI_CODE','DS_V3_url','1','wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat',1,NULL,'2000-01-01 00:00:00','2025-03-13 09:36:01'),
	 (1520,'LLM','base-model','xdeepseekr1','xdeepseekr1',1,'DeepSeek-R1','2000-01-01 00:00:00',NULL),
	 (1522,'LLM','base-model','xdeepseekv3','xdeepseekv3',1,'DeepSeek-V3','2000-01-01 00:00:00','2024-07-08 11:06:09'),
	 (1524,'TAG','FLOW_TAGS','交通出行','travel',1,'交通出行','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1526,'TAG','FLOW_TAGS','休闲娱乐','recreation',1,'休闲娱乐','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1528,'TAG','FLOW_TAGS','医药健康','medicine',1,'医药健康','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1530,'TAG','FLOW_TAGS','影视音乐','film-music',1,'影视音乐','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1532,'TAG','FLOW_TAGS','教育百科','educationEncyclopedia',1,'教育百科','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1534,'TAG','FLOW_TAGS','新闻资讯','news',1,'新闻资讯','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1536,'TAG','FLOW_TAGS','母婴儿童','mother-to-child',1,'母婴儿童','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1538,'TAG','FLOW_TAGS','生活常用','daily-life',1,'生活常用','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1540,'TAG','FLOW_TAGS','金融理财','financialPlanning',1,'金融理财','2025-03-10 10:00:00','2025-03-11 10:28:36'),
	 (1542,'LLM_WORKFLOW_FILTER_PRE','xfyun','spark-llm','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xdeepseekv3,xdeepseekr1,image_understanding,x1,xop3qwen30b,xop3qwen235b,xop3qwen14b,xop3qwen8b,xopgptoss20b,xopgptoss120b,xdsv3t128k,xdeepseekv31',1,'','2000-01-01 00:00:00','2025-08-27 11:23:59'),
	 (1544,'LLM_WORKFLOW_FILTER_PRE','xfyun','decision-making','bm3,bm3.5,bm4',1,'','2000-01-01 00:00:00','2025-03-24 14:54:14'),
	 (1546,'LLM_WORKFLOW_FILTER_PRE','xfyun','extractor-parameter','bm3,bm3.5,bm4',1,'','2000-01-01 00:00:00','2025-03-24 14:54:14'),
	 (1548,'LLM_WORKFLOW_FILTER_PRE','iflyaicloud','extractor-parameter','bm3,bm3.5,bm4,xdeepseekv3,xdeepseekr1',1,'','2000-01-01 00:00:00','2025-03-24 14:54:14'),
	 (1549,'LLM_WORKFLOW_FILTER','iflyaicloud','agent','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1550,'LLM_WORKFLOW_FILTER_PRE','iflyaicloud','decision-making','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xqwen257bchat,xdeepseekv3,xdeepseekr1',1,'','2000-01-01 00:00:00','2025-03-24 14:54:13'),
	 (1551,'LLM_WORKFLOW_FILTER','xfyun','agent','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1552,'LLM_WORKFLOW_FILTER_PRE','iflyaicloud','spark-llm','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xdeepseekv3,xdeepseekr1,image_understanding,x1,xop3qwen30b,xop3qwen235b,xopgptoss20b,xopgptoss120b,xdsv3t128k,xdeepseekv31',1,'','2000-01-01 00:00:00','2025-08-27 11:23:59'),
	 (1553,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','逻辑','{
    "aliasName": "Agent智能决策",
    "idType": "agent",
    "data":
    {
        "outputs":
        [
            {
                "id": "",
                "customParameterType": "deepseekr1",
                "name": "REASONING_CONTENT",
                "nameErrMsg": "",
                "schema":
                {
                    "default": "模型思考过程",
                    "type": "string"
                }
            },
            {
                "id": "",
                "name": "output",
                "nameErrMsg": "",
                "schema":
                {
                    "default": "",
                    "type": "string"
                }
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "inputs":
        [
            {
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                },
                "name": "input",
                "id": ""
            }
        ],
        "icon": "https://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/agent.png",
        "allowOutputReference": true,
        "nodeMeta":
        {
            "aliasName": "智能体节点",
            "nodeType": "Agent节点"
        },
        "nodeParam":
        {
            "appId": "",
            "serviceId": "xdeepseekv3",
            "llmId": 141,
            "enableChatHistoryV2":
            {
                "isEnabled": false,
                "rounds": 1
            },
            "modelConfig":
            {
                "domain": "xdeepseekv3",
                "api": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
                "agentStrategy": 1
            },
            "instruction":
            {
                "reasoning": "",
                "answer": "",
                "query": ""
            },
            "plugin":
            {
                "tools":
                [],
                "toolsList":
                [],
                "mcpServerIds":
                [],
                "mcpServerUrls":
                [],
                "workflowIds":
                []
            },
            "maxLoopCount": 10
        }
    },
    "description": "依据任务需求，通过选择合适的工具列表，实现大 模型的智能调度",
    "nodeType": "基础节点"
}',1,'agent','2000-01-01 00:00:00','2025-07-24 18:56:09'),
	 (1554,'LLM_WORKFLOW_FILTER_PRE','xfyun','null','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xdeepseekv3,xdeepseekr1,image_understanding',1,'','2000-01-01 00:00:00','2025-03-24 14:54:13'),
	 (1555,'WORKFLOW_CHANNEL','mcp','MCP Server','发布为MCP Server',1,'发布成功后即可在工作流编排时调用，并在agent决策节点工具列表查看','2000-01-01 00:00:00','2025-04-09 14:15:54'),
	 (1556,'LLM_WORKFLOW_FILTER_PRE','iflyaicloud','null','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xdeepseekv3,xdeepseekr1,image_understanding',1,'','2000-01-01 00:00:00','2025-03-24 14:54:13'),
	 (1557,'WORKFLOW_AGENT_STRATEGY','agentStrategy','ReACT (支持MCP Tools)','用于指导大模型完成复杂任务的结构化思考和决策过程',1,'1','2000-01-01 00:00:00','2025-04-03 17:50:48'),
	 (1558,'LLM_WORKFLOW_FILTER','iflyaicloud','null','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1559,'MCP_MODEL_API_REFLECT','mcp','xdeepseekv3','https://maas-api.cn-huabei-1.xf-yun.com/v2',1,'','2000-01-01 00:00:00','2025-05-29 15:54:10'),
	 (1560,'LLM_WORKFLOW_FILTER','xfyun','null','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1561,'MCP_MODEL_API_REFLECT','mcp','xdeepseekr1','https://maas-api.cn-huabei-1.xf-yun.com/v2',1,'','2000-01-01 00:00:00','2025-05-29 15:54:10'),
	 (1562,'LLM_WORKFLOW_FILTER','iflyaicloud','spark-llm','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1563,'MCP_SERVER_URL_PREFIX','mcp','https://xingchen-api.xf-yun.com/mcp/xingchen/flow/{0}/sse','',1,'','2000-01-01 00:00:00','2025-04-09 15:04:01'),
	 (1564,'LLM_WORKFLOW_FILTER','iflyaicloud','decision-making','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1566,'LLM_WORKFLOW_FILTER','iflyaicloud','extractor-parameter','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1568,'LLM_WORKFLOW_FILTER','xfyun','extractor-parameter','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1570,'LLM_WORKFLOW_FILTER','xfyun','decision-making','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1571,'LLM_WORKFLOW_FILTER','xingchen','model_square','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1572,'LLM_WORKFLOW_FILTER','xfyun','spark-llm','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1574,'LLM_WORKFLOW_FILTER_PRE','iflyaicloud','agent','xdeepseekv3,xdeepseekr1,x1,xop3qwen30b,xop3qwen235b,xdsv3t128k',1,'','2000-01-01 00:00:00','2025-08-28 15:26:02'),
	 (1576,'LLM_WORKFLOW_FILTER_PRE','xfyun','agent','xdeepseekv3,xdeepseekr1,x1,xop3qwen30b,xop3qwen235b,xdsv3t128k',1,'','2000-01-01 00:00:00','2025-08-28 15:25:57'),
	 (1577,'LLM_WORKFLOW_MODEL_FILTER','think','思考模型','x1,xdeepseekr1,xop3qwen30b,xop3qwen235b,xopgptoss120b',1,'','2000-01-01 00:00:00','2025-08-07 11:23:32'),
	 (1578,'WORKFLOW_NODE_TEMPLATE','1,2','逻辑','{
    "aliasName": "Agent智能决策",
    "idType": "agent",
    "data":
    {
        "outputs":
        [
            {
                "id": "",
                "customParameterType": "deepseekr1",
                "name": "REASONING_CONTENT",
                "nameErrMsg": "",
                "schema":
                {
                    "default": "模型思考过程",
                    "type": "string"
                }
            },
            {
                "id": "",
                "name": "output",
                "nameErrMsg": "",
                "schema":
                {
                    "default": "",
                    "type": "string"
                }
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "inputs":
        [
            {
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                },
                "name": "input",
                "id": ""
            }
        ],
        "icon": "https://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/common/agent.png",
        "allowOutputReference": true,
        "nodeMeta":
        {
            "aliasName": "智能体节点",
            "nodeType": "Agent节点"
        },
        "nodeParam":
        {
            "appId": "",
            "enableChatHistoryV2":
            {
                "isEnabled": false,
                "rounds": 1
            },
            "modelConfig":
            {
                "agentStrategy": 1
            },
            "instruction":
            {
                "reasoning": "",
                "answer": "",
                "query": ""
            },
            "plugin":
            {
                "tools":
                [],
                "toolsList":
                [],
                "mcpServerIds":
                [],
                "mcpServerUrls":
                [],
                "workflowIds":
                []
            },
            "maxLoopCount": 10
        }
    },
    "description": "依据任务需求，通过选择合适的工具列表，实现大 模型的智能调度",
    "nodeType": "基础节点"
}',1,'agent','2000-01-01 00:00:00','2025-09-29 17:05:28'),
	 (1580,'LLM_FILTER','summary_agent','大模型agent过滤器','xdeepseekr1,xdeepseekv3,x1,xop3qwen30b,xop3qwen235b',1,'bm3,bm3.5,bm4,pro-128k,xqwen257bchat,xqwen72bchat,xqwen257bchat,xsparkprox,xdeepseekr1,xdeepseekv3','2000-01-01 00:00:00','2025-05-12 10:38:48'),
	 (1582,'LLM_FILTER_PRE','summary_agent','大模型agent过滤器','xdeepseekr1,xdeepseekv3,x1,xop3qwen30b,xop3qwen235b,bm4',1,'bm3,bm3.5,bm4,pro-128k,xqwen257bchat,xqwen72bchat,xqwen257bchat,xsparkprox,xdeepseekr1,xdeepseekv3','2000-01-01 00:00:00','2025-05-21 15:34:23'),
	 (1583,'TAG','TOOL_TAGS_V2','插件','tool',1,'','2025-04-01 17:51:32','2025-08-19 20:53:55'),
	 (1585,'TAG','TOOL_TAGS_V2','文档处理',NULL,0,NULL,'2025-04-01 17:51:32','2025-04-24 20:52:33'),
	 (1587,'TAG','TOOL_TAGS_V2','信息检索',NULL,0,NULL,'2025-04-01 17:51:32','2025-04-24 20:52:33'),
	 (1589,'TAG','TOOL_TAGS_V2','实用工具',NULL,0,NULL,'2025-04-01 17:51:32','2025-04-24 20:52:33'),
	 (1591,'TAG','TOOL_TAGS_V2','生活娱乐',NULL,0,NULL,'2025-04-01 17:51:32','2025-04-24 20:52:33'),
	 (1593,'TAG','TOOL_TAGS_V2','MCP Tools','',1,'','2025-04-01 17:51:32','2025-09-29 19:28:41'),
	 (1595,'LLM_WORKFLOW_FILTER_PRE','xingchen','model_square','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xdeepseekv3,xdeepseekr1,image_understanding,xopqwenqwq32b,xdeepseekv32,x1,xop3qwen30b,xop3qwen235b,xopgptoss20b,xopgptoss120b',1,'','2000-01-01 00:00:00','2025-08-06 15:46:16'),
	 (1597,'LLM_WORKFLOW_FILTER','self-model','控制自定义模型适配节点',NULL,1,'','2000-01-01 00:00:00','2025-09-20 20:42:01'),
	 (1599,'MULTI_ROUNDS_ALIAS_NAME','MUTI_ROUNDS_ALIAS_NAME','多轮对话支持节点','decision-making,spark-llm,agent,flow',1,'','2000-01-01 00:00:00','2025-08-20 15:07:43'),
	 (1601,'MODEL_SECRET_KEY','public_key','公钥','MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh3iFD+BIGlCY083ItUwJFscMyept2dVl3Zs7/S6V+NnreiUJtjkAsok++eL5BYr9Jz5KULnpQv47tPhqAJd+xxzWZRfNVABHnox61GWlqqgWogbcPZWP/rzGt6c2jOkgbUVdCU7gc+EfKKZ5Fq99A5c6vDQi5u9GozElf2VnLKrH+u0tRpmrQDNSSfW0ifxUNGTvat6cJOIGRC4iUqdI+S3d3BSJEZ9VOAuAs1xmLTZciVkmSM+/bCEfdhChAh1wfpBMOb8Lu2JUXf3tfjZtNOXWRRw70NQu9Xmn3RE0ajZDODLg+xqJ3AR3fgAhunHT8W6d/PVHSM1cFUFap4P4IQIDAQAB',1,'','2000-01-01 00:00:00','2025-04-15 11:57:22'),
	 (1603,'MODEL_SECRET_KEY','private_key','私钥','MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCHeIUP4EgaUJjTzci1TAkWxwzJ6m3Z1WXdmzv9LpX42et6JQm2OQCyiT754vkFiv0nPkpQuelC/ju0+GoAl37HHNZlF81UAEeejHrUZaWqqBaiBtw9lY/+vMa3pzaM6SBtRV0JTuBz4R8opnkWr30Dlzq8NCLm70ajMSV/ZWcsqsf67S1GmatAM1JJ9bSJ/FQ0ZO9q3pwk4gZELiJSp0j5Ld3cFIkRn1U4C4CzXGYtNlyJWSZIz79sIR92EKECHXB+kEw5vwu7YlRd/e1+Nm005dZFHDvQ1C71eafdETRqNkM4MuD7GoncBHd+ACG6cdPxbp389UdIzVwVQVqng/ghAgMBAAECggEAVF/Z8ENuZQVhyjlXEqPi3U7oRjI+bPgeU+HFgTEssyt3IEJFRDtIleopURXup2cjuPdw7cp83/7cTSCTVP8GNRle5uPmPLVX5gX00qjkf9/lCNFhBvJKFwyYb/YzYZwpWCVlhtCbt1C1SWo17M0r/bqJGIMYYeERi76mbixIEGb60mCOPyj3tZfTCXzeSaZqgEV+9SjpgBcUj0/NSn1nxOZ8SeESQHrkz+ZfUZ/VDxdICW2Hy0hGJfaR9VZHGlVnabbtreUni5JDMf7o6xSPKvThp2rIIQd4H1PLRMFeWprigQ+6vfxeMHnyS5ggag5wGclFAargqAXq0WFO3xxoSQKBgQDbAt+T0jjHvv6d/924JiJf9awoGQ6Xjbu2z2xVNHg32Hew+u+0CiRsmo1nMMS//JxieNjSRWT6SJ482xAXgmGsdBKrSf+G5s3RpBCLDOYAvx67XmxB86CCpXVwomejGCZhdD4Vm2sB68ansbW1/y2Z2UHAG6wbsC7llzrxXvwAbwKBgQCeWbVDqLCSbsHgkn7LMPVCozH0GICQN92d5oyc8veZFa8uXq7fVIpELXv/S1TDVcpwEbIUnQycFRgj/si3QPZyIAAsKf6tx8MKy+BYm81eJqc0AuUc8wrmSJdcEOBDSaZvNMVX+bmqQItDTSJ+rv5fC8+zhv+gNRH+4cuOPxC4bwKBgA4/2ZwciWU1oAtXom1gzcvAiDrzpmdl6VizljDVAR1hECiLqxzjrAsE4z5bhfGX1fTyN+k2aqN+Jg1/k0R0TzaRNsW+QsncKngBXLIvXKefx7gZJKIF3+OgMEvrxSJvZ8/faEqvmf6+AGbYwSHeQHFKGWUOZ9xFUkfN1x/tNigxAoGAXtLffhWtLvMOPHndXbYCmJX7Wu21Ryd9GYou1+mTJWPb1Iu0cl5AshT+tOEacCKWqEegeUGWhH0JSLzQ2xQWwD6ze77mGJCQFo4B2W3rLB8/byDwrEZKV55OrT4Z3ZFkDiHurwEHEpG2E2ZEatJF1wrOpPYJa5l8HkJ+T78qNxcCgYBZbJJFCL7buF5ZO6dhZVMSLlERL0q5XKbCWXe/987g2fMfi7t6UrQAQ6zxvqBFrapodcsGjxbeXerJzNHqkQ4fySHZ8qeiwSlx8tCbBiO0PR7pY4mlXratJjpHvQbs1yXUcGZ3obyuK1Oe+sa+jYJC54UVz08g2+nGiQGho5x1FQ==',1,'','2000-01-01 00:00:00','2025-04-15 11:57:22'),
	 (1605,'SPARK_PRO_QR_CODE','qr','二维码','https://oss-beijing-m8.openstorage.cn/SparkBot/test4/weichat_qr.jpeg',1,NULL,'2025-04-01 17:51:32','2025-06-05 17:07:41'),
	 (1607,'MCP_MODEL_API_REFLECT','mcp','xop3qwen30b','https://maas-api.cn-huabei-1.xf-yun.com/v2',1,'','2000-01-01 00:00:00','2025-05-29 15:54:10'),
	 (1609,'MCP_MODEL_API_REFLECT','mcp','xop3qwen235b','https://maas-api.cn-huabei-1.xf-yun.com/v2',1,'','2000-01-01 00:00:00','2025-05-29 15:54:11'),
	 (1611,'LLM_WORKFLOW_MODEL_FILTER','multiMode','多模态模型','image_understandingv3,image_understanding',1,'','2000-01-01 00:00:00','2025-03-12 15:45:05'),
	 (1613,'PERSONAL_MODEL','20000001','imagev3','{
    "llmSource": 1,
    "llmId": 10000005,
    "name": "图像理解V3",
    "patchId": "0",
    "domain": "imagev3",
    "serviceId": "image_understandingv3",
    "status": 1,
    "info": "{\\"conc\\":2,\\"domain\\":\\"generalv3.5\\",\\"expireTs\\":\\"2025-05-31\\",\\"qps\\":2,\\"tokensPreDay\\":1000,\\"tokensTotal\\":1000,\\"llmServiceId\\":\\"bm3.5\\"}"
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image",
    "modelId": 0,
    "isThink":false,
    "multiMode":true
}',1,'','2000-01-01 00:00:00','2025-05-08 15:04:22'),
	 (1615,'WORKFLOW_KNOWLEDGE_PRO_STRATEGY','knowledgeProStrategy','Agentic RAG','适用于复杂问题的场景，擅长将复杂问题分解为多个子问题进行检索。',1,'1','2000-01-01 00:00:00','2025-05-15 11:28:26'),
	 (1617,'WORKFLOW_KNOWLEDGE_PRO_STRATEGY','knowledgeProStrategy','Long RAG','适用于对长文档内容理解与生成任务。',1,'2','2000-01-01 00:00:00','2025-05-15 11:28:26'),
	 (1621,'LLM_WORKFLOW_FILTER_PRE','xfyun','knowledge-pro-base','xdeepseekv3',1,'','2000-01-01 00:00:00','2025-05-21 15:11:12'),
	 (1623,'LLM_WORKFLOW_FILTER_PRE','iflyaicloud','knowledge-pro-base','xdeepseekv3',1,'','2000-01-01 00:00:00','2025-05-21 15:11:12'),
	 (1627,'LLM_WORKFLOW_FILTER_PRE','iflyaicloud','question-answer','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xdeepseekv3,xdeepseekr1,image_understanding,image_understandingv3,xopqwenqwq32b,xdeepseekv32,x1,deepseek-ollama',1,'','2000-01-01 00:00:00','2025-05-21 10:30:36'),
	 (1629,'LLM_WORKFLOW_FILTER_PRE','xfyun','question-answer','bm3,bm3.5,bm4,pro-128k,xgemma29bit,xaipersonality,xdeepseekv3,xdeepseekr1,image_understanding,image_understandingv3,xopqwenqwq32b,xdeepseekv32,x1,deepseek-ollama',1,'','2000-01-01 00:00:00','2025-05-21 10:30:36'),
	 (1631,'LLM_WORKFLOW_FILTER','iflyaicloud','question-answer','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1633,'LLM_WORKFLOW_FILTER','xfyun','question-answer','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1635,'LLM_WORKFLOW_FILTER','xfyun','knowledge-pro-base','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1637,'LLM_WORKFLOW_FILTER','iflyaicloud','knowledge-pro-base','',1,'','2000-01-01 00:00:00','2025-09-20 20:11:24'),
	 (1639,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','基础节点','{
    "aliasName": "知识库 Pro",
    "idType": "knowledge-pro-base",
    "data": {
        "outputs": [
           {
    "id": "52f0819d-e403-43e1-85d3-50519ccfcbcf",
    "name": "output",
    "schema": {
        "type": "string",
        "default": ""
    },
    "required": false,
    "nameErrMsg": ""
},
{
    "id": "87247b70-f05c-4125-a416-e2c41be2e1c1",
    "name": "result",
    "schema": {
        "type": "array-object",
        "default": "",
        "properties": [
            {
                "id": "a9db3a72-abb2-4512-a598-13b8294fce60",
                "name": "source_id",
                "type": "string",
                "default": "",
                "required": false,
                "nameErrMsg": ""
            },
            {
                "id": "c1711905-9f7e-4408-918e-33d57d39f9bc",
                "name": "chunk",
                "type": "array-object",
                "default": "",
                "required": false,
                "nameErrMsg": "",
                "properties": [
                    {
                        "id": "b8b50110-2abc-4732-9c96-6f3b7bad9259",
                        "name": "chunk_context",
                        "type": "string",
                        "default": "",
                        "required": false,
                        "nameErrMsg": ""
                    },
                    {
                        "id": "95ffea3c-4008-4df8-84a8-013079e72276",
                        "name": "score",
                        "type": "number",
                        "default": "",
                        "required": false,
                        "nameErrMsg": "",
                        "properties": []
                    }
                ]
            }
        ]
    },
    "required": false,
    "nameErrMsg": ""
}
        ],
        "references": [],
        "allowInputReference": true,
        "inputs": [
            {
                "schema": {
                    "type": "string",
                    "value": {
                        "type": "ref",
                        "content": {}
                    }
                },
                "name": "query",
                "id": ""
            }
        ],
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/knowledgeIcon.png",
        "allowOutputReference": true,
        "nodeMeta": {
            "aliasName": "知识库 Pro",
            "nodeType": "工具"
        },
        "nodeParam": {
			"repoTopK":3,
             "topK": 4,
            "repoIds": [ ],
            "repoList":[],
            "ragType": 1,
            "url": "https://maas-api.cn-huabei-1.xf-yun.com/v2",
            "domain": "xdeepseekv3",
            "temperature": 0.5,
            "maxTokens": 2048,
            "model": "xdeepseekv3",
            "llmId": 141,
             "serviceId":"xdeepseekv3",
            "answerRole": "",
            "repoType": 1
        }
    },
    "description": "通过智能策略调用知识库，可以指定知识库进行知识检索和总结答复",
    "nodeType": "基础节点"
}',1,'知识库pro节点','2000-01-01 00:00:00','2025-07-24 18:56:09'),
	 (1641,'mingduan','x1','x1','https://spark-api-open.xf-yun.com/v2',1,'','2000-01-01 00:00:00','2025-05-21 14:50:16'),
	 (1643,'mingduan','bm4','bm4','https://spark-api-open.xf-yun.com/v1',1,'','2000-01-01 00:00:00','2025-05-21 14:50:16'),
	 (1645,'mingduan','AK:SK','','x1,bm4',1,'https://spark-api-open.xf-yun.com/v2','2000-01-01 00:00:00','2025-05-21 15:42:44'),
	 (1647,'MODEL_URL_CONFIG','Agent节点','https://maas-api.cn-huabei-1.xf-yun.com/v2','xdeepseekv3,xdeepseekr1,xop3qwen30b,xop3qwen235b',1,'','2000-01-01 00:00:00','2025-05-29 15:35:31'),
	 (1649,'WORKFLOW_NODE_TEMPLATE','1,2','基础节点','{
    "aliasName": "知识库 Pro",
    "idType": "knowledge-pro-base",
    "data":
    {
        "outputs":
        [
            {
                "id": "52f0819d-e403-43e1-85d3-50519ccfcbcf",
                "name": "output",
                "schema":
                {
                    "type": "string",
                    "default": ""
                },
                "required": false,
                "nameErrMsg": ""
            },
            {
                "id": "87247b70-f05c-4125-a416-e2c41be2e1c1",
                "name": "result",
                "schema":
                {
                    "type": "array-object",
                    "default": "",
                    "properties":
                    [
                        {
                            "id": "a9db3a72-abb2-4512-a598-13b8294fce60",
                            "name": "source_id",
                            "type": "string",
                            "default": "",
                            "required": false,
                            "nameErrMsg": ""
                        },
                        {
                            "id": "c1711905-9f7e-4408-918e-33d57d39f9bc",
                            "name": "chunk",
                            "type": "array-object",
                            "default": "",
                            "required": false,
                            "nameErrMsg": "",
                            "properties":
                            [
                                {
                                    "id": "b8b50110-2abc-4732-9c96-6f3b7bad9259",
                                    "name": "chunk_context",
                                    "type": "string",
                                    "default": "",
                                    "required": false,
                                    "nameErrMsg": ""
                                },
                                {
                                    "id": "95ffea3c-4008-4df8-84a8-013079e72276",
                                    "name": "score",
                                    "type": "number",
                                    "default": "",
                                    "required": false,
                                    "nameErrMsg": "",
                                    "properties":
                                    []
                                }
                            ]
                        }
                    ]
                },
                "required": false,
                "nameErrMsg": ""
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "inputs":
        [
            {
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                },
                "name": "query",
                "id": ""
            }
        ],
        "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/knowledgeIcon.png",
        "allowOutputReference": true,
        "nodeMeta":
        {
            "aliasName": "知识库 Pro",
            "nodeType": "工具"
        },
        "nodeParam":
        {
            "repoTopK": 3,
            "llmId": 141,
            "topK": 4,
            "repoIds":
            [],
            "repoList":
            [],
            "ragType": 1,
            "temperature": 0.5,
            "maxTokens": 2048,
            "answerRole": "",
            "repoType": 1,
            "score": 0.2
        }
    },
    "description": "通过智能策略调用知识库，可以指定知识库进行知识检索和总结答复",
    "nodeType": "基础节点"
}',0,'知识库pro节点','2000-01-01 00:00:00','2025-09-29 15:54:42'),
	 (1711,'SPECIAL_MODEL','10000012','dsv3t128k','{
    "llmSource": 1,
    "llmId": 10000012,
    "id": 10000012,
    "name": "星火128k",
    "patchId": "0",
    "domain": "xdsv3t128k",
    "modelType": 2,
    "licChannel":"xdsv3t128k",
    "serviceId": "xdsv3t128k",
    "status": 1,
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "wss://maas-long-context-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',0,'','2000-01-01 00:00:00','2025-08-27 11:16:08'),
	 (1713,'SPECIAL_MODEL_CONFIG','10000012','dsv3t128k','{
        "id": 2431162637211654,
        "name": "DeepSeek-V3",
        "serviceId": "xdsv3t128k",
        "serverId": "xdsv3t128k",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "xdsv3t128k"
            ],
            "serviceBlock":
            {
                "xdsv3t128k":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 65535
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 65535,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是65535。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            },
                            {
                                "constraintType": "switch",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "关",
                                        "label": "关",
                                        "value": true,
                                        "desc": "关"
                                    },
                                    {
                                        "name": "开",
                                        "label": "开",
                                        "value": false,
                                        "desc": "开"
                                    }
                                ],
                                "name": "联网搜索",
                                "revealed": true,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "search_disable",
                                "required": false,
                                "desc": "开启联网搜索，默认关闭。"
                            },
                            {
                                "constraintType": "enum",
                                "default": "force",
                                "constraintContent":
                                [
                                    {
                                        "name": "自动",
                                        "label": "default",
                                        "value": "auto",
                                        "desc": "自动判断是否需要搜索"
                                    },
                                    {
                                        "name": "强制开启",
                                        "label": "default",
                                        "value": "force",
                                        "desc": "强制开启搜索"
                                    }
                                ],
                                "name": "搜索模式",
                                "revealed": false,
                                "support": true,
                                "fieldType": "string",
                                "initialValue": "force",
                                "key": "search_mod",
                                "required": false,
                                "desc": "联网搜索的模式，默认自动判断。"
                            },
                            {
                                "constraintType": "enum",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "开",
                                        "label": "default",
                                        "value": true,
                                        "desc": "开"
                                    },
                                    {
                                        "name": "关",
                                        "label": "default",
                                        "value": false,
                                        "desc": "关"
                                    }
                                ],
                                "name": "展示溯源信息",
                                "revealed": false,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "show_ref_label",
                                "required": false,
                                "desc": "开启联网搜索后在结果中展示搜索溯源信息，默认关闭。"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "dsv3t128k",
            "multipleDialog": 1
        },
        "source": 2,
        "url": "wss://maas-long-context-api.cn-huabei-1.xf-yun.com/v1.1/chat",
        "appId": null,
        "licChannel": "xdsv3t128k"
    }
',1,'','2000-01-01 00:00:00','2025-06-26 17:39:30'),
	 (1715,'SELF_MODEL_COMMON_CONFIG','config','自定义模型公共配置','{
    "config":
    [
        {
            "standard": true,
            "constraintType": "range",
            "default": 2048,
            "constraintContent":
            [
                {
                    "name": 1
                },
                {
                    "name": 8192
                }
            ],
            "name": "最大回复长度",
            "fieldType": "int",
            "initialValue": 2048,
            "key": "maxTokens",
            "required": true
        },
        {
            "standard": true,
            "constraintContent":
            [
                {
                    "name": 0
                },
                {
                    "name": 1
                }
            ],
            "precision": 0.1,
            "required": true,
            "constraintType": "range",
            "default": 0.5,
            "name": "核采样阈值",
            "fieldType": "float",
            "initialValue": 0.5,
            "key": "temperature"
        },
        {
            "standard": true,
            "constraintType": "range",
            "default": 4,
            "constraintContent":
            [
                {
                    "name": 1
                },
                {
                    "name": 6
                }
            ],
            "name": "生成多样性",
            "fieldType": "int",
            "initialValue": 4,
            "key": "topK",
            "required": true
        }
    ]
}',1,'','2000-01-01 00:00:00','2025-06-05 19:15:55'),
	 (1717,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','基础节点','{
    "aliasName": "问答节点",
    "idType": "question-answer",
    "data":
    {
        "outputs":
        [
            {
                "schema":
                {
                    "default": "",
                    "type": "string",
                    "description": "该节点提问内容"
                },
                "name": "query",
                "id": "",
                "required": true
            },
            {
                "schema":
                {
                    "default": "",
                    "type": "string",
                    "description": "用户回复内容"
                },
                "name": "content",
                "id": "",
                "required": true
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "inputs":
        [
            {
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                },
                "name": "input",
                "id": ""
            }
        ],
        "icon": "https://oss-beijing-m8.openstorage.cn/SparkBot/test4/answer-new2.png",
        "allowOutputReference": true,
        "nodeMeta":
        {
            "aliasName": "问答节点",
            "nodeType": "基础节点"
        },
        "nodeParam":
        {
            "question": "",
            "timeout": 3,
            "needReply": false,
            "answerType": "direct",
            "directAnswer":
            {
                "handleResponse": false,
                "maxRetryCounts": 2
            },
            "optionAnswer":
            [
                {
                    "id": "option-one-of::01a35034-8e7a-4a84-83ee-c51d4cbe2660",
                    "name": "A",
                    "type": 2,
                    "content": "",
                    "content_type": "string"
                },
                {
                    "id": "option-one-of::1df8b2ac-c228-4195-8978-54f87b1bdbb9",
                    "name": "B",
                    "type": 2,
                    "content": "",
                    "content_type": "string"
                },
                {
                    "id": "option-one-of::646527fa-a9eb-4216-a324-95fc5601d2bf",
                    "name": "default",
                    "type": 1,
                    "content": "",
                    "content_type": "string"
                }
            ],
            "url": "wss://spark-api.xf-yun.com/v4.0/chat",
            "domain": "4.0Ultra",
            "appId": "d1590f30",
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "model": "spark",
            "llmId": 110,
            "serviceId": "bm4"
        }
    },
    "description": "支持在此节点向用户提问，接收用户回复，并输出回复内容及提取的信息",
    "nodeType": "基础节点"
}',1,'问答节点','2000-01-01 00:00:00','2025-07-24 18:56:10'),
	 (1719,'SPARK_PRO_QR_CODE','qr_feishu','飞书二维码','https://oss-beijing-m8.openstorage.cn/SparkBot/test4/feishu_qr.jpeg',1,NULL,'2025-04-01 17:51:32','2025-06-05 16:46:35'),
	 (1723,'SPECIAL_MODEL','10000006','xdsv3t128k','{
    "llmSource": 1,
    "llmId": 10000006,
    "id": 10000006,
    "name": "xdsv3t128k",
    "patchId": "0",
    "domain": "xdsv3t128k",
    "serviceId": "xdsv3t128k",
    "status": 1,
    "modelType": 2,
    "licChannel":"xdsv3t128k",
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "https://maas-api.cn-huabei-1.xf-yun.com/v2",
    "modelId": 0
}',0,'','2000-01-01 00:00:00','2025-08-27 11:16:08'),
	 (1725,'SPECIAL_MODEL_CONFIG','10000006','xdsv3t128k','{
        "id": 2431162637211655,
        "name": "xdsv3t128k",
        "serviceId": "xdsv3t128k",
        "serverId": "xdsv3t128k",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "xdsv3t128k"
            ],
            "serviceBlock":
            {
                "xdsv3t128k":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 65535
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 8192,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            },
                            {
                                "constraintType": "switch",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "关",
                                        "label": "关",
                                        "value": true,
                                        "desc": "关"
                                    },
                                    {
                                        "name": "开",
                                        "label": "开",
                                        "value": false,
                                        "desc": "开"
                                    }
                                ],
                                "name": "联网搜索",
                                "revealed": true,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "search_disable",
                                "required": false,
                                "desc": "开启联网搜索，默认关闭。"
                            },
                            {
                                "constraintType": "enum",
                                "default": "force",
                                "constraintContent":
                                [
                                    {
                                        "name": "自动",
                                        "label": "default",
                                        "value": "auto",
                                        "desc": "自动判断是否需要搜索"
                                    },
                                    {
                                        "name": "强制开启",
                                        "label": "default",
                                        "value": "force",
                                        "desc": "强制开启搜索"
                                    }
                                ],
                                "name": "搜索模式",
                                "revealed": false,
                                "support": true,
                                "fieldType": "string",
                                "initialValue": "force",
                                "key": "search_mod",
                                "required": false,
                                "desc": "联网搜索的模式，默认自动判断。"
                            },
                            {
                                "constraintType": "enum",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "开",
                                        "label": "default",
                                        "value": true,
                                        "desc": "开"
                                    },
                                    {
                                        "name": "关",
                                        "label": "default",
                                        "value": false,
                                        "desc": "关"
                                    }
                                ],
                                "name": "展示溯源信息",
                                "revealed": false,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "show_ref_label",
                                "required": false,
                                "desc": "开启联网搜索后在结果中展示搜索溯源信息，默认关闭。"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "xdsv3t128k",
            "multipleDialog": 1
        },
        "source": 1,
        "url": "https://maas-api.cn-huabei-1.xf-yun.com/v2",
        "appId": null,
        "licChannel": "xdsv3t128k"
    }
',1,'','2000-01-01 00:00:00','2025-06-26 17:40:19'),
	 (1731,'MCP_MODEL_API_REFLECT','mcp','x1','https://spark-api-open.xf-yun.com/v2',1,'','2000-01-01 00:00:00','2025-06-10 17:52:48'),
	 (1735,'IP_BLACK_LIST','ip_balck_list','ip黑名单','0.0.0.0,127.0.0.1,localhost',1,NULL,'2022-06-10 00:00:00','2025-09-08 10:42:02'),
	 (1737,'NETWORK_SEGMENT_BLACK_LIST','network_segment_balck_list','网段黑名单','192.168.0.0/16,100.64.0.0/10',1,NULL,'2022-06-10 00:00:00','2025-09-08 10:44:56'),
	 (1739,'DOMAIN_BLACK_LIST','domain_balck_list','域名黑名单','cloud.iflytek.com,monojson.com,ssrf.security.private,ssrf-prod.security.private',1,NULL,'2022-06-10 00:00:00','2025-09-08 10:42:13'),
	 (1743,'WORKFLOW_NODE_TEMPLATE','1,2','基础节点','{
    "aliasName": "问答节点",
    "idType": "question-answer",
    "data":
    {
        "outputs":
        [
            {
                "schema":
                {
                    "default": "",
                    "type": "string",
                    "description": "该节点提问内容"
                },
                "name": "query",
                "id": "",
                "required": true
            },
            {
                "schema":
                {
                    "default": "",
                    "type": "string",
                    "description": "用户回复内容"
                },
                "name": "content",
                "id": "",
                "required": true
            }
        ],
        "references":
        [],
        "allowInputReference": true,
        "inputs":
        [
            {
                "schema":
                {
                    "type": "string",
                    "value":
                    {
                        "type": "ref",
                        "content":
                        {}
                    }
                },
                "name": "input",
                "id": ""
            }
        ],
        "icon": "https://oss-beijing-m8.openstorage.cn/SparkBot/test4/answer-new2.png",
        "allowOutputReference": true,
        "nodeMeta":
        {
            "aliasName": "问答节点",
            "nodeType": "基础节点"
        },
        "nodeParam":
        {
            "question": "",
            "timeout": 3,
            "needReply": false,
            "answerType": "direct",
            "directAnswer":
            {
                "handleResponse": false,
                "maxRetryCounts": 2
            },
            "optionAnswer":
            [
                {
                    "id": "option-one-of::01a35034-8e7a-4a84-83ee-c51d4cbe2660",
                    "name": "A",
                    "type": 2,
                    "content": "",
                    "content_type": "string"
                },
                {
                    "id": "option-one-of::1df8b2ac-c228-4195-8978-54f87b1bdbb9",
                    "name": "B",
                    "type": 2,
                    "content": "",
                    "content_type": "string"
                },
                {
                    "id": "option-one-of::646527fa-a9eb-4216-a324-95fc5601d2bf",
                    "name": "default",
                    "type": 1,
                    "content": "",
                    "content_type": "string"
                }
            ],
            "maxTokens": 2048,
            "temperature": 0.5,
            "topK": 4,
            "model": "spark"
        }
    },
    "description": "支持在此节点向用户提问，接收用户回复，并输出回复内容及提取的信息",
    "nodeType": "基础节点"
}',1,'问答节点','2000-01-01 00:00:00','2025-09-29 15:55:05'),
	 (1745,'SPECIAL_MODEL','10000007','xsp8f70988f','{
    "llmSource": 1,
    "llmId": 10000007,
    "id": 10000007,
    "name": "智能硬件专有2.6B模型",
    "patchId": "0",
    "domain": "xsp8f70988f",
    "serviceId": "xsp8f70988f",
    "modelType": 2,
    "licChannel":"xsp8f70988f",
    "status": 1,
    "info": "假设你是一个智能交互助手，基于用户的输入文本，解析其中语义，抽取关键信息，以json格式生成结构化的语义内容。我的输入是：请调小空气净化器的湿度到1",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "wss://xingchen-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',1,'','2000-01-01 00:00:00','2025-07-09 14:31:21'),
	 (1747,'SPECIAL_MODEL_CONFIG','10000007','xsp8f70988f','{
        "id": 2431162637211656,
        "name": "xsp8f70988f",
        "serviceId": "xsp8f70988f",
        "serverId": "xsp8f70988f",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "xsp8f70988f"
            ],
            "serviceBlock":
            {
                "xsp8f70988f":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 16384
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 8192,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            },
                            {
                                "constraintType": "switch",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "关",
                                        "label": "关",
                                        "value": true,
                                        "desc": "关"
                                    },
                                    {
                                        "name": "开",
                                        "label": "开",
                                        "value": false,
                                        "desc": "开"
                                    }
                                ],
                                "name": "联网搜索",
                                "revealed": true,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "search_disable",
                                "required": false,
                                "desc": "开启联网搜索，默认关闭。"
                            },
                            {
                                "constraintType": "enum",
                                "default": "force",
                                "constraintContent":
                                [
                                    {
                                        "name": "自动",
                                        "label": "default",
                                        "value": "auto",
                                        "desc": "自动判断是否需要搜索"
                                    },
                                    {
                                        "name": "强制开启",
                                        "label": "default",
                                        "value": "force",
                                        "desc": "强制开启搜索"
                                    }
                                ],
                                "name": "搜索模式",
                                "revealed": false,
                                "support": true,
                                "fieldType": "string",
                                "initialValue": "force",
                                "key": "search_mod",
                                "required": false,
                                "desc": "联网搜索的模式，默认自动判断。"
                            },
                            {
                                "constraintType": "enum",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "开",
                                        "label": "default",
                                        "value": true,
                                        "desc": "开"
                                    },
                                    {
                                        "name": "关",
                                        "label": "default",
                                        "value": false,
                                        "desc": "关"
                                    }
                                ],
                                "name": "展示溯源信息",
                                "revealed": false,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "show_ref_label",
                                "required": false,
                                "desc": "开启联网搜索后在结果中展示搜索溯源信息，默认关闭。"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "xdsv3t128k",
            "multipleDialog": 1
        },
        "source": 1,
        "url": "https://maas-api.cn-huabei-1.xf-yun.com/v1",
        "appId": null,
        "licChannel": "xsp8f70988f"
    }
',1,'','2000-01-01 00:00:00','2025-06-12 09:36:51'),
	 (1749,'SPECIAL_MODEL','10000008','xqwen257bchat','{
    "llmSource": 1,
    "llmId": 10000008,
    "id": 10000008,
    "name": "xqwen257bchat",
    "patchId": "0",
    "domain": "xqwen257bchat",
    "serviceId": "xqwen257bchat",
    "modelType": 2,
    "licChannel":"xqwen257bchat",
    "status": 1,
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',1,'','2000-01-01 00:00:00','2025-07-09 14:31:21'),
	 (1751,'SPECIAL_MODEL_CONFIG','10000008','xqwen257bchat','{
        "id": 2431162637211657,
        "name": "xqwen257bchat",
        "serviceId": "xqwen257bchat",
        "serverId": "xqwen257bchat",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "xqwen257bchat"
            ],
            "serviceBlock":
            {
                "xqwen257bchat":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 16384
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 8192,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            },
                            {
                                "constraintType": "switch",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "关",
                                        "label": "关",
                                        "value": true,
                                        "desc": "关"
                                    },
                                    {
                                        "name": "开",
                                        "label": "开",
                                        "value": false,
                                        "desc": "开"
                                    }
                                ],
                                "name": "联网搜索",
                                "revealed": true,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "search_disable",
                                "required": false,
                                "desc": "开启联网搜索，默认关闭。"
                            },
                            {
                                "constraintType": "enum",
                                "default": "force",
                                "constraintContent":
                                [
                                    {
                                        "name": "自动",
                                        "label": "default",
                                        "value": "auto",
                                        "desc": "自动判断是否需要搜索"
                                    },
                                    {
                                        "name": "强制开启",
                                        "label": "default",
                                        "value": "force",
                                        "desc": "强制开启搜索"
                                    }
                                ],
                                "name": "搜索模式",
                                "revealed": false,
                                "support": true,
                                "fieldType": "string",
                                "initialValue": "force",
                                "key": "search_mod",
                                "required": false,
                                "desc": "联网搜索的模式，默认自动判断。"
                            },
                            {
                                "constraintType": "enum",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "开",
                                        "label": "default",
                                        "value": true,
                                        "desc": "开"
                                    },
                                    {
                                        "name": "关",
                                        "label": "default",
                                        "value": false,
                                        "desc": "关"
                                    }
                                ],
                                "name": "展示溯源信息",
                                "revealed": false,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "show_ref_label",
                                "required": false,
                                "desc": "开启联网搜索后在结果中展示搜索溯源信息，默认关闭。"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "xdsv3t128k",
            "multipleDialog": 1
        },
        "source": 1,
        "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
        "appId": null,
        "licChannel": "xqwen257bchat"
    }
',1,'','2000-01-01 00:00:00','2025-06-12 09:36:51'),
	 (1753,'SPECIAL_MODEL','10000009','xop3qwen8b','{
    "llmSource": 1,
    "llmId": 10000009,
    "id": 10000009,
    "name": "xop3qwen8b",
    "patchId": "0",
    "domain": "xop3qwen8b",
    "serviceId": "xop3qwen8b",
    "modelType": 2,
    "licChannel":"xop3qwen8b",
    "status": 1,
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-07-09 14:31:21'),
	 (1755,'SPECIAL_MODEL','10000010','xop3qwen14b','{
    "llmSource": 1,
    "llmId": 10000010,
    "id": 10000010,
    "name": "xop3qwen14b",
    "patchId": "0",
    "domain": "xop3qwen14b",
    "serviceId": "xop3qwen14b",
    "modelType": 2,
    "licChannel":"xop3qwen14b",
    "status": 1,
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-07-09 14:31:21'),
	 (1757,'SPECIAL_MODEL_CONFIG','10000009','xop3qwen8b','{
        "id": 2431162637211657,
        "name": "xop3qwen8b",
        "serviceId": "xop3qwen8b",
        "serverId": "xop3qwen8b",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "xop3qwen8b"
            ],
            "serviceBlock":
            {
                "xop3qwen8b":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 16384
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 8192,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            },
                            {
                                "constraintType": "switch",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "关",
                                        "label": "关",
                                        "value": true,
                                        "desc": "关"
                                    },
                                    {
                                        "name": "开",
                                        "label": "开",
                                        "value": false,
                                        "desc": "开"
                                    }
                                ],
                                "name": "联网搜索",
                                "revealed": true,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "search_disable",
                                "required": false,
                                "desc": "开启联网搜索，默认关闭。"
                            },
                            {
                                "constraintType": "enum",
                                "default": "force",
                                "constraintContent":
                                [
                                    {
                                        "name": "自动",
                                        "label": "default",
                                        "value": "auto",
                                        "desc": "自动判断是否需要搜索"
                                    },
                                    {
                                        "name": "强制开启",
                                        "label": "default",
                                        "value": "force",
                                        "desc": "强制开启搜索"
                                    }
                                ],
                                "name": "搜索模式",
                                "revealed": false,
                                "support": true,
                                "fieldType": "string",
                                "initialValue": "force",
                                "key": "search_mod",
                                "required": false,
                                "desc": "联网搜索的模式，默认自动判断。"
                            },
                            {
                                "constraintType": "enum",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "开",
                                        "label": "default",
                                        "value": true,
                                        "desc": "开"
                                    },
                                    {
                                        "name": "关",
                                        "label": "default",
                                        "value": false,
                                        "desc": "关"
                                    }
                                ],
                                "name": "展示溯源信息",
                                "revealed": false,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "show_ref_label",
                                "required": false,
                                "desc": "开启联网搜索后在结果中展示搜索溯源信息，默认关闭。"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "xop3qwen8b",
            "multipleDialog": 1
        },
        "source": 1,
        "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
        "appId": null,
        "licChannel": "xop3qwen8b"
    }
',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-06-16 15:27:55'),
	 (1759,'SPECIAL_MODEL_CONFIG','10000010','xop3qwen14b','{
        "id": 2431162637211657,
        "name": "xop3qwen14b",
        "serviceId": "xop3qwen14b",
        "serverId": "xop3qwen14b",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "xop3qwen14b"
            ],
            "serviceBlock":
            {
                "xop3qwen14b":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 16384
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 8192,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            },
                            {
                                "constraintType": "switch",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "关",
                                        "label": "关",
                                        "value": true,
                                        "desc": "关"
                                    },
                                    {
                                        "name": "开",
                                        "label": "开",
                                        "value": false,
                                        "desc": "开"
                                    }
                                ],
                                "name": "联网搜索",
                                "revealed": true,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "search_disable",
                                "required": false,
                                "desc": "开启联网搜索，默认关闭。"
                            },
                            {
                                "constraintType": "enum",
                                "default": "force",
                                "constraintContent":
                                [
                                    {
                                        "name": "自动",
                                        "label": "default",
                                        "value": "auto",
                                        "desc": "自动判断是否需要搜索"
                                    },
                                    {
                                        "name": "强制开启",
                                        "label": "default",
                                        "value": "force",
                                        "desc": "强制开启搜索"
                                    }
                                ],
                                "name": "搜索模式",
                                "revealed": false,
                                "support": true,
                                "fieldType": "string",
                                "initialValue": "force",
                                "key": "search_mod",
                                "required": false,
                                "desc": "联网搜索的模式，默认自动判断。"
                            },
                            {
                                "constraintType": "enum",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "开",
                                        "label": "default",
                                        "value": true,
                                        "desc": "开"
                                    },
                                    {
                                        "name": "关",
                                        "label": "default",
                                        "value": false,
                                        "desc": "关"
                                    }
                                ],
                                "name": "展示溯源信息",
                                "revealed": false,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "show_ref_label",
                                "required": false,
                                "desc": "开启联网搜索后在结果中展示搜索溯源信息，默认关闭。"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "xop3qwen14b",
            "multipleDialog": 1
        },
        "source": 1,
        "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
        "appId": null,
        "licChannel": "xop3qwen14b"
    }
',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-06-16 15:27:55'),
	 (1761,'SPECIAL_MODEL','10000011','image_understandingv3','{
    "llmSource": 1,
    "llmId": 10000005,
    "name": "图像理解V3",
    "patchId": "0",
    "domain": "imagev3",
    "serviceId": "image_understandingv3",
    "status": 1,
    "info": "{\\"conc\\":2,\\"domain\\":\\"generalv3.5\\",\\"expireTs\\":\\"2025-05-31\\",\\"qps\\":2,\\"tokensPreDay\\":1000,\\"tokensTotal\\":1000,\\"llmServiceId\\":\\"bm3.5\\"}"
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/aicloud/llm/resource/image/model/icon_iflyspark_96.png",
    "tag":
    [],
    "url": "wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image",
    "modelId": 0,
    "isThink":false,
    "multiMode":true
}',0,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-07-08 17:25:54'),
	 (1763,'SPECIAL_MODEL_CONFIG','10000011','image_understandingv3','{
        "id": 2431162637211660,
        "name": "image_understandingv3",
        "serviceId": "image_understandingv3",
        "serverId": "image_understandingv3",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "image_understandingv3"
            ],
            "serviceBlock":
            {
                "image_understandingv3":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 16384
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 8192,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            },
                            {
                                "constraintType": "switch",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "关",
                                        "label": "关",
                                        "value": true,
                                        "desc": "关"
                                    },
                                    {
                                        "name": "开",
                                        "label": "开",
                                        "value": false,
                                        "desc": "开"
                                    }
                                ],
                                "name": "联网搜索",
                                "revealed": true,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "search_disable",
                                "required": false,
                                "desc": "开启联网搜索，默认关闭。"
                            },
                            {
                                "constraintType": "enum",
                                "default": "force",
                                "constraintContent":
                                [
                                    {
                                        "name": "自动",
                                        "label": "default",
                                        "value": "auto",
                                        "desc": "自动判断是否需要搜索"
                                    },
                                    {
                                        "name": "强制开启",
                                        "label": "default",
                                        "value": "force",
                                        "desc": "强制开启搜索"
                                    }
                                ],
                                "name": "搜索模式",
                                "revealed": false,
                                "support": true,
                                "fieldType": "string",
                                "initialValue": "force",
                                "key": "search_mod",
                                "required": false,
                                "desc": "联网搜索的模式，默认自动判断。"
                            },
                            {
                                "constraintType": "enum",
                                "default": false,
                                "constraintContent":
                                [
                                    {
                                        "name": "开",
                                        "label": "default",
                                        "value": true,
                                        "desc": "开"
                                    },
                                    {
                                        "name": "关",
                                        "label": "default",
                                        "value": false,
                                        "desc": "关"
                                    }
                                ],
                                "name": "展示溯源信息",
                                "revealed": false,
                                "support": true,
                                "fieldType": "boolean",
                                "initialValue": false,
                                "key": "show_ref_label",
                                "required": false,
                                "desc": "开启联网搜索后在结果中展示搜索溯源信息，默认关闭。"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "image_understandingv3",
            "multipleDialog": 1
        },
        "source": 1,
        "url": "wss://spark-api.cn-huabei-1.xf-yun.com/v2.1/image",
        "appId": null,
        "licChannel": "image_understandingv3"
    }
',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-06-16 15:27:55'),
	 (1765,'DEFAULT_SLICE_RULES_CBG','1','CBG默认切片规则','{"type":0,"seperator":["\\n"],"lengthRange":[256,1024]}',1,'','2025-06-18 17:21:37','2025-06-18 17:21:44'),
	 (1767,'CUSTOM_SLICE_RULES_CBG','1','CBG自定义切片模板','{"type":1,"seperator":["\\n"],"lengthRange":[16,1024]}',1,'','2025-06-18 17:21:42','2025-08-14 17:22:34'),
	 (1769,'DEFAULT_SLICE_RULES_SPARK','1','Spark默认切片规则','{"type":0,"seperator":["\\n"],"lengthRange":[16,1024]}',1,'','2025-06-18 17:21:41','2025-06-18 17:21:46'),
	 (1771,'CUSTOM_SLICE_RULES_SPARK','1','Spark自定义切片模板','{"type":1,"seperator":["\\n"],"lengthRange":[16,1024]}',1,'','2025-06-18 17:21:43','2025-06-18 17:21:47'),
	 (1773,'DEFAULT_SLICE_RULES_AIUI','1','AIUI默认切片规则','{"type":0,"seperator":["\\n"],"lengthRange":[16,1024]}',1,'','2025-07-03 15:18:40','2025-07-03 15:18:40'),
	 (1775,'CUSTOM_SLICE_RULES_AIUI','1','AIUI自定义切片模板','{"type":1,"seperator":["\\n"],"lengthRange":[16,1024]}',1,'','2025-07-03 15:18:40','2025-07-03 15:18:40'),
	 (1777,'WORKFLOW_INIT_DATA','workflow','工作流初始化data','{"nodes":[{"data":{"allowInputReference":false,"allowOutputReference":true,"description":"工作流的开启节点，用于定义流程调用所需的业务变量信息。","icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/start-node-icon.png","inputs":[],"label":"开始","nodeMeta":{"aliasName":"开始节点","nodeType":"基础节点"},"nodeParam":{},"outputs":[{"deleteDisabled":true,"id":"0918514b-72a8-4646-8dd9-ff4a8fc26d44","name":"AGENT_USER_INPUT","required":true,"schema":{"default":"用户本轮对话输入内容","type":"string"}}],"status":"","updatable":false},"dragging":false,"height":256,"id":"node-start::d61b0f71-87ee-475e-93ba-f1607f0ce783","position":{"x":-25.109019607843152,"y":521.7086666666667},"positionAbsolute":{"x":-25.109019607843152,"y":521.7086666666667},"selected":false,"type":"开始节点","width":658},{"data":{"allowInputReference":true,"allowOutputReference":false,"description":"工作流的结束节点，用于输出工作流运行后的最终结果。","icon":"https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/end-node-icon.png","inputs":[{"id":"82de2b42-a059-4c98-bffb-b6b4800fcac9","name":"output","schema":{"type":"string","value":{"content":{},"type":"ref"}}}],"label":"结束","nodeMeta":{"aliasName":"结束节点","nodeType":"基础节点"},"nodeParam":{"template":"","streamOutput":true,"outputMode":1},"outputs":[],"references":[],"status":"","updatable":false},"dragging":false,"height":617,"id":"node-end::cda617af-551e-462e-b3b8-3bb9a041bf88","position":{"x":886.8833333333332,"y":343.91588235294114},"positionAbsolute":{"x":886.8833333333332,"y":343.91588235294114},"selected":true,"type":"结束节点","width":408}],"edges":[]}',1,NULL,'2022-06-10 00:00:00','2025-06-26 15:01:02'),
	 (1779,'DOMAIN_WHITE_LIST','domain_white_list','域名白名单','inner-sparklinkthirdapi.aipaasapi.cn,agentbuilder.aipaasapi.cn,dx-cbm-ocp-agg-search-inner.xf-yun.com,dx-cbm-ocp-gateway.xf-yun.com,xingchen-agent-mcp.aicp.private,dx-spark-agentbuilder.aicp.private,vmselect.huabei.xf-yun.com,pre-agentbuilder.aipaasapi.cn,apisix-pre-in.iflytekauto.cn,csp-in.iflytekauto.cn,www.ctllm.com',1,NULL,'2022-06-10 00:00:00','2025-08-23 14:18:16'),
	 (1781,'CUSTOM_SLICE_SEPERATORS_AIUI','1','AIUI自定义分隔符','[
{
"id": 1,
"name": "换行符",
"symbol": "\\\\n"
},
{
"id": 2,
"name": "中文句号",
"symbol": "。"
},
{
"id": 3,
"name": "英文句号",
"symbol": "."
},
{
"id": 4,
"name": "中文叹号",
"symbol": "！"
},
{
"id": 5,
"name": "英文叹号",
"symbol": "!"
},
{
"id": 6,
"name": "中文问号",
"symbol": "？"
},
{
"id": 7,
"name": "英文问号",
"symbol": "?"
},
{
"id": 8,
"name": "中文分号",
"symbol": "；"
},
{
"id": 9,
"name": "英文分号",
"symbol": ";"
},
{
"id": 10,
"name": "中文省略号",
"symbol": "……"
},
{
"id": 11,
"name": "英文省略号",
"symbol": "..."
}
]',1,'','2025-07-24 15:02:00','2025-07-24 15:02:00'),
	 (1783,'CUSTOM_SLICE_SEPERATORS_CBG','1','CBG自定义分隔符','[
{
"id": 1,
"name": "换行符",
"symbol": "\\\\n"
},
{
"id": 2,
"name": "中文句号",
"symbol": "。"
},
{
"id": 3,
"name": "英文句号",
"symbol": "."
},
{
"id": 4,
"name": "中文叹号",
"symbol": "！"
},
{
"id": 5,
"name": "英文叹号",
"symbol": "!"
},
{
"id": 6,
"name": "中文问号",
"symbol": "？"
},
{
"id": 7,
"name": "英文问号",
"symbol": "?"
},
{
"id": 8,
"name": "中文分号",
"symbol": "；"
},
{
"id": 9,
"name": "英文分号",
"symbol": ";"
},
{
"id": 10,
"name": "中文省略号",
"symbol": "……"
},
{
"id": 11,
"name": "英文省略号",
"symbol": "..."
}
]',1,'','2025-07-24 15:02:18','2025-07-24 15:02:18'),
	 (1785,'CUSTOM_SLICE_SEPERATORS_SPARK','1','SPARK自定义分隔符','[
{
"id": 1,
"name": "换行符",
"symbol": "\\\\n"
},
{
"id": 2,
"name": "中文句号",
"symbol": "。"
},
{
"id": 3,
"name": "英文句号",
"symbol": "."
},
{
"id": 4,
"name": "中文叹号",
"symbol": "！"
},
{
"id": 5,
"name": "英文叹号",
"symbol": "!"
},
{
"id": 6,
"name": "中文问号",
"symbol": "？"
},
{
"id": 7,
"name": "英文问号",
"symbol": "?"
},
{
"id": 8,
"name": "中文分号",
"symbol": "；"
},
{
"id": 9,
"name": "英文分号",
"symbol": ";"
},
{
"id": 10,
"name": "中文省略号",
"symbol": "……"
},
{
"id": 11,
"name": "英文省略号",
"symbol": "..."
}
]',1,'','2025-07-24 15:02:38','2025-07-24 15:02:38'),
	 (1787,'WORKFLOW_NODE_TEMPLATE_PRE','1,2','基础节点','{
"aliasName": "数据库",
"idType": "database",
"data": {
"outputs": [
{
"id": "",
"name": "isSuccess",
"nameErrMsg": "",
"schema": {
"default": "SQL语句执行状态标识，成功true，失败false",
"type": "boolean"
}
},
{
"id": "",
"name": "message",
"nameErrMsg": "",
"schema": {
"default": "失败原因",
"type": "string"
}
},
{
"id": "",
"name": "outputList",
"nameErrMsg": "",
"schema": {
"default": "执行结果",
"type": "array-object"
}
}
],
"references": [],
"allowInputReference": true,
"inputs": [
{
"schema": {
"type": "string",
"value": {
"type": "ref",
"content": {}
}
},
"name": "input",
"id": ""
}
],
"icon": "https://oss-beijing-m8.openstorage.cn/SparkBotDev/icon/user/sparkBot_1752568522509_database_icon.svg",
"allowOutputReference": true,
"nodeMeta": {
"aliasName": "数据库节点",
"nodeType": "基础节点"
},
"nodeParam": {
"mode": 0
}
},
"description": "支持用户自定义的SQL完成对数据库的增删改查操作",
"nodeType": "基础节点"
}',1,'数据库节点','2000-01-01 00:00:00','2025-07-16 14:41:05'),
	 (1789,'DB_TABLE_TEMPLATE','TB','数据库字段导入模版','https://oss-beijing-m8.openstorage.cn/SparkBotDev/sparkBot/DB_TABLE_导入模板.xlsx',1,NULL,'2025-07-10 10:50:48','2025-07-11 10:01:47'),
	 (1791,'WORKFLOW_NODE_TEMPLATE','1,2','基础节点','{
"aliasName": "数据库",
"idType": "database",
"data": {
"outputs": [
{
"id": "",
"name": "isSuccess",
"nameErrMsg": "",
"schema": {
"default": "SQL语句执行状态标识，成功true，失败false",
"type": "boolean"
}
},
{
"id": "",
"name": "message",
"nameErrMsg": "",
"schema": {
"default": "失败原因",
"type": "string"
}
},
{
"id": "",
"name": "outputList",
"nameErrMsg": "",
"schema": {
"default": "执行结果",
"type": "array-object"
}
}
],
"references": [],
"allowInputReference": true,
"inputs": [
{
"schema": {
"type": "string",
"value": {
"type": "ref",
"content": {}
}
},
"name": "input",
"id": ""
}
],
"icon": "https://oss-beijing-m8.openstorage.cn/SparkBotDev/icon/user/sparkBot_1752568522509_database_icon.svg",
"allowOutputReference": true,
"nodeMeta": {
"aliasName": "数据库节点",
"nodeType": "基础节点"
},
"nodeParam": {
"mode": 0
}
},
"description": "支持用户自定义的SQL完成对数据库的增删改查操作",
"nodeType": "基础节点"
}',1,'数据库节点','2000-01-01 00:00:00','2025-07-25 16:31:32'),
	 (1793,'EVAL_TASK_PROMPT','FIX','测评纬度优化prompt','#角色
你是一个提示词优化专家，本次仅针对单一维度" {{评估维度名称}}"对下列"原始提示词"进行分析和优化，帮助用户在该维度上提升提示的质量。

#原始提示词 
{{context}}

#请按照以下步骤思考： 
1、分析原提示中在“{{评估维度名称}}”方面的不足（例如：表达含糊不清、缺少必要信息等）。
2、可对原始提示词进行优化，如：细化措辞、补充示例、明确格式等，确保提示在该维度上更为突出（例如，更加清晰或更为完整）。
4、梳理提示词里对维度的评分标准，按4个等级维度描述。
**评分标准**  
   - 针对“{{评估维度名称}}”使用以下固定等级与分值，这一维度的四个等级描述，假设维度是“清晰度”：  
   | 等级   | 分值  | 描述                                   |
   | ------ | ----- | -------------------------------------  |
   | **好**   | 4 分   | 目标与指令一目了然，无任何歧义。|
   | **较好** | 3 分   | 大体清晰，仅有少量模糊之处，不影响理解。|
   | **一般** | 2 分   | 表达部分模糊，需要根据上下文猜测意图。|
   | **差**   | 1 分   | 指令含糊或前后矛盾，难以执行。|           

#输出格式：
"""
##角色 
你是一名对话流畅性的质量检查员，负责对"用户输入"和"回复文本"的质量进行评价。

##评估流程
1、检查语句是否通顺，是否存在语法错误（如搭配不当、成分残缺等）。
2、分析逻辑连贯性，判断段落间、句子间的衔接是否自然，是否存在话题跳跃或逻辑断层。
3、评估信息量是否适中，是否符合用户需求（如信息冗余或遗漏可能影响流畅性）。
##评分标准/*按markdown格式*/
| 等级   | 分值  | 描述                                   || ------ | ----- | -------------------------------------- || **好**   | 4 分   | 语句通顺、逻辑严谨、承接自然，信息量适中，整体对话如同人类交流般顺畅。 || **较好** | 3 分   | 基本流畅，仅有偶发小的语法或衔接瑕疵，不影响沟通效果。 || **一般** | 2 分   | 有若干语法或逻辑小错误，或衔接稍显生硬，但大体能理解意图。 || **差**   | 1 分   | 语法错误多、句式混乱、话题跳跃严重，严重妨碍对话连贯性。 |

##输出样例
{"Score":1,"Reason":"智能体的回复语气、用词和内容完全符合其19世纪维多利亚时代英国管家的角色设定；回复贴合用户积极的情绪方向，并通过礼貌的鼓励语言回应了用户的愉快心情。"}
"""
#输出要求：
- 全文聚焦 **“{{评估维度名称}}”**，无需关注其他维度。  
- 语言简洁分点，方便复制粘贴使用。  
-给出一份专注于“{{评估维度名称}}”的结构化、可直接使用的新版提示词。  
- 仅输出最终提示词优化后的结果，无须输出思考过程及优化建议
-按照"输出格式"进行输出，其中"输出样例"严格按json格式输出，score为得分，reason为得分原因。 ',1,'','2025-07-31 10:52:49','2025-07-31 10:52:49'),
	 (1795,'EVAL_TASK_PROMPT','JUDGE','评分维度评价prompt','#输入
你基于"智能体设定"，对"用户输入"的"回复文本"的进行{{评分维度}}评价。
智能体/工作流设定：{{system_prompt}}
用户输入：{{input}}
回复文本：{{output}}

#输出：
得分：一个数字，表示满足Prompt中评分标准的程度。得分范围从 4 分到 1分，分别为4分（好）、3分（较好）、一般（2分）、差（1）分。
原因：对得分的可读解释。你必须用一句话结束理由。
格式：严格按json格式输出，score为得分，reason为得分原因。
#输出格式  
{"Score":3,"Reason":"回复内容基本符合问题语境，但提及的次要案例未充分说明其与核心结论的关联性，导致局部逻辑稍显松散。"} ',1,'','2025-07-31 10:52:49','2025-07-31 10:52:49'),
	 (1797,'ICON','rag','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','icon/rag/Personal@1x.png',1,'SparkDesk-RAG','2025-07-31 19:50:09','2025-10-11 09:58:30'),
	 (1799,'ICON','rag','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','icon/rag/Spark@1x.png',1,'CBG-RAG','2025-07-31 19:50:09','2025-10-11 09:58:30'),
	 (1801,'ICON','rag','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','icon/rag/Stellar@1x.png',1,'AIUI-RAG2','2025-07-31 19:50:09','2025-10-11 09:58:30'),
	 (1803,'SPECIAL_MODEL','10000013','xopgptoss20b','{
    "llmSource": 1,
    "llmId": 10000013,
    "id": 10000013,
    "name": "gpt-oss-20b",
    "patchId": "0",
    "domain": "xopgptoss20b",
    "serviceId": "xopgptoss20b",
    "modelType": 2,
    "isThink": true,
    "licChannel":"xopgptoss20b",
    "status": 1,
    "desc":"gpt-oss-20b 是 OpenAI gpt-oss 系列开源模型，含 21B 参数（3.6B 活跃），适用于低延迟、本地或专用场景，支持推理调节、消费级硬件微调及工具调用，需配合 harmony 格式。",
    "info": "gpt-oss-20b 是 OpenAI gpt-oss 系列开源模型，含 21B 参数（3.6B 活跃），适用于低延迟、本地或专用场景，支持推理调节、消费级硬件微调及工具调用，需配合 harmony 格式。",
    "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/openai.png",
    "tag":
    ["文本生成","多语言","MoE","深度思考","逻辑推理"],
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',1,'','2000-01-01 00:00:00','2025-08-07 11:25:14'),
	 (1805,'SPECIAL_MODEL','10000014','xopgptoss120b','{
    "llmSource": 1,
    "llmId": 10000014,
    "id": 10000014,
    "name": "gpt-oss-120b",
    "patchId": "0",
    "domain": "xopgptoss120b",
    "serviceId": "xopgptoss120b",
    "modelType": 2,
    "licChannel":"xopgptoss120b",
    "status": 1,
    "isThink": true,
    "desc":"gpt-oss-120b 是 OpenAI gpt-oss 系列的开源模型，含 117B 参数（5.1B 活跃参数），采用 Apache 2.0 许可，支持推理强度调节、完整思维链、微调及工具调用，需配合 harmony 格式使用。",
    "info": "gpt-oss-120b 是 OpenAI gpt-oss 系列的开源模型，含 117B 参数（5.1B 活跃参数），采用 Apache 2.0 许可，支持推理强度调节、完整思维链、微调及工具调用，需配合 harmony 格式使用。",
    "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/openai.png",
    "tag":
    ["文本生成","多语言","MoE","深度思考","逻辑推理"],
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',1,'','2000-01-01 00:00:00','2025-08-07 11:25:20'),
	 (1807,'SPECIAL_MODEL_CONFIG','10000013','xopgptoss20b','{
    "id": 2431162637211658,
    "name": "xopgptoss20b",
    "serviceId": "xopgptoss20b",
    "serverId": "xopgptoss20b",
    "domain": null,
    "patchId": "0",
    "type": 1,
    "config":
    {
        "serviceIdkeys":
        [
            "xopgptoss20b"
        ],
        "serviceBlock":
        {
            "xopgptoss20b":
            [
                {
                    "fields":
                    [
                        {
                            "constraintType": "range",
                            "default": 8192,
                            "constraintContent":
                            [
                                {
                                    "name": 1
                                },
                                {
                                    "name": 16384
                                }
                            ],
                            "name": "Max tokens",
                            "revealed": true,
                            "support": true,
                            "fieldType": "int",
                            "initialValue": 8192,
                            "key": "max_tokens",
                            "required": true,
                            "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                        },
                        {
                            "constraintContent":
                            [
                                {
                                    "name": 0.1
                                },
                                {
                                    "name": 1.0
                                }
                            ],
                            "precision": 0.1,
                            "accuracy": 1,
                            "required": true,
                            "constraintType": "range",
                            "default": 0.5,
                            "name": "Temperature",
                            "revealed": true,
                            "step": 0.1,
                            "support": true,
                            "fieldType": "float",
                            "initialValue": 0.5,
                            "key": "temperature",
                            "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                        },
                        {
                            "constraintType": "range",
                            "default": 4,
                            "constraintContent":
                            [
                                {
                                    "name": 1
                                },
                                {
                                    "name": 6
                                }
                            ],
                            "name": "Top_k",
                            "revealed": true,
                            "support": true,
                            "fieldType": "int",
                            "initialValue": 4,
                            "key": "top_k",
                            "required": true,
                            "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                        }
                    ],
                    "key": "generalv3"
                }
            ]
        },
        "featureBlock":
        {},
        "payloadBlock":
        {},
        "acceptBlock":
        {},
        "protocolType": 1,
        "serviceId": "xopgptoss20b",
        "multipleDialog": 1
    },
    "source": 1,
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "appId": null,
    "licChannel": "xopgptoss20b"
}',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-08-07 11:40:58'),
	 (1809,'SPECIAL_MODEL_CONFIG','10000014','xopgptoss120b','{
        "id": 2431162637211660,
        "name": "xopgptoss120b",
        "serviceId": "xopgptoss120b",
        "serverId": "xopgptoss120b",
        "domain": null,
        "patchId": "0",
        "type": 1,
        "config":
        {
            "serviceIdkeys":
            [
                "xopgptoss120b"
            ],
            "serviceBlock":
            {
                "xopgptoss120b":
                [
                    {
                        "fields":
                        [
                            {
                                "constraintType": "range",
                                "default": 8192,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 16384
                                    }
                                ],
                                "name": "Max tokens",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 8192,
                                "key": "max_tokens",
                                "required": true,
                                "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                            },
                            {
                                "constraintContent":
                                [
                                    {
                                        "name": 0.1
                                    },
                                    {
                                        "name": 1.0
                                    }
                                ],
                                "precision": 0.1,
                                "accuracy": 1,
                                "required": true,
                                "constraintType": "range",
                                "default": 0.5,
                                "name": "Temperature",
                                "revealed": true,
                                "step": 0.1,
                                "support": true,
                                "fieldType": "float",
                                "initialValue": 0.5,
                                "key": "temperature",
                                "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                            },
                            {
                                "constraintType": "range",
                                "default": 4,
                                "constraintContent":
                                [
                                    {
                                        "name": 1
                                    },
                                    {
                                        "name": 6
                                    }
                                ],
                                "name": "Top_k",
                                "revealed": true,
                                "support": true,
                                "fieldType": "int",
                                "initialValue": 4,
                                "key": "top_k",
                                "required": true,
                                "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                            }
                        ],
                        "key": "generalv3"
                    }
                ]
            },
            "featureBlock":
            {},
            "payloadBlock":
            {},
            "acceptBlock":
            {},
            "protocolType": 1,
            "serviceId": "xopgptoss120b",
            "multipleDialog": 1
        },
        "source": 1,
        "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
        "appId": null,
        "licChannel": "xopgptoss120b"
    }
',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-08-07 11:41:35'),
	 (1811,'SPACE_SWITCH_NODE','SPACE_SWITCH_NODE','空间节点开关','',1,NULL,'2025-07-10 10:50:48','2025-09-04 14:59:57'),
	 (1813,'SPECIAL_MODEL','10000015','xdeepseekv31','{
    "llmSource": 1,
    "llmId": 10000015,
    "id": 10000015,
    "name": "DeepSeek-V3.1",
    "patchId": "0",
    "domain": "xdeepseekv31",
    "serviceId": "xdeepseekv31",
    "modelType": 2,
    "licChannel": "xdeepseekv31",
    "status": 1,
    "isThink": false,
    "desc": "",
    "info": "",
    "icon": "https://oss-beijing-m8.openstorage.cn/atp/image/model/icon/deepseek.png",
    "tag":
    ["文本生成","工具调用","混合思考"],
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "modelId": 0
}',1,'','2000-01-01 00:00:00','2025-08-27 14:08:01'),
	 (1815,'SPECIAL_MODEL_CONFIG','10000015','xdeepseekv31','{
    "id": 2431162637211661,
    "name": "xdeepseekv31",
    "serviceId": "xdeepseekv31",
    "serverId": "xdeepseekv31",
    "domain": "xdeepseekv31",
    "patchId": "0",
    "type": 1,
    "config":
    {
        "serviceIdkeys":
        [
            "xdeepseekv31"
        ],
        "serviceBlock":
        {
            "xdeepseekv31":
            [
                {
                    "fields":
                    [
                        {
                            "constraintType": "range",
                            "default": 8192,
                            "constraintContent":
                            [
                                {
                                    "name": 1
                                },
                                {
                                    "name": 16384
                                }
                            ],
                            "name": "Max tokens",
                            "revealed": true,
                            "support": true,
                            "fieldType": "int",
                            "initialValue": 8192,
                            "key": "max_tokens",
                            "required": true,
                            "desc": "最大回复长度：最小值是1, 最大值是16384。控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于150 个中文汉字。"
                        },
                        {
                            "constraintContent":
                            [
                                {
                                    "name": 0.1
                                },
                                {
                                    "name": 1.0
                                }
                            ],
                            "precision": 0.1,
                            "accuracy": 1,
                            "required": true,
                            "constraintType": "range",
                            "default": 0.5,
                            "name": "Temperature",
                            "revealed": true,
                            "step": 0.1,
                            "support": true,
                            "fieldType": "float",
                            "initialValue": 0.5,
                            "key": "temperature",
                            "desc": "核采样阈值：取值范围 (0，1]。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高"
                        },
                        {
                            "constraintType": "range",
                            "default": 4,
                            "constraintContent":
                            [
                                {
                                    "name": 1
                                },
                                {
                                    "name": 6
                                }
                            ],
                            "name": "Top_k",
                            "revealed": true,
                            "support": true,
                            "fieldType": "int",
                            "initialValue": 4,
                            "key": "top_k",
                            "required": true,
                            "desc": "生成多样性：调高会使得模型的输出更多样性和创新性，反之，降低会使输出内容更加遵循指令要求但减少多样性。最小值1，最大值6"
                        }
                    ],
                    "key": "generalv3"
                }
            ]
        },
        "featureBlock":
        {},
        "payloadBlock":
        {},
        "acceptBlock":
        {},
        "protocolType": 1,
        "serviceId": "xdeepseekv31",
        "multipleDialog": 1
    },
    "source": 1,
    "url": "wss://maas-api.cn-huabei-1.xf-yun.com/v1.1/chat",
    "appId": null,
    "licChannel": "xdeepseekv31"
}',1,'亚谋理想项目测试使用','2000-01-01 00:00:00','2025-08-27 11:31:43'),
	 (1817,'MCP_MODEL_API_REFLECT','mcp','xdeepseekv31','https://maas-api.cn-huabei-1.xf-yun.com/v2',1,'','2000-01-01 00:00:00','2025-05-29 15:54:10'),
	 (1819,'NODE_PREFIX_MODEL','switch','应用大模型节点前缀配置','spark-llm,decision-making,extractor-parameter,agent,knowledge-pro-base,question-answer',1,NULL,'2025-07-10 10:50:48','2025-08-27 14:12:02'),
	 (1821,'DB_TABLE_RESERVED_KEYWORD','reserved_keyword','数据库关键字','all,analyse,analyze,and,any,array,as,asc,asymmetric,authorization,binary,both,case,cast,check,collate,collation,column,concurrently,constraint,create,cross,current_catalog,current_date,current_role,current_schema,current_time,current_timestamp,current_user,default,deferrable,desc,distinct,do,else,end,except,false,fetch,for,foreign,freeze,from,full,grant,group,having,ilike,in,initially,inner,intersect,into,is,isnull,join,lateral,leading,left,like,limit,localtime,localtimestamp,natural,not,notnull,null,offset,on,only,or,order,outer,overlaps,placing,primary,references,returning,right,select,session_user,similar,some,symmetric,table,tablesample,then,to,trailing,true,union,unique,user,using,variadic,verbose,when,where,window,with',1,NULL,'2025-07-10 10:50:48','2025-08-12 16:34:24'),
	 (1823,'WORKFLOW_NODE_TEMPLATE','1,2','工具','{
    "idType": "rpa",
    "nodeType": "基础节点",
    "aliasName": "RPA",
    "description": "调用RPA，可以指定RPA执行",
    "data":
    {
        "nodeMeta":
        {
            "nodeType": "工具",
            "aliasName": "RPA"
        },
        "inputs":
        [],
        "outputs":
        [],
        "nodeParam":
        {
            "projectId": "1965981379635499008",
            "header":
            {
                "apiKey": ""
            },
            "rpaParams":
            {
                "execPosition": "EXECUTOR"
            },
            "source": "xiaowu",
            "icon": "https://oss-beijing-m8.openstorage.cn/pro-bucket/sparkBot/common/workflow/icon/tool-icon.png"
        },
        "references":
        [],
        "allowInputReference": true,
        "allowOutputReference": true,
        "icon": "http://oss-beijing-m8.openstorage.cn/SparkBotProd/icon/tool/rpa_icon.png"
    }
}',1,'RPA','2000-01-01 00:00:00','2025-10-11 14:45:16'),
	 (1824,'NODE_API_K_S','NODE','node判断是否需要apikey','node-start,node-end,text-joiner,node-variable',1,'','2000-01-01 00:00:00','2025-09-29 16:26:33'),
	 (1825,'ICON','rag','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','icon/rag/20251011-140414.png',1,'Ragflow-RAG','2025-07-31 19:50:09','2025-10-11 14:06:20'),
	 (1826,'ICON','rpa_robot','http://oss-beijing-m8.openstorage.cn/SparkBotProd/','icon/tool/rpa_robot_icon.png',1,'','2025-07-31 19:50:09','2025-10-11 14:06:20');
COMMIT;

