-- MySQL dump 10.13  Distrib 8.0.33, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: hybrid_irctc_22Oct2024
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `iib_candidate`
--

DROP TABLE IF EXISTS `iib_candidate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_candidate` (
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `exam_centre_code` int DEFAULT NULL,
  `mem_type` char(2) DEFAULT NULL,
  `gender` char(1) DEFAULT NULL,
  `password` varchar(50) NOT NULL DEFAULT '',
  `password_act` varchar(50) DEFAULT NULL,
  `address1` varchar(100) DEFAULT NULL,
  `address2` varchar(100) DEFAULT NULL,
  `address3` varchar(100) NOT NULL DEFAULT '',
  `address4` varchar(100) NOT NULL DEFAULT '',
  `address5` varchar(100) DEFAULT NULL,
  `address6` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zone_code` varchar(5) DEFAULT NULL,
  `state_code` varchar(5) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `pin_code` varchar(20) DEFAULT NULL,
  `institution_code` varchar(20) DEFAULT NULL,
  `institution_name` varchar(255) DEFAULT NULL,
  `raw_password` varchar(200) NOT NULL,
  PRIMARY KEY (`membership_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_candidate`
--

LOCK TABLES `iib_candidate` WRITE;
/*!40000 ALTER TABLE `iib_candidate` DISABLE KEYS */;
INSERT INTO `iib_candidate` VALUES ('940066663',17,'E','F','*C880794098E49A6FC5C44D6F4A7AB77BBA9C4358','*C880794098E49A6FC5C44D6F4A7AB77BBA9C4358','NAGENDRA SINGH','REGION: CR','TICKET NO: 249413541','','','','0','0','','','SONIYA BHARTI','0','','','MzA2MTk4OQ=='),('920009410',17,'E','M','*A7331FDDAE04771F5C9042A3174E6E7B52695E62','*A7331FDDAE04771F5C9042A3174E6E7B52695E62','MANIK LAL BISHWASH','REGION: CR','TICKET NO: 249213542','','','','0','0','','','OM PRAKASH BISHWASH','0','','','MTAwMjE5ODg='),('920009332',17,'E','M','*6BFCA48D13C55045A6A668D48FF6801FDBA1C7CD','*6BFCA48D13C55045A6A668D48FF6801FDBA1C7CD','GIRANAND SAH','REGION: CR','TICKET NO: 249213543','','','','0','0','','','SUBHASH KUMAR SAH','0','','','MjAxMjE5ODc=');
/*!40000 ALTER TABLE `iib_candidate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iib_candidate_iway`
--

DROP TABLE IF EXISTS `iib_candidate_iway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_candidate_iway` (
  `membership_no` char(20) NOT NULL DEFAULT '',
  `centre_code` char(20) NOT NULL DEFAULT '',
  `exam_code` char(20) NOT NULL DEFAULT '',
  `subject_code` char(20) NOT NULL DEFAULT '',
  `zone_code` time NOT NULL DEFAULT '00:00:00',
  `state_code` char(5) DEFAULT NULL,
  `exam_date` date DEFAULT '0000-00-00',
  `exam_time` time DEFAULT '00:00:00',
  `qp_assigned` enum('Y','N') DEFAULT 'N',
  `qp_generated` enum('Y','N') DEFAULT 'N',
  PRIMARY KEY (`membership_no`,`exam_code`,`subject_code`),
  KEY `membership_no` (`membership_no`),
  KEY `subject_code` (`subject_code`),
  KEY `exam_code` (`exam_code`),
  KEY `centre_code` (`centre_code`),
  KEY `exam_date` (`exam_date`),
  KEY `exam_time` (`exam_time`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_candidate_iway`
--

LOCK TABLES `iib_candidate_iway` WRITE;
/*!40000 ALTER TABLE `iib_candidate_iway` DISABLE KEYS */;
INSERT INTO `iib_candidate_iway` VALUES ('940066663','854306A','100','101','10:00:00','','2024-10-22','10:00:00','Y','N'),('920009410','854306A','100','101','10:00:00','','2024-10-22','10:00:00','Y','N'),('920009332','854306A','100','101','10:00:00','','2024-10-22','10:00:00','Y','N');
/*!40000 ALTER TABLE `iib_candidate_iway` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iib_question_paper`
--

DROP TABLE IF EXISTS `iib_question_paper`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_question_paper` (
  `question_paper_no` int NOT NULL AUTO_INCREMENT,
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `total_marks` int NOT NULL DEFAULT '0',
  `sample` enum('Y','N') DEFAULT NULL,
  `enabled` enum('Y','N') DEFAULT NULL,
  `online` enum('Y','N') DEFAULT NULL,
  `assigned` enum('Y','N') DEFAULT NULL,
  `complete` enum('Y','N') NOT NULL DEFAULT 'N',
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `medium_code` enum('H','E') NOT NULL DEFAULT 'E',
  `html_qp_generated` enum('Y','N') DEFAULT 'N',
  PRIMARY KEY (`question_paper_no`),
  KEY `membership_no_idx` (`membership_no`),
  KEY `idx_upqp` (`exam_code`,`subject_code`,`assigned`,`online`)
) ENGINE=InnoDB AUTO_INCREMENT=253 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_question_paper`
--

LOCK TABLES `iib_question_paper` WRITE;
/*!40000 ALTER TABLE `iib_question_paper` DISABLE KEYS */;
-- INSERT INTO `iib_question_paper` VALUES (192,'100','101',52,'N','Y','Y','Y','Y','940066663','E','N'),(251,'100','101',52,'N','Y','Y','Y','Y','920009410','E','N'),(252,'100','101',52,'N','Y','Y','Y','Y','920009332','E','N');
/*!40000 ALTER TABLE `iib_question_paper` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iib_question_paper_details`
--

DROP TABLE IF EXISTS `iib_question_paper_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_question_paper_details` (
  `question_paper_no` int NOT NULL DEFAULT '0',
  `subject_code` varchar(20) DEFAULT NULL,
  `section_code` varchar(20) NOT NULL DEFAULT '',
  `question_id` int NOT NULL DEFAULT '0',
  `case_id` int DEFAULT NULL,
  `answer` varchar(250) DEFAULT '',
  `answer_order` varchar(20) NOT NULL DEFAULT '',
  `display_order` int unsigned NOT NULL DEFAULT '0',
  `updated_time` datetime DEFAULT NULL,
  KEY `paper_question` (`question_paper_no`,`question_id`),
  KEY `subjectcode_idx` (`subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_question_paper_details`
--

LOCK TABLES `iib_question_paper_details` WRITE;
/*!40000 ALTER TABLE `iib_question_paper_details` DISABLE KEYS */;
-- INSERT INTO `iib_question_paper_details` VALUES (252,'101','1',1,0,'','2,3,4,1,5',11,NULL),(252,'101','1',2,0,'','3,5,4,1,2',4,NULL),(252,'101','1',3,0,'','1,2,5,3,4',5,NULL),(252,'101','1',4,0,'','4,2,5,3,1',7,NULL),(252,'101','1',5,0,'','5,3,1,4,2',6,NULL),(252,'101','1',6,0,'','5,3,4,2,1',12,NULL),(252,'101','1',7,0,'','4,2,1,5,3',13,NULL),(252,'101','1',8,0,'','3,2,1,5,4',10,NULL),(252,'101','1',9,0,'','1,5,4,3,2',15,NULL),(252,'101','1',10,0,'','1,4,3,5,2',17,NULL),(252,'101','1',11,0,'','4,3,5,2,1',18,NULL),(252,'101','1',12,0,'','5,2,1,4,3',16,NULL),(252,'101','1',13,0,'','3,1,2,5,4',9,NULL),(252,'101','1',14,0,'','3,2,1,4,5',2,NULL),(252,'101','1',15,0,'','4,2,3,1,5',3,NULL),(252,'101','1',16,0,'','1,4,3,2,5',19,NULL),(252,'101','1',17,0,'','2,4,1,5,3',1,NULL),(252,'101','1',18,0,'','4,2,1,5,3',14,NULL),(252,'101','1',19,0,'','3,1,5,4,2',20,NULL),(252,'101','1',20,0,'','5,1,3,2,4',8,NULL),(252,'101','3',21,1,'','3,1,5,4,2',39,NULL),(252,'101','3',22,1,'','5,1,4,2,3',40,NULL),(252,'101','3',23,1,'','5,4,3,1,2',41,NULL),(252,'101','3',24,1,'','3,1,5,2,4',42,NULL),(252,'101','3',25,2,'','4,2,5,3,1',35,NULL),(252,'101','3',26,2,'','1,4,5,3,2',36,NULL),(252,'101','3',27,2,'','3,1,4,2,5',37,NULL),(252,'101','3',28,2,'','5,2,3,1,4',38,NULL),(252,'101','2',29,0,'','1,2,5,4,3',28,NULL),(252,'101','2',30,0,'','2,5,3,1,4',34,NULL),(252,'101','2',31,0,'','1,2,3,4,5',25,NULL),(252,'101','2',32,0,'','3,2,5,1,4',30,NULL),(252,'101','2',33,0,'','4,5,3,1,2',33,NULL),(252,'101','2',34,0,'','2,4,5,1,3',24,NULL),(252,'101','2',35,0,'','3,4,5,2,1',31,NULL),(252,'101','2',36,0,'','3,5,4,1,2',32,NULL),(252,'101','2',37,0,'','4,5,1,2,3',29,NULL),(252,'101','2',38,0,'','4,3,2,1,5',26,NULL),(252,'101','2',39,0,'','3,5,4,2,1',22,NULL),(252,'101','2',40,0,'','4,1,5,3,2',21,NULL),(252,'101','2',41,0,'','3,1,5,2,4',27,NULL),(252,'101','2',42,0,'','5,3,2,4,1',23,NULL),(252,'101','4',43,0,'','3,1,5,2,4',46,NULL),(252,'101','4',44,0,'','3,1,5,2,4',44,NULL),(252,'101','4',45,0,'','3,1,5,2,4',43,NULL),(252,'101','4',46,0,'','3,1,5,2,4',45,NULL),(252,'101','4',47,0,'','3,1,5,2,4',47,NULL),(251,'101','1',1,0,'','1,4,2,5,3',19,NULL),(251,'101','1',2,0,'','1,3,5,4,2',5,NULL),(251,'101','1',3,0,'','5,1,2,3,4',18,NULL),(251,'101','1',4,0,'','5,1,2,4,3',4,NULL),(251,'101','1',5,0,'','4,2,1,5,3',7,NULL),(251,'101','1',6,0,'','3,5,1,2,4',14,NULL),(251,'101','1',7,0,'','1,3,2,5,4',8,NULL),(251,'101','1',8,0,'','1,2,4,3,5',20,NULL),(251,'101','1',9,0,'','5,2,1,4,3',15,NULL),(251,'101','1',10,0,'','5,2,4,1,3',2,NULL),(251,'101','1',11,0,'','1,5,3,2,4',6,NULL),(251,'101','1',12,0,'','4,2,3,1,5',10,NULL),(251,'101','1',13,0,'','3,4,1,2,5',1,NULL),(251,'101','1',14,0,'','2,3,1,4,5',3,NULL),(251,'101','1',15,0,'','2,1,5,4,3',9,NULL),(251,'101','1',16,0,'','2,3,5,4,1',13,NULL),(251,'101','1',17,0,'','4,2,1,5,3',16,NULL),(251,'101','1',18,0,'','5,4,3,1,2',12,NULL),(251,'101','1',19,0,'','2,3,5,4,1',11,NULL),(251,'101','1',20,0,'','2,3,4,1,5',17,NULL),(251,'101','3',21,1,'','1,4,5,2,3',35,NULL),(251,'101','3',22,1,'','1,4,5,3,2',36,NULL),(251,'101','3',23,1,'','3,5,2,4,1',37,NULL),(251,'101','3',24,1,'','1,4,2,3,5',38,NULL),(251,'101','3',25,2,'','5,3,4,2,1',39,NULL),(251,'101','3',26,2,'','4,2,5,3,1',40,NULL),(251,'101','3',27,2,'','4,2,3,5,1',41,NULL),(251,'101','3',28,2,'','5,3,4,2,1',42,NULL),(251,'101','2',29,0,'','5,2,1,3,4',25,NULL),(251,'101','2',30,0,'','5,2,4,1,3',26,NULL),(251,'101','2',31,0,'','4,3,5,1,2',31,NULL),(251,'101','2',32,0,'','1,3,4,5,2',30,NULL),(251,'101','2',33,0,'','1,5,3,4,2',33,NULL),(251,'101','2',34,0,'','3,5,2,1,4',32,NULL),(251,'101','2',35,0,'','2,4,3,5,1',23,NULL),(251,'101','2',36,0,'','5,3,1,2,4',21,NULL),(251,'101','2',37,0,'','1,3,5,4,2',28,NULL),(251,'101','2',38,0,'','2,3,5,4,1',34,NULL),(251,'101','2',39,0,'','5,4,2,3,1',29,NULL),(251,'101','2',40,0,'','1,2,5,4,3',27,NULL),(251,'101','2',41,0,'','5,2,1,3,4',22,NULL),(251,'101','2',42,0,'','1,3,5,2,4',24,NULL),(251,'101','4',43,0,'','5,3,4,2,1',46,NULL),(251,'101','4',44,0,'','5,3,4,2,1',44,NULL),(251,'101','4',45,0,'','5,3,4,2,1',43,NULL),(251,'101','4',46,0,'','5,3,4,2,1',45,NULL),(251,'101','4',47,0,'','5,3,4,2,1',47,NULL),(192,'101','1',1,0,'','2,1,4,5,3',13,NULL),(192,'101','1',2,0,'','5,1,3,4,2',3,NULL),(192,'101','1',3,0,'','4,5,3,1,2',14,NULL),(192,'101','1',4,0,'','1,4,2,3,5',4,NULL),(192,'101','1',5,0,'','5,4,3,2,1',10,NULL),(192,'101','1',6,0,'','5,4,2,1,3',7,NULL),(192,'101','1',7,0,'','5,1,3,4,2',8,NULL),(192,'101','1',8,0,'','3,2,5,1,4',17,NULL),(192,'101','1',9,0,'','3,1,4,5,2',9,NULL),(192,'101','1',10,0,'','2,5,3,1,4',16,NULL),(192,'101','1',11,0,'','5,4,3,1,2',1,NULL),(192,'101','1',12,0,'','2,5,1,3,4',5,NULL),(192,'101','1',13,0,'','4,3,2,1,5',20,NULL),(192,'101','1',14,0,'','1,4,3,2,5',6,NULL),(192,'101','1',15,0,'','1,5,2,3,4',19,NULL),(192,'101','1',16,0,'','1,2,4,5,3',11,NULL),(192,'101','1',17,0,'','3,5,1,2,4',2,NULL),(192,'101','1',18,0,'','2,5,3,1,4',18,NULL),(192,'101','1',19,0,'','2,4,5,3,1',15,NULL),(192,'101','1',20,0,'','5,4,1,2,3',12,NULL),(192,'101','3',21,1,'','1,4,3,5,2',39,NULL),(192,'101','3',22,1,'','5,4,1,3,2',40,NULL),(192,'101','3',23,1,'','3,2,4,5,1',41,NULL),(192,'101','3',24,1,'','1,2,5,3,4',42,NULL),(192,'101','3',25,2,'','5,4,3,2,1',35,NULL),(192,'101','3',26,2,'','1,2,5,4,3',36,NULL),(192,'101','3',27,2,'','1,4,5,2,3',37,NULL),(192,'101','3',28,2,'','3,4,1,2,5',38,NULL),(192,'101','2',29,0,'','2,5,3,4,1',24,NULL),(192,'101','2',30,0,'','2,3,4,5,1',32,NULL),(192,'101','2',31,0,'','2,1,5,4,3',21,NULL),(192,'101','2',32,0,'','1,2,3,5,4',30,NULL),(192,'101','2',33,0,'','3,2,4,1,5',31,NULL),(192,'101','2',34,0,'','1,3,5,2,4',34,NULL),(192,'101','2',35,0,'','3,5,2,1,4',26,NULL),(192,'101','2',36,0,'','3,2,5,1,4',27,NULL),(192,'101','2',37,0,'','3,1,5,2,4',25,NULL),(192,'101','2',38,0,'','1,3,5,4,2',22,NULL),(192,'101','2',39,0,'','5,1,4,3,2',29,NULL),(192,'101','2',40,0,'','5,4,2,3,1',23,NULL),(192,'101','2',41,0,'','4,1,2,3,5',33,NULL),(192,'101','2',42,0,'','5,2,4,1,3',28,NULL),(192,'101','4',43,0,'','1,2,5,3,4',46,NULL),(192,'101','4',44,0,'','1,2,5,3,4',43,NULL),(192,'101','4',45,0,'','1,2,5,3,4',47,NULL),(192,'101','4',46,0,'','1,2,5,3,4',45,NULL),(192,'101','4',47,0,'','1,2,5,3,4',44,NULL);
/*!40000 ALTER TABLE `iib_question_paper_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iib_ta_details`
--

DROP TABLE IF EXISTS `iib_ta_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_ta_details` (
  `ta_id` int unsigned NOT NULL AUTO_INCREMENT,
  `ta_login` char(20) NOT NULL DEFAULT '',
  `ta_name` char(150) NOT NULL,
  `ta_password` char(50) NOT NULL DEFAULT '',
  `cafe_id` char(20) DEFAULT NULL,
  `centre_code` char(20) NOT NULL DEFAULT '',
  `is_active` enum('0','1') DEFAULT '1',
  `start_ip` bigint NOT NULL DEFAULT '0',
  `end_ip` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`ta_id`),
  UNIQUE KEY `ind_talogin` (`ta_login`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_ta_details`
--

LOCK TABLES `iib_ta_details` WRITE;
/*!40000 ALTER TABLE `iib_ta_details` DISABLE KEYS */;
INSERT INTO `iib_ta_details` VALUES (12,'iwfr_854306A','PURNEA DIGITAL','*2470C0C06DEE42FD1618BB99005ADCA2EC9D1E19',':>854306A','854306A','1',0,0);
/*!40000 ALTER TABLE `iib_ta_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iib_exam_candidate`
--

DROP TABLE IF EXISTS `iib_exam_candidate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_exam_candidate` (
  `membership_no` varchar(20) NOT NULL DEFAULT '',
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `medium_code` varchar(20) DEFAULT NULL,
  `institution_code` varchar(20) DEFAULT NULL,
  `alloted` char(1) NOT NULL DEFAULT 'N',
  KEY `id_index` (`membership_no`,`exam_code`,`subject_code`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_exam_candidate`
--

LOCK TABLES `iib_exam_candidate` WRITE;
/*!40000 ALTER TABLE `iib_exam_candidate` DISABLE KEYS */;
INSERT INTO `iib_exam_candidate` VALUES ('920009332','100','101','E','','Y'),('920009410','100','101','E','','Y'),('940066663','100','101','E','','Y');
/*!40000 ALTER TABLE `iib_exam_candidate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iib_ta_iway`
--

DROP TABLE IF EXISTS `iib_ta_iway`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_ta_iway` (
  `ta_login` varchar(20) NOT NULL DEFAULT '',
  `centre_code` varchar(20) NOT NULL DEFAULT '',
  `exam_date` date NOT NULL DEFAULT '0000-00-00',
  `exam_time` time NOT NULL DEFAULT '00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_ta_iway`
--

LOCK TABLES `iib_ta_iway` WRITE;
/*!40000 ALTER TABLE `iib_ta_iway` DISABLE KEYS */;
INSERT INTO `iib_ta_iway` VALUES ('iwfr_854306A','854306A','2024-10-22','10:00:00');
/*!40000 ALTER TABLE `iib_ta_iway` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iib_exam_schedule`
--

DROP TABLE IF EXISTS `iib_exam_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iib_exam_schedule` (
  `exam_code` varchar(20) NOT NULL DEFAULT '',
  `subject_code` varchar(20) NOT NULL DEFAULT '',
  `exam_date` date DEFAULT NULL,
  `online` enum('Y','N') NOT NULL DEFAULT 'Y'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iib_exam_schedule`
--

LOCK TABLES `iib_exam_schedule` WRITE;
/*!40000 ALTER TABLE `iib_exam_schedule` DISABLE KEYS */;
INSERT INTO `iib_exam_schedule` VALUES ('100','101','2024-10-22','Y'),('100','102','2024-10-22','Y'),('100','1011','2024-10-22','Y');
/*!40000 ALTER TABLE `iib_exam_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `autoInc`
--

DROP TABLE IF EXISTS `autoInc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `autoInc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `autoid` int DEFAULT NULL,
  `center_code` varchar(50) DEFAULT NULL,
  `serverno` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=373 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `autoInc`
--

LOCK TABLES `autoInc` WRITE;
/*!40000 ALTER TABLE `autoInc` DISABLE KEYS */;
INSERT INTO `autoInc` VALUES (368,368000,'854306A','2'),(369,369000,'854306A','3'),(370,370000,'854306A','4'),(371,371000,'854306A','5'),(372,372000,'854306A','6');
/*!40000 ALTER TABLE `autoInc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biometric_report_api`
--

DROP TABLE IF EXISTS `biometric_report_api`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biometric_report_api` (
  `id` int NOT NULL AUTO_INCREMENT,
  `center_code` varchar(11) NOT NULL,
  `membership_no` varchar(30) NOT NULL DEFAULT '',
  `seat_no` varchar(10) NOT NULL DEFAULT '',
  `exam_date` date NOT NULL,
  `labname` text NOT NULL,
  `batch_time` varchar(10) NOT NULL DEFAULT '',
  `date_created` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `date_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `check_bio` (`membership_no`)
) ENGINE=MyISAM AUTO_INCREMENT=300 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biometric_report_api`
--

LOCK TABLES `biometric_report_api` WRITE;
/*!40000 ALTER TABLE `biometric_report_api` DISABLE KEYS */;
INSERT INTO `biometric_report_api` VALUES (297,'854306A','920009410','','2024-10-22','BUILDING-1 FLOOR-1ST LAB-1','10:00:00','2024-10-21 16:24:01','2024-10-21 10:54:01'),(298,'854306A','920009332','','2024-10-22','BUILDING-1 FLOOR-1ST LAB-1','10:00:00','2024-10-21 16:24:01','2024-10-21 10:54:01'),(299,'854306A','940066663','','2024-10-22','BUILDING-1 FLOOR-1ST LAB-1','10:00:00','2024-10-21 16:24:01','2024-10-21 10:54:01');
/*!40000 ALTER TABLE `biometric_report_api` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-21 17:50:39
