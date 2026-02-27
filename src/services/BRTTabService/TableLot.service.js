import { getConnection } from "../../constants/db.connection.js";
import { io } from "../../../index.js"; // adjust path properly
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
    const sql = `SELECT GTCHKTABLEMASTID, CHECKINGNO,TABLEAVAILBLE FROM GTCHKTABLEMAST WHERE TABLEAVAILBLE IS NULL OR UPPER(TABLEAVAILBLE) <> 'NO'`;
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
          CHECKER,
          TABLENO1
        )
        VALUES
        (
          :id,
          :nonGridId,
          :gridId,
          :checkerId,
          :tableId
        )
        `,
        {
          id: primaryKey,
          nonGridId: selectedNonGridId,
          gridId: selectedGridId,
          checkerId: checkerId,
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
          TABDATE,
          PROCESSNAME
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
          :TABDATE,
          :checkingSectionId
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
          TABDATE,
          checkingSectionId,
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
    await connection.commit();
    io.emit("tableUpdated", {
      tableIds: selectedTables.map((t) => t.GTCHKTABLEMASTID),
    });

    res.json({
      statusCode: 0,
      message: "Saved Successfully",
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
