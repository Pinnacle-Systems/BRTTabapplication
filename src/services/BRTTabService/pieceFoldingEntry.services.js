import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
import oracledb from "oracledb";

export async function getFoldingPending(req, res) {
  let connection;
  const { companyId } = req.query;

  try {
    connection = await getConnection();
    const sql = `select FR.DOCID,GT.RECEIPTNO from Gtpiecesdefectdet   GT
    JOIN Gtpiecesdefect A ON A.GTPIECESDEFECTID = GT.GTPIECESDEFECTID
LEFT JOIN gtfabricreceipt FR ON FR.GTFABRICRECEIPTID = GT.RECEIPTNO
where A.COMPCODE = ${companyId}
ORDER BY RECEIPTNO
`;

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
    GS.WEAVERPCSNO,
    DT.WIDTH,
    DT.PICK

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
    setNo,
    companyId,
    pickup,
    width,
  } = req.body;

  const { selectedLotNo } = req.params;

  let connection;

  try {
    console.log("========== updateFoldingEntry START ==========");
    console.log("Body:", req.body);
    console.log("Params:", req.params);

    console.log("1. Getting connection...");
    connection = await getConnection();
    console.log("1. Connection acquired");

    let docId;

    // =====================================================
    // CHECK WHETHER LOT ALREADY EXISTS
    // =====================================================

    console.log("2. Checking PCS_APPROVAL...");

    const lotCheck = await connection.execute(
      `
      SELECT DOCID
      FROM PCS_APPROVAL
      WHERE LOTNO = :lotNo
      `,
      {
        lotNo: selectedLotNo,
      },
    );

    console.log("2. lotCheck result:", lotCheck.rows);

    if (lotCheck.rows.length > 0) {
      docId = lotCheck.rows[0][0];

      console.log("3. Existing DOCID found:", docId);
    } else {
      console.log("4. Inserting new PCS_APPROVAL...");

      const parentResult = await connection.execute(
        `
        INSERT INTO PCS_APPROVAL
        (
          DOCID,
          LOTNO,
          APPROVAL_DATE,
          COMPANYID
        )
        VALUES
        (
          PCS_NONGRID_SEQ.NEXTVAL,
          :lotNo,
          SYSDATE,
          :companyId
        )
        RETURNING DOCID INTO :docId
        `,
        {
          lotNo: selectedLotNo,
          companyId,
          docId: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER,
          },
        },
      );

      docId = parentResult.outBinds.docId[0];

      console.log("5. New DOCID generated:", docId);
    }

    // =====================================================
    // CHECK WHETHER PIECE ALREADY EXISTS
    // =====================================================

    console.log("6. Checking PCS_APPROVAL_DETAILS...");

    const pieceCheck = await connection.execute(
      `
      SELECT ID
      FROM PCS_APPROVAL_DETAILS
      WHERE DOCID = :docId
      AND PICID = :picId
      `,
      {
        docId,
        picId: selectedPiece,
      },
    );

    console.log("6. pieceCheck result:", pieceCheck.rows);

    if (pieceCheck.rows.length > 0) {
      const existingId = pieceCheck.rows[0][0];

      console.log("7. Existing detail found:", existingId);
      console.log("8. Updating PCS_APPROVAL_DETAILS...");

      await connection.execute(
        `
        UPDATE PCS_APPROVAL_DETAILS
        SET
            TABLE_NO = :tableNo,
            FOLDER_ID = :checkerId,
            PCSNO = :pcsNo,
            MTR = :meters,
            RECEPITMTR = :receiptMtr,
            DEFECTPOINTS = :defectPoints,
            CHKMTR = :checkedMeters,
            GRADEE = :gradeName,
            WEIGHTTT = :weight,
            ACTPOITS = :actualPoints,
            FOLD_PERCENTAGE = :foldPercentage,
            SETNO = :setNo,
            LOOM_NO = :loomNo,
            WEAVERPCSNO = :weaverPieceNo,
            PICK = :pickup,
            WIDTH = :width
        WHERE ID = :id
        `,
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
          pickup,
          width,
        },
      );

      console.log("9. Detail updated successfully");
    } else {
      console.log("7. No detail found");
      console.log("8. Inserting PCS_APPROVAL_DETAILS...");

      await connection.execute(
        `
        INSERT INTO PCS_APPROVAL_DETAILS
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
          FOLD_PERCENTAGE,
          SETNO,
          LOOM_NO,
          WEAVERPCSNO,
          PICK,
          WIDTH
        )
        VALUES
        (
          PCS_APPROVAL_SEQ.NEXTVAL,
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
          :foldPercentage,
          :setNo,
          :loomNo,
          :weaverPieceNo,
          :pickup,
          :width
        )
        `,
        {
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
          pickup,
          width,
        },
      );

      console.log("9. Detail inserted successfully");
    }

    // =====================================================
    // UPDATE GTDEFECTDETTAB
    // =====================================================

    console.log("10. Updating GTDEFECTDETTAB...");

    await connection.execute(
      `
      UPDATE GTDEFECTDETTAB
      SET PCSFOLDED = 'YES'
      WHERE GTDEFECTDETTABID = :pieceId
      `,
      {
        pieceId: selectedPiece,
      },
    );

    console.log("11. GTDEFECTDETTAB updated");

    await connection.commit();

    console.log("12. Commit successful");
    console.log("========== updateFoldingEntry END ==========");

    return res.status(200).json({
      message: "Successfully Saved / Updated",
    });
  } catch (error) {
    console.error("========== ERROR ==========");
    console.error(error);

    if (connection) {
      try {
        await connection.rollback();
        console.log("Rollback completed");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Connection closed");
      } catch (closeError) {
        console.error("Close connection error:", closeError);
      }
    }
  }
}
