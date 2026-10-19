USE `school_inventory_db`;

-- --------------------------------------------------------
-- 1. Seed System Users (Admin / Staff Accounts)
-- --------------------------------------------------------
DELETE FROM `users`;
INSERT INTO `users` (`user_id`, `username`, `password`, `full_name`, `role`) VALUES
(1, 'admin', '123', 'System Administrator', 'Admin'),
(2, 'staff', '123', 'Property Staff', 'Staff');

-- --------------------------------------------------------
-- 2. Seed Borrowers (Student & Faculty Accounts)
-- --------------------------------------------------------
DELETE FROM `borrowers`;
INSERT INTO `borrowers` (`borrower_id`, `id_number`, `full_name`, `role`, `password`) VALUES
(17, '17', 'james', 'Faculty', '123'),
(123, '123', 'Student Borrower', 'Student', '123'),
(101, '2024-0001', 'Maria Santos', 'Student', '123'),
(102, '2024-0002', 'Juan Dela Cruz', 'Faculty', '123');

-- --------------------------------------------------------
-- 3. Seed Equipment Items (Inventory Catalog)
-- --------------------------------------------------------
DELETE FROM `equipment_items`;
INSERT INTO `equipment_items` (`item_id`, `item_name`, `property_number`, `category`, `brand`, `status`) VALUES
(1, 'mouse', 'PROP-LAB', 'General', 'Standard', 'Available'),
(2, 'Compound Microscope X100', 'PROP-LAB-003', 'Laboratory', 'Standard', 'Available'),
(3, 'Epson Projector EB-X06', 'PROP-AV-001', 'Audio-Visual', 'Epson', 'Borrowed'),
(4, 'Logitech Wireless Presenter', 'PROP-AV-002', 'Audio-Visual', 'Logitech', 'Available'),
(5, 'Dell Latitude Laptop', 'PROP-IT-005', 'IT Equipment', 'Dell', 'Borrowed'),
(6, 'Soldering Iron Kit', 'PROP-ECE-012', 'Engineering', 'Standard', 'Available');

-- --------------------------------------------------------
-- 4. Seed Borrow Logs (Borrowing History & Active Loans)
-- --------------------------------------------------------
DELETE FROM `borrow_logs`;

-- Note: 'item_id' and 'equipment_id' populated for schema compatibility
INSERT INTO `borrow_logs` (
  `log_id`, 
  `borrower_id`, 
  `item_id`, 
  `equipment_id`, 
  `date_borrowed`, 
  `expected_return_date`, 
  `date_returned`, 
  `item_condition_on_borrow`, 
  `overall_status`
) VALUES
-- Active loan for account 17 (james) - Epson Projector
(1, 17, 3, 3, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY), NULL, 'Good', 'Active'),

-- Active loan for account 123 - Dell Laptop
(2, 123, 5, 5, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY), NULL, 'Good', 'Active'),

-- Past returned transaction for account 17 (james) - mouse
(3, 17, 1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 'Good', 'Returned');