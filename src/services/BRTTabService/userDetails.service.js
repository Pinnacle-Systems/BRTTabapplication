import { getConnection } from "../../constants/db.connection.js";
import oracledb from "oracledb";

export async function getActiveWorkersAndTables(req, res) {
  let connection;
  try {
    connection = await getConnection();

    // ── Active Workers ──────────────────────────────────────────────
    const workersResult = await connection.execute(
      `SELECT
        C.ALLOCATIONID,
        C.CHECKERID,
        U.USERNAME        AS CHECKERNAME,
        C.LOTID,
        R.DOCID           AS LOTDOCID,
        C.PIECENO,
        C.PIECEID,
        C.METERS,
        C.CHECKINGSECTIONID,
        S.SECTIONNAME,
        C.CREATEDAT,
        (
          SELECT LISTAGG(M.CHECKINGNO, ',')
          WITHIN GROUP (ORDER BY M.CHECKINGNO)
          FROM CheckerWorkingTables WT
          JOIN GTCHKTABLEMAST M
            ON M.GTCHKTABLEMASTID = WT.GTCHKTABLEMASTID
          WHERE WT.ALLOCATIONID = C.ALLOCATIONID
        ) AS TABLENOS
      FROM CheckerWorkingDetails C
      LEFT JOIN TABUSER U ON U.USERID = C.CHECKERID
      LEFT JOIN GTFABRICRECEIPT R ON R.GTFABRICRECEIPTID = C.LOTID
      LEFT JOIN GTCHECKINGMAST S ON S.GTCHECKINGMASTID = C.CHECKINGSECTIONID
      ORDER BY C.CREATEDAT DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    // ── Locked Tables ───────────────────────────────────────────────
    const tablesResult = await connection.execute(
      `SELECT
        M.GTCHKTABLEMASTID,
        M.CHECKINGNO,
        M.TABLEAVAILBLE,
        M.TABLEUSERID,
        U.USERNAME AS LOCKEDBYNAME,
        M.TABDATE
      FROM GTCHKTABLEMAST M
      LEFT JOIN TABUSER U ON U.USERID = M.TABLEUSERID
      WHERE UPPER(M.TABLEAVAILBLE) = 'NO'
      ORDER BY M.CHECKINGNO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    return res.json({
      statusCode: 0,
      data: {
        activeWorkers: workersResult.rows,
        lockedTables: tablesResult.rows,
      },
    });
  } catch (err) {
    console.error("Error retrieving active workers and tables:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}
