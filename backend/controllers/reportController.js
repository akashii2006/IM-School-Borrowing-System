const db = require('../config/db');

// Property Inventory Aggregated by Room
exports.getPropertyByRoom = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ro.room_id,
        ro.room_name,
        ro.building,
        COUNT(i.item_id) AS total_property_items,
        IFNULL(SUM(i.unit_cost), 0.00) AS total_room_valuation
      FROM rooms_offices ro
      LEFT JOIN items i ON ro.room_id = i.room_id AND i.type = 'property'
      GROUP BY ro.room_id, ro.room_name, ro.building
      ORDER BY total_property_items DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error generating room report:', err);
    res.status(500).json({ message: 'Failed to generate room report', error: err.message });
  }
};

// Property Inventory Aggregated by Custodian
exports.getPropertyByCustodian = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.user_id,
        u.full_name AS custodian_name,
        u.role,
        COUNT(i.item_id) AS assigned_count,
        IFNULL(SUM(i.unit_cost), 0.00) AS total_asset_value
      FROM users u
      LEFT JOIN items i ON u.user_id = i.custodian_id AND i.type = 'property'
      GROUP BY u.user_id, u.full_name, u.role
      ORDER BY assigned_count DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error generating custodian report:', err);
    res.status(500).json({ message: 'Failed to generate custodian report', error: err.message });
  }
};