import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  console.log(req.body, "req.body");

  try {
  const { username } = req.query;

    const sql = `
      SELECT DISTINCT A.COMPCODE AS GCOMPCODE 
      FROM GTCOMPMAST A, GTEMPCOMPDET B, GTEMPMAST C
      WHERE A.GTCOMPMASTID = B.EMPCOMP 
        AND B.GTEMPMASTID = C.GTEMPMASTID
        AND LOWER(C.EUSERS) = LOWER(:USERNAME)
        AND PTRANSACTION = 'COMPANY'
      ORDER BY 1
    `;

    const result = await connection.execute(sql, { USERNAME: username });

    const resp = result.rows.map((i) => {
      let newObj = {};
      for (let columnIndex = 0; columnIndex < result.metaData.length; columnIndex++) {
        const element = result.metaData[columnIndex];
        newObj[element.name] = i[columnIndex];
      }
      return newObj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}