-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 09, 2025 at 04:25 AM
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
-- Database: `paperless`
--

-- --------------------------------------------------------

--
-- Table structure for table `bill`
--

CREATE TABLE `bill` (
  `index_file` int(11) NOT NULL,
  `file_ID` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `fileimagename` varchar(255) DEFAULT NULL,
  `receipt_number` varchar(50) DEFAULT NULL,
  `receipt_date` date DEFAULT NULL,
  `payment_description` text DEFAULT NULL,
  `payer_name` varchar(100) DEFAULT NULL,
  `payment_method` enum('Cash','Credit','Transfer') DEFAULT NULL,
  `product_item` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `total_product_price` decimal(10,2) DEFAULT NULL,
  `all_product_total_price` decimal(10,2) DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bill`
--

INSERT INTO `bill` (`index_file`, `file_ID`, `file_type`, `fileimagename`, `receipt_number`, `receipt_date`, `payment_description`, `payer_name`, `payment_method`, `product_item`, `description`, `quantity`, `unit_price`, `total_product_price`, `all_product_total_price`, `amount_paid`) VALUES
(1, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Bill', 'undefined-Screenshot 2025-03-09 200223.png', '001', '2018-11-01', 'TOTAL $204.75', 'John Smith', '', 'กร ณ ชร เล อ ณ์ น อ ย', NULL, 1, 100.09, 100.09, 204.75, 204.75),
(2, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Bill', 'undefined-Screenshot 2025-03-09 200223.png', '001', '2018-11-01', 'TOTAL $204.75', 'John Smith', '', 'Newent of peda are', NULL, 25, 0.00, 0.00, 204.75, 204.75),
(3, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Bill', 'undefined-Screenshot 2025-03-09 200223.png', '001', '2018-11-01', 'TOTAL $204.75', 'John Smith', '', 'acer au', NULL, 1, 195.00, 195.00, 204.75, 204.75);

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `index_file` int(11) NOT NULL,
  `file_ID` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `fileimagename` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `seller_name` varchar(100) DEFAULT NULL,
  `buyer_name` varchar(100) DEFAULT NULL,
  `product_item` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `total_product_price` decimal(10,2) DEFAULT NULL,
  `all_total_before_tax` decimal(10,2) DEFAULT NULL,
  `vat` decimal(10,2) DEFAULT NULL,
  `all_total_amount_including_VAT` decimal(10,2) DEFAULT NULL,
  `payment_terms` varchar(100) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`index_file`, `file_ID`, `file_type`, `fileimagename`, `invoice_number`, `invoice_date`, `seller_name`, `buyer_name`, `product_item`, `description`, `quantity`, `unit_price`, `total_product_price`, `all_total_before_tax`, `vat`, `all_total_amount_including_VAT`, `payment_terms`, `payment_method`) VALUES
(16, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Invoice', 'undefined-Screenshot 2025-03-09 195829.png', '00021', '2020-11-07', 'Globex Corporation', 'Acme Industries', 'Laser Mouse', NULL, 10, 950.00, 9500.00, 12800.00, 12.00, 12512.00, 'Please pay the balance due within time', NULL),
(17, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Invoice', 'undefined-Screenshot 2025-03-09 195829.png', '00021', '2020-11-07', 'Globex Corporation', 'Acme Industries', 'Dual XL Monitors', NULL, 20, 150.00, 3000.00, 12800.00, 12.00, 12512.00, 'Please pay the balance due within time', NULL),
(18, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Invoice', 'undefined-Screenshot 2025-03-09 195829.png', '00021', '2020-11-07', 'Globex Corporation', 'Acme Industries', 'Multi-jet Printer', NULL, 2, 150.00, 300.00, 12800.00, 12.00, 12512.00, 'Please pay the balance due within time', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `file_ID` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `create_date` date NOT NULL,
  `update_date` date DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`file_ID`, `username`, `create_date`, `update_date`, `file_name`) VALUES
('f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'reginababy', '2025-03-09', '2025-04-08', 'OLDEST 3 file type');

-- --------------------------------------------------------

--
-- Table structure for table `purchaseorder`
--

CREATE TABLE `purchaseorder` (
  `index_file` int(11) NOT NULL,
  `file_ID` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `fileimagename` varchar(255) DEFAULT NULL,
  `purchase_order_number` varchar(50) DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `product_item` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `total_product_price` decimal(10,2) DEFAULT NULL,
  `all_product_total_price` decimal(10,2) DEFAULT NULL,
  `supplier_name` varchar(100) DEFAULT NULL,
  `order_status` enum('Pending','Shipped','Completed') DEFAULT NULL,
  `delivery_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchaseorder`
--

INSERT INTO `purchaseorder` (`index_file`, `file_ID`, `file_type`, `fileimagename`, `purchase_order_number`, `order_date`, `customer_name`, `product_item`, `description`, `quantity`, `unit_price`, `total_product_price`, `all_product_total_price`, `supplier_name`, `order_status`, `delivery_date`) VALUES
(17, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Purchase order', 'undefined-Screenshot 2025-03-03 164401.png', NULL, NULL, 'Industrial Machinery Go, Led.', '010020101', 'Cylinder Body', 1, 6000.00, 6000.00, 12987.00, 'Smart Fact Ordinary Partnership', 'Pending', NULL),
(18, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Purchase order', 'undefined-Screenshot 2025-03-03 164401.png', NULL, NULL, 'Industrial Machinery Go, Led.', '010020102', 'Seal Kit', 1, 1500.00, 1600.00, 12987.00, 'Smart Fact Ordinary Partnership', 'Pending', NULL),
(19, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Purchase order', 'undefined-Screenshot 2025-03-03 164401.png', NULL, NULL, 'Industrial Machinery Go, Led.', '010020103', 'End Caps.', 2, 800.00, 1600.00, 12987.00, 'Smart Fact Ordinary Partnership', 'Pending', NULL),
(20, 'f7e5e0f4-ea68-44d6-aecd-266e25759bbe', 'Purchase order', 'undefined-Screenshot 2025-03-03 164401.png', NULL, NULL, 'Industrial Machinery Go, Led.', '010020104', 'Assembly Labor', 1, 3000.00, 3000.00, 12987.00, 'Smart Fact Ordinary Partnership', 'Pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`username`, `password`, `email`) VALUES
('NOACCOUNT', '$2b$10$6CU3S..7uvIdwSChni7XH.ibsjjIGz.VjTr7EMTHBXo0ZStrQtstS', 'marjeniss@gmail.com'),
('reginababy', '$2b$10$NT/ZRX.IZubK2eJx0hnQ3OU.sORmEb577plnTI2eINM5WoiFMJDL6', 'anothai.bo@ku.th');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bill`
--
ALTER TABLE `bill`
  ADD PRIMARY KEY (`index_file`),
  ADD KEY `file_ID` (`file_ID`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`index_file`),
  ADD KEY `file_ID` (`file_ID`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`file_ID`),
  ADD UNIQUE KEY `file_name` (`file_name`),
  ADD KEY `username` (`username`);

--
-- Indexes for table `purchaseorder`
--
ALTER TABLE `purchaseorder`
  ADD PRIMARY KEY (`index_file`),
  ADD KEY `file_ID` (`file_ID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bill`
--
ALTER TABLE `bill`
  MODIFY `index_file` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `index_file` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `purchaseorder`
--
ALTER TABLE `purchaseorder`
  MODIFY `index_file` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bill`
--
ALTER TABLE `bill`
  ADD CONSTRAINT `bill_ibfk_1` FOREIGN KEY (`file_ID`) REFERENCES `project` (`file_ID`);

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`file_ID`) REFERENCES `project` (`file_ID`);

--
-- Constraints for table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`username`) REFERENCES `user` (`username`);

--
-- Constraints for table `purchaseorder`
--
ALTER TABLE `purchaseorder`
  ADD CONSTRAINT `purchaseorder_ibfk_1` FOREIGN KEY (`file_ID`) REFERENCES `project` (`file_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
