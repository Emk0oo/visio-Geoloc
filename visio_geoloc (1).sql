-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 09 fév. 2025 à 20:35
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `visio_geoloc`
--

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` text NOT NULL,
  `longitude` float NOT NULL,
  `latitude` float NOT NULL,
  `isConnected` tinyint(1) NOT NULL DEFAULT '0',
  `last_activity` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `longitude`, `latitude`, `isConnected`, `last_activity`) VALUES
(54, 'MonPseudo', 0.247503, 49.402, 0, '2025-02-09 21:35:08'),
(53, 'hello', 0.252314, 49.3978, 0, '2025-02-09 20:41:55'),
(51, 'zezeeze', 0.2475, 49.402, 1, '2025-02-09 13:41:21'),
(50, 'ze', -0.332007, 49.1874, 0, '2025-01-29 16:18:37'),
(49, 'ze', -0.332007, 49.1874, 1, '2025-01-29 16:18:08'),
(48, 'ze', -0.345468, 49.1881, 0, '2025-01-29 14:01:24'),
(46, 'ze', 0.252314, 49.3978, 0, '2025-01-28 16:29:56'),
(45, 'ze', 0.252314, 49.3978, 0, '2025-01-28 16:26:07');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
