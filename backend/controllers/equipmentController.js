const db = require('../config/db');

// GET all equipment items (with Category name)
exports.getAllEquipment = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.item_id, 
        e.property_number, 
        e.item_name, 
        c.category_name, 
        e.status 
      FROM equipment_items e
      JOIN categories c ON e.category_id = c.category_id
      ORDER BY e.item_id DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
};

// ADD new equipment item
exports.addEquipment = async (req, res) => {
  const { property_number, item_name, category_id, status } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO equipment_items (property_number, item_name, category_id, status) 
       VALUES (?, ?, ?, ?)`,
      [property_number, item_name, category_id, status || 'Available']
    );
    res.status(201).json({ message: 'Equipment added successfully', itemId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding equipment', error: error.message });
  }
};

// UPDATE equipment item
exports.updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { property_number, item_name, category_id, status } = req.body;
  try {
    await db.query(
      `UPDATE equipment_items 
       SET property_number = ?, item_name = ?, category_id = ?, status = ? 
       WHERE item_id = ?`,
      [property_number, item_name, category_id, status, id]
    );
    res.status(200).json({ message: 'Equipment updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating equipment', error: error.message });
  }
};

// DELETE equipment item
exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM equipment_items WHERE item_id = ?', [id]);
    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting equipment', error: error.message });
  }
};

// GET categories for frontend dropdowns
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY category_name ASC');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};