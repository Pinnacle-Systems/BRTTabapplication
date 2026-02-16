import { getConnection } from "../constants/db.connection.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  const { branch } = req.query; 
  console.log(req.query, "req");

  try {
    const sql = `
      SELECT * FROM GTLOTDETAILS A
      WHERE A.PROCESSNAME = 'LOT PREPERATION' 
        AND A.STATUS IS NULL 
        AND COMPCODE = :COMPCODE
      ORDER BY CUSTNAME, BATCHNO
    `;

    const result = await connection.execute(sql, { COMPCODE: branch });

    const resp = result.rows.map((row) => {
      const newObj = {};
      for (let i = 0; i < result.metaData.length; i++) {
        newObj[result.metaData[i].name] = row[i];
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
export async function getPrepareDet(req, res) {
  const connection = await getConnection(res);
  const { branch } = req.query; 
  console.log(req.query, "req");

  try {
    const sql = `
      SELECT * FROM GTLOTDETAILS A
      WHERE 
        COMPCODE = :COMPCODE AND PREPAREDBY IS NOT NULL
      ORDER BY CUSTNAME, BATCHNO
    `;
    console.log(sql,"sql for prepare")

    const result = await connection.execute(sql, { COMPCODE: branch });

    const resp = result.rows.map((row) => {
      const newObj = {};
      for (let i = 0; i < result.metaData.length; i++) {
        newObj[result.metaData[i].name] = row[i];
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

export async function updateLotDetail(req, res) {
  const connection = await getConnection(res);
  try {
    let dataList = req.body;
    if (!Array.isArray(dataList)) {
      dataList = [dataList];
    }

    let updatedCount = 0;
    let insertedCount = 0;

    for (const data of dataList) {
      const updateSql = `
UPDATE GTLOTDETAILS
SET STATUS = :status,
    ENDT = SYSDATE,
    STDT = SYSDATE,
    PREPAREDBY = :CONTRACTOR
WHERE BATCHNO = :batchno AND PROCESSNAME = 'LOT PREPERATION'
      `;

      const updateParams = {
        status: data.status,
        batchno: data.BATCHNO,
        CONTRACTOR: data.CONTRACTORNAME
      };

      const updateResult = await connection.execute(updateSql, updateParams);
      updatedCount += updateResult.rowsAffected;

      const selectSql = `
        SELECT IID, STATUS, PROCESSNAME, BATCHNO, BATQTY, COMPCODE, CONTRACTOR,
               CUSTNAME, FABRIC, GRNNO, MACHINE, ROUTE, SNO, STDT, APPROVED
        FROM GTLOTDETAILS
        WHERE BATCHNO = :batchno AND PROCESSNAME = 'LOT PREPERATION'
      `;
      const result = await connection.execute(selectSql, {
        batchno: data.BATCHNO,
      });

      const insertSql = `
        INSERT INTO GTLOTALLDETAILS (
          IID, STATUS, PROCESSNAME, BATCHNO, BATQTY, COMPCODE, CONTRACTOR,
          CUSTNAME, ENDT, FABRIC, GRNNO, MACHINE, ROUTE, SNO, STDT, APPROVED
        ) VALUES (
          :IID, :STATUS, :PROCESSNAME, :BATCHNO, :BATQTY, :COMPCODE, :CONTRACTOR,
          :CUSTNAME, SYSDATE, :FABRIC, :GRNNO, :MACHINE, :ROUTE, :SNO, SYSDATE, :APPROVED
        )
      `;
      const columnMap = {};
      result.metaData.forEach((column, index) => {
        columnMap[column.name] = index;
      });

      for (const row of result.rows) {
        const insertParams = {
          IID: row[columnMap["IID"]],
          STATUS: row[columnMap["STATUS"]],
          PROCESSNAME: row[columnMap["PROCESSNAME"]],
          BATCHNO: row[columnMap["BATCHNO"]],
          BATQTY: row[columnMap["BATQTY"]],
          COMPCODE: row[columnMap["COMPCODE"]],
          CONTRACTOR: row[columnMap["CONTRACTOR"]],
          CUSTNAME: row[columnMap["CUSTNAME"]],
          FABRIC: row[columnMap["FABRIC"]],
          GRNNO: row[columnMap["GRNNO"]],
          MACHINE: row[columnMap["MACHINE"]],
          ROUTE: row[columnMap["ROUTE"]],
          SNO: row[columnMap["SNO"]],
          APPROVED: row[columnMap["APPROVED"]],
        };

        try {
          console.log("Inserting into GTLOTALLDETAILS:", insertParams);
          await connection.execute(insertSql, insertParams);
          insertedCount++;
        } catch (insertErr) {
          console.error(
            `Insert failed for BATCHNO: ${data.BATCHNO}`,
            insertErr
          );
        }
      }
    }

    await connection.commit();

    return res.json({
      statusCode: 0,
      message: `${updatedCount} lot(s) updated. ${insertedCount} lot(s) inserted into GTLOTALLDETAILS.`,
    });
  } catch (err) {
    console.error("Error in bulk lot update/insert:", err);
    await connection.rollback();
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}
