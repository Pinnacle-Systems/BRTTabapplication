import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
import oracledb from "oracledb";

export async function getLotNo(req, res) {
  const connection = await getConnection(res);

  try {
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
  const connection = await getConnection(res);
  const { lotId } = req.params;

  console.log(lotId, "lotId getPieces");

  try {
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
  const connection = await getConnection(res);
  const { pieceId } = req.params;
  console.log(pieceId, "received params");

  try {
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
  const connection = await getConnection(res);

  try {
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
  const {
    pieceId,
    pieceNo,
    tableId,
    tableNo,
    startMeter,
    endMeter,
    meters,
    checkerId,
    checkingSectionId,
    defectArray,
    totalPointsSum,
    allocationId,
  } = req.body;

  const connection = await getConnection(res);

  try {
    // ✅ STEP 1
    const step1Query = `
      SELECT GTPIECESDEFECTID, LOTNO
      FROM Gtpiecesdefect
      WHERE LOTNO = :lotId
    `;

    const step1Result = await connection.execute(
      step1Query,
      { lotId }, // bind object
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (step1Result.rows.length === 0) {
      return res.status(404).json({
        message: "No record found in Gtpiecesdefect for this lotId",
      });
    }

    const { GTPIECESDEFECTID, LOTNO } = step1Result.rows[0];

    // ✅ STEP 2
    const step2Query = `
      SELECT GTPIECESDEFECTDETID,GTPIECESDEFECTID,RECEIPTNO
      FROM Gtpiecesdefectdet
      WHERE GTPIECESDEFECTID = :id
      AND RECEIPTNO = :receiptNo
    `;

    const step2Result = await connection.execute(
      step2Query,
      {
        id: GTPIECESDEFECTID,
        receiptNo: LOTNO,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    if (step2Result.rows.length === 0) {
      return res.status(404).json({
        message: "No matching record found in Gtpiecesdefectdet",
      });
    }
    const { GTPIECESDEFECTDETID } = step2Result.rows[0];

    let tableNoTabValue = null;

    if (Array.isArray(tableNo)) {
      tableNoTabValue = tableNo.join(",");
    } else if (tableNo) {
      tableNoTabValue = String(tableNo);
    }
    const primaryKey = Date.now() + 1000 + Math.floor(Math.random() * 1000);

    const insertQuery = `
      INSERT INTO Gtdefectdettab (
      
        GTDEFECTDETTABID,
        GTPIECESDEFECTID,
        GTPIECESDEFECTDETID,
        BASEPCSNO,
        TABLENOTAB,
        STARTMTR,
        ENDMTR,
        CHECKER,
        ALLACATIONID,
        PCSID,
        TOTPOINTSTAB
      )
      VALUES (
        :primaryKey,
        :piecesDefectId,
        :piecesDefectDetId,
        :basePcsNo,
        :tableNoTab,
        :startMtr,
        :meters,
        :checker,
        :allocationId,
        :pieceId,
        :totalPoints
      )
    `;

    await connection.execute(
      insertQuery,
      {
        primaryKey,
        piecesDefectId: GTPIECESDEFECTID,
        piecesDefectDetId: GTPIECESDEFECTDETID,
        basePcsNo: Number(pieceNo),
        tableNoTab: tableNoTabValue,
        startMtr: Number(startMeter),
        meters: Number(meters),
        checker: checkerId ? Number(checkerId) : null,
        allocationId: allocationId ? Number(allocationId) : null,
        pieceId: pieceId,
        totalPoints: totalPointsSum,
      },
      { autoCommit: false },
    );

    // 🔥 STEP 3 - Insert children into GTPCSDEFDET
    if (!Array.isArray(defectArray) || defectArray.length === 0) {
      throw new Error("Defect array cannot be empty");
    }
    const seen = new Set();

    for (const defect of defectArray) {
      const duplicateKey = `${defect.meter}_${defect.defectId}`;

      if (seen.has(duplicateKey)) {
        throw new Error(
          `Duplicate defect found for Meter ${defect.meter} and Defect ${defect.defectId}`,
        );
      }

      seen.add(duplicateKey);
      const childPrimaryKey = Number(
        `${Date.now()}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 100)}`,
      );
      await connection.execute(
        `
    INSERT INTO GTPCSDEFDET (
      GTPCSDEFDETID,
      GTPIECESDEFECTID,
      GTDEFECTDETTABID,
      MTRAT,
      DEFECTNAME1,
      NOOGTIME,
      DEFECTPOINS1,
      TOTPOINS1
    )
    VALUES (
      :childId,
      :piecesDefectId,
      :defectDetTabId,
      :meter,
      :defectId,
      :times,
      :points,
      :totalPoints
    )
    `,
        {
          childId: childPrimaryKey,
          piecesDefectId: GTPIECESDEFECTID,
          defectDetTabId: primaryKey,
          meter: Number(defect.meter),
          defectId: Number(defect.defectId),
          times: Number(defect.times),
          points: Number(defect.points),
          totalPoints: Number(defect.totalPoints),
        },
        { autoCommit: false },
      );
    }
   
    await connection.commit();
    return res.status(200).json({
      message: "Defect entry updated and child record inserted successfully",
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
