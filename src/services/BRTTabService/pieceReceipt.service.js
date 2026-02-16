import { getConnection } from "../../constants/db.connection.js";

export async function getLotNo(req, res) {
  const connection = await getConnection(res);
  //   const { branch } = req.query;

  try {
    const sql = `select gtfabricreceiptid,docid from gtfabricreceipt`;
    console.log(sql, "sql for Piecereceipt");
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
  const { selectedLotId } = req.params;
  console.log(selectedLotId, "received params");

  try {
    const sql = `SELECT A.GTFABRICRECEIPTID,B.GTFABRICRECEIPTDETID,B.LOTNO1,B.CLOTHNAME as clothId,C.CLOTHNAME,B.PCS,B.MTRS
FROM GTFABRICRECEIPT A
JOIN GTFABRICRECEIPTDET B ON B.GTFABRICRECEIPTID = A.GTFABRICRECEIPTID
JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = B.CLOTHNAME 
WHERE A.GTFABRICRECEIPTID='${selectedLotId}'`;
    console.log(sql, "sql for getLotDetails");
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

export async function get(req, res) {
  const connection = await getConnection(res);

  try {
    const sql = `

       SELECT

        R.GTFABRICRECEIPTID,
        R.DOCID,

        D.GTFABRICRECEIPTDETID,
        D.CLOTHNAME as clothId,
        C.CLOTHNAME,
        S.GTSCHEDULESUNDETID,
        S.SNO,
        S.MTR

      FROM GTFABRICRECEIPT R

      LEFT JOIN GTFABRICRECEIPTDET D
        ON R.GTFABRICRECEIPTID = D.GTFABRICRECEIPTID
LEFT JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = D.CLOTHNAME 

      LEFT JOIN Gtschedulesundet S
        ON D.GTFABRICRECEIPTDETID = S.GTFABRICRECEIPTDETID

      ORDER BY
        R.GTFABRICRECEIPTID,
        D.GTFABRICRECEIPTDETID,
        S.SNO




    `;

    const result = await connection.execute(sql);

    // Convert rows to object
    const rows = result.rows.map((row) => {
      let obj = {};

      result.metaData.forEach(({ name }, i) => {
        obj[name] = row[i];
      });

      return obj;
    });

    // ✅ Separate Parent per Child
    const parentChildMap = {};
    const finalData = [];

    rows.forEach((row) => {
      // skip if no child
      if (!row.GTFABRICRECEIPTDETID) return;

      const key = row.GTFABRICRECEIPTID + "_" + row.GTFABRICRECEIPTDETID;

      // Create new parent object for each child
      if (!parentChildMap[key]) {
        parentChildMap[key] = {
          receiptId: row.GTFABRICRECEIPTID,
          docId: row.DOCID,

          details: [
            {
              detId: row.GTFABRICRECEIPTDETID,
              clothId: row.CLOTHID, // ✅ added
              clothName: row.CLOTHNAME, // ✅ added
              schedules: [],
            },
          ],
        };

        finalData.push(parentChildMap[key]);
      }

      // Add schedules
      if (row.SNO) {
        parentChildMap[key].details[0].schedules.push({
          sno: row.SNO,
          mtr: row.MTR,
        });
      }
    });

    res.json({
      statusCode: 0,
      data: finalData,
    });
  } catch (err) {
    console.log(err);

    res.json({
      statusCode: 1,
      data: [],
    });
  } finally {
    await connection.close();
  }
}

export async function getOne(req, res) {
  const connection = await getConnection(res);

  try {
    const { selectedLotId, selectedGridId } = req.params;

    const sql = `

      SELECT

        R.GTFABRICRECEIPTID,
        R.DOCID,

        D.GTFABRICRECEIPTDETID,
        D.CLOTHNAME as clothId,
        C.CLOTHNAME,

        S.GTSCHEDULESUNDETID,
        S.SNO,
        S.MTR

      FROM GTFABRICRECEIPT R

      LEFT JOIN GTFABRICRECEIPTDET D
        ON R.GTFABRICRECEIPTID = D.GTFABRICRECEIPTID
LEFT JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = D.CLOTHNAME 

      LEFT JOIN Gtschedulesundet S
        ON D.GTFABRICRECEIPTDETID = S.GTFABRICRECEIPTDETID

      WHERE
        R.GTFABRICRECEIPTID = :lotId
        AND D.GTFABRICRECEIPTDETID = :clothId

      ORDER BY
        D.GTFABRICRECEIPTDETID,
        S.SNO

    `;

    const result = await connection.execute(sql, {
      lotId: selectedLotId,
      clothId: selectedGridId,
    });

    const rows = result.rows.map((row) => {
      let obj = {};

      result.metaData.forEach(({ name }, i) => {
        obj[name] = row[i];
      });

      return obj;
    });

    // ✅ Parent-child-grandchild nesting
    const parentChildMap = {};

    rows?.forEach((row) => {
      if (!row.GTFABRICRECEIPTDETID) return;

      const key = row.GTFABRICRECEIPTID + "_" + row.GTFABRICRECEIPTDETID;

      if (!parentChildMap[key]) {
        parentChildMap[key] = {
          selectedLotId: row.GTFABRICRECEIPTID,

          docId: row.DOCID,

          lotItems: [
            {
              selectedGridId: row.GTFABRICRECEIPTDETID,
              selectedClothId: row.CLOTHID,
              lotItemsSubGrid: [],
            },
          ],
        };
      }

      // ✅ Add schedules safely
      if (row.SNO !== null && row.MTR !== null) {
        parentChildMap[key]?.lotItems[0]?.lotItemsSubGrid?.push({
          sno: row.SNO,
          mtr: row.MTR,
        });
      }
    });

    const finalData = Object.values(parentChildMap);

    res.json({
      statusCode: 0,

      data: finalData,
    });
  } catch (err) {
    console.log(err);

    res.json({
      statusCode: 1,

      data: [],
    });
  } finally {
    await connection.close();
  }
}

export async function update(req, res) {
  const connection = await getConnection(res);

  try {
    const { lotItems } = req.body;
    console.log(lotItems, "updatinglotItems");

    for (const item of lotItems) {
      const sql = `

        MERGE INTO GTSCHEDULESUNDET T

        USING dual

        ON (
          T.GTFABRICRECEIPTID = :lotId
          AND T.GTFABRICRECEIPTDETID = :clothId
          AND T.SNO = :pcNo
        )

        WHEN MATCHED THEN
          UPDATE SET
            T.MTR = :meters

        WHEN NOT MATCHED THEN
          INSERT
          (
            GTSCHEDULESUNDETID,
            GTFABRICRECEIPTID,
            GTFABRICRECEIPTDETID,
            SNO,
            MTR
          )
          VALUES
          (
            :GTSCHEDULESUNDETID,
            :lotId,
            :clothId,
            :pcNo,
            :meters
          )

      `;

      await connection.execute(
        sql,
        {
          GTSCHEDULESUNDETID: Date.now(), // ✅ bind to correct column name

          lotId: item.selectedLotId,
          clothId: item.selectedGridId,
          pcNo: item.pcNo,
          meters: item.meters,
        },
        { autoCommit: false },
      );
    }

    await connection.commit();

    res.json({
      statusCode: 0,
      message: "Saved Successfully",
    });
  } catch (err) {
    console.log(err);

    await connection.rollback();

    res.json({
      statusCode: 1,
      message: "Error",
    });
  } finally {
    await connection.close();
  }
}
