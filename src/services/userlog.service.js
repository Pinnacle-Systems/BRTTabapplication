import { getConnection } from "../constants/db.connection.js";


import oracledb from 'oracledb'; // make sure this import is present at top

export async function get(req, res) {
  const connection = await getConnection(res);

  try {
    const result = await connection.execute(
      `SELECT * FROM USERLOG`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT } 
    );

    const rows = result.rows;
    return res.json({ statusCode: 0, data: rows });
  } catch (err) {
    console.error('Error fetching USERLOG data:', err);
    res.status(500).json({ statusCode: 1, message: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}














