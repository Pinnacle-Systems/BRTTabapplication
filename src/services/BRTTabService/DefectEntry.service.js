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