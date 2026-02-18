import { getConnection } from "../../constants/db.connection.js";

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
    const sql = `select GTCHKTABLEMASTID,CHECKINGNO from gtchktablemast`;
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
    const sql = `select A.GTLOTCHKPLANID as nonGridId,A.GTLOTCHKPLANDETID as gridId,A.LOTNO from Gtlotchkplandet A`;
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
    const sql = `select A.GTLOTCHKPLANID as nonGridId,A.GTLOTCHKPLANDETID as gridId,A.LOTNO,A.CLOTHNAME as CLOTHID,C.CLOTHNAME from Gtlotchkplandet A
JOIN GTCLOTHCREATION C ON C.GTCLOTHCREATIONID = A.CLOTHNAME
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

  const { selectedGridId } = req.params;

  console.log(selectedGridId, "params for getPieces");

  try {
    const sql = `select GTLOTCHKPLANID as nonGridId,GTLOTCHKPLANDETID as gridId,GTLOTPCSSUBDETID as subGridId,PCSNO,METER from gtlotpcssubdet
WHERE GTLOTCHKPLANDETID ='${selectedGridId}'`;
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
