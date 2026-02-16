import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
        const { branch } = req.query

  try {
    let sql;
    sql = `

SELECT * FROM GTLOTDETAILS A
WHERE A.SNO = (
SELECT MAX(AA.SNO) FROM GTLOTDETAILS AA
WHERE AA.STATUS IS NOT NULL
AND AA.BATCHNO = A.BATCHNO AND AA.GRNNO = A.GRNNO AND AA.ROUTE = A.ROUTE AND AA.FABRIC = A.FABRIC
AND AA.COMPCODE = :compcode
)
ORDER BY CUSTNAME,BATCHNO,GRNNO,ROUTE,FABRIC
    `;
    const result = await connection.execute(sql,{compcode:branch});
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

    return value !== undefined && value !== null ? value : "NULL";
  });

  console.log("Resolved SQL:\n", resolved);
}

export async function updateRevertDetail(req, res) {
  const connection = await getConnection(res);
  try {
    const data = req.body;

    const iid = Number(data.IID);
    if (isNaN(iid)) {
      return res.status(400).json({
        statusCode: -1,
        error: "Invalid ID parameter",
        details: "ID must be a valid number",
      });
    }
    console.log(data.PROCESSNAME,data.STATUS,"PROCESSNAME")
    const updateQueries = [];

    if (data.PROCESSNAME === "LOT PREPERATION") {
      updateQueries.push({
        sql: `UPDATE GTLOTDETAILS
              SET STATUS = NULL,
                  STDT = NULL,
                  ENDT = NULL
              WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME`,
        params: { BATCHNO: data.BATCHNO, PROCESSNAME: data.PROCESSNAME },
      });
    }

    if (data.PROCESSNAME !== "DYEING" && data.STATUS === "LOADING") {
      updateQueries.push({
        sql: `UPDATE GTLOTDETAILS
              SET STATUS = NULL,
                  STDT = NULL,
                  MACHINE = NULL,
                  CONTRACTOR = NULL
              WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME`,
        params: { BATCHNO: data.BATCHNO, PROCESSNAME: data.PROCESSNAME },
      });
    }

    if (data.PROCESSNAME === "DYEING") {
      if (data.STATUS === "LOADING") {
        if (data.APPROVED === "APPROVED") {
          updateQueries.push({
            sql: `UPDATE GTLOTDETAILS
                  SET APPROVED = NULL,
                      APPDT = NULL
                  WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME`,
            params: { BATCHNO: data.BATCHNO, PROCESSNAME: data.PROCESSNAME },
          });
        } else if (data.APPROVED === null) {
          updateQueries.push({
            sql: `UPDATE GTLOTDETAILS
                  SET STATUS = NULL,
                      STDT = NULL,
                      MACHINE = NULL,
                      CONTRACTOR = NULL
                  WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME`,
            params: { BATCHNO: data.BATCHNO, PROCESSNAME: data.PROCESSNAME },
          });
        }
      }

    
    }
      if (data.STATUS == "UNLOADING") {
          updateQueries.push({
            sql: `UPDATE GTLOTDETAILS
                  SET STATUS = 'LOADING',
                      ENDT = NULL,
                      CONTRACTOR1 = NULL
                  WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME`,
            params: { BATCHNO: data.BATCHNO, PROCESSNAME: data.PROCESSNAME },
          });
       
      }
      if(data.STATUS == "LOADING" && data.PROCESSNAME != "DYEING"  ){
updateQueries.push({
            sql: `UPDATE GTLOTDETAILS
                  SET STATUS = NULL,
                      STDT = NULL,
                      MACHINE = NULL,
                      CONTRACTOR = NULL
                  WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME`,
            params: { BATCHNO: data.BATCHNO, PROCESSNAME: data.PROCESSNAME },
          });
      }

    for (const { sql, params } of updateQueries) {
      logResolvedSQL(sql, params);
      await connection.execute(sql, params);
    }

    // Validate numerical fields
    const batqty = Number(data.BATQTY);
    if (isNaN(batqty)) {
      return res.status(400).json({
        statusCode: -1,
        error: "Invalid BATQTY value",
        details: "BATQTY must be a valid number",
      });
    }

    const sno = Number(data.SNO);
    if (isNaN(sno)) {
      return res.status(400).json({
        statusCode: -1,
        error: "Invalid SNO value",
        details: "SNO must be a valid number",
      });
    }

    const insertSql = `INSERT INTO GTLOTALLDETAILS (
        IID, PROCESSNAME, BATCHNO, BATQTY, COMPCODE,
        CUSTNAME, FABRIC, GRNNO, MACHINE, ROUTE, SNO, APPROVED, APPDT
      ) VALUES (
        :IID, :PROCESSNAME, :BATCHNO, :BATQTY, :COMPCODE,
        :CUSTNAME, :FABRIC, :GRNNO, :MACHINE, :ROUTE, :SNO, :APPROVED, :APPDT
      )`;

    const insertParams = {
      IID: iid,
      PROCESSNAME: data.PROCESSNAME,
      BATCHNO: data.BATCHNO,
      BATQTY: batqty,
      COMPCODE: data.COMPCODE,
      CUSTNAME: data.CUSTNAME,
      FABRIC: data.FABRIC,
      GRNNO: data.GRNNO,
      MACHINE: data.MACHINE,
      ROUTE: data.ROUTE,
      SNO: sno,
      APPROVED: data.payload?.STATUS || null,
      APPDT: data.payload?.STDTIME ? new Date(data.payload.STDTIME) : null,
    };

    logResolvedSQL(insertSql, insertParams);
    await connection.execute(insertSql, insertParams);

    await connection.commit();

    return res.json({
      statusCode: 0,
      message: "Revert operation completed successfully",
    });
  } catch (err) {
    console.error("Revert operation failed:", err);
    await connection.rollback?.();
    res.status(500).json({
      statusCode: -1,
      error: "Internal Server Error",
      details: err.message,
    });
  } finally {
    await connection.close?.();
  }
}
