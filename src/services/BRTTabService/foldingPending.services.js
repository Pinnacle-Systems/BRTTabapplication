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
  const { lotNo } = req.params;

  // console.log(foldingId, "lotId getPieces");

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
WHERE PD.RECEIPTNO = ${lotNo} AND DT.TABAPPROVAL IS NULL AND DT.GTDEFECTDETTABID IS NOT NULL `;



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



export async function getGradeData(req,res){

    console.log("getGrdaeData")

    const connection = await getConnection(res);

  try {
    const sql = `select * from GTGRADEDET`;

    console.log(sql,"sql for get grade data")

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


export async function updateFolding(req, res) {

  const { foldingItems, lotNo } = req.body;


  const connection = await getConnection(res);


  try {

    for (const piece of foldingItems) {

      const { TABAPPROVAL, ID } = piece;

      console.log("connection: ", connection)
      await connection.execute(
        `UPDATE Gtdefectdettab
         SET TABAPPROVAL = :status
         WHERE GTDEFECTDETTABID = :id`,
        {
          status: TABAPPROVAL ? "YES" : "",
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
