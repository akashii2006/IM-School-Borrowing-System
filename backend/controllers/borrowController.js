const db = require('../config/db');

// Helper function to dynamically inspect database table column names
const getTableColumns = async (tableName) => {
  try {
    const [cols] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
    return cols.map((c) => c.Field);
  } catch (err) {
    console.error(`Error inspecting table ${tableName}:`, err.message);
    return [];
  }
};

// 1. Fetch All Borrow Logs
exports.getBorrowLogs = async (req, res) => {
  try {
    const logCols = await getTableColumns('borrow_logs');
    const equipCols = await getTableColumns('equipment_items');

    const itemFk = logCols.includes('item_id')
      ? 'item_id'
      : logCols.includes('equipment_id')
      ? 'equipment_id'
      : 'item_id';

    const equipPk = equipCols.includes('item_id')
      ? 'item_id'
      : equipCols.includes('id')
      ? 'id'
      : 'item_id';

    const logPk = logCols.includes('log_id') ? 'log_id' : 'id';

    const [logs] = await db.query(`
      SELECT 
        bl.*,
        bl.${itemFk} AS item_id,
        COALESCE(ei.item_name, 'Unknown Equipment') AS item_name,
        COALESCE(ei.property_number, 'N/A') AS property_number,
        COALESCE(b.full_name, 'Unknown Borrower') AS full_name,
        COALESCE(b.id_number, 'N/A') AS id_number
      FROM borrow_logs bl
      LEFT JOIN equipment_items ei ON bl.${itemFk} = ei.${equipPk}
      LEFT JOIN borrowers b ON bl.borrower_id = b.borrower_id
      ORDER BY bl.${logPk} DESC
    `);

    res.json(logs);
  } catch (err) {
    console.error('Error fetching borrow logs:', err);
    res.status(500).json({ message: 'Failed to retrieve borrow logs.', error: err.message });
  }
};

// 2. Create Borrow Request with Dynamic Column Detection
exports.createBorrowLog = async (req, res) => {
  const { borrower_id, item_id, expected_return_date, item_condition_on_borrow } = req.body;

  const cleanBorrowerId = parseInt(borrower_id, 10);
  const cleanItemId = parseInt(item_id, 10);

  if (!cleanBorrowerId || !cleanItemId) {
    return res.status(400).json({
      message: `Invalid request payload: borrower_id=${borrower_id}, item_id=${item_id}`
    });
  }

  try {
    const logCols = await getTableColumns('borrow_logs');
    const equipCols = await getTableColumns('equipment_items');

    // Auto-detect foreign key column name
    const itemFk = logCols.includes('item_id')
      ? 'item_id'
      : logCols.includes('equipment_id')
      ? 'equipment_id'
      : 'item_id';

    // Auto-detect status column name
    const statusCol = logCols.includes('overall_status')
      ? 'overall_status'
      : logCols.includes('status')
      ? 'status'
      : 'overall_status';

    const condCol = logCols.includes('item_condition_on_borrow')
      ? 'item_condition_on_borrow'
      : logCols.includes('condition_on_borrow')
      ? 'condition_on_borrow'
      : null;

    const dateCol = logCols.includes('date_borrowed')
      ? 'date_borrowed'
      : logCols.includes('borrow_date')
      ? 'borrow_date'
      : null;

    const retDateCol = logCols.includes('expected_return_date')
      ? 'expected_return_date'
      : logCols.includes('return_date')
      ? 'return_date'
      : null;

    // Build dynamic INSERT statement based on actual table columns
    const fields = ['borrower_id', itemFk, statusCol];
    const placeholders = ['?', '?', "'Active'"];
    const values = [cleanBorrowerId, cleanItemId];

    if (dateCol) {
      fields.push(dateCol);
      placeholders.push('NOW()');
    }

    if (retDateCol && expected_return_date) {
      fields.push(retDateCol);
      placeholders.push('?');
      values.push(expected_return_date);
    }

    if (condCol) {
      fields.push(condCol);
      placeholders.push('?');
      values.push(item_condition_on_borrow || 'Good');
    }

    const queryStr = `INSERT INTO borrow_logs (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    console.log('[EXECUTING SQL]:', queryStr, values);

    const [result] = await db.query(queryStr, values);

    // Update equipment status to 'Borrowed' in catalog table
    const equipPk = equipCols.includes('item_id')
      ? 'item_id'
      : equipCols.includes('id')
      ? 'id'
      : 'item_id';

    if (equipCols.includes('status')) {
      await db.query(
        `UPDATE equipment_items SET status = 'Borrowed' WHERE ${equipPk} = ?`,
        [cleanItemId]
      );
    }

    console.log('[SUCCESS] Borrow record saved. Insert ID:', result.insertId);
    return res.status(201).json({
      message: 'Borrow request recorded successfully',
      log_id: result.insertId
    });

  } catch (err) {
    console.error('[SQL ERROR] Insert failed:', err);
    return res.status(500).json({ message: `Database error: ${err.message}` });
  }
};

// 3. Process Return Item with Dynamic Column Detection
exports.returnItem = async (req, res) => {
  const { log_id, item_id } = req.body;
  const cleanLogId = parseInt(log_id, 10);
  const cleanItemId = parseInt(item_id, 10);

  try {
    const logCols = await getTableColumns('borrow_logs');
    const equipCols = await getTableColumns('equipment_items');

    const logPk = logCols.includes('log_id') ? 'log_id' : 'id';
    const statusCol = logCols.includes('overall_status')
      ? 'overall_status'
      : logCols.includes('status')
      ? 'status'
      : 'overall_status';

    const retDateCol = logCols.includes('date_returned')
      ? 'date_returned'
      : logCols.includes('return_date')
      ? 'return_date'
      : null;

    let updateLogStr = `UPDATE borrow_logs SET ${statusCol} = 'Returned'`;
    if (retDateCol) {
      updateLogStr += `, ${retDateCol} = NOW()`;
    }
    updateLogStr += ` WHERE ${logPk} = ?`;

    await db.query(updateLogStr, [cleanLogId]);

    const equipPk = equipCols.includes('item_id')
      ? 'item_id'
      : equipCols.includes('id')
      ? 'id'
      : 'item_id';

    if (equipCols.includes('status')) {
      await db.query(
        `UPDATE equipment_items SET status = 'Available' WHERE ${equipPk} = ?`,
        [cleanItemId]
      );
    }

    res.json({ message: 'Item successfully returned.' });
  } catch (err) {
    console.error('Error returning item:', err);
    res.status(500).json({ message: `Failed to return item: ${err.message}` });
  }
};