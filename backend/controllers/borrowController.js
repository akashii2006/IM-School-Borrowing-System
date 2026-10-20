const db = require('../config/db');

// 1. Fetch all borrow logs
const getBorrowLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT 
        bl.log_id,
        bl.borrower_id,
        bl.item_id,
        bl.usage_room_id,
        bl.date_borrowed,
        bl.expected_return_date,
        bl.date_returned,
        bl.item_condition_on_borrow,
        bl.item_condition_on_return,
        bl.overall_status,
        bl.remarks,
        i.name AS item_name,
        i.item_code,
        COALESCE(u.full_name, 'Student Borrower') AS full_name,
        COALESCE(u.username, bl.borrower_id) AS id_number,
        ro.room_name AS usage_room_name,
        ro.building AS usage_building
      FROM borrow_logs bl
      LEFT JOIN items i ON bl.item_id = i.item_id
      LEFT JOIN users u ON bl.borrower_id = u.user_id
      LEFT JOIN rooms_offices ro ON bl.usage_room_id = ro.room_id
      ORDER BY bl.log_id DESC
    `);
    
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Error fetching borrow logs:', err);
    res.status(500).json({ message: 'Failed to fetch borrow logs', error: err.message });
  }
};

// 2. Create borrow request
const createBorrowRequest = async (req, res) => {
  const { borrower_id, item_id, usage_room_id, expected_return_date, item_condition_on_borrow } = req.body;

  if (!borrower_id || !item_id || !usage_room_id || !expected_return_date) {
    return res.status(400).json({ 
      message: 'Borrower ID, Item, Usage Room, and Expected Return Date are strictly required.' 
    });
  }

  try {
    const [userRows] = await db.query(
      'SELECT role FROM users WHERE user_id = ? OR username = ?', 
      [borrower_id, borrower_id]
    );
    
    const userRole = (userRows[0]?.role || req.body.role || 'Student').toLowerCase();

    const [itemRows] = await db.query('SELECT status, name FROM items WHERE item_id = ?', [item_id]);

    if (itemRows.length === 0) {
      return res.status(404).json({ message: 'Equipment item not found.' });
    }

    if (itemRows[0].status !== 'available') {
      return res.status(400).json({ 
        message: `"${itemRows[0].name}" is currently unavailable (${itemRows[0].status}).` 
      });
    }

    const requestStatus = userRole === 'staff' ? 'Active' : 'Pending';

    const [result] = await db.query(
      `INSERT INTO borrow_logs (borrower_id, item_id, usage_room_id, date_borrowed, expected_return_date, item_condition_on_borrow, overall_status)
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      [borrower_id, item_id, usage_room_id, expected_return_date, item_condition_on_borrow || 'Good', requestStatus]
    );

    if (userRole === 'staff') {
      await db.query(`UPDATE items SET status = 'borrowed' WHERE item_id = ?`, [item_id]);
    }

    res.status(201).json({
      success: true,
      message: userRole === 'staff'
        ? 'Faculty request automatically approved! Equipment status updated to borrowed.'
        : 'Borrow request submitted successfully and pending admin approval.',
      log_id: result.insertId,
      status: requestStatus
    });
  } catch (err) {
    console.error('Error creating borrow request:', err);
    res.status(500).json({ message: 'Failed to process borrow request', error: err.message });
  }
};

// 3. Admin Approve Borrow Request
const approveBorrowRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const [logRows] = await db.query('SELECT item_id FROM borrow_logs WHERE log_id = ?', [id]);
    if (logRows.length === 0) {
      return res.status(404).json({ message: 'Borrow record not found.' });
    }

    const itemId = logRows[0].item_id;

    // Set borrow log status to Active
    await db.query(`UPDATE borrow_logs SET overall_status = 'Active', date_borrowed = NOW() WHERE log_id = ?`, [id]);

    // Set item status to borrowed
    await db.query(`UPDATE items SET status = 'borrowed' WHERE item_id = ?`, [itemId]);

    res.json({ message: 'Borrow request approved successfully!' });
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).json({ message: 'Failed to approve request', error: err.message });
  }
};

// 4. Admin Reject Borrow Request
const rejectBorrowRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`UPDATE borrow_logs SET overall_status = 'Rejected' WHERE log_id = ?`, [id]);
    res.json({ message: 'Borrow request rejected.' });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ message: 'Failed to reject request', error: err.message });
  }
};

// 5. Process Return Inspection
const processReturn = async (req, res) => {
  const { id } = req.params;
  const { return_condition, fine_amount, remarks } = req.body;

  const condition = String(return_condition || 'good').toLowerCase();

  try {
    const [requestRows] = await db.query(
      `SELECT log_id, item_id FROM borrow_logs WHERE log_id = ?`,
      [id]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ message: 'Borrowing record not found.' });
    }

    const itemId = requestRows[0].item_id;

    await db.query(
      `UPDATE borrow_logs 
       SET date_returned = NOW(), 
           overall_status = 'Returned', 
           item_condition_on_return = ?,
           remarks = ?
       WHERE log_id = ?`,
      [condition, remarks || '', id]
    );

    const newEquipmentStatus = condition === 'damaged' ? 'maintenance' : 'available';

    await db.query(
      `UPDATE items 
       SET status = ?, 
           condition_status = ? 
       WHERE item_id = ?`,
      [newEquipmentStatus, condition, itemId]
    );

    res.json({
      success: true,
      message: condition === 'damaged'
        ? 'Item flagged as damaged and routed to Maintenance. Return completed.'
        : 'Inspection passed! Equipment marked as Available.'
    });
  } catch (err) {
    console.error('Error processing return inspection:', err);
    res.status(500).json({ message: 'Failed to process return', error: err.message });
  }
};

module.exports = {
  getBorrowLogs,
  createBorrowLog: createBorrowRequest,
  createBorrowRequest,
  approveBorrowRequest,
  rejectBorrowRequest,
  returnItem: processReturn,
  processReturn
};