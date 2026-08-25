import { getConnection } from "../../constants/db.connection.js";

export async function getDocId(req, res) {
  let connection;

  try {
    const { companyName, finYear } = req.params;
    connection = await getConnection();

    const sql = `
 SELECT A.*
            FROM AUTOGENERATE A 
            WHERE A.TX_VIEW_ID = 'packing_slip'
              AND A.PREFIX LIKE '%'||:finYear||'%' 
              AND A.PREFIX LIKE '%'||:compcode||'%'
`;

    console.log(sql, "sql for getDocId");
    const result = await connection.execute(sql, {
      finYear: finYear,
      compcode: companyName,
    });

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

export async function getBarCodeData(req, res) {
  let connection;
  const { companyName, barCode } = req.params;

  const joinedSql = `
   SELECT A.LOTNO,A.SPLITNO,A.GRADE,A.LOOMNO,SUM(A.STOCKMTRS) STOCKMTRS,A.WEIGHTCALS,A.CLOTHNAME, 
A.FOLDPER,A.ORDERNO,A.SUPPLIER,A.DOCID,A.TTYPE,
ROUND(SUM(A.AMOUNT) / SUM(A.STOCKMTRS), 2)  AVG_RATE,A.LOCID,A.STOREID,A.ENDCOUNT,A.WEAVERPCSWNO,A.SETNO,A.BARCODE, B.GTCLOTHCREATIONID AS CLOTHID
FROM GTFABRICSTOCKMAST A 
LEFT JOIN GTCLOTHCREATION B ON B.CLOTHNAME = A.CLOTHNAME
WHERE A.COMPCODE=:COMPCODE AND A.STOCKCONTROL='SPLIT PIECE NO STOCK' AND A.BARCODE = :BARCODE
AND A.TTYPE='UNPACKING PCS'
GROUP BY A.LOTNO,A.SPLITNO,A.GRADE,A.LOOMNO,A.WEIGHTCALS,A.FOLDPER,A.ORDERNO,A.SUPPLIER,A.DOCID,A.TTYPE,A.CLOTHNAME,A.LOCID,A.STOREID,A.ENDCOUNT,
A.WEAVERPCSWNO,A.SETNO,A.BARCODE, B.GTCLOTHCREATIONID
HAVING SUM (A.STOCKMTRS) >0
  `;

  try {
    connection = await getConnection();
    const result = await connection.execute(joinedSql, {
      COMPCODE: companyName,
      BARCODE: barCode,
    });

    const resp = result.rows.map((row) => {
      let obj = {};
      result.metaData.forEach(({ name }, idx) => {
        obj[name] = row[idx];
      });
      return obj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error("Error retrieving BarCodeData:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function getCurrentFinyear(req, res) {
  let connection;

  try {
    connection = await getConnection();

    const sql = `
   SELECT GTFINANCIALYEARID,FINYR,CURRENTFINYR FROM GTFINANCIALYEAR
WHERE CURRENTFINYR = 'T'`;

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

export async function getCloth(req, res) {
  let connection;

  try {
    const { companyName } = req.params;
    connection = await getConnection();

    const sql = `
  SELECT B.GTCLOTHCREATIONID,B.CLOTHNAME,C.LOOMTYNAME,B.PREFIX,100 FOLDING
FROM GTFABRICSTOCKMAST A
JOIN GTCLOTHCREATION B ON B.CLOTHNAME = A.CLOTHNAME
LEFT JOIN GTLOOMMAST C ON C.GTLOOMMASTID = B.LOOMTYP
WHERE A.COMPCODE='${companyName}' AND A.STOCKCONTROL='SPLIT PIECE NO STOCK' AND A.TTYPE='UNPACKING PCS'
GROUP BY B.GTCLOTHCREATIONID,B.CLOTHNAME,C.LOOMTYNAME,B.PREFIX
HAVING (SUM(A.STOCKMTRS) >0 )`;

    console.log(sql, "sql for getCloth");
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

export async function getGrade(req, res) {
  let connection;

  try {
    const { companyName, clothName } = req.params;
    connection = await getConnection();

    const sql = `
 SELECT A.GRADE GRADEE
FROM GTFABRICSTOCKMAST A
WHERE A.COMPCODE='${companyName}' AND A.STOCKCONTROL='SPLIT PIECE NO STOCK' AND A.TTYPE='UNPACKING PCS' AND  A.CLOTHNAME='${clothName}'
GROUP BY A.GRADE
HAVING (SUM(A.STOCKMTRS) >0 )`;

    console.log(sql, "sql for getGrade");
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

export async function getLoom(req, res) {
  let connection;

  try {
    connection = await getConnection();

    const sql = `
     SELECT GTLOOMMASTID,LOOMTYNAME,SHORTNAME FROM GTLOOMMAST
`;

    console.log(sql, "sql for getLoom");
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

export async function addPackingSlip(req, res) {
  let connection;

  try {
    const {
      companyId,
      companyName,
      finyearId,
      finyear,
      clothId,
      clothName,
      clothGrade,
      packingType,
      loomId,
      prefix,
      suffix,
      slipNo,
      docId,
      docDate,
      docTime,
      details,
      foldind,
      docPrefix,
    } = req.body;

    connection = await getConnection();

    // Generate Header ID
    const seqResult = await connection.execute(
      `SELECT packingsliptab_seq.NEXTVAL FROM DUAL`,
    );

    const packingSlipId = seqResult.rows[0][0];

    const binds = {
      p1: packingSlipId,
      p2: companyId,
      p3: finyearId,
      p4: clothId,
      p5: clothGrade,
      p6: packingType,
      p7: loomId,
      p8: prefix,
      p9: suffix,
      p10: slipNo,
      p11: docId,
      p12: docDate,
      p13: docTime,
      p14: foldind,
      p15: docPrefix,
    };

    const headerSql = `
INSERT INTO GTPACKINGSLIP
(
  GTPACKINGSLIPID,
  COMPCODE,
  FINYEAR,
  CLOTHNAME,
  CLOTHTYPE,
  PACKINGTYPE,
  LOOMNAME,
  PREFIX,
  SUFFIX,
  SLIPNO,
  DOCID,
  DOCDATE,
  DOCTIME,
  FOLDING,PRE,  CREATED_ON

)
VALUES
(
  :p1,
  :p2,
  :p3,
  :p4,
  :p5,
  :p6,
  :p7,
  :p8,
  :p9,
  :p10,
  :p11,
  TO_DATE(:p12,'DD-MM-YYYY'),
  :p13,
  :p14,:p15,  SYSDATE
)
`;
    console.log({
      companyId,
      finyearId,
      clothId,
      clothGrade,
      packingType,
      loomId,
      prefix,
      suffix,
      slipNo,
      docId,
      docDate,
      docTime,
      foldind,
      docPrefix,
    });
    await connection.execute(headerSql, binds);

    console.log("After Header");

    await connection.execute(
      `
    UPDATE AUTOGENERATE
    SET LASTNO = NVL(LASTNO,0) + 1
    WHERE PREFIX = :PREFIX
  `,
      {
        PREFIX: docPrefix,
      },
    );

    console.log("AUTOGENERATE Updated");
    // Detail Insert
    const detailSql = `
      INSERT INTO GTPACKINGSLIPDET
      (
        GTPACKINGSLIPDETID,
        GTPACKINGSLIPID,
        LOTNO,
        PCSNO,
        CLOTHTYPE1,
        LOOMNO,
        MTR,
        CLOTHNAME1,
      
        ORDERNO,
        WEAVERNAME,
       
        LOCANAME,
        STORENAME,
      
        WEAVERPCSNO,
        SETNO,
        FOLD,WEIGHTTT,
        WTMTR
      )
      VALUES
      (
        packingslipDettab_seq.NEXTVAL,
        :PACKINGSLIPID,
        :LOTNO,
        :SPLITNO,
        :GRADE,
        :LOOMNO,
        :STOCKMTRS,
        :CLOTHNAME1,
        :ORDERNO,
        :SUPPLIER,
        
        :LOCID,
        :STOREID,
   
        :WEAVERPCSWNO,
        :SETNO,
        :FOLDPER,
        :WEIGHTTT,
        :WTMTR
      )
    `;

    for (const item of details || []) {
      console.log("Before Detail");
      await connection.execute(detailSql, {
        PACKINGSLIPID: packingSlipId,
        LOTNO: item.LOTNO,
        SPLITNO: item.SPLITNO,
        GRADE: item.GRADE,
        LOOMNO: item.LOOMNO,
        STOCKMTRS: item.STOCKMTRS,
        CLOTHNAME1: item.CLOTHNAME,
        ORDERNO: item.ORDERNO,
        SUPPLIER: item.SUPPLIER,

        LOCID: item.LOCID,
        STOREID: item.STOREID,

        WEAVERPCSWNO: item.WEAVERPCSWNO,
        SETNO: item.SETNO,
        FOLDPER: item.FOLDPER,
        WEIGHTTT: item.WEIGHTCALS,
        WTMTR: Number(item.WGTMTR),
      });
    }
    console.log("After Detail");
    await connection.commit();
    console.log("After Commit");

    return res.json({
      statusCode: 0,
      message: "Packing Slip Saved Successfully",
      packingSlipId,
      totalPieces: details?.length || 0,
    });
  } catch (err) {
    console.error("Error inserting Packing Slip:");
    console.error("message =", err.message);
    console.error("errorNum =", err.errorNum);
    console.error("offset =", err.offset);
    console.error(err);

    if (connection) {
      await connection.rollback();
    }

    return res.status(500).json({
      statusCode: 1,
      error: err.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
