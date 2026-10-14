const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'traffico_db',
  password: 'Nishantcodes25',
  port: 5432,
});

(async () => {
  try {
    const userId = '9d557c90-a9d9-49fa-89d1-420db019ab43';
    const query = `
      INSERT INTO violation_reports (
        user_id,
        violation_code,
        media_key,
        media_url,
        location_geom,
        address_label,
        device_info,
        status
      )
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, 'PENDING')
      RETURNING id, status;
    `;
    const values = [
      userId,
      'NO_HELMET',
      'MOCK_uploads/test.mp4',
      'https://mock-bucket.s3.amazonaws.com/MOCK_uploads/test.mp4',
      73.8567,
      18.5204,
      'Pune, Maharashtra',
      { platform: 'Win32' }
    ];

    const result = await pool.query(query, values);
    console.log('INSERT_OK', JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('INSERT_ERR:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
})();
