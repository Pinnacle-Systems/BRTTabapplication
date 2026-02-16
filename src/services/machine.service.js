import moment from "moment";
import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  const { PROCESSNAME } = req.query;
  console.log(PROCESSNAME, "processname");

  try {
    const sql = `
      SELECT DISTINCT A.MACHINENAME
      FROM DTMACHINEMAST A
      JOIN DTMACHINEMASTDET B ON A.DTMACHINEMASTID = B.DTMACHINEMASTID
      JOIN DTCOLORPROMAST C ON B.PROCESSNAME = C.DTCOLORPROMASTID
      WHERE C.PROCESSNAME = :PROCESSNAME AND A.ACTIVE = 'T'
      ORDER BY 1
    `;

    const result = await connection.execute(sql, { PROCESSNAME });

    const resp = result.rows.map((i) => {
      const newObj = {};
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

