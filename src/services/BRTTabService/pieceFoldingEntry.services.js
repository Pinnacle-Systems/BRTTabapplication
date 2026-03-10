import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
import oracledb from "oracledb";

export async function getFoldingPending(req, res) {
  const connection = await getConnection(res);

  try {
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

export async function getFoldingPendingById(req, res) {
  const connection = await getConnection(res);
  const { pieceId } = req.params;

  // console.log(foldingId, "lotId getPieces");

  try {
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

export async function getPieceAgainstLotNo(req, res) {
  const connection = await getConnection(res);
  const { lotNo } = req.params;

  console.log(lotNo, "lotId getPieces");

  try {
    const sql = `select 
    

         DT.TABLENOTAB,
    DT.SPLITPCSNO,
    DT.TOTPOINTSTAB,
    DT.STARTMTR,
    DT.ENDMTR,
    DT.BASEPCSNO,
    DT.GTDEFECTDETTABID AS id ,
    DT.TABAPPROVAL ,
 

    
      PD.RECEIPTNO,
    
    TB.USERNAME AS CHECKERNAME

    
    from Gtpiecesdefectdet PD
LEFT JOIN Gtdefectdettab DT ON  DT.GTPIECESDEFECTDETID = PD.GTPIECESDEFECTDETID
LEFT JOIN TABUSER TB ON TB.USERID = DT.CHECKER
WHERE PD.RECEIPTNO = ${lotNo} AND DT.TABAPPROVAL IS NOT NULL`;

    console.log(sql, "sql fro ah");

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

export async function updateFoldingEntry(req, res) {
  const {
    tableNo,
    loomNo,
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
  } = req.body;

  const { selectedLotNo } = req.params;

  const connection = await getConnection(res);

  try {
    // 1️⃣ Generate DOCID
    let docId;

    // 1️⃣ Check if LOT already exists
    const lotCheck = await connection.execute(
      `SELECT DOCID FROM PCS_APPROVAL WHERE LOTNO = :lotNo`,
      { lotNo: selectedLotNo },
    );

    if (lotCheck.rows.length > 0) {
      // LOT exists → use existing DOCID
      docId = lotCheck.rows[0][0];
    } else {
      // 2️⃣ Generate new DOCID
      const docResult = await connection.execute(
        `SELECT NVL(MAX(DOCID),0)+1 FROM PCS_APPROVAL`,
      );

      docId = docResult.rows[0][0];

      // 3️⃣ Insert Parent Table
      await connection.execute(
        `INSERT INTO PCS_APPROVAL (DOCID, LOTNO, APPROVAL_DATE)
         VALUES (:docId, :lotNo, SYSDATE)`,
        {
          docId: docId,
          lotNo: selectedLotNo,
        },
      );
    }

    // 4️⃣ Generate ID for child table
    const idResult = await connection.execute(
      `SELECT NVL(MAX(ID),0)+1 FROM PCS_APPROVAL_DETAILS`,
    );

    const detailId = idResult.rows[0][0];

    // 5️⃣ Insert Child Table
    await connection.execute(
      `INSERT INTO PCS_APPROVAL_DETAILS
      (
        ID,
        DOCID,
        TABLE_NO,
        LOOM_NO,
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
        FOLD_PERCENTAGE
      )
      VALUES
      (
        :id,
        :docId,
        :tableNo,
        :loomNo,
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
        :foldPercentage
      )`,
      {
        id: detailId,
        docId: docId,
        tableNo: tableNo,
        loomNo: loomNo,
        checkerId: checkerId,
        pcsNo: pieceNo,
        picId: selectedPiece,
        meters: meters,
        receiptMtr: meters,
        defectPoints: defectPoints,
        checkedMeters: checkedMeters,
        gradeName: gradeName,
        weight: weight,
        actualPoints: actualPoints,
        foldPercentage: foldPercentage,
      },
    );

    await connection.commit();

    return res.status(200).json({
      message: `Successfully Saved`,
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
