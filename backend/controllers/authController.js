const db = require('../config/db');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const cleanUser = String(username || '').trim();
  const cleanPass = String(password || '').trim();

  console.log('\n================ LOGIN DIAGNOSTIC ================');
  console.log(`Attempting login for Username/ID: "${cleanUser}"`);

  try {
    // 1. Check 'users' table (Admin / Staff) by username
    const [users] = await db.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
      [cleanUser]
    );

    if (users.length > 0) {
      const user = users[0];
      console.log(`[FOUND] Matched System User: ${user.username}`);

      if (String(user.password).trim() === cleanPass) {
        return res.json({
          message: 'Login successful',
          user: {
            id: user.user_id || user.id,
            name: user.full_name || user.username,
            role: user.role || 'Admin',
            type: 'operator'
          }
        });
      }
    }

    // 2. Check 'borrowers' table (Student / Faculty) by id_number or borrower_id
    const parsedId = isNaN(cleanUser) ? 0 : parseInt(cleanUser, 10);
    const [borrowers] = await db.query(
      'SELECT * FROM borrowers WHERE LOWER(id_number) = LOWER(?) OR borrower_id = ?',
      [cleanUser, parsedId]
    );

    if (borrowers.length > 0) {
      const borrower = borrowers[0];
      console.log(`[FOUND] Matched Borrower: ${borrower.full_name} (ID: ${borrower.borrower_id})`);

      if (String(borrower.password).trim() === cleanPass) {
        return res.json({
          message: 'Login successful',
          user: {
            id: borrower.borrower_id,
            borrower_id: borrower.borrower_id,
            username: borrower.id_number || String(borrower.borrower_id),
            id_number: borrower.id_number || String(borrower.borrower_id),
            name: borrower.full_name,
            role: borrower.role || 'Student',
            type: 'borrower'
          }
        });
      }
    }

    console.log(`[NOT FOUND] No matching active account or password mismatch for "${cleanUser}"`);
    return res.status(401).json({ message: 'Login failed. Please check your credentials.' });

  } catch (err) {
    console.error('Database query error during login:', err);
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
};