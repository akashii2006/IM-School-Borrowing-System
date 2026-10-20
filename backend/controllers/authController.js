const db = require('../config/db');

const login = async (req, res) => {
  try {
    const usernameInput = req.body.username || req.body.id_number || req.body.identifier || '';
    const passwordInput = req.body.password || '';

    const cleanUser = String(usernameInput).trim().toLowerCase();
    const cleanPass = String(passwordInput).trim();

    console.log(`[AUTH LOGIN] User: "${cleanUser}"`);

    // Hardcoded Overrides for Instant Development Access
    if (cleanUser === 'admin' && (cleanPass === '123' || cleanPass === 'admin')) {
      return res.json({
        message: 'Login successful',
        user: { id: 1, user_id: 1, name: 'System Administrator', username: 'admin', role: 'Admin', type: 'operator' }
      });
    }

    if (cleanUser === 'staff' && cleanPass === '123') {
      return res.json({
        message: 'Login successful',
        user: { id: 2, user_id: 2, name: 'Property Staff', username: 'staff', role: 'Staff', type: 'operator' }
      });
    }

    if ((cleanUser === '123' || cleanUser === '17') && cleanPass === '123') {
      return res.json({
        message: 'Login successful',
        user: {
          id: cleanUser === '17' ? 17 : 123,
          borrower_id: cleanUser === '17' ? 17 : 123,
          username: cleanUser,
          id_number: cleanUser,
          name: cleanUser === '17' ? 'kinjay' : 'Student Borrower',
          role: cleanUser === '17' ? 'Faculty' : 'Student',
          type: 'borrower'
        }
      });
    }

    // MySQL Fallback
    const [users] = await db.query(
      'SELECT * FROM users WHERE LOWER(TRIM(username)) = ? OR LOWER(TRIM(full_name)) = ?',
      [cleanUser, cleanUser]
    );

    if (users.length > 0 && String(users[0].password || '').trim() === cleanPass) {
      const user = users[0];
      return res.json({
        message: 'Login successful',
        user: { id: user.user_id, name: user.full_name || user.username, role: user.role, type: 'operator' }
      });
    }

    const parsedId = isNaN(cleanUser) ? 0 : parseInt(cleanUser, 10);
    const [borrowers] = await db.query(
      'SELECT * FROM borrowers WHERE LOWER(TRIM(id_number)) = ? OR LOWER(TRIM(full_name)) = ? OR borrower_id = ?',
      [cleanUser, cleanUser, parsedId]
    );

    if (borrowers.length > 0 && String(borrowers[0].password || '').trim() === cleanPass) {
      const borrower = borrowers[0];
      return res.json({
        message: 'Login successful',
        user: {
          id: borrower.borrower_id,
          borrower_id: borrower.borrower_id,
          username: borrower.id_number,
          id_number: borrower.id_number,
          name: borrower.full_name,
          role: borrower.role,
          type: 'borrower'
        }
      });
    }

    return res.status(401).json({ message: 'Login failed. Please check your credentials.' });

  } catch (err) {
    console.error('Auth Controller Error:', err);
    return res.status(500).json({ message: `Database error: ${err.message}` });
  }
};

module.exports = {
  login
};