const db = require('../config/db');

// Fetch all property assignments with item and room details
exports.getPropertyAssignments = async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT 
        pa.assignment_id,
        pa.item_id,
        pa.assigned_to,
        pa.room_id,
        pa.date_assigned,
        pa.remarks,
        pa.status,
        i.name AS item_name,
        i.item_code,
        ro.room_name,
        ro.building
      FROM property_assignments pa
      LEFT JOIN items i ON pa.item_id = i.item_id
      LEFT JOIN rooms_offices ro ON pa.room_id = ro.room_id
      ORDER BY pa.assignment_id DESC
    `);
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching property assignments:', err);
    res.status(500).json({ message: 'Failed to fetch property assignments', error: err.message });
  }
};

// Create new property assignment
exports.createPropertyAssignment = async (req, res) => {
  const { item_id, assigned_to, room_id, date_assigned, remarks } = req.body;

  if (!item_id || !assigned_to) {
    return res.status(400).json({ message: 'Item ID and Custodian (Assigned To) are required.' });
  }

  try {
    const assignmentDate = date_assigned || new Date().toISOString().split('T')[0];

    const [result] = await db.query(
      `INSERT INTO property_assignments (item_id, assigned_to, room_id, date_assigned, remarks, status)
       VALUES (?, ?, ?, ?, ?, 'Active')`,
      [item_id, String(assigned_to).trim(), room_id || null, assignmentDate, remarks || '']
    );

    // Update item status to 'assigned' and link room_id
    await db.query(
      `UPDATE items SET status = 'assigned', room_id = ? WHERE item_id = ?`,
      [room_id || null, item_id]
    );

    res.status(201).json({ message: 'Property assigned successfully', assignment_id: result.insertId });
  } catch (err) {
    console.error('Error assigning property:', err);
    res.status(500).json({ message: 'Failed to record property assignment', error: err.message });
  }
};

// Release / Unassign Property
exports.unassignProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const [assignment] = await db.query('SELECT * FROM property_assignments WHERE assignment_id = ?', [id]);
    if (assignment.length === 0) {
      return res.status(404).json({ message: 'Assignment record not found.' });
    }

    const itemId = assignment[0].item_id;

    // Mark assignment as unassigned / inactive
    await db.query(
      `UPDATE property_assignments SET status = 'Released' WHERE assignment_id = ?`,
      [id]
    );

    // Reset item status back to available
    await db.query(
      `UPDATE items SET status = 'available', room_id = NULL WHERE item_id = ?`,
      [itemId]
    );

    res.json({ message: 'Property unassigned and marked available.' });
  } catch (err) {
    console.error('Error unassigning property:', err);
    res.status(500).json({ message: 'Failed to release property assignment', error: err.message });
  }
};