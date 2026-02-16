import { getConnection } from "../constants/db.connection.js";
export async function get(req, res) {
  const connection = await getConnection(res);
  const { branch } = req.query;

  try {
    const sql = `
     SELECT *
FROM GTLOTALLDETAILS A
WHERE A.STATUS = 'STOP'
  AND A.COMPCODE = :compcode
  AND EXISTS (
    SELECT 1
    FROM (
      SELECT IID,
             SUM(CASE WHEN STATUS = 'STOP' THEN 1 ELSE 0 END) AS stop_count,
             SUM(CASE WHEN STATUS = 'START' THEN 1 ELSE 0 END) AS start_count
      FROM GTLOTALLDETAILS
      WHERE COMPCODE = :compcode
      GROUP BY IID
    ) B
    WHERE A.IID = B.IID
      AND B.stop_count > B.start_count
  )
    `;

    const result = await connection.execute(sql, { compcode: branch });

    const resp = result.rows.map((row) => {
      const rowObj = {};
      result.metaData.forEach((meta, idx) => {
        rowObj[meta.name] = row[idx];
      });
      return rowObj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}
export async function InsertStopDetail(req, res) {
  const connection = await getConnection(res);
  if (!connection) return;

  try {
    const data = req.body;
    console.log(data, "data for stop");

    
    if (!data.matchedItem || !Array.isArray(data.matchedItem) || data.matchedItem.length === 0) {
      return res.status(400).json({
        statusCode: 1,
        message: "No matched items found to process"
      });
    }
  
    const parseDateTime = (dateString) => {
      if (!dateString) return new Date();
      const dt = new Date(dateString);
      return isNaN(dt) ? new Date() : dt;
    };

    const stopTime = parseDateTime(data.payload?.MANUAL_TIME || new Date());

    const insertSql = `
      INSERT INTO GTLOTALLDETAILS (
        IID, STATUS, PROCESSNAME, BATCHNO, BATQTY, COMPCODE, 
        CONTRACTOR1, CUSTNAME, STDT, ENDT,
        FABRIC, GRNNO, MACHINE, ROUTE, SNO, STOPREASON,REMARKS
      ) VALUES (
        :IID, :STATUS, :PROCESSNAME, :BATCHNO, :BATQTY, :COMPCODE, 
        :CONTRACTOR1, :CUSTNAME, :STDT, :ENDT,
        :FABRIC, :GRNNO, :MACHINE, :ROUTE, :SNO, :STOPREASON,:REMARKS
      )
    `;

    let totalInserted = 0;
    for (const item of data.matchedItem) {
      try {
        const insertParams = {
          IID: Number(item.IID),
          STATUS:data.payload.STATUS , 
          PROCESSNAME: item.PROCESSNAME,
          BATCHNO: item.BATCHNO,
          BATQTY: Number(item.BATQTY),
          COMPCODE: item.COMPCODE,
          CONTRACTOR1: item.CONTRACTOR || data.payload?.CONTRACTORNAME || '',
          CUSTNAME: item.CUSTNAME,
          STDT: data.payload.STATUS ==="STOP" ? stopTime : null,
          ENDT:  data.payload.STATUS ==="START" ? stopTime : null, 
          FABRIC: item.FABRIC,
          GRNNO: item.GRNNO,
          MACHINE: item.MACHINE,
          ROUTE: item.ROUTE,
          SNO: Number(item.SNO),
          STOPREASON: data.payload?.STOPREASON || null,
          REMARKS: data.payload.REMARKS
        };

        const result = await connection.execute(
          insertSql,
          insertParams,
          { autoCommit: false }
        );

        if (result.rowsAffected > 0) {
          totalInserted++;
          
          
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.IID}:`, itemError);
      }
    }

    await connection.commit();

    if (totalInserted > 0) {
      return res.json({
        statusCode: 0,
        message: `Successfully inserted ${totalInserted} stop records out of ${data.matchedItem.length}`
      });
    } else {
      return res.status(400).json({
        statusCode: 1,
        message: "No stop records were inserted"
      });
    }

  } catch (err) {
    console.error("Database error:", err);
    await connection.rollback?.();
    return res.status(500).json({
      statusCode: -1,
      error: "Database operation failed",
      details: err.message
    });
  } finally {
    await connection.close?.();
  }
}