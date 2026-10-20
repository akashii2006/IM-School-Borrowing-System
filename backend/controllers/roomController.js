const db = require('../config/db');

// Fetch all rooms/offices with assigned asset counts
exports.getRooms = async (req, res) => {
  try {
    const [rooms] = await db.query(`
      SELECT 
        ro.room_id,
        ro.room_name,
        ro.building,
        ro.floor_level,
        COUNT(i.item_id) AS total_assigned_assets
      FROM rooms_offices ro
      LEFT JOIN items i ON ro.room_id = i.room_id
      GROUP BY ro.room_id, ro.room_name, ro.building, ro.floor_level
      ORDER BY ro.room_id DESC
    `);
    res.json(rooms);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ message: 'Failed to fetch rooms and offices', error: err.message });
  }
};

// Create a room or office
exports.createRoom = async (req, res) => {
  const { room_name, building, floor_level } = req.body;

  if (!room_name) {
    return res.status(400).json({ message: 'Room or office name is required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO rooms_offices (room_name, building, floor_level) VALUES (?, ?, ?)`,
      [
        room_name.trim(),
        building ? building.trim() : 'Main Building',
        floor_level ? floor_level.trim() : '1st Floor'
      ]
    );

    res.status(201).json({ message: 'Room created successfully', room_id: result.insertId });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ message: 'Failed to create room', error: err.message });
  }
};

// Update a room or office
exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { room_name, building, floor_level } = req.body;

  try {
    await db.query(
      `UPDATE rooms_offices SET room_name = ?, building = ?, floor_level = ? WHERE room_id = ?`,
      [room_name, building, floor_level, id]
    );
    res.json({ message: 'Room updated successfully.' });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ message: 'Failed to update room', error: err.message });
  }
};

// Delete a room or office
exports.deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    // Prevent deletion if items are currently assigned to this room
    const [assigned] = await db.query('SELECT COUNT(*) AS count FROM items WHERE room_id = ?', [id]);
    if (assigned[0].count > 0) {
      return res.status(400).json({
        message: `Cannot delete room. ${assigned[0].count} asset(s) are currently assigned to this room. Reassign or remove items first.`
      });
    }

    await db.query('DELETE FROM rooms_offices WHERE room_id = ?', [id]);
    res.json({ message: 'Room deleted successfully.' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ message: 'Failed to delete room', error: err.message });
  }
};