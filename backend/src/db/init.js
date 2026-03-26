require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('./index');

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 Initialising database...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Split and run each statement
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (err) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate key')) {
          console.warn('Statement warning:', err.message.substring(0, 100));
        }
      }
    }

    // Set real admin password
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Lifted@2026';
    const hash = await bcrypt.hash(defaultPassword, 12);
    await client.query(
      `INSERT INTO admin_users (username, password_hash, email, role)
       VALUES ('admin', $1, 'liftedtolift@gmail.com', 'superadmin')
       ON CONFLICT (username) DO UPDATE SET password_hash = $1, email = 'liftedtolift@gmail.com'`,
      [hash]
    );

    console.log('✅ Database initialised successfully!');
    console.log(`👤 Admin credentials: username=admin, password=${defaultPassword}`);
  } catch (err) {
    console.error('❌ Database init failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase().catch(console.error);
