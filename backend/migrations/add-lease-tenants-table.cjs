const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create lease_tenants table for many-to-many relationship
  db.run(`
    CREATE TABLE IF NOT EXISTS lease_tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lease_id INTEGER NOT NULL,
      tenant_id INTEGER NOT NULL,
      is_primary BOOLEAN DEFAULT 0,
      start_date DATE NOT NULL,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
      UNIQUE(lease_id, tenant_id, start_date)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating lease_tenants table:', err);
    } else {
      console.log('lease_tenants table created successfully');
    }
  });

  // Create index for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_lease_tenants_lease_id ON lease_tenants(lease_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_lease_tenants_tenant_id ON lease_tenants(tenant_id)
  `);
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database closed successfully');
  }
});
