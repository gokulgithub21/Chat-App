-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 25, 2025 at 03:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chatapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `created_at`, `user_email`) VALUES
(39, 'gokul', 'gokul@gmail.com', '2025-02-17 14:21:30', 'gokuls@gmail.com'),
(40, 'gokuls0607', 'gokuls0607@gmail.com', '2025-02-17 14:21:51', 'gokuls@gmail.com'),
(41, 'gokuls0607', 'gokuls0607@gmail.com', '2025-02-17 14:22:03', 'gokul@gmail.com'),
(42, 'gokuls', 'gokuls@gmail.com', '2025-02-17 14:22:15', 'gokul@gmail.com'),
(45, 'pangaaaliiiii', 'gokul@gmail.com', '2025-02-18 06:55:06', 'abishekshanmugam2003@gmail.com'),
(46, 'shek', 'abishekshanmugam2003@gmail.com', '2025-02-18 06:56:07', 'gokul@gmail.com'),
(47, 'shek', 'abishekshanmugam2003@gmail.com', '2025-02-18 06:58:22', 'gokuls@gmail.com'),
(48, 'gokuls', 'gokuls@gmail.com', '2025-02-18 07:03:35', 'abishekshanmugam2003@gmail.com'),
(51, 'gokul', 'gokul@gmail.com', '2025-03-07 04:42:49', 'gokuls0607@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `groupchat`
--

CREATE TABLE `groupchat` (
  `id` int(11) NOT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `group_description` text DEFAULT NULL,
  `created_by_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `group_avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groupchat`
--

INSERT INTO `groupchat` (`id`, `group_name`, `group_description`, `created_by_email`, `created_at`, `group_avatar`) VALUES
(11, 'Bca Family ☠️', 'Bca Family  1☠️', 'gokuls@gmail.com', '2025-02-17 14:23:39', 'http://localhost/angular-auth/uploads/group_images/67b3473e0ce53_cropped_group_image.png'),
(12, 'Mca Family 😎', 'Mca Family 😎', 'gokul@gmail.com', '2025-02-19 05:59:25', 'http://localhost/angular-auth/uploads/group_images/67b5736ca9692_cropped_group_image.png'),
(13, '1234', '1234', 'gokuls@gmail.com', '2025-02-28 04:14:10', 'http://localhost/angular-auth/uploads/group_images/67c13840aafe3_cropped_group_image.png');

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `group_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`group_id`, `contact_id`) VALUES
(11, 39),
(12, 46),
(12, 42),
(12, 41),
(11, 46),
(13, 40),
(13, 39),
(13, 46),
(11, 40);

-- --------------------------------------------------------

--
-- Table structure for table `group_messages`
--

CREATE TABLE `group_messages` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `read_status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group_messages`
--

INSERT INTO `group_messages` (`id`, `group_id`, `sender_email`, `sender_name`, `message`, `file_url`, `timestamp`, `deleted`, `deleted_at`, `read_status`) VALUES
(820, 11, 'gokul@gmail.com', 'Gokul', 'bjqFdtLsP5LluQajAWIpiw==', NULL, '2025-02-19 06:04:22', 0, NULL, 1),
(821, 11, 'gokuls@gmail.com', 'Gokuls', 'This message was deleted', NULL, '2025-02-19 06:04:48', 1, '2025-02-19 11:34:53', 1),
(822, 11, 'gokuls@gmail.com', 'Gokuls', '', 'http://localhost/angular-auth/uploads/msg_files/profile.txt', '2025-02-19 06:05:03', 0, NULL, 1),
(823, 11, 'gokuls@gmail.com', 'Gokuls', 'jjm1YNspZkyoEf1Rsf4ERQ==', NULL, '2025-02-20 06:35:38', 0, NULL, 1),
(824, 11, 'gokul@gmail.com', 'Gokul', 'Vh+rKgbtBKhFGEHJWCsJwQ==', NULL, '2025-02-26 04:52:47', 0, NULL, 1),
(825, 11, 'gokuls@gmail.com', 'Gokuls', 'CpMnMK3YYiViH+9ZbQL39w==', NULL, '2025-02-26 04:52:50', 0, NULL, 1),
(826, 11, 'gokuls@gmail.com', 'Gokuls', '', 'http://localhost/angular-auth/uploads/msg_files/1sem.jpg', '2025-02-26 04:52:55', 0, NULL, 1),
(827, 11, 'gokuls@gmail.com', 'Gokuls', '', 'http://localhost/angular-auth/uploads/msg_files/IBCA unit 3 (1) (3).pdf', '2025-02-28 01:07:14', 0, NULL, 1),
(828, 12, 'gokuls@gmail.com', 'Gokuls', 'XX1PkjQeWRzi8d7h26zYaw==', NULL, '2025-02-28 04:08:47', 0, NULL, 1),
(829, 12, 'gokul@gmail.com', 'Gokul', 'yaQxynaRySnr6Z3bpEPdlQ==', NULL, '2025-02-28 04:09:19', 0, NULL, 1),
(830, 12, 'gokuls@gmail.com', 'Gokuls', 'MbUctI2LfagPkjA1iUTHRg==', NULL, '2025-03-06 09:23:13', 0, NULL, 1),
(831, 12, 'gokul@gmail.com', 'Gokul', 'l6QfMj4vyK4Jyc2RvCgyGg==', NULL, '2025-03-06 09:23:17', 0, NULL, 1),
(832, 12, 'gokuls@gmail.com', 'Gokuls', '', 'http://localhost/angular-auth/uploads/msg_files/10TH MC F (5).pdf', '2025-03-06 09:23:21', 0, NULL, 1),
(833, 12, 'gokuls@gmail.com', 'Gokuls', '8wNuJR2y5v8dEPhWCVYD0w==', NULL, '2025-03-06 09:23:46', 0, NULL, 1),
(834, 12, 'gokul@gmail.com', 'Gokul', 'BCxlYaJNL0aeR3y3UG3eGw==', NULL, '2025-03-06 09:24:12', 0, NULL, 1),
(835, 12, 'gokuls@gmail.com', 'Gokuls', 'Z2fB3f6u/NKZCM1mpAevZA==', NULL, '2025-03-06 09:24:14', 0, NULL, 1),
(836, 12, 'gokul@gmail.com', 'Gokul', 'kfU3R0DRhM6+CRF0gj1Mvg==', NULL, '2025-03-06 09:24:17', 0, NULL, 1),
(837, 12, 'gokuls@gmail.com', 'Gokuls', 'RPAw5w5Z06R3qplyTbXSiQ==', NULL, '2025-03-06 09:24:19', 0, NULL, 1),
(838, 12, 'gokuls@gmail.com', 'Gokuls', 'G7qYxdcJ6XAn8X0cVKDUUw==', NULL, '2025-03-06 09:24:28', 0, NULL, 1),
(839, 12, 'gokul@gmail.com', 'Gokul', 'xbTBwjnqZ0p18uV4dAyCtg==', NULL, '2025-03-06 09:24:38', 0, NULL, 1),
(840, 12, 'gokuls0607@gmail.com', 'gokuls0607', 'bsnGmfEG3tTi8PDEm/gIfQ==', NULL, '2025-03-18 13:06:48', 0, NULL, 1),
(841, 12, 'gokuls0607@gmail.com', 'gokuls0607', '52CmnPsVD/YdVkuU0mmHxw==', NULL, '2025-03-18 13:06:59', 0, NULL, 1),
(842, 12, 'gokuls0607@gmail.com', 'gokuls0607', 'myQi36iF+Z2CqAq8IR18jQ==', NULL, '2025-03-18 13:07:03', 0, NULL, 1),
(843, 12, 'gokuls0607@gmail.com', 'gokuls0607', 'T0ZJFJ35XDlXx5D9DpbDtQ==', NULL, '2025-03-18 13:07:11', 0, NULL, 1),
(844, 11, 'gokuls0607@gmail.com', 'gokuls0607', 'LJJ+5c0ewV1NK4ePLHZ/Zg==', NULL, '2025-03-18 13:07:16', 0, NULL, 1),
(845, 12, 'gokuls0607@gmail.com', 'gokuls0607', 'myQi36iF+Z2CqAq8IR18jQ==', NULL, '2025-03-18 13:07:21', 0, NULL, 1),
(846, 12, 'gokuls0607@gmail.com', 'gokuls0607', 'cuHiLAj4xOdevahZzzdO3Q==', NULL, '2025-03-18 13:07:22', 0, NULL, 1),
(847, 13, 'gokuls0607@gmail.com', 'gokuls0607', 'cuHiLAj4xOdevahZzzdO3Q==', NULL, '2025-03-18 13:07:28', 0, NULL, 1),
(848, 11, 'gokuls0607@gmail.com', 'gokuls0607', '++kmprJUnrm50nZ8LF2D/w==', NULL, '2025-03-18 13:08:05', 0, NULL, 1),
(849, 11, 'gokul@gmail.com', 'Gokul', 'hBDFCggubUUS/VBq37l7nw==', NULL, '2025-03-18 13:08:16', 0, NULL, 1),
(850, 11, 'gokuls0607@gmail.com', 'gokuls0607', 'rzrz8dIQlyY5nL/qXs7oTg==', NULL, '2025-03-18 13:08:45', 0, NULL, 1),
(851, 11, 'gokul@gmail.com', 'Gokul', 'fLwatDqL2gIJNqoTobHMOQ==', NULL, '2025-03-18 13:08:47', 0, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `receiver_email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted` tinyint(1) DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `read_status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_email`, `receiver_email`, `message`, `file_url`, `timestamp`, `deleted`, `deleted_at`, `read_status`) VALUES
(1065, 'gokuls@gmail.com', 'gokul@gmail.com', 'XX1PkjQeWRzi8d7h26zYaw==', NULL, '2025-02-19 06:00:52', 0, NULL, 1),
(1066, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/2 R PROGRAMMING BASICS (1).pdf', '2025-02-19 06:01:14', 0, NULL, 1),
(1067, 'gokul@gmail.com', 'gokuls@gmail.com', 'ml/2udiv1suVUnGqd/vfyw==', NULL, '2025-02-19 06:05:34', 0, NULL, 1),
(1068, 'gokul@gmail.com', 'gokuls@gmail.com', 'V4LOFBmMT6/A+aVlkWy+Jg==', NULL, '2025-02-19 06:05:36', 0, NULL, 1),
(1069, 'gokul@gmail.com', 'gokuls@gmail.com', 'oI8XOyM4ts2EESrLMe6uzg==', NULL, '2025-02-19 06:05:45', 0, NULL, 1),
(1070, 'gokuls@gmail.com', 'gokul@gmail.com', 'Y6I6Uin5NbLqkCe3GkiwGw==', NULL, '2025-02-20 06:35:02', 0, NULL, 1),
(1071, 'gokuls@gmail.com', 'gokul@gmail.com', 'j87YPmGLQ5huPkCQhHwKlQ==', NULL, '2025-02-20 06:35:08', 0, NULL, 1),
(1072, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/BP221001 (2).docx', '2025-02-20 06:35:14', 0, NULL, 1),
(1073, 'gokul@gmail.com', 'gokuls@gmail.com', 'Jx6PB8RoPYrnFajaxa9rAQ==', NULL, '2025-02-26 04:58:05', 0, NULL, 1),
(1074, 'gokuls@gmail.com', 'gokul@gmail.com', '0RJgHJ54/6NIIO20A2OUSQ==', NULL, '2025-02-26 04:58:09', 0, NULL, 1),
(1075, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/Death Certificate.jpg', '2025-02-26 04:58:13', 0, NULL, 1),
(1076, 'gokuls@gmail.com', 'gokul@gmail.com', 'qux1KqDn3C3QUe5XrD9UzA==', NULL, '2025-02-26 04:58:15', 0, NULL, 1),
(1077, 'gokuls@gmail.com', 'gokul@gmail.com', 'BnkEPoqGLju8x45xrxvjlw==', NULL, '2025-02-26 04:58:16', 0, NULL, 1),
(1078, 'gokuls@gmail.com', 'gokul@gmail.com', 'JXJS2LA3cOExc2JqtfE4AA==', NULL, '2025-02-26 04:58:17', 0, NULL, 1),
(1079, 'gokul@gmail.com', 'abishekshanmugam2003@gmail.com', 'rKiyHUBBUr0+ehDkeNIRxw==', NULL, '2025-02-26 04:58:27', 0, NULL, 0),
(1080, 'gokul@gmail.com', 'gokuls0607@gmail.com', 'MjeYbYZ7uGhdykT53sEBUg==', NULL, '2025-02-26 04:58:30', 0, NULL, 1),
(1081, 'gokuls@gmail.com', 'gokuls0607@gmail.com', 'XfYOCSJuCTOZ7WgK1iGlYw==', NULL, '2025-02-26 04:58:34', 0, NULL, 1),
(1082, 'gokuls@gmail.com', 'abishekshanmugam2003@gmail.com', 'B/kV6z98DGm2WDhXCFUdxw==', NULL, '2025-02-26 04:58:37', 0, NULL, 0),
(1083, 'gokul@gmail.com', 'gokuls@gmail.com', 'G9SyEu9C9TpIKa0bMDmr8Q==', NULL, '2025-02-26 05:00:55', 0, NULL, 1),
(1084, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/1190372-removebg-preview.png', '2025-02-28 01:09:17', 0, NULL, 1),
(1085, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/WhatsApp Image 2025-02-17 at 8.19.52 PM.jpeg', '2025-02-28 01:09:45', 0, NULL, 1),
(1086, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/04afe94b-a0e4-41bd-b4f5-bbb154d73baf.mp3', '2025-02-28 01:09:58', 0, NULL, 1),
(1087, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/77c5f5d96dd04de19e6562807fdaa38c.mp4', '2025-02-28 01:10:19', 0, NULL, 1),
(1088, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/wallpaperflare.com_wallpaper (9).jpg', '2025-02-28 01:10:29', 0, NULL, 1),
(1089, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/For students - Request UGC to withdraw the UGC DraftRegulation 2025 12_01_25.docx', '2025-02-28 01:10:37', 0, NULL, 1),
(1090, 'gokuls@gmail.com', 'gokul@gmail.com', '+wpXyIbmxXm3WgpBqdhM3g==', NULL, '2025-03-06 05:29:09', 0, NULL, 1),
(1091, 'gokul@gmail.com', 'gokuls@gmail.com', 'This message was deleted', NULL, '2025-03-06 05:29:12', 1, '2025-03-22 15:02:06', 1),
(1092, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/cs=2.docx', '2025-03-06 05:29:37', 0, NULL, 1),
(1093, 'gokuls@gmail.com', 'gokul@gmail.com', 'N9uwuy6SBV9FYXjbrT3Z+g==', NULL, '2025-03-06 09:22:20', 0, NULL, 1),
(1094, 'gokul@gmail.com', 'gokuls@gmail.com', 'p4LSid7/elS5vwiwYuZIpw==', NULL, '2025-03-06 09:22:22', 0, NULL, 1),
(1095, 'gokuls@gmail.com', 'gokul@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/Doc2.pdf', '2025-03-06 09:22:46', 0, NULL, 1),
(1096, 'gk1@gmail.com', 'gokul@gmail.com', 'Jk5bfI2gJ/KkorU+wml8qQ==', NULL, '2025-03-06 09:36:08', 0, NULL, 1),
(1097, 'gokul@gmail.com', 'gk1@gmail.com', 'zT2ZbkU51jtOO7OlCo+Fkw==', NULL, '2025-03-06 09:37:13', 0, NULL, 0),
(1098, 'gokul@gmail.com', 'gokuls0607@gmail.com', 'CiY/fJehB6JBs3GEgdIwxQ==', NULL, '2025-03-07 04:15:15', 0, NULL, 1),
(1099, 'gokul@gmail.com', 'gokuls0607@gmail.com', 'MSU8VoAOlrupb7P+RA9BvQ==', NULL, '2025-03-07 04:15:35', 0, NULL, 1),
(1100, 'gokul@gmail.com', 'gokuls0607@gmail.com', 'rZAc0iB7eJAFsBW5H1skfw==', NULL, '2025-03-07 04:16:09', 0, NULL, 1),
(1101, 'gokul@gmail.com', 'gokuls0607@gmail.com', 'ZedYIGetLLavAm8WbQbSZA==', NULL, '2025-03-07 04:19:39', 0, NULL, 1),
(1102, 'test@gmail.com', 'gokul@gmail.com', 'Hello, this is a test!', NULL, '2025-03-07 04:30:42', 0, NULL, 0),
(1103, 'gokuls@gmail.com', 'gokuls0607@gmail.com', 'wtqAgf31MIWtGBVU/LoOhw==', NULL, '2025-03-07 04:45:31', 0, NULL, 0),
(1104, 'gokul@gmail.com', 'gokuls0607@gmail.com', 'p4LSid7/elS5vwiwYuZIpw==', NULL, '2025-03-18 13:08:58', 0, NULL, 1),
(1105, 'gokuls0607@gmail.com', 'gokul@gmail.com', 'spxhyH1f5+vCuvpipz2HvA==', NULL, '2025-03-18 13:09:00', 0, NULL, 1),
(1106, 'gokuls0607@gmail.com', 'gokul@gmail.com', 'p4LSid7/elS5vwiwYuZIpw==', NULL, '2025-03-18 13:09:02', 0, NULL, 1),
(1107, 'gokul@gmail.com', 'gokuls0607@gmail.com', 'B/kV6z98DGm2WDhXCFUdxw==', NULL, '2025-03-18 13:09:04', 0, NULL, 1),
(1108, 'gokul@gmail.com', 'gokuls@gmail.com', 'CkNBNHXBJT4HFzS5zLEwUw==', NULL, '2025-03-22 09:31:47', 0, NULL, 0),
(1109, 'gokul@gmail.com', 'gokuls@gmail.com', '', 'http://localhost/angular-auth/uploads/msg_files/pxfuel.jpg', '2025-03-22 09:31:56', 0, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phoneno` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phoneno`, `password`, `avatar`) VALUES
(14, 'Gokul', 'gokul@gmail.com', '9898989898', '$2y$10$KpOHOKyEa3pli809SzZSAORD.g3mYG1PhqeMyPRq72UPtr22yTyP6', 'http://localhost/angular-auth/uploads/67be9f9e1f06f-cropped_image.png'),
(15, 'Gokuls', 'gokuls@gmail.com', '9878987987', '$2y$10$xc1mHSBosae0y2UIgaRfiePsgP710mM8PmEllf.0PLv1InITq4BBe', 'http://localhost/angular-auth/uploads/67c1389fd32c6-cropped_image.png'),
(16, 'gokuls0607', 'gokuls0607@gmail.com', '9879876581', '$2y$10$IH7n7qO7spAzL..IFiwMLuXcqUShHsD1qredLYTeDhQq9t1YSwMmK', 'http://localhost/angular-auth/uploads/67b3476125649-cropped_image.png'),
(17, 'shek', 'abishekshanmugam2003@gmail.com', '7639072762', '$2y$10$FwMO/ttUeP3P/SM8Y9zgd.ANMDm40qg2J6zBPlKoObI8k47N4q2oq', 'http://localhost/angular-auth/uploads/67b42ea39eddf-cropped_image.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `groupchat`
--
ALTER TABLE `groupchat`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD KEY `group_id` (`group_id`),
  ADD KEY `contact_id` (`contact_id`);

--
-- Indexes for table `group_messages`
--
ALTER TABLE `group_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `sender_email` (`sender_email`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `groupchat`
--
ALTER TABLE `groupchat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `group_messages`
--
ALTER TABLE `group_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=852;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1110;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groupchat` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_messages`
--
ALTER TABLE `group_messages`
  ADD CONSTRAINT `group_messages_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groupchat` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_messages_ibfk_2` FOREIGN KEY (`sender_email`) REFERENCES `users` (`email`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
