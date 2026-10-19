CREATE DATABASE IF NOT EXISTS school_inventory_db;
USE school_inventory_db;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS maintenance_records;
DROP TABLE IF EXISTS borrow_details;
DROP TABLE IF EXISTS borrow_logs;
DROP TABLE IF EXISTS equipment_items;
DROP TABLE IF EXISTS borrowers;
DROP TABLE IF EXISTS categories;

-- Categories Table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Borrowers Table
CREATE TABLE borrowers (
    borrower_id INT AUTO_INCREMENT PRIMARY KEY,
    id_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('Student', 'Faculty', 'Staff') NOT NULL,
    contact_number VARCHAR(20)
);

-- Equipment Items Table
CREATE TABLE equipment_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    property_number VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    status ENUM('Available', 'Borrowed', 'Under Maintenance', 'Damaged') DEFAULT 'Available',
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Borrow Logs Table
CREATE TABLE borrow_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    borrower_id INT NOT NULL,
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATETIME NOT NULL,
    actual_return_date DATETIME NULL,
    overall_status ENUM('Active', 'Returned', 'Overdue') DEFAULT 'Active',
    FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id) ON DELETE CASCADE
);

-- Borrow Details Table
CREATE TABLE borrow_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    log_id INT NOT NULL,
    item_id INT NOT NULL,
    item_condition_on_borrow VARCHAR(255) DEFAULT 'Good',
    item_condition_on_return VARCHAR(255) NULL,
    FOREIGN KEY (log_id) REFERENCES borrow_logs(log_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES equipment_items(item_id) ON DELETE CASCADE
);

-- Maintenance Records Table
CREATE TABLE maintenance_records (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    maintenance_date DATE NOT NULL,
    issue_description TEXT NOT NULL,
    action_taken TEXT,
    cost DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (item_id) REFERENCES equipment_items(item_id) ON DELETE CASCADE
);

-- Users Table (Admin & Staff Roles)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Staff') NOT NULL DEFAULT 'Staff',
    borrower_id INT NULL,
    FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id) ON DELETE CASCADE
);

-- SEED DATA
INSERT INTO categories (category_name, description) VALUES
('Audio-Visual', 'Projectors, speakers, and microphones'),
('IT Hardware', 'Laptops, monitors, keyboards, and mice'),
('Laboratory', 'Microscopes, measuring tools, test equipment'),
('Office Electronics', 'Printers, scanners, and shredders'),
('Sports Equipment', 'Balls, nets, and sports gear');

INSERT INTO borrowers (id_number, full_name, role, contact_number) VALUES
('2024-00001', 'Kinjay Dela Cruz', 'Student', '09171234567'),
('2024-00002', 'Sarah Gomez', 'Student', '09182345678'),
('FAC-2021-01', 'Prof. Alan Turing', 'Faculty', '09193456789'),
('FAC-2022-04', 'Dr. Grace Hopper', 'Faculty', '09204567890'),
('STF-2020-09', 'John Doe', 'Staff', '09215678901');

INSERT INTO equipment_items (property_number, item_name, category_id, status) VALUES
('PROP-AV-001', 'Epson Projector EB-X06', 1, 'Available'),
('PROP-IT-002', 'Dell Monitor 24 inch', 2, 'Available'),
('PROP-LAB-003', 'Compound Microscope X100', 3, 'Available'),
('PROP-AV-004', 'Wireless Microphone Set', 1, 'Borrowed'),
('PROP-OFF-005', 'HP Laserjet Printer', 4, 'Under Maintenance');

INSERT INTO borrow_logs (borrower_id, borrow_date, expected_return_date, actual_return_date, overall_status) VALUES
(1, '2026-10-01 09:00:00', '2026-10-03 17:00:00', '2026-10-03 14:00:00', 'Returned'),
(2, '2026-10-10 10:30:00', '2026-10-12 17:00:00', NULL, 'Active'),
(3, '2026-10-11 08:00:00', '2026-10-13 17:00:00', NULL, 'Active');

INSERT INTO borrow_details (log_id, item_id, item_condition_on_borrow, item_condition_on_return) VALUES
(1, 1, 'Good', 'Returned intact'),
(2, 4, 'Good', NULL),
(3, 2, 'Good', NULL);

INSERT INTO maintenance_records (item_id, maintenance_date, issue_description, action_taken, cost) VALUES
(5, '2026-10-05', 'Paper jam and light print output', 'Replaced toner cartridge and cleaned rollers', 1500.00);

-- Seed Accounts: Admin & Staff Login Credentials
INSERT INTO users (username, password, role, borrower_id) VALUES
('admin', 'admin123', 'Admin', NULL),
('staff1', 'staff123', 'Staff', 5);