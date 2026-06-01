import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {

    const { userId } = req.query;

  const connection = await getConnection(res);

  try {
    const sql = `
      SELECT A.GTCOMPMASTID, A.COMPCODE
      FROM GTCOMPMAST A
      WHERE A.PTRANSACTION = 'COMPANY'
        AND A.DIVISION = 'FABRIC'
    `;

    const result = await connection.execute(sql);

    const resp = result.rows.map((row) =>
      result.metaData.reduce((obj, col, index) => {
        obj[col.name] = row[index];
        return obj;
      }, {})
    );

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}