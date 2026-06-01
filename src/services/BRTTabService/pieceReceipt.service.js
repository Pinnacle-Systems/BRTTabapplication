import { getConnection } from "../../constants/db.connection.js";
import oracledb from "oracledb";

export async function getLotNo(req, res) {
  let connection;

  const { companyId } = req.query;
  console.log(companyId, "received companyId in getLotNo");
  // const connection = await getConnection(res);
  //   const { branch } = req.query;

  try {
    connection = await getConnection(); // borrows from pool
    // const sql = `select gtfabricreceiptid,docid from gtfabricreceipt`;
    //     const sql = `
    //   SELECT gr.gtfabricreceiptid, gr.docid
    //   FROM GTFABRICRECEIPT gr
    //   WHERE NOT EXISTS (
    //     SELECT 1
    //     FROM GTFABRICRECEIPTDET grd
    //     JOIN GTSCHEDULESUNDET gsd
    //       ON gsd.gtfabricreceiptdetid = grd.gtfabricreceiptdetid
    //     WHERE grd.gtfabricreceiptid = gr.gtfabricreceiptid
    //       AND gsd.sno = grd.pcs
    //   )
    // `;
    //     const sql = `
    //   SELECT gr.gtfabricreceiptid, gr.docid
    //   FROM GTFABRICRECEIPT gr
    // `;

    const sql = `
SELECT DISTINCT
    A.gtfabricreceiptid,
    A.docid
FROM GTFABRICRECEIPT A
JOIN GTFABRICRECEIPTDET B 
    ON B.GTFABRICRECEIPTID = A.GTFABRICRECEIPTID
LEFT JOIN GTSCHEDULESUNDET S
    ON S.GTFABRICRECEIPTDETID = B.GTFABRICRECEIPTDETID
LEFT JOIN GTCOMPMAST G 
    ON G.GTCOMPMASTID = A.COMPCODE    
WHERE 
    B.SETNO IS NOT NULL
    AND G.GTCOMPMASTID = '${companyId}'
GROUP BY
    A.GTFABRICRECEIPTID,
    A.DOCID,
    B.GTFABRICRECEIPTDETID,
    B.SETNO,
    B.PCS
HAVING
    COUNT(S.GTSCHEDULESUNDETID) != B.PCS
    OR COUNT(CASE WHEN S.MTR IS NULL OR S.MTR = 0 THEN 1 END) > 0
ORDER BY
    A.GTFABRICRECEIPTID`;

    console.log(sql, "sql for Piecereceipt");
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
    if (connection) {
      await connection.close(); // returns to pool — does NOT destroy
    }
  }
}
export async function getSetNo(req, res) {
  let connection;
  const { selectedLotId } = req.params;
  console.log(selectedLotId, "received params");

  try {
    connection = await getConnection();
    // const sql = `
    //   SELECT
    //       A.GTFABRICRECEIPTID,
    //       B.GTFABRICRECEIPTDETID AS GRIDID,
    //       B.SETNO
    //   FROM GTFABRICRECEIPT A
    //   JOIN GTFABRICRECEIPTDET B
    //       ON B.GTFABRICRECEIPTID = A.GTFABRICRECEIPTID
    //   WHERE A.GTFABRICRECEIPTID = '${selectedLotId}'
    //   AND B.SETNO IS NOT NULL

    // `;

    const sql = `
    SELECT 
    A.GTFABRICRECEIPTID,
    B.GTFABRICRECEIPTDETID AS GRIDID,
    B.SETNO
FROM GTFABRICRECEIPT A
JOIN GTFABRICRECEIPTDET B 
    ON B.GTFABRICRECEIPTID = A.GTFABRICRECEIPTID
LEFT JOIN GTSCHEDULESUNDET S
    ON S.GTFABRICRECEIPTDETID = B.GTFABRICRECEIPTDETID
WHERE 
    A.GTFABRICRECEIPTID = '${selectedLotId}'
    AND B.SETNO IS NOT NULL
GROUP BY
    A.GTFABRICRECEIPTID,
    B.GTFABRICRECEIPTDETID,
    B.SETNO,
    B.PCS
HAVING
    COUNT(S.GTSCHEDULESUNDETID) != B.PCS
    OR COUNT(CASE WHEN S.MTR IS NULL OR S.MTR = 0 THEN 1 END) > 0
ORDER BY
    B.GTFABRICRECEIPTDETID`;

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

export async function get(req, res) {
  let connection;

  try {
    connection = await getConnection();
    const sql = `

       SELECT

        R.GTFABRICRECEIPTID,
        R.DOCID,

        D.GTFABRICRECEIPTDETID,
        D.CLOTHNAME as clothId,
        C.CLOTHNAME,
        S.GTSCHEDULESUNDETID,
        S.SNO,
        S.MTR

      FROM GTFABRICRECEIPT R

      LEFT JOIN GTFABRICRECEIPTDET D
        ON R.GTFABRICRECEIPTID = D.GTFABRICRECEIPTID
LEFT JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = D.CLOTHNAME 

      LEFT JOIN Gtschedulesundet S
        ON D.GTFABRICRECEIPTDETID = S.GTFABRICRECEIPTDETID

      ORDER BY
        R.GTFABRICRECEIPTID,
        D.GTFABRICRECEIPTDETID,
        S.SNO




    `;

    const result = await connection.execute(sql);

    // Convert rows to object
    const rows = result.rows.map((row) => {
      let obj = {};

      result.metaData.forEach(({ name }, i) => {
        obj[name] = row[i];
      });

      return obj;
    });

    // ✅ Separate Parent per Child
    const parentChildMap = {};
    const finalData = [];

    rows.forEach((row) => {
      // skip if no child
      if (!row.GTFABRICRECEIPTDETID) return;

      const key = row.GTFABRICRECEIPTID + "_" + row.GTFABRICRECEIPTDETID;

      // Create new parent object for each child
      if (!parentChildMap[key]) {
        parentChildMap[key] = {
          receiptId: row.GTFABRICRECEIPTID,
          docId: row.DOCID,

          details: [
            {
              detId: row.GTFABRICRECEIPTDETID,
              clothId: row.CLOTHID, // ✅ added
              clothName: row.CLOTHNAME, // ✅ added
              schedules: [],
            },
          ],
        };

        finalData.push(parentChildMap[key]);
      }

      // Add schedules
      if (row.SNO) {
        parentChildMap[key].details[0].schedules.push({
          sno: row.SNO,
          mtr: row.MTR,
        });
      }
    });

    res.json({
      statusCode: 0,
      data: finalData,
    });
  } catch (err) {
    console.log(err);

    res.json({
      statusCode: 1,
      data: [],
    });
  } finally {
    await connection.close();
  }
}

export async function getOne(req, res) {
  let connection;

  try {
    connection = await getConnection();

    const { selectedLotId, selectedGridId } = req.params;

    const sql = `
      SELECT
        D.GTFABRICRECEIPTDETID,
        C.CLOTHNAME,
        D.PCS,
        D.MTRS AS TOTAL_MTR,

        S.GTSCHEDULESUNDETID,
        S.PCSSNNO,
        s.MTR

      FROM GTFABRICRECEIPT R

      LEFT JOIN GTFABRICRECEIPTDET D
        ON R.GTFABRICRECEIPTID = D.GTFABRICRECEIPTID

      LEFT JOIN GTCLOTHCREATION C
        ON C.GTCLOTHCREATIONID = D.CLOTHNAME

      LEFT JOIN GTSCHEDULESUNDET S
        ON D.GTFABRICRECEIPTDETID = S.GTFABRICRECEIPTDETID

      WHERE
        R.GTFABRICRECEIPTID = :lotId
        AND D.GTFABRICRECEIPTDETID = :gridId

      ORDER BY
        S.PCSSNNO
    `;

    const result = await connection.execute(sql, {
      lotId: selectedLotId,
      gridId: selectedGridId,
    });

    // 🔹 Convert rows to objects
    const rows = result.rows.map((row) => {
      const obj = {};
      result.metaData.forEach(({ name }, i) => {
        obj[name] = row[i];
      });
      return obj;
    });

    // 🔹 Build final structure
    let finalObj = null;

    rows.forEach((row) => {
      if (!row.GTFABRICRECEIPTDETID) return;

      // Create main object once
      if (!finalObj) {
        finalObj = {
          clothName: row.CLOTHNAME,
          pcs: row.PCS,
          meters: row.TOTAL_MTR,
          lotItemsSubGrid: [],
        };
      }

      // Add child rows
      if (row.GTSCHEDULESUNDETID) {
        finalObj.lotItemsSubGrid.push({
          gtscheduleSunDetId: row.GTSCHEDULESUNDETID,
          pcs: row.PCSSNNO,
          mtr: row.MTR,
        });
      }
    });

    res.json({
      statusCode: 0,
      data: finalObj ? [finalObj] : [],
    });
  } catch (err) {
    console.log(err);

    res.json({
      statusCode: 1,
      data: [],
    });
  } finally {
    if (connection) await connection.close();
  }
}

export async function update(req, res) {
  let connection;

  try {
    connection = await getConnection();
    const { lotItems } = req.body;
    console.log(lotItems, "updatinglotItems");

    for (const item of lotItems) {
      const sql = `
        UPDATE GTSCHEDULESUNDET
        SET SNO = :pcNo,
            MTR = :meters,
            CHK = 1,
            NOTES1 = 'TabUser'
        WHERE GTSCHEDULESUNDETID = :subgridId
      `;

      await connection.execute(
        sql,
        {
          pcNo: item.pcNo,
          meters: item.meters,
          subgridId: item.subgridId,
        },
        { autoCommit: false },
      );
    }

    await connection.commit();

    res.json({
      statusCode: 0,
      message: "Saved Successfully",
    });
  } catch (err) {
    console.log(err);

    await connection.rollback();

    res.json({
      statusCode: 1,
      message: "Error",
    });
  } finally {
    await connection.close();
  }
}

export async function getLoomAndWeaver(req, res) {
  let connection;

  try {
    connection = await getConnection();

    const { lotId, pcno } = req.params;

    if (!lotId || !pcno) {
      return res.status(400).json({
        statusCode: 1,
        message: "lotId and pcno are required",
      });
    }

    const result = await connection.execute(
      `
  SELECT LOOMNO, WEAVERPCSNO
  FROM GTSCHEDULESUNDET
  WHERE GTFABRICRECEIPTID = :lotId
    AND SNO = :pcno
  `,
      {
        lotId: { val: lotId },
        pcno: { val: pcno },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        statusCode: 1,
        message: "No matching record found",
      });
    }

    const row = result.rows[0];

    return res.json({
      statusCode: 0,
      data: {
        loomNo: row.LOOMNO,
        weaverPieceNo: row.WEAVERPCSNO,
      },
    });
  } catch (err) {
    console.error("Oracle Error:", err);

    return res.status(500).json({
      statusCode: 1,
      message: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Connection close error:", err);
      }
    }
  }
}
