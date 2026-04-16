export async function getLotNo(req, res) {
  let connection;

  try {
    connection = await getConnection();
    const sql = `SELECT C.AllocationID,C.LotID,L.DOCID FROM CheckerWorkingDetails C
JOIN GTFABRICRECEIPT L ON L.GTFABRICRECEIPTID = C.LotID`;
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
      await connection.execute(
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
    WEAVERPCSNO 
        ) VALUES (
          :primaryKey,
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
    :weaverPcsNo  
        )`,
        {
          primaryKey,
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
          weaverPcsNo: weaverPcsNo || null, // ← add
        },
        { autoCommit: false },
      );

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
            :childId,
            :piecesDefectId,
            :defectDetTabId,
            :meter,
            :defectId,
            :times,
            :points,
            :totalPoints,            
            :subPieceNo,
            :pieceNo
          )`,
          {
            childId: childPrimaryKey,
            piecesDefectId: GTPIECESDEFECTID,
            defectDetTabId: primaryKey, // links to the parent tab row for this piece
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
    await connection.rollback();
    console.error("Update Defect Entry Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

export async function getWorkStatus(req, res) {
  let connection;

  try {
    connection = await getConnection();
    const { storedUserId } = req.params;

    const result = await connection.execute(
      `
      SELECT
        C.AllocationID,
        C.CheckingSectionID,
        S.SECTIONNAME,
        C.CheckerID,
        U.USERNAME,
        C.LotID,
        L.DOCID,
        C.PieceNo,
        T.GTCHKTABLEMASTID,
        M.CHECKINGNO,
        C.PIECEID,
        C.meters
      FROM CheckerWorkingDetails C
      JOIN GTCHECKINGMAST S 
        ON S.GTCHECKINGMASTID = C.CheckingSectionID
      JOIN TABUSER U 
        ON U.USERID = C.CheckerID
      JOIN GTFABRICRECEIPT L 
        ON L.GTFABRICRECEIPTID = C.LotID
      JOIN CheckerWorkingTables T 
        ON T.AllocationID = C.AllocationID
      JOIN GTCHKTABLEMAST M 
        ON M.GTCHKTABLEMASTID = T.GTCHKTABLEMASTID
      WHERE C.CheckerID = :loggedInUserId
      `,
      { loggedInUserId: storedUserId },
    );

    if (result.rows.length === 0) {
      return res.json({
        statusCode: 0,
        hasActiveWork: false,
        data: null,
      });
    }

    // 🔹 Format response properly
    const rows = result.rows;

    const workData = {
      allocationId: rows[0][0],
      checkingSectionId: rows[0][1],
      sectionName: rows[0][2],
      checkerId: rows[0][3],
      checkerName: rows[0][4],
      lotId: rows[0][5],
      docId: rows[0][6],
      pieceNo: rows[0][7],
      pieceId: rows[0][10],
      meters: rows[0][11],
      tables: rows.map((r) => ({
        tableId: r[8],
        checkingNo: r[9],
      })),
    };

    res.json({
      statusCode: 0,
      hasActiveWork: true,
      data: workData,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 1,
      message: err.message,
    });
  } finally {
    await connection.close();
  }
}
