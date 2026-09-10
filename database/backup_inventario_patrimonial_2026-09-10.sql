CREATE DATABASE  IF NOT EXISTS `inventario_patrimonial` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventario_patrimonial`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: inventario_patrimonial
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ativos`
--

DROP TABLE IF EXISTS `ativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ativos` (
  `serial_number` varchar(20) NOT NULL,
  `patrimonio` varchar(20) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `marca` varchar(20) NOT NULL,
  `modelo` varchar(30) NOT NULL,
  `status_ativo` varchar(30) NOT NULL,
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `setor_id` int DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `motivo_baixa` varchar(255) DEFAULT NULL,
  `data_atualizacao` datetime DEFAULT NULL,
  PRIMARY KEY (`serial_number`),
  UNIQUE KEY `patrimonio` (`patrimonio`),
  KEY `fk_ativos_setores` (`setor_id`),
  KEY `fk_ativos_categorias` (`categoria_id`),
  CONSTRAINT `fk_ativos_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `fk_ativos_setores` FOREIGN KEY (`setor_id`) REFERENCES `setores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ativos`
--

LOCK TABLES `ativos` WRITE;
/*!40000 ALTER TABLE `ativos` DISABLE KEYS */;
INSERT INTO `ativos` VALUES ('SN0002','1234','Desktop','Dell','Optiplex 3020','Disponivel','2026-09-09 15:10:17',1,NULL,1,NULL,NULL),('SN001','PAT001','Notebook','Dell','Latitude 5420','Baixado','2026-09-09 09:54:25',1,NULL,0,'id 87855','2026-09-09 15:12:07'),('SN002','PAT002','Notebook','Lenovo','Thinkpad T14 Gen 2','Baixado','2026-09-09 11:31:28',1,NULL,0,'substituição','2026-09-09 11:37:52');
/*!40000 ALTER TABLE `ativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campus`
--

DROP TABLE IF EXISTS `campus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campus`
--

LOCK TABLES `campus` WRITE;
/*!40000 ALTER TABLE `campus` DISABLE KEYS */;
INSERT INTO `campus` VALUES (1,'Interlagos');
/*!40000 ALTER TABLE `campus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_ativos`
--

DROP TABLE IF EXISTS `historico_ativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_ativos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ativo_serial` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `usuario_id` int NOT NULL,
  `data_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `evento` varchar(30) NOT NULL,
  `dados_antes` json DEFAULT NULL,
  `dados_depois` json DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_historico_ativo` (`ativo_serial`),
  KEY `fk_historico_usuario` (`usuario_id`),
  CONSTRAINT `fk_historico_ativo` FOREIGN KEY (`ativo_serial`) REFERENCES `ativos` (`serial_number`),
  CONSTRAINT `fk_historico_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_ativos`
--

LOCK TABLES `historico_ativos` WRITE;
/*!40000 ALTER TABLE `historico_ativos` DISABLE KEYS */;
INSERT INTO `historico_ativos` VALUES (1,'SN002',1,'2026-09-09 11:31:28','CADASTRO',NULL,'{\"tipo\": \"Notebook\", \"ativo\": 1, \"marca\": \"Lenovo\", \"modelo\": \"Thinkpad T14\", \"setor_id\": 1, \"patrimonio\": \"PAT002\", \"categoria_id\": null, \"motivo_baixa\": null, \"status_ativo\": \"Disponivel\", \"data_cadastro\": \"2026-09-09T14:31:28.000Z\", \"serial_number\": \"SN002\", \"data_atualizacao\": null}',NULL),(2,'SN002',1,'2026-09-09 11:33:45','ALTERACAO','{\"tipo\": \"Notebook\", \"ativo\": 1, \"marca\": \"Lenovo\", \"modelo\": \"Thinkpad T14\", \"setor_id\": 1, \"patrimonio\": \"PAT002\", \"categoria_id\": null, \"motivo_baixa\": null, \"status_ativo\": \"Disponivel\", \"data_cadastro\": \"2026-09-09T14:31:28.000Z\", \"serial_number\": \"SN002\", \"data_atualizacao\": null}','{\"tipo\": \"Notebook\", \"ativo\": 1, \"marca\": \"Lenovo\", \"modelo\": \"Thinkpad T14 Gen 2\", \"setor_id\": 1, \"patrimonio\": \"PAT002\", \"categoria_id\": null, \"motivo_baixa\": null, \"status_ativo\": \"Disponivel\", \"data_cadastro\": \"2026-09-09T14:31:28.000Z\", \"serial_number\": \"SN002\", \"data_atualizacao\": \"2026-09-09T14:33:45.000Z\"}',NULL),(3,'SN002',1,'2026-09-09 11:37:52','BAIXA','{\"tipo\": \"Notebook\", \"ativo\": 1, \"marca\": \"Lenovo\", \"modelo\": \"Thinkpad T14 Gen 2\", \"setor_id\": 1, \"patrimonio\": \"PAT002\", \"categoria_id\": null, \"motivo_baixa\": null, \"status_ativo\": \"Disponivel\", \"data_cadastro\": \"2026-09-09T14:31:28.000Z\", \"serial_number\": \"SN002\", \"data_atualizacao\": \"2026-09-09T14:33:45.000Z\"}','{\"tipo\": \"Notebook\", \"ativo\": 0, \"marca\": \"Lenovo\", \"modelo\": \"Thinkpad T14 Gen 2\", \"setor_id\": 1, \"patrimonio\": \"PAT002\", \"categoria_id\": null, \"motivo_baixa\": \"substituição\", \"status_ativo\": \"Baixado\", \"data_cadastro\": \"2026-09-09T14:31:28.000Z\", \"serial_number\": \"SN002\", \"data_atualizacao\": \"2026-09-09T14:37:52.000Z\"}','substituição'),(4,'SN0002',1,'2026-09-09 15:10:17','CADASTRO',NULL,'{\"tipo\": \"Desktop\", \"ativo\": 1, \"marca\": \"Dell\", \"modelo\": \"Optiplex 3020\", \"setor_id\": 1, \"patrimonio\": \"1234\", \"categoria_id\": null, \"motivo_baixa\": null, \"status_ativo\": \"Disponivel\", \"data_cadastro\": \"2026-09-09T18:10:17.000Z\", \"serial_number\": \"SN0002\", \"data_atualizacao\": null}',NULL),(5,'SN001',1,'2026-09-09 15:12:07','BAIXA','{\"tipo\": \"Notebook\", \"ativo\": 1, \"marca\": \"Dell\", \"modelo\": \"Latitude 5420\", \"setor_id\": 1, \"patrimonio\": \"PAT001\", \"categoria_id\": null, \"motivo_baixa\": null, \"status_ativo\": \"Disponivel\", \"data_cadastro\": \"2026-09-09T12:54:25.000Z\", \"serial_number\": \"SN001\", \"data_atualizacao\": null}','{\"tipo\": \"Notebook\", \"ativo\": 0, \"marca\": \"Dell\", \"modelo\": \"Latitude 5420\", \"setor_id\": 1, \"patrimonio\": \"PAT001\", \"categoria_id\": null, \"motivo_baixa\": \"id 87855\", \"status_ativo\": \"Baixado\", \"data_cadastro\": \"2026-09-09T12:54:25.000Z\", \"serial_number\": \"SN001\", \"data_atualizacao\": \"2026-09-09T18:12:07.000Z\"}','id 87855');
/*!40000 ALTER TABLE `historico_ativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `predios`
--

DROP TABLE IF EXISTS `predios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `predios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  `campus_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campus_id` (`campus_id`),
  CONSTRAINT `predios_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campus` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `predios`
--

LOCK TABLES `predios` WRITE;
/*!40000 ALTER TABLE `predios` DISABLE KEYS */;
INSERT INTO `predios` VALUES (1,'C1',1),(2,'B1',1);
/*!40000 ALTER TABLE `predios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `setores`
--

DROP TABLE IF EXISTS `setores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `predio_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `predio_id` (`predio_id`),
  CONSTRAINT `setores_ibfk_1` FOREIGN KEY (`predio_id`) REFERENCES `predios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setores`
--

LOCK TABLES `setores` WRITE;
/*!40000 ALTER TABLE `setores` DISABLE KEYS */;
INSERT INTO `setores` VALUES (1,'Biblioteca',2);
/*!40000 ALTER TABLE `setores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `email` varchar(120) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `perfil` enum('ADMIN','GESTOR','CONSULTOR') NOT NULL DEFAULT 'CONSULTOR',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador','admin@inventario.local','dd6e4eb530779d87f6d3fc247fae557b:953b2d69a63be5384489f546918bcc2b6fb927e208364063382f63e7b7e0c2f60ffbbdb260d664b597b7d76b5d7bd0439c432b67753101dca95cc29b61b441ea','ADMIN',1,'2026-09-09 10:54:34');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-10 11:37:11
