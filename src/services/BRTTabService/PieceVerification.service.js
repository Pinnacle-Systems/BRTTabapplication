import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
import oracledb from "oracledb";

export async function getLotNo(req, res) {
  const connection = await getConnection(res);

  try {
    const sql = `SELECT C.LOTNO,L.DOCID FROM PCS_APPROVAL C
JOIN GTFABRICRECEIPT L ON L.GTFABRICRECEIPTID = C.LOTNO`;
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

export async function getFoldingDetailsByLot(req, res) {
  const { lotNo } = req.params;

  const connection = await getConnection(res);

  try {
    // 1️⃣ Get DOCID from PCS_APPROVAL
    const docResult = await connection.execute(
      `SELECT DOCID FROM PCS_APPROVAL WHERE LOTNO = :lotNo`,
      { lotNo },
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        message: "Lot not found",
      });
    }

    const docId = docResult.rows[0][0];

    // 2️⃣ Get details from child table
    const detailsResult = await connection.execute(
      `SELECT 
    A.ID,
    A.DOCID,
    A.TABLE_NO,
    A.LOOM_NO,
    A.FOLDER_ID,
    U.USERNAME,
    A.PCSNO,
    A.PICID,
    A.MTR,
    A.RECEPITMTR,
    A.DEFECTPOINTS,
    A.CHKMTR,
    A.GRADEE,
    A.WEIGHTTT,
    A.ACTPOITS,
    A.FOLD_PERCENTAGE,
    A.NOTES
FROM PCS_APPROVAL_DETAILS A
LEFT JOIN TABUSER U 
       ON U.USERID = A.FOLDER_ID
WHERE A.DOCID = :docId AND  NVL(A.NOTES,'NO') <> 'YES' `,
      { docId },
    );

    const resp = detailsResult.rows.map((row) => {
      let obj = {};
      detailsResult.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (error) {
    console.error("Fetch Folding Details Error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
export async function updatePieceVerification(req, res) {

  const { foldingItems, lotNo } = req.body;


  const connection = await getConnection(res);


  try {

    for (const piece of foldingItems) {

      const { NOTES, ID } = piece;

      console.log("connection: ", connection)
      await connection.execute(
        `UPDATE PCS_APPROVAL_DETAILS
         SET NOTES = :status
         WHERE ID = :id`,
        {
          status: NOTES ? "YES" : "",
          id: ID
        }
      );
    console.log("piece", piece);

    }

    await connection.commit();


    return res.status(200).json({
      message: `Folding entry updated successfully for ${foldingItems?.length} items`,
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
