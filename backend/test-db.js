const db = require('./database');

db.close((err) => {
  if (err) {
    console.error('Failed to close DB:', err.message);
    process.exit(1);
  }
  console.log('SQLite DB initialized and closed successfully.');
});
