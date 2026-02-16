import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  const { branch } = req.query;

  try {
    const sql = `
      SELECT A.*,
        (
          SELECT ZZ.PROCESSNAME
          FROM GTLOTDETAILS ZZ
          WHERE ZZ.BATCHNO = A.BATCHNO
            AND ZZ.ROUTE = A.ROUTE
            AND ZZ.FABRIC = A.FABRIC
            AND ZZ.SNO = (A.SNO - 1)
            AND ROWNUM = 1  -- Ensures single row
        ) AS FROMPROCESS
      FROM GTLOTDETAILS A
      WHERE A.STATUS IS NULL
        AND A.COMPCODE = :BRANCH
        AND A.SNO = (
          SELECT MAX(SNO)  -- Aggregate handles multiple rows
          FROM (
            SELECT MAX(AA.SNO) + 1 AS SNO, AA.BATCHNO, AA.GRNNO, AA.ROUTE, AA.FABRIC
            FROM GTLOTDETAILS AA
            WHERE AA.STATUS IN ('COMPLETED', 'UNLOADING')
              AND AA.PROCESSNAME <> 'DYEING'
            GROUP BY AA.BATCHNO, AA.GRNNO, AA.ROUTE, AA.FABRIC
            UNION ALL
            SELECT MAX(AA.SNO) + 1 AS SNO, AA.BATCHNO, AA.GRNNO, AA.ROUTE, AA.FABRIC
            FROM GTLOTDETAILS AA
            WHERE AA.STATUS IN ('COMPLETED', 'UNLOADING')
              AND AA.PROCESSNAME = 'DYEING'
              AND AA.APPROVED = 'APPROVED'
            GROUP BY AA.BATCHNO, AA.GRNNO, AA.ROUTE, AA.FABRIC
          ) AA
          WHERE AA.BATCHNO = A.BATCHNO
            AND AA.GRNNO = A.GRNNO
            AND AA.ROUTE = A.ROUTE
            AND AA.FABRIC = A.FABRIC
        )
      ORDER BY CUSTNAME, BATCHNO, GRNNO, ROUTE, FABRIC
    `;
    console.log(sql,"sql for Loading")
    const result = await connection.execute(sql, { BRANCH: branch });
    
    const resp = result.rows.map((row) => {
      let obj = {};
      result.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });

    return res.json({ statusCode: 0, data: resp });

  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function updateLoadingDetail(req, res) {
  const connection = await getConnection(res);
  try {
    const data = req.body;
    const payload = data.payload;
    console.log("Incoming Data:", data);

    const updateSql = `
      UPDATE GTLOTDETAILS
      SET STATUS = :STATUS,
          STDT = :STDT,
          ENDT = NULL,
          CONTRACTOR = :CONTRACTOR,
          MACHINE = :MACHINE
      WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME
    `;

    const updateParams = {
      STATUS: payload.STATUS,
      STDT: new Date(payload.STDTIME),
      CONTRACTOR: payload.CONTRACTORNAME,
      MACHINE: payload.MACHINENAME,
      BATCHNO: data.BATCHNO,
      PROCESSNAME: data.PROCESSNAME,
    };

    logResolvedSQL(updateSql, updateParams);
    const updateResponse = await connection.execute(updateSql, updateParams);

    const insertSql = `
      INSERT INTO GTLOTALLDETAILS (
        IID, STATUS, PROCESSNAME, BATCHNO, BATQTY, COMPCODE, CONTRACTOR,
        CUSTNAME, ENDT, FABRIC, GRNNO, MACHINE, ROUTE, SNO, STDT, APPROVED
      ) VALUES (
        :IID, :STATUS, :PROCESSNAME, :BATCHNO, :BATQTY, :COMPCODE, :CONTRACTOR,
        :CUSTNAME, NULL, :FABRIC, :GRNNO, :MACHINE, :ROUTE, :SNO, :STDT, :APPROVED
      )
    `;

    const insertParams = {
      IID: Number(data.IID),
      STATUS: payload.STATUS,
      PROCESSNAME: data.PROCESSNAME,
      BATCHNO: data.BATCHNO,
      BATQTY: Number(data.BATQTY),
      COMPCODE: data.COMPCODE,
      CONTRACTOR: payload.CONTRACTORNAME,
      CUSTNAME: data.CUSTNAME,
      FABRIC: data.FABRIC,
      GRNNO: data.GRNNO,
      MACHINE: payload.MACHINENAME,
      ROUTE: data.ROUTE,
      SNO: Number(data.SNO),
      STDT: new Date(payload.STDTIME),
      APPROVED: data.APPROVED,
    };

    logResolvedSQL(insertSql, insertParams);
    await connection.execute(insertSql, insertParams);
    await connection.commit();

    if (updateResponse.rowsAffected && updateResponse.rowsAffected > 0) {
      return res.json({
        statusCode: 0,
        message: "Loading updated and inserted successfully",
      });
    } else {
      return res.status(404).json({
        statusCode: 1,
        message: "Loading record not found",
      });
    }

  } catch (err) {
    console.error("Error updating/inserting lot:", err);
    await connection.rollback?.();
    return res.status(500).json({ statusCode: -1, error: "Internal Server Error", details: err.message });
  } finally {
    await connection.close?.();
  }
}


function logResolvedSQL(query, params) {
  const resolved = query.replace(/:\w+/g, match => {
    const key = match.slice(1);
    const value = params[key];
    if (value instanceof Date) {
      return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  });

  console.log("Resolved SQL:\n", resolved);
}
