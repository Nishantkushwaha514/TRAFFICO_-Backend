const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'traffico_db',
  password: 'Nishantcodes25',
  port: 5432,
});

(async () => {
  try {
    await client.connect();
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log('TABLES:', JSON.stringify(tables.rows, null, 2));
    const cols = await client.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('users', 'violation_reports', 'violation_rules') ORDER BY table_name, ordinal_position;");
    console.log('COLUMNS:', JSON.stringify(cols.rows, null, 2));
    await client.end();
  } catch (err) {
    console.error('DB ERR:', err.message);
    process.exit(1);
  }
})();
