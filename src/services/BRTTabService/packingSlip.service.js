import { getConnection } from "../../constants/db.connection.js";

export async function getBarCodeData(req, res) {
  let connection;
  const { barCode } = req.params;

  const joinedSql = `
    SELECT 
      B.GTPIECESCHKID AS NONGRIDID,
      A.GTPCSCHKERDETTID AS GRIDID,
      A.PCSNO,
      A.LMNO AS LOOMNO,
      A.RECMTER AS RECEIPTMETER,
      A.TOTRECMTR AS METERS,
      A.LOTNO2 AS LOTNO,
      B.LOTNONON AS LOTID,
      A.WEGHTT AS WEIGHT,
      A.BARCODECOLUMWISE AS GRID_BARCODE,
      A.FOLD AS FOLD_PERCENTAGE,
      B.BARCODE AS NON_GRIDBAR_CODE,
       B.CLOTHNAMENON AS CLOTHID,
      C.CLOTHNAME AS CLOTHNAME,
      B.WEAVER AS WEAVERID
    FROM GTPCSCHKERDETT A
    LEFT JOIN GTPIECESCHK B ON B.GTPIECESCHKID = A.GTPIECESCHKID
    LEFT JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = B.CLOTHNAMENON
  `;

  try {
    connection = await getConnection();
    // Step 1: Check if barCode exists in parent table GTPIECESCHK
    const parentResult = await connection.execute(
      `SELECT GTPIECESCHKID FROM GTPIECESCHK WHERE BARCODE = :barCode`,
      { barCode },
    );

    const parentRows = parentResult.rows.map((row) => {
      let obj = {};
      parentResult.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });

    let childResult;

    if (parentRows.length > 0) {
      // ── Found in parent → return ALL child rows for that parent ──
      const parentId = parentRows[0].GTPIECESCHKID;

      childResult = await connection.execute(
        `${joinedSql} WHERE A.GTPIECESCHKID = :parentId`,
        { parentId },
      );
    } else {
      // ── Not in parent → search child by BARCODECOLUMWISE ──
      childResult = await connection.execute(
        `${joinedSql} WHERE A.BARCODECOLUMWISE = :barCode`,
        { barCode },
      );
    }

    const resp = childResult.rows.map((row) => {
      let obj = {};
      childResult.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving BarCodeData:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getCurrentFinyear(req, res) {
  let connection;

  try {
    connection = await getConnection();

    const sql = `
   SELECT GTFINANCIALYEARID,FINYR,CURRENTFINYR FROM GTFINANCIALYEAR
WHERE CURRENTFINYR = 'T'`;

    console.log(sql, "sql for getLotDetails");
    const result = await connection.execute(sql);

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
