const db = require('../config/db');

// GET all borrowers
exports.getAllBorrowers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM borrowers ORDER BY borrower_id DESC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching borrowers', error: error.message });
  }
};

// ADD new borrower (supports password for borrower logins)
exports.addBorrower = async (req, res) => {
  const { id_number, full_name, role, contact_number, password } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO borrowers (id_number, full_name, role, contact_number, password) VALUES (?, ?, ?, ?, ?)',
      [id_number, full_name, role || 'Faculty', contact_number, password || '123456']
    );
    res.status(201).json({ message: 'Borrower added successfully', borrowerId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding borrower', error: error.message });
  }
};

// UPDATE borrower
exports.updateBorrower = async (req, res) => {
  const { id } = req.params;
  const { id_number, full_name, role, contact_number } = req.body;
  try {
    await db.query(
      'UPDATE borrowers SET id_number = ?, full_name = ?, role = ?, contact_number = ? WHERE borrower_id = ?',
      [id_number, full_name, role, contact_number, id]
    );
    res.status(200).json({ message: 'Borrower updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating borrower', error: error.message });
  }
};

// DELETE borrower
exports.deleteBorrower = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM borrowers WHERE borrower_id = ?', [id]);
    res.status(200).json({ message: 'Borrower deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting borrower', error: error.message });
  }
};