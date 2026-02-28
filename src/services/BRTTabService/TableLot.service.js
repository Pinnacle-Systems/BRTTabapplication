import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
import oracledb from "oracledb";

export async function getCheckingSection(req, res) {
  const connection = await getConnection(res);

  try {
    const sql = `select GTCHECKINGMASTID,SECTIONNAME from gtcheckingmast`;
    console.log(sql, "sql for getCheckingSection");
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
export async function getTables(req, res) {
  const connection = await getConnection(res);

  try {
    const sql1 = `SELECT GTCHKTABLEMASTID, CHECKINGNO,TABLEAVAILBLE FROM GTCHKTABLEMAST WHERE TABLEAVAILBLE IS NULL OR UPPER(TABLEAVAILBLE) <> 'NO'`;
    const sql = `SELECT GTCHKTABLEMASTID, CHECKINGNO, TABLEAVAILBLE FROM GTCHKTABLEMAST`;
    console.log(sql, "sql for getTables");
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
export async function getLotNo(req, res) {
  const connection = await getConnection(res);

  try {
    const sql1 = `select A.GTLOTCHKPLANID as nonGridId,A.GTLOTCHKPLANDETID as gridId,A.LOTNO from Gtlotchkplandet A`;
    const sql = `select A.LOTNO as LOTNO,B.DOCID as LOTDOCID,A.GTLOTALLOTMENTID as nongiidId,c.DOCID from gtlotallotmentdet A 
left join GTFABRICRECEIPT B ON A.LOTNO = B.GTFABRICRECEIPTID
left join GTLOTALLOTMENT c on A.GTLOTALLOTMENTID = c.GTLOTALLOTMENTID`;
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
export async function getClothName(req, res) {
  const connection = await getConnection(res);

  const { selectedLotNo } = req.params;

  console.log(selectedLotNo, "params for getClothName");

  try {
    const sql1 = `select A.GTLOTCHKPLANID as nonGridId,A.GTLOTCHKPLANDETID as gridId,A.LOTNO,A.CLOTHNAME as CLOTHID,C.CLOTHNAME from Gtlotchkplandet A
JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = A.CLOTHNAME
WHERE A.LOTNO = '${selectedLotNo}'`;
    const sql = `SELECT A.GTLOTALLOTMENTID AS NONGRIDID,A.GTLOTALLOTMENTDETID AS GRIDID,A.LOTNO AS LOTID,A.CLOTHNAME AS CLOTHID,C.CLOTHNAME,A.LOTCHKNO AS LOTCHKNOID,D.DOCID AS LOTCHEKCNO FROM GTLOTALLOTMENTDET A
JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = A.CLOTHNAME
JOIN  GTLOTCHKPLAN  D ON D.GTLOTCHKPLANID = A.LOTCHKNO
WHERE A.LOTNO = '${selectedLotNo}'`;
    console.log(sql, "sql for getClothName");
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
  const { selectedClothId, selectedLotNo, lotCheckingNoId } = req.params;

  console.log(
    selectedClothId,
    selectedLotNo,
    lotCheckingNoId,
    "params for getPieces",
  );

  try {
    //     const sql1 = `select GTLOTCHKPLANID as nonGridId,GTLOTCHKPLANDETID as gridId,GTLOTPCSSUBDETID as subGridId,PCSNO,METER from gtlotpcssubdet
    // WHERE GTLOTCHKPLANDETID ='${selectedGridId}'`;
    const sql = `SELECT BB.PCSNO,BB.METER,BB.GTLOTPCSSUBDETID as subGridId
FROM GTLOTCHKPLAN A
JOIN GTLOTCHKPLANDET B ON B.GTLOTCHKPLANID = A.GTLOTCHKPLANID
JOIN GTLOTPCSSUBDET BB ON BB.GTLOTCHKPLANID = A.GTLOTCHKPLANID
JOIN GTLOTALLOTMENTDET EE ON EE.LOTCHKNO = A.GTLOTCHKPLANID
JOIN GTLOTALLOTMENT E ON E.GTLOTALLOTMENTID = EE.GTLOTALLOTMENTID
JOIN GTFABRICRECEIPT C ON C.GTFABRICRECEIPTID =EE.LOTNO
JOIN GTCLOTHCREATION D ON D.GTCLOTHCREATIONID = EE.CLOTHNAME
WHERE A.GTLOTCHKPLANID ='${lotCheckingNoId}' AND C.GTFABRICRECEIPTID='${selectedLotNo}' AND D.GTCLOTHCREATIONID='${selectedClothId}'
AND (BB.NOTES1 IS NULL OR UPPER(BB.NOTES1) <> 'YES')`;
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
export async function update(req, res) {
  const connection = await getConnection(res);

  try {
    const {
      checkerId,
      selectedTables,
      selectedPiece,
      checkingSectionId,
      dcMeter,
      NOOFPCSSTK,
      PCSTAKEN,
      TABDATE,
      selectedSubGridId,
      NOTES1,
      storedUserId,
      selectedLotNo,
    } = req.body;
    const { selectedNonGridId, selectedGridId } = req.params;
    console.log(
      checkerId,
      selectedTables,
      selectedPiece,
      checkingSectionId,
      dcMeter,
      NOOFPCSSTK,
      PCSTAKEN,
      TABDATE,
      selectedSubGridId,
      NOTES1,
      storedUserId,
      "body updatinglotAllot",
    );
    console.log(selectedNonGridId, selectedGridId, "params updatinglotAllot");

    // ✅ Check Parent Exists
    const parentResult = await connection.execute(
      `
        SELECT 1
        FROM gtlotallotmentdet
        WHERE gtlotallotmentId = :nonGridId
        AND gtlotallotmentdetId = :gridId
        `,
      {
        nonGridId: selectedNonGridId,
        gridId: selectedGridId,
      },
      { autoCommit: false },
    );

    if (parentResult.rows.length === 0) {
      await connection.rollback();

      return res.json({
        statusCode: 1,
        message: "Parent record not found",
      });
    }
    // 🔒 SORT TABLES (prevents deadlocks)
    const sortedTables = [...selectedTables].sort(
      (a, b) => a.GTCHKTABLEMASTID - b.GTCHKTABLEMASTID,
    );

    // ✅ Insert child records

    for (const table of sortedTables) {
      const tableId = table.GTCHKTABLEMASTID;

      // ✅ ATOMIC LOCK (NO SELECT FOR UPDATE)
      const lockResult = await connection.execute(
        `
        UPDATE GTCHKTABLEMAST
        SET TABLEAVAILBLE = 'NO',
            TABLEUSERID = :userId,
            TABDATE = SYSDATE
        WHERE GTCHKTABLEMASTID = :tableId
        AND (
              TABLEAVAILBLE IS NULL
              OR TABLEAVAILBLE <> 'NO'
              OR TABLEUSERID = :userId
            )
        `,
        { tableId, userId: storedUserId },
        { autoCommit: false },
      );

      // ❌ If already locked by another user
      if (lockResult.rowsAffected === 0) {
        await connection.rollback();
        return res.status(409).json({
          statusCode: 1,
          errorCode: "TABLE_ALREADY_SELECTED",

          message: `Table ${tableId} already taken by another user`,
        });
      }
      const primaryKey = Date.now() + 1000 + Math.floor(Math.random() * 1000);
      await connection.execute(
        `
        INSERT INTO gtlotallosubdet
        (
          GTLOTALLOSUBDETID,
          GTLOTALLOTMENTID,
          GTLOTALLOTMENTDETID,
          TABLENO1
        )
        VALUES
        (
          :id,
          :nonGridId,
          :gridId,
          :tableId
        )
        `,
        {
          id: primaryKey,
          nonGridId: selectedNonGridId,
          gridId: selectedGridId,
          tableId: tableId,
        },
        { autoCommit: false },
      );
      // ✅ stock table PK
      const stockDetId = Date.now() + 1000 + Math.floor(Math.random() * 1000);

      // insert gtstockdet
      await connection.execute(
        `
        INSERT INTO gtstockdet
        (
          GTSTOCKDETID,
          GTLOTALLOTMENTID,
          GTLOTALLOSUBDETID,
          NOOFMTRSTK,
          NOOFPCSSTK,
          PCSNO,
          PCSTAKEN,
          PROCESSNAME,
          CHECKER1,
          TABDATE

        )
        VALUES
        (
          :stockDetId,
          :nonGridId,
          :primaryKey,
          :dcMeter,
          :NOOFPCSSTK,
          :selectedPiece,
          :PCSTAKEN,
          :checkingSectionId,
          :checkerId,
          SYSDATE

        )
        `,

        {
          stockDetId,
          nonGridId: selectedNonGridId,
          primaryKey,
          dcMeter,
          NOOFPCSSTK,
          selectedPiece,
          PCSTAKEN,
          checkingSectionId,
          checkerId: checkerId,
        },
        { autoCommit: false },
      );
    }
    const updateResult = await connection.execute(
      `
  UPDATE GTLOTPCSSUBDET
  SET NOTES1 = :NOTES1
  WHERE GTLOTPCSSUBDETID = :selectedSubGridId
  `,
      {
        NOTES1,
        selectedSubGridId,
      },
    );

    if (updateResult.rowsAffected === 0) {
      await connection.rollback();

      return res.json({
        statusCode: 1,
        message: "Piece not found",
      });
    }
    // 🔹 Insert into CheckerWorkingDetails
    const allocationResult = await connection.execute(
      `
  INSERT INTO CheckerWorkingDetails
  (
    CheckingSectionID,
    CheckerID,
    LotID,
    PieceNo
  )
  VALUES
  (
    :checkingSectionId,
    :checkerId,
    :lotId,
    :pieceNo
  )
  RETURNING AllocationID INTO :allocationId
  `,
      {
        checkingSectionId,
        checkerId,
        lotId: selectedLotNo,
        pieceNo: selectedPiece,
        allocationId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false },
    );

    const allocationId = allocationResult.outBinds.allocationId[0];
    for (const table of sortedTables) {
      await connection.execute(
        `
    INSERT INTO CheckerWorkingTables
    (
      AllocationID,
      GTCHKTABLEMASTID
    )
    VALUES
    (
      :allocationId,
      :tableId
    )
    `,
        {
          allocationId,
          tableId: table.GTCHKTABLEMASTID,
        },
        { autoCommit: false },
      );
    }
    await connection.commit();
    io.emit("tableUpdated", {
      tableIds: selectedTables.map((t) => t.GTCHKTABLEMASTID),
    });

    res.json({
      statusCode: 0,
      message: "Saved Successfully",
      data: {
        checkingSectionId,
        userId: storedUserId,
        checkerId: checkerId,
        tableIds: selectedTables?.map((t) => t?.GTCHKTABLEMASTID),
        lotId: selectedLotNo,
        gridId: selectedGridId,
        pieceNo: selectedPiece,
      },
    });
  } catch (err) {
    console.error("Oracle Error:", err);

    await connection.rollback();

    res.status(500).json({
      statusCode: 1,
      message: err.message,
    });
  } finally {
    await connection.close();
  }
}
export async function getWorkStatus(req, res) {
  const connection = await getConnection(res);

  try {
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
        M.CHECKINGNO
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
export async function releaseTable(req, res) {
  const connection = await getConnection(res);

  try {
    const { userId, tableId } = req.body;

    const result = await connection.execute(
      `
      UPDATE GTCHKTABLEMAST
      SET TABLEUSERID = NULL,
          TABDATE = NULL,
          TABLEAVAILBLE = NULL
      WHERE GTCHKTABLEMASTID = :tableId
      AND TABLEUSERID = :userId
      `,
      { tableId, userId },
      { autoCommit: false },
    );

    if (result.rowsAffected === 0) {
      await connection.rollback();
      return res.status(403).json({
        statusCode: 1,
        message: "You are not allowed to release this table",
      });
    }

    await connection.commit();

    io.emit("tableReleased", { tableId });

    res.json({
      statusCode: 0,
      message: "Table Released Successfully",
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({
      statusCode: 1,
      message: err.message,
    });
  } finally {
    await connection.close();
  }
}
