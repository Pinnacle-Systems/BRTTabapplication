import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
import oracledb from "oracledb";

export async function getFoldingPending(req, res) {
  let connection;

  try {
    connection = await getConnection();
    const sql = `select FR.DOCID,GT.RECEIPTNO from Gtpiecesdefectdet   GT
LEFT JOIN gtfabricreceipt FR ON FR.GTFABRICRECEIPTID = GT.RECEIPTNO`;

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
export async function getPieceAgainstLotNo(req, res) {
  let connection;
  const { lotNo } = req.params;

  console.log(lotNo, "lotId getPieces");

  try {
    connection = await getConnection();
    const sql = `SELECT 
    DT.TABLENOTAB,
    DT.SPLITPCSNO,
    DT.TOTPOINTSTAB,
    DT.STARTMTR,
    DT.ENDMTR,
    DT.BASEPCSNO,
    DT.GTDEFECTDETTABID AS id,
    DT.TABAPPROVAL,
    PD.RECEIPTNO,
    TB.USERNAME AS CHECKERNAME,

    GS.LOOMNO,
    GS.WEAVERPCSNO

FROM Gtpiecesdefectdet PD

LEFT JOIN Gtdefectdettab DT 
    ON DT.GTPIECESDEFECTDETID = PD.GTPIECESDEFECTDETID

LEFT JOIN TABUSER TB 
    ON TB.USERID = DT.CHECKER

LEFT JOIN GTSCHEDULESUNDET GS 
    ON GS.GTFABRICRECEIPTID = PD.RECEIPTNO
   AND GS.SNO = DT.BASEPCSNO

WHERE PD.RECEIPTNO = ${lotNo}
  AND DT.TABAPPROVAL = 'YES'
  AND NVL(DT.PCSFOLDED, 'NO') <> 'YES'
`;

    console.log(sql, "sql fro getPieceAgainstLotNo");

    const result = await connection.execute(sql);

    // console.log(result?.rows, "result.rows")

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
export async function getFoldingPendingById(req, res) {
  let connection;
  const { pieceId } = req.params;

  // console.log(foldingId, "lotId getPieces");

  try {
    connection = await getConnection();
    const sql = `select * from Gtdefectdettab GT where GT.GTDEFECTDETTABID = ${pieceId} `;
    // console.log(sql, "sql for getPieces");
    const result = await connection.execute(sql);

    // console.log(result?.metaData, "result.rows")

    const resp = result.rows.map((row) => {
      let obj = {};
      result.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });

    return res.json({ statusCode: 0, data: resp[0] });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}

export async function updateFoldingEntry(req, res) {
  const {
    tableNo,
    loomNo,
    weaverPieceNo,
    checkerId,
    selectedPiece,
    pieceNo,
    meters,
    defectPoints,
    checkedMeters,
    gradeName,
    actualPoints,
    foldPercentage,
    weight,
    receiptMeters,
    PCSFOLDED,
    setNo,
  } = req.body;

  const { selectedLotNo } = req.params;

  let connection;

  try {
    connection = await getConnection();
    let docId;

    // 1️⃣ Check if LOT already exists
    const lotCheck = await connection.execute(
      `SELECT DOCID FROM PCS_APPROVAL WHERE LOTNO = :lotNo`,
      { lotNo: selectedLotNo },
    );

    if (lotCheck.rows.length > 0) {
      docId = lotCheck.rows[0][0];
    } else {
      // Generate DOCID
      const docResult = await connection.execute(
        `SELECT NVL(MAX(DOCID),0)+1 FROM PCS_APPROVAL`,
      );

      docId = docResult.rows[0][0];

      // Insert parent
      await connection.execute(
        `INSERT INTO PCS_APPROVAL (DOCID, LOTNO, APPROVAL_DATE)
         VALUES (:docId, :lotNo, SYSDATE)`,
        {
          docId,
          lotNo: selectedLotNo,
        },
      );
    }

    // 2️⃣ Check if piece already exists
    const pieceCheck = await connection.execute(
      `SELECT ID 
       FROM PCS_APPROVAL_DETAILS
       WHERE DOCID = :docId
       AND PICID = :picId`,
      {
        docId,
        picId: selectedPiece,
      },
    );

    if (pieceCheck.rows.length > 0) {
      // 🔁 UPDATE existing record
      const existingId = pieceCheck.rows[0][0];

      await connection.execute(
        `UPDATE PCS_APPROVAL_DETAILS
         SET TABLE_NO = :tableNo,
             FOLDER_ID = :checkerId,
             PCSNO = :pcsNo,
             MTR = :meters,
             RECEPITMTR = :receiptMtr,
             DEFECTPOINTS = :defectPoints,
             CHKMTR = :checkedMeters,
             GRADEE = :gradeName,
             WEIGHTTT = :weight,
             ACTPOITS = :actualPoints,
             FOLD_PERCENTAGE = :foldPercentage,SETNO = :setNo,LOOM_NO = :loomNo,WEAVERPCSNO = :weaverPieceNo
         WHERE ID = :id`,
        {
          id: existingId,
          tableNo,
          checkerId,
          pcsNo: pieceNo,
          meters,
          receiptMtr: receiptMeters,
          defectPoints,
          checkedMeters,
          gradeName,
          weight,
          actualPoints,
          foldPercentage,
          setNo,
          loomNo,
          weaverPieceNo,
        },
      );
    } else {
      // 3️⃣ Generate new ID
      const idResult = await connection.execute(
        `SELECT NVL(MAX(ID),0)+1 FROM PCS_APPROVAL_DETAILS`,
      );

      const detailId = idResult.rows[0][0];

      // ➕ INSERT new record
      await connection.execute(
        `INSERT INTO PCS_APPROVAL_DETAILS
        (
          ID,
          DOCID,
          TABLE_NO,
         
          FOLDER_ID,
          PCSNO,
          PICID,
          MTR,
          RECEPITMTR,
          DEFECTPOINTS,
          CHKMTR,
          GRADEE,
          WEIGHTTT,
          ACTPOITS,
          FOLD_PERCENTAGE,SETNO,LOOM_NO,WEAVERPCSNO
        )
        VALUES
        (
          :id,
          :docId,
          :tableNo,
          
          :checkerId,
          :pcsNo,
          :picId,
          :meters,
          :receiptMtr,
          :defectPoints,
          :checkedMeters,
          :gradeName,
          :weight,
          :actualPoints,
          :foldPercentage,:setNo,:loomNo,:weaverPieceNo
        )`,
        {
          id: detailId,
          docId,
          tableNo,

          checkerId,
          pcsNo: pieceNo,
          picId: selectedPiece,
          meters,
          receiptMtr: receiptMeters,
          defectPoints,
          checkedMeters,
          gradeName,
          weight,
          actualPoints,
          foldPercentage,
          setNo,
          loomNo,
          weaverPieceNo,
        },
      );
    }
    // After the pieceCheck and upsert logic, add this update
    // Find the piece in Gtdefectdettab and mark PCSFOLDED = 'YES'
    await connection.execute(
      `UPDATE Gtdefectdettab
   SET PCSFOLDED = 'YES'
   WHERE GTDEFECTDETTABID = :pieceNo`,
      { pieceNo: selectedPiece },
    );
    await connection.commit();

    return res.status(200).json({
      message: "Successfully Saved / Updated",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Update Folding Entry Error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
