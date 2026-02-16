import moment from "moment";
import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  try {
    let sql;
    sql = `
 SELECT A.CONAME FROM GTCONMAST A
WHERE A.ACTIVE = 'T'
ORDER BY 1

    `;
    const result = await connection.execute(sql);
    let resp = result.rows.map((i) => {
      let newObj = {};
      for (
        let columnIndex = 0;
        columnIndex < result.metaData.length;
        columnIndex++
      ) {
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