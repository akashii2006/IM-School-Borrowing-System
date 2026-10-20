const db = require('../config/db');

const fallbackEquipment = [
  { item_id: 1, item_code: 'SN-SOLD-012', name: 'Digital Soldering Kit', description: '60W Temperature Controlled', type: 'equipment', status: 'available', is_borrowable: 1, unit_cost: 1500.00 },
  { item_id: 2, item_code: 'SN-DELL-005', name: 'Dell Latitude 3420 Laptop', description: 'Core i5 16GB RAM', type: 'equipment', status: 'available', is_borrowable: 1, unit_cost: 45000.00 },
  { item_id: 3, item_code: 'SN-EPS-006', name: 'Epson Projector EB-X06', description: 'HDMI 3600 Lumens Projector', type: 'equipment', status: 'available', is_borrowable: 1, unit_cost: 22000.00 },
  { item_id: 4, item_code: 'SN-MICR-003', name: 'Compound Microscope X100', description: '1000x Monocular microscope', type: 'equipment', status: 'available', is_borrowable: 1, unit_cost: 8500.00 },
  { item_id: 5, item_code: 'SN-LOGI-001', name: 'Logitech Wireless Mouse', description: 'Optical USB mouse', type: 'equipment', status: 'borrowed', is_borrowable: 1, unit_cost: 750.00 }
];

// Fetch Inventory Items
exports.getItems = async (req, res) => {
  try {
    let [items] = await db.query(`
      SELECT i.*, ro.room_name, ro.building 
      FROM items i 
      LEFT JOIN rooms_offices ro ON i.room_id = ro.room_id 
      ORDER BY i.item_id DESC
    `);

    if (!items || items.length === 0) {
      console.log('[ITEMS] Database empty. Auto-seeding default equipment...');
      for (const item of fallbackEquipment) {
        await db.query(
          `INSERT INTO items (item_id, item_code, name, description, type, status, is_borrowable, unit_cost)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [item.item_id, item.item_code, item.name, item.description, item.type, item.status, item.is_borrowable, item.unit_cost]
        ).catch(() => {});
      }
      items = fallbackEquipment;
    }

    const { type } = req.query;
    if (type) {
      const filtered = items.filter(i => String(i.type || '').toLowerCase() === String(type).toLowerCase());
      return res.json(filtered);
    }

    res.json(items);
  } catch (err) {
    console.error('Error fetching inventory items, returning fallback list:', err);
    res.json(fallbackEquipment);
  }
};

// Create Item with Room Assignment
exports.createItem = async (req, res) => {
  const { item_code, name, description, type, room_id, unit_cost } = req.body;

  if (!item_code || !name) {
    return res.status(400).json({ message: 'Item code and name are required.' });
  }

  try {
    const itemType = type || 'equipment';
    const is_borrowable = itemType === 'equipment' ? 1 : 0;

    const [result] = await db.query(
      `INSERT INTO items (item_code, name, description, type, room_id, status, is_borrowable, unit_cost)
       VALUES (?, ?, ?, ?, ?, 'available', ?, ?)`,
      [
        String(item_code).trim(),
        String(name).trim(),
        description || '',
        itemType,
        room_id || null,
        is_borrowable,
        unit_cost || 0.00
      ]
    );

    res.status(201).json({ message: 'Item created successfully', item_id: result.insertId });
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ message: 'Failed to create item', error: err.message });
  }
};

// Update Item
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { item_code, name, description, type, room_id, status, unit_cost } = req.body;

  try {
    await db.query(
      `UPDATE items SET item_code = ?, name = ?, description = ?, type = ?, room_id = ?, status = ?, unit_cost = ? WHERE item_id = ?`,
      [item_code, name, description, type, room_id || null, status, unit_cost || 0.00, id]
    );
    res.json({ message: 'Item updated successfully.' });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM items WHERE item_id = ?', [id]);
    res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
};