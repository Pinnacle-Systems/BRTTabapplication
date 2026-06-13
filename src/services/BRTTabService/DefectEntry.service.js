import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
import oracledb from "oracledb";

export async function getLotNo(req, res) {
  let connection;

  const { companyId } = req.query;

  console.log(companyId, "companyIdcheckingreceived");

  try {
    connection = await getConnection();
    const sql = `SELECT C.AllocationID,C.LotID,L.DOCID FROM CheckerWorkingDetails C
JOIN GTFABRICRECEIPT L ON L.GTFABRICRECEIPTID = C.LotID
 WHERE C.COMPANYID = ${companyId}
`;
    console.log(sql, "sql for getLotNo");
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

export async function getSavedLots(req, res) {
  let connection;
  const { companyId } = req.query;
  try {
    connection = await getConnection();
    const sql = `
      SELECT DISTINCT LOTID, DOCID FROM (
        SELECT
          C.LOTID   AS LOTID,
          R.DOCID   AS DOCID
        FROM CheckerWorkingDetails C
        JOIN GTFABRICRECEIPT R ON R.GTFABRICRECEIPTID = C.LOTID
         WHERE C.COMPANYID = ${companyId}

        UNION

       
        SELECT
          P.LOTNO   AS LOTID,
          R.DOCID   AS DOCID
        FROM Gtpiecesdefect P
        JOIN GTFABRICRECEIPT R ON R.GTFABRICRECEIPTID = P.LOTNO
        WHERE P.COMPCODE = ${companyId}
      )
      ORDER BY DOCID`;
    const result = await connection.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return res.json({ statusCode: 0, data: result.rows });
  } catch (err) {
    console.error("Error retrieving saved lots:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getPieces(req, res) {
  let connection;
  const { lotId } = req.params;

  console.log(lotId, "lotId getPieces");

  try {
    connection = await getConnection();
    const sql = `SELECT C.AllocationID,C.PIECEID,C.PIECENO FROM CheckerWorkingDetails C
WHERE  C.LOTID = ${lotId}`;
    console.log(sql, "sql for getPieces");
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

export async function getSetNO(req, res) {
  let connection;
  const { lotId, pcNo } = req.params;

  console.log(lotId, pcNo, "lotId getPieces");

  try {
    connection = await getConnection();
    const sql = `SELECT grd.SETNO
FROM GTSCHEDULESUNDET gsd
JOIN GTFABRICRECEIPTDET grd
    ON grd.GTFABRICRECEIPTDETID = gsd.GTFABRICRECEIPTDETID
WHERE gsd.GTFABRICRECEIPTID = ${lotId}
AND gsd.SNO = ${pcNo}`;
    console.log(sql, "sql for getPieces");
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

// ── Add these 2 new functions to DefectEntry.service.js ──

// export async function getSavedLots(req, res) {
//   let connection;
//   try {
//     connection = await getConnection();
//     const sql = `
//       SELECT DISTINCT
//         P.LOTNO   AS LOTID,
//         R.DOCID   AS DOCID
//       FROM Gtpiecesdefect P
//       JOIN GTFABRICRECEIPT R ON R.GTFABRICRECEIPTID = P.LOTNO
//       ORDER BY R.DOCID`;
//     const result = await connection.execute(sql, [], {
//       outFormat: oracledb.OUT_FORMAT_OBJECT,
//     });
//     return res.json({ statusCode: 0, data: result.rows });
//   } catch (err) {
//     console.error("Error retrieving saved lots:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     await connection.close();
//   }
// }

// export async function getSavedPieces(req, res) {
//   let connection;
//   const { lotId } = req.params;
//   try {
//     connection = await getConnection();
//     const sql = `
//       SELECT DISTINCT
//         T.PCSID          AS PIECEID,
//         T.BASEPCSNO      AS PIECENO,
//         T.RECEIPTMETER   AS METER,
//         T.ALLACATIONID   AS ALLOCATIONID,
//         T.LOOMNO         AS LOOMNO,
//         T.WEAVERPCSNO    AS WEAVERPCSNO,
//         T.TABLENOTAB     AS TABLENO,
//         U.USERNAME       AS CHECKERNAME,
//         T.CHECKER        AS CHECKERID
//       FROM Gtdefectdettab T
//       JOIN Gtpiecesdefect P ON P.GTPIECESDEFECTID = T.GTPIECESDEFECTID
//       LEFT JOIN TABUSER U ON U.USERID = T.CHECKER
//       WHERE P.LOTNO = :lotId
//       ORDER BY T.BASEPCSNO`;
//     const result = await connection.execute(
//       sql,
//       { lotId: Number(lotId) },
//       {
//         outFormat: oracledb.OUT_FORMAT_OBJECT,
//       },
//     );
//     return res.json({ statusCode: 0, data: result.rows });
//   } catch (err) {
//     console.error("Error retrieving saved pieces:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     await connection.close();
//   }
// }

export async function getSavedPieces(req, res) {
  let connection;
  const { lotId } = req.params;

  if (!lotId || isNaN(Number(lotId))) {
    return res.status(400).json({ error: "Invalid or missing lotId" });
  }

  try {
    connection = await getConnection();
    const sql = `
      SELECT DISTINCT PIECEID, PIECENO, METER, ALLOCATIONID,
             LOOMNO, WEAVERPCSNO, TABLENO, CHECKERNAME, CHECKERID,
             CHECKINGSECTIONID, SECTIONNAME
      FROM (
       
        SELECT
          C.PIECEID        AS PIECEID,
          C.PIECENO        AS PIECENO,
          C.METERS         AS METER,
          C.ALLOCATIONID   AS ALLOCATIONID,
          SC.LOOMNO        AS LOOMNO,
          SC.WEAVERPCSNO   AS WEAVERPCSNO,
          (
            SELECT LISTAGG(M.CHECKINGNO, ',')
            WITHIN GROUP (ORDER BY M.CHECKINGNO)
            FROM CheckerWorkingTables WT
            JOIN GTCHKTABLEMAST M
              ON M.GTCHKTABLEMASTID = WT.GTCHKTABLEMASTID
            WHERE WT.ALLOCATIONID = C.ALLOCATIONID
          )                AS TABLENO,
          U.USERNAME       AS CHECKERNAME,
          C.CHECKERID      AS CHECKERID,
          C.CHECKINGSECTIONID AS CHECKINGSECTIONID,
          S.SECTIONNAME    AS SECTIONNAME
        FROM CheckerWorkingDetails C
        LEFT JOIN TABUSER U ON U.USERID = C.CHECKERID
        LEFT JOIN GTCHECKINGMAST S ON S.GTCHECKINGMASTID = C.CHECKINGSECTIONID
        LEFT JOIN GTSCHEDULESUNDET SC
          ON SC.GTFABRICRECEIPTID = C.LOTID
          AND SC.SNO = C.PIECENO
        WHERE C.LOTID = :lotId

        UNION

        
        SELECT DISTINCT
          T.PCSID            AS PIECEID,
          T.BASEPCSNO        AS PIECENO,
          T.RECEIPTMETER     AS METER,
          T.ALLACATIONID     AS ALLOCATIONID,
          T.LOOMNO           AS LOOMNO,
          T.WEAVERPCSNO      AS WEAVERPCSNO,
          T.TABLENOTAB       AS TABLENO,
          U.USERNAME         AS CHECKERNAME,
          T.CHECKER          AS CHECKERID,
          T.CHECKINGSECTION  AS CHECKINGSECTIONID,   -- ← now stored
          S.SECTIONNAME      AS SECTIONNAME          -- ← join to get name
        FROM Gtdefectdettab T
        JOIN Gtpiecesdefect P ON P.GTPIECESDEFECTID = T.GTPIECESDEFECTID
        LEFT JOIN TABUSER U ON U.USERID = T.CHECKER
        LEFT JOIN GTCHECKINGMAST S ON S.GTCHECKINGMASTID = T.CHECKINGSECTION
        WHERE P.LOTNO = :lotId
      )
      ORDER BY PIECENO`;

    const result = await connection.execute(
      sql,
      { lotId: Number(lotId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    return res.json({ statusCode: 0, data: result.rows });
  } catch (err) {
    console.error("Error retrieving saved pieces:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}
export async function getLotDetails(req, res) {
  let connection;
  const { pieceId } = req.params;
  console.log(pieceId, "received params");

  try {
    connection = await getConnection();
    const sql = `SELECT  C.CheckingSectionID,
        S.SECTIONNAME,
        C.CheckerID,
        U.USERNAME,
        C.PieceNo,
         C.METERS,
        T.GTCHKTABLEMASTID,
        M.CHECKINGNO as tableNo
       
    FROM CheckerWorkingDetails C
    JOIN GTCHECKINGMAST S ON S.GTCHECKINGMASTID = C.CheckingSectionID
    JOIN TABUSER U ON U.USERID = C.CheckerID
    JOIN CheckerWorkingTables T ON T.AllocationID = C.AllocationID
    JOIN GTCHKTABLEMAST M ON M.GTCHKTABLEMASTID = T.GTCHKTABLEMASTID
    WHERE C.PIECEID = ${pieceId}`;
    console.log(sql, "sql for getLotDetails");
    const result = await connection.execute(sql);

    const rows = result.rows;
    // ← Guard: no rows found for this pieceId
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        statusCode: 1,
        message: `No details found for pieceId: ${pieceId}`,
      });
    }
    const workData = {
      checkingSectionId: rows[0][0],
      sectionName: rows[0][1],
      checkerId: rows[0][2],
      checkerName: rows[0][3],
      pieceNo: rows[0][4],
      meters: rows[0][5],
      tables: rows.map((r) => ({
        tableId: r[6],
        checkingNo: r[7],
      })),
    };

    res.json({
      statusCode: 0,
      data: workData,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function getDefects(req, res) {
  let connection;

  try {
    connection = await getConnection();
    const sql = `select GTPIECEDEFMASTID,DEFECTNAME,POINTS from gtpiecedefmast`;
    console.log(sql, "sql for getDefects");
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

export async function updateDefectEntry(req, res) {
  const { lotId } = req.params;
  const { Lot, deleteWorkStatus } = req.body;

  // Validate Lot array
  if (!Array.isArray(Lot) || Lot.length === 0) {
    return res.status(400).json({ message: "Lot array cannot be empty" });
  }

  let connection;

  try {
    connection = await getConnection();
    // ✅ STEP 1 — Fetch GTPIECESDEFECTID and LOTNO once (same for all pieces)
    const step1Result = await connection.execute(
      `SELECT GTPIECESDEFECTID, LOTNO
       FROM Gtpiecesdefect
       WHERE LOTNO = :lotId`,
      { lotId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (step1Result.rows.length === 0) {
      return res.status(404).json({
        message: "No record found in Gtpiecesdefect for this lotId",
      });
    }

    const { GTPIECESDEFECTID, LOTNO } = step1Result.rows[0];

    // ✅ STEP 2 — Fetch GTPIECESDEFECTDETID once (same for all pieces)
    const step2Result = await connection.execute(
      `SELECT GTPIECESDEFECTDETID, GTPIECESDEFECTID, RECEIPTNO
       FROM Gtpiecesdefectdet
       WHERE GTPIECESDEFECTID = :id
       AND RECEIPTNO = :receiptNo`,
      { id: GTPIECESDEFECTID, receiptNo: LOTNO },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (step2Result.rows.length === 0) {
      return res.status(404).json({
        message: "No matching record found in Gtpiecesdefectdet",
      });
    }

    const { GTPIECESDEFECTDETID } = step2Result.rows[0];
    const pieceId = Lot[0].pieceId;
    const allocationId = Lot[0].allocationId; // ←

    // ✅ STEP 3 — Find existing GTDEFECTDETTABID(s) for this piece
    const existingTabResult = await connection.execute(
      `SELECT GTDEFECTDETTABID
       FROM Gtdefectdettab
       WHERE GTPIECESDEFECTID = :piecesDefectId
       AND PCSID = :pieceId`,
      { piecesDefectId: GTPIECESDEFECTID, pieceId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const existingTabIds = existingTabResult.rows.map(
      (r) => r.GTDEFECTDETTABID,
    );

    // ✅ STEP 4 — Delete child defects first, then parent tab rows
    if (existingTabIds.length > 0) {
      // Delete children from GTPCSDEFDET for all existing tab IDs
      for (const tabId of existingTabIds) {
        await connection.execute(
          `DELETE FROM GTPCSDEFDET WHERE GTDEFECTDETTABID = :tabId`,
          { tabId },
          { autoCommit: false },
        );
      }

      // Delete parent rows from Gtdefectdettab
      await connection.execute(
        `DELETE FROM Gtdefectdettab
         WHERE GTPIECESDEFECTID = :piecesDefectId
         AND PCSID = :pieceId`,
        { piecesDefectId: GTPIECESDEFECTID, pieceId },
        { autoCommit: false },
      );
    }
    // ✅ STEP 3 — Loop through each piece in the Lot array
    for (const piece of Lot) {
      const {
        pieceId,
        pieceNo,
        subPieceNo, // only present for split pieces
        tableId,
        tableNo,
        startMeter,
        endMeter,
        meters,
        checkerId,
        checkingSectionId,
        allocationId,
        totalPointsSum,
        defects,
        actualMeters,
        loomNo, // ← add
        weaverPcsNo,
        setNo,
        originalPieceNo,
        isCompleted,
        pick,
        width,
      } = piece;

      // Validate defects for each piece
      if (!Array.isArray(defects) || defects.length === 0) {
        throw new Error(
          `Defect array cannot be empty for piece ${subPieceNo || pieceNo}`,
        );
      }

      // Build tableNoTab string
      let tableNoTabValue = null;
      if (Array.isArray(tableNo)) {
        tableNoTabValue = tableNo.join(",");
      } else if (tableNo) {
        tableNoTabValue = String(tableNo);
      }

      // Generate unique primary key for this piece's tab record
      const primaryKey = Number(
        `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      );

      // ✅ Insert into Gtdefectdettab — one row per piece (original or split)
      const subDetResult = await connection.execute(
        `INSERT INTO Gtdefectdettab (
          GTDEFECTDETTABID,
          GTPIECESDEFECTID,
          GTPIECESDEFECTDETID,
          BASEPCSNO,
          SPLITPCSNO,
          TABLENOTAB,
          STARTMTR,
          ENDMTR,
          CHECKER,
          ALLACATIONID,
          PCSID,
          TOTPOINTSTAB,
          ACTUALMETER,
          RECEIPTMETER,
           LOOMNO,        
          WEAVERPCSNO,
          CHECKINGSECTION,
          SETNO,
          OGPCSNO,
          ISCOMPLETED,PICK,WIDTH
        ) VALUES (
          defectsubgridseq.NEXTVAL,
          :piecesDefectId,
          :piecesDefectDetId,
          :basePcsNo,
          :subPcsNo,
          :tableNoTab,
          :startMtr,
          :endMtr,
          :checker,
          :allocationId,
          :pieceId,
          :totalPoints,
          :actualMeters,
          :meters,
          :loomNo,   
          :weaverPcsNo,
          :checkingSectionId,
          :setNo,
          :originalPieceNo,
          :isCompleted,
          :pick,
          :width
        )
          RETURNING GTDEFECTDETTABID INTO :subDetId
        `,
        {
          // primaryKey,
          piecesDefectId: GTPIECESDEFECTID,
          piecesDefectDetId: GTPIECESDEFECTDETID,
          basePcsNo: Number(pieceNo),
          subPcsNo: subPieceNo || null, // null for original piece, "1A"/"1B" for splits
          tableNoTab: tableNoTabValue,
          startMtr: Number(startMeter),
          endMtr: Number(endMeter), // endMeter per piece (important for splits)
          checker: checkerId ? Number(checkerId) : null,
          allocationId: allocationId ? Number(allocationId) : null,
          pieceId: pieceId,
          totalPoints: totalPointsSum,
          actualMeters: Number(actualMeters),
          meters: Number(meters),
          loomNo: loomNo || null, // ← add
          weaverPcsNo: weaverPcsNo || null,
          checkingSectionId: Number(checkingSectionId),
          setNo: setNo,
          originalPieceNo: originalPieceNo,
          isCompleted: isCompleted ? "YES" : "NO",
          pick: Number(pick),
          width: Number(width),
          subDetId: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
        },
        { autoCommit: false },
      );
      const subDetId = subDetResult.outBinds.subDetId[0];

      // ✅ Insert defects for this piece into GTPCSDEFDET
      const seen = new Set();

      for (const defect of defects) {
        const duplicateKey = `${defect.meter}_${defect.defectId}`;

        if (seen.has(duplicateKey)) {
          throw new Error(
            `Duplicate defect found for Meter ${defect.meter} and Defect ${defect.defectId} in piece ${subPieceNo || pieceNo}`,
          );
        }

        seen.add(duplicateKey);

        const childPrimaryKey = Number(
          `${Date.now()}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 100)}`,
        );

        await connection.execute(
          `INSERT INTO GTPCSDEFDET (
            GTPCSDEFDETID,
            GTPIECESDEFECTID,
            GTDEFECTDETTABID,
            MTRAT,
            DEFECTNAME1,
            NOOGTIME,
            DEFECTPOINS1,
            TOTPOINS1,
            SPLITPCSNO1,
            BASEPCSNO1
          ) VALUES (
            defectsubsubgridseq.NEXTVAL,
            :piecesDefectId,
            :subDetId,
            :meter,
            :defectId,
            :times,
            :points,
            :totalPoints,            
            :subPieceNo,
            :pieceNo
          )`,
          {
            // childId: childPrimaryKey,
            piecesDefectId: GTPIECESDEFECTID,
            // defectDetTabId: primaryKey,
            subDetId,
            meter: Number(defect.meter),
            defectId: Number(defect.defectId),
            times: Number(defect.times),
            points: Number(defect.points),
            totalPoints: Number(defect.totalPoints),
            pieceNo: Number(pieceNo),
            subPieceNo: subPieceNo,
          },
          { autoCommit: false },
        );
      }
    }
    // ✅ STEP 5 — If completed checkbox was ticked, clean up work status
    if (deleteWorkStatus === true && allocationId) {
      // Update GTCHKTABLEMAST — reset TABLEAVAILBLE to NULL
      await connection.execute(
        `UPDATE GTCHKTABLEMAST
     SET TABLEAVAILBLE = NULL
     WHERE TABLEAVAILBLE = 'NO'
     AND GTCHKTABLEMASTID IN (
       SELECT GTCHKTABLEMASTID
       FROM CheckerWorkingTables
       WHERE AllocationID = :allocationId
     )`,
        { allocationId },
        { autoCommit: false },
      );

      // Delete child first
      await connection.execute(
        `DELETE FROM CheckerWorkingDetails
     WHERE AllocationID = :allocationId`,
        { allocationId },
        { autoCommit: false },
      );

      // Delete parent
      await connection.execute(
        `DELETE FROM CheckerWorkingTables
     WHERE AllocationID = :allocationId`,
        { allocationId },
        { autoCommit: false },
      );

      console.log(
        `Work completed — tables freed for allocationId: ${allocationId}`,
      );
    }
    // ✅ Commit all inserts together
    await connection.commit();

    return res.status(200).json({
      message: `Defect entry updated successfully for ${Lot.length} piece(s)`,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Update Defect Entry Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

export async function getExistingDefectEntry(req, res) {
  let connection;
  const { lotId, pieceId } = req.params;

  try {
    connection = await getConnection();
    // Fetch the parent tab record(s) for this lot + piece
    const tabResult = await connection.execute(
      `SELECT 
        T.GTDEFECTDETTABID,
        T.BASEPCSNO,
        T.SPLITPCSNO,
        T.STARTMTR,
        T.ENDMTR,
        T.TOTPOINTSTAB,
        T.TABLENOTAB,
        T.CHECKER,
        T.ALLACATIONID,
        T.TABAPPROVAL,
        T.ISCOMPLETED,
        T.PICK,
        T.WIDTH
       FROM Gtdefectdettab T
       JOIN Gtpiecesdefect P ON P.GTPIECESDEFECTID = T.GTPIECESDEFECTID
       WHERE P.LOTNO = :lotId
       AND T.PCSID = :pieceId
       ORDER BY T.STARTMTR ASC`,
      { lotId, pieceId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (tabResult.rows.length === 0) {
      // No existing data — return empty so frontend knows to start fresh
      return res.json({ statusCode: 0, data: [] });
    }

    // For each tab row, fetch its defects from GTPCSDEFDET
    const pieces = [];

    for (const tab of tabResult.rows) {
      const defectResult = await connection.execute(
        `SELECT 
          D.GTPCSDEFDETID,
          D.MTRAT,
          D.DEFECTNAME1,
          D.NOOGTIME,
          D.DEFECTPOINS1,
          D.TOTPOINS1,
          D.SPLITPCSNO1,
          D.BASEPCSNO1,
          M.DEFECTNAME
         FROM GTPCSDEFDET D
         LEFT JOIN gtpiecedefmast M ON M.GTPIECEDEFMASTID = D.DEFECTNAME1
         WHERE D.GTDEFECTDETTABID = :tabId`,
        { tabId: tab.GTDEFECTDETTABID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      pieces.push({
        gtDefectDetTabId: tab.GTDEFECTDETTABID,
        pieceNo: tab.BASEPCSNO,
        subPieceNo: tab.SPLITPCSNO || String(tab.BASEPCSNO),
        startMeter: tab.STARTMTR,
        endMeter: tab.ENDMTR,
        totalPointsSum: tab.TOTPOINTSTAB,
        tabApproval: tab.TABAPPROVAL,
        isCompleted: tab.ISCOMPLETED === "YES",
        pick: tab.PICK,
        width: tab.WIDTH,
        defects: defectResult.rows.map((d) => ({
          meter: d.MTRAT,
          defectId: d.DEFECTNAME1,
          defectName: d.DEFECTNAME,
          points: d.DEFECTPOINS1,
          times: d.NOOGTIME,
          totalPoints: d.TOTPOINS1,
          pieceNo: d.BASEPCSNO1,
          subPieceNo: d.SPLITPCSNO1,
        })),
      });
    }

    return res.json({ statusCode: 0, data: pieces });
  } catch (err) {
    console.error("Error fetching existing defect entry:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}
