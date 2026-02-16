import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  const { branch } = req.query;

  try {
    const sql = `
      SELECT * FROM (
        SELECT A.*,
          (
            SELECT MAX(ZA.SNO)
            FROM GTLOTDETAILS ZA
            WHERE ZA.BATCHNO = A.BATCHNO
              AND ZA.ROUTE = A.ROUTE
              AND ZA.FABRIC = A.FABRIC
              AND ZA.COMPCODE = A.COMPCODE
          ) AS SNO1
        FROM GTLOTDETAILS A
        WHERE A.STATUS IN ('UNLOADING')
          AND A.COMPCODE = :compcode
      ) A
      WHERE A.SNO1 || A.PROCESSNAME IN (
        SELECT MAX(AA.SNO) || AA.PROCESSNAME
        FROM GTLOTDETAILS AA
        WHERE AA.BATCHNO = A.BATCHNO
          AND AA.ROUTE = A.ROUTE
          AND AA.STATUS IN ('UNLOADING')
          AND AA.COMPCODE = :compcode
        GROUP BY AA.PROCESSNAME
      )
      ORDER BY CUSTNAME, BATCHNO, GRNNO, ROUTE, FABRIC
    `;

    console.log(sql, "inspection sql");

    const result = await connection.execute(sql, { compcode: branch });

    const resp = result.rows.map((row) => {
      const newObj = {};
      result.metaData.forEach((col, index) => {
        newObj[col.name] = row[index];
      });
      return newObj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}



function logResolvedSQL(query, params) {
  const resolved = query.replace(/:\w+/g, (match) => {
    const key = match.slice(1);
    const value = params[key];

    if (value instanceof Date) {
      return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
    }

    if (typeof value === "string") {
      return `'${value.replace(/'/g, "''")}'`;
    }

    if (value === undefined) {
      console.warn(`WARNING: No value found for parameter ${match}`);
      return 'NULL';
    }

    return value;
  });

  console.log("Resolved SQL:\n", resolved);
}

export async function updateRevertDetail(req, res) {
  const connection = await getConnection(res);

  try {
    const data = req.body;
    const payload = data.payload;

    console.log("Incoming Data:", data);

    const updateSql = `
      UPDATE GTLOTDETAILS
      SET STATUS = :APPROVED,
          APPDT = SYSDATE
      WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME
    `;

    const updateParams = {
      APPROVED: payload.STATUS,  
      BATCHNO: data.BATCHNO,
      PROCESSNAME: data.PROCESSNAME
    };

    logResolvedSQL(updateSql, updateParams);
    const updateResponse = await connection.execute(updateSql, updateParams);

    // FIX 2: Corrected column names and parameters for insert
    const insertSql = `
      INSERT INTO GTLOTALLDETAILS (
        IID, PROCESSNAME, BATCHNO, BATQTY, COMPCODE,
        CUSTNAME, FABRIC, GRNNO, MACHINE, ROUTE, SNO,
        APPROVED, APPDT
      ) VALUES (
        :IID, :PROCESSNAME, :BATCHNO, :BATQTY, :COMPCODE,
        :CUSTNAME, :FABRIC, :GRNNO, :MACHINE, :ROUTE, :SNO,
        :APPROVED, :APPDT
      )
    `;

    // FIX 3: Replaced STATUS with APPROVED to match insert statement
    const insertParams = {
      IID: Number(data.IID),
      PROCESSNAME: data.PROCESSNAME,
      BATCHNO: data.BATCHNO,
      BATQTY: Number(data.BATQTY),
      COMPCODE: data.COMPCODE,
      CUSTNAME: data.CUSTNAME,
      FABRIC: data.FABRIC,
      GRNNO: data.GRNNO,
      MACHINE: data.MACHINE,
      ROUTE: data.ROUTE,
      SNO: Number(data.SNO),
      APPROVED: payload.STATUS,  // Corrected key name
      APPDT: new Date(payload.STDTIME)
    };

    logResolvedSQL(insertSql, insertParams);
    await connection.execute(insertSql, insertParams);
    await connection.commit();

    if (updateResponse.rowsAffected && updateResponse.rowsAffected > 0) {
      return res.json({
        statusCode: 0,
        message: "Unloading updated and inserted successfully"
      });
    } else {
      return res.status(404).json({
        statusCode: 1,
        message: "Unloading record not found"
      });
    }

  } catch (err) {
    console.error("Error updating/inserting unloading record:", err);
    await connection.rollback?.();
    return res.status(500).json({
      statusCode: -1,
      error: "Internal Server Error",
      details: err.message
    });
  } finally {
    await connection.close?.();
  }
}