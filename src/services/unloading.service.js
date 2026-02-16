import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  const { branch } = req.query;

  if (!branch) {
    return res.status(400).json({ error: "Missing required parameter: branch" });
  }

  try {
    const sql = `
      SELECT * FROM (
        SELECT * FROM GTLOTDETAILS A
        WHERE A.STATUS IN ('LOADING') AND COMPCODE = :COMPCODE
      ) A
      ORDER BY CUSTNAME, BATCHNO, GRNNO, ROUTE, FABRIC
    `;

    const result = await connection.execute(sql, { COMPCODE: branch });

    const resp = result.rows.map((row) => {
      const newObj = {};
      for (let i = 0; i < result.metaData.length; i++) {
        const column = result.metaData[i];
        newObj[column.name] = row[i];
      }
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

export async function updateUnLoadingDetail(req, res) {
  const connection = await getConnection(res);

  try {
    const data = req.body;
    const payload = data.payload;
    console.log(payload,"payloadUoLoad")
    const records = Object.keys(data)
      .filter(key => key !== 'payload')
      .map(key => data[key]);

    console.log("Processing records:", records);

    // Process each record individually
    for (const record of records) {
      // --- UPDATE SQL ---
      const updateSql = `
        UPDATE GTLOTDETAILS
        SET STATUS = :STATUS,
            ENDT = :ENDT,
            CONTRACTOR1 = :CONTRACTOR1
        WHERE BATCHNO = :BATCHNO AND PROCESSNAME = :PROCESSNAME
      `;

      const updateParams = {
        STATUS: payload.STATUS,
        ENDT: new Date(payload.STDTIME),
        CONTRACTOR1: payload.CONTRACTORNAME,
        BATCHNO: record.BATCHNO,
        PROCESSNAME: record.PROCESSNAME
      };

      logResolvedSQL(updateSql, updateParams);
      const updateResponse = await connection.execute(updateSql, updateParams);

      // --- INSERT SQL ---
      const insertSql = `
        INSERT INTO GTLOTALLDETAILS (
          IID, STATUS, PROCESSNAME, BATCHNO, BATQTY, COMPCODE, CONTRACTOR1,
          CUSTNAME, ENDT, FABRIC, GRNNO, MACHINE, ROUTE, SNO
        ) VALUES (
          :IID, :STATUS, :PROCESSNAME, :BATCHNO, :BATQTY, :COMPCODE, :CONTRACTOR1,
          :CUSTNAME, :ENDT, :FABRIC, :GRNNO, :MACHINE, :ROUTE, :SNO
        )
      `;

      const insertParams = {
        IID: Number(record.IID),
        STATUS: payload.STATUS,
        PROCESSNAME: record.PROCESSNAME,
        BATCHNO: record.BATCHNO,
        BATQTY: Number(record.BATQTY),
        COMPCODE: record.COMPCODE,
        CONTRACTOR1: payload.CONTRACTORNAME,
        CUSTNAME: record.CUSTNAME,
        ENDT: new Date(payload.STDTIME),
        FABRIC: record.FABRIC,
        GRNNO: record.GRNNO,
        MACHINE: record.MACHINE,
        ROUTE: record.ROUTE,
        SNO: Number(record.SNO)
      };

      logResolvedSQL(insertSql, insertParams);
      await connection.execute(insertSql, insertParams);
    }

    await connection.commit();

    return res.json({
      statusCode: 0,
      message: `${records.length} unloading record(s) updated and inserted successfully`
    });

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


