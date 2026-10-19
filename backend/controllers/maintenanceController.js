const db = require('../config/db');

// GET all maintenance records
exports.getAllMaintenance = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.maintenance_id,
        e.property_number,
        e.item_name,
        m.maintenance_date,
        m.issue_description,
        m.action_taken,
        m.cost
      FROM maintenance_records m
      JOIN equipment_items e ON m.item_id = e.item_id
      ORDER BY m.maintenance_id DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance records', error: error.message });
  }
};

// ADD maintenance record and update equipment status
exports.addMaintenance = async (req, res) => {
  const { item_id, maintenance_date, issue_description, action_taken, cost } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO maintenance_records (item_id, maintenance_date, issue_description, action_taken, cost)
       VALUES (?, ?, ?, ?, ?)`,
      [item_id, maintenance_date, issue_description, action_taken, cost || 0.00]
    );

    await connection.query(
      "UPDATE equipment_items SET status = 'Under Maintenance' WHERE item_id = ?",
      [item_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Maintenance record created and item status updated.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error adding maintenance record', error: error.message });
  } finally {
    connection.release();
  }
};