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

    console.log(sql, "sql fro ah")

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