import moment from "moment";
import { getConnection } from "../constants/db.connection.js";
import { getNextMachineAllocationDocNo } from "../queries/sequences.js";

export async function get(req, res) {
  const connection = await getConnection(res);
  try {
    const { poNo, type } = req.query;
    let poNumCondition = '';
    let statusType = '';


    if (poNo) {
      poNumCondition = ` AND A.DOCID = '${poNo}'`;
    }
    if (type) {
      statusType = ` AND A.ETYPE = '${type}'`;
    }

    let sql
    sql = `
    
 SELECT C.ALLOMACHINE,C.PENTRY,
DIA.DIA AS FABDIA,
   A.GTLABENTRYID,  H.COMPNAME AS COMPCODE1,
                      A.DOCID,
                      to_char(A.DOCDATE,'DD/MM/YYYY') as DOCDATE,
                      C.DOCID AS FABRICINWARDNO,
                      B.FABRIC,
                      B.COLOUR,
                      G.REQDIA,
                      B.RECROLL,
                      B.RECQTY,
                      B.AGSM,
                      B.BGSM,
                      B.WIDTH,
                      B.ADIA,
                      B.BDIA,
                      B.KDIA1,
                      G.AFTERGSM,
                      G.AFTERWITH,
                      G.REQGSM,
                      G.MCSPEED,
                      G.KDIA,
                      G.LOADSHELL,
                      G.FABQUAL,
                      G.OVERFEED,
                      B.FLENGTH,
                      A.ETYPE,
                      A.PARTYDCNO,
                      A.BAPPSTATUS,
                      A.AAPPSTATUS,
                       F.DOCID AS PRONUM,
                       A.CUSTOMER,
                         to_char(C.DOCDATE,'DD/MM/YYYY') as INWDATE,
                            to_char(A.BAPPSTATUSDATE,'DD/MM/YYYY') as BAPPSTATUSDATE,
                           to_char(A.AAPPSTATUSDATE,'DD/MM/YYYY') as AAPPSTATUSDATE
      FROM GTLABENTRY A
      LEFT JOIN GTLABENTRYDET B ON A.GTLABENTRYID = B.GTLABENTRYID
     RIGHT JOIN GTFABINWARD C ON C.GTFABINWARDID = A.FABINWARDNO
     LEFT JOIN GTFABINWARDDET D ON D.GTFABINWARDID = C.GTFABINWARDID
      LEFT JOIN GTMACHINEALLOCATE AL ON AL.JOBNO = A.GTLABENTRYID
      LEFT JOIN GTPRODENTRY F ON C.GTFABINWARDID = F.FABRICINWARDNO
      LEFT JOIN GTPRODENTRYDET G ON F.GTPRODENTRYID = G.GTPRODENTRYID
       LEFT join gtcompmast H ON A.COMPCODE = H.gtcompmastId
       LEFT JOIN GTDIAMAST DIA on D.DIA = DIA.GTDIAMASTID
      WHERE 1=1 ${poNumCondition} ${statusType}
      order by FINWARDNO desc

    `;




    const result = await connection.execute(sql);

    let resp = result.rows.map((i) => {
      let newObj = {};
      for (let columnIndex = 0; columnIndex < result.metaData.length; columnIndex++) {
        const element = result.metaData[columnIndex];
        newObj[element.name] = i[columnIndex];
      }
      return newObj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}

export async function getItem(req, res) {
  const connection = await getConnection(res);
  try {
    const { poNo, inwNo, type } = req.query;

    let poNumCondition = '';
    let statusType = ''
    let jobNo = ''
    if (inwNo) {
      poNumCondition = ` AND C.DOCID = '${inwNo}'`;
    }

    if (type) {
      jobNo = ` AND A.DOCID = '${poNo}'`;
    }
    let sql
    sql = `
    SELECT A.GTLABENTRYID,  H.COMPNAME AS COMPCODE1,
                      A.DOCID,
                      to_char(A.DOCDATE,'DD/MM/YYYY') as DOCDATE,
                      C.DOCID AS FABRICINWARDNO,
                      B.FABRIC,
                      B.COLOUR,
                      G.REQDIA,
                      B.RECROLL,
                      B.RECQTY,
                      B.AGSM,
                      B.BGSM,
                      B.WIDTH,
                      B.ADIA,
                      B.BDIA,
                      B.KDIA1,
                      G.AFTERGSM,
                      G.AFTERWITH,
                      G.REQGSM,
                      G.MCSPEED,
                      G.KDIA,
                      G.LOADSHELL,
                      G.FABQUAL,
                      G.OVERFEED,
                      B.FLENGTH,
                      A.ETYPE,
                      A.PARTYDCNO,
                      A.BAPPSTATUS,
                      A.AAPPSTATUS,
                       F.DOCID AS PRONUM,
                       A.CUSTOMER,
                         to_char(C.DOCDATE,'DD/MM/YYYY') as INWDATE,
                            to_char(A.BAPPSTATUSDATE,'DD/MM/YYYY') as BAPPSTATUSDATE,
                           to_char(A.AAPPSTATUSDATE,'DD/MM/YYYY') as AAPPSTATUSDATE
      FROM GTLABENTRY A
      LEFT JOIN GTLABENTRYDET B ON A.GTLABENTRYID = B.GTLABENTRYID
     RIGHT JOIN GTFABINWARD C ON C.GTFABINWARDID = A.FABINWARDNO
     LEFT JOIN GTFABINWARDDET D ON D.GTFABINWARDID = C.GTFABINWARDID
      LEFT JOIN GTMACHINEALLOCATE AL ON AL.JOBNO = A.GTLABENTRYID
      LEFT JOIN GTPRODENTRY F ON C.GTFABINWARDID = F.FABRICINWARDNO
      LEFT JOIN GTPRODENTRYDET G ON F.GTPRODENTRYID = G.GTPRODENTRYID
       LEFT join gtcompmast H ON A.COMPCODE =  H.gtcompmastId
      WHERE 1=1  ${poNumCondition} ${statusType} ${jobNo}
  
    `;




    const result = await connection.execute(sql);


    let resp = result.rows.map((i) => {
      let newObj = {};
      for (let columnIndex = 0; columnIndex < result.metaData.length; columnIndex++) {
        const element = result.metaData[columnIndex];
        newObj[element.name] = i[columnIndex];
      }
      return newObj;
    });

    return res.json({ statusCode: 0, data: resp });
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}


export async function approve(req, res) {
  const connection = await getConnection(res)
  try {
    const { type, apStatus, doc, remarks } = req.query

    let response;
    let sql;
    let params = {};

    if (apStatus !== 'REVERT') {
      if (type === 'BEFORE') {
        sql = `UPDATE GTLABENTRY a
               SET a.BAPPSTATUS = :apStatus,
                   a.BAPPSTATUSDATE = SYSDATE,
                   a.REMARKS = :remarks
               WHERE a.DOCID = :doc`;
        params = { apStatus, remarks, doc };
      } else {
        sql = `UPDATE GTLABENTRY a
               SET a.AAPPSTATUS = :apStatus,
                   a.AAPPSTATUSDATE = SYSDATE,
                   a.REMARKS = :remarks
               WHERE a.DOCID = :doc`;
        params = { apStatus, remarks, doc };
      }
    } else {
      if (type === 'BEFORE') {
        sql = `UPDATE GTLABENTRY a
               SET a.BAPPSTATUS = '',
                   a.BAPPSTATUSDATE = '',
                   a.REMARKS = ''
               WHERE a.DOCID = :doc 
                 AND a.FABINWARDNO IN (
                   SELECT INW.GTFABINWARDID
                   FROM GTFABINWARD INW
                   WHERE INW.ALLOMACHINE IS NULL
                     AND INW.PENTRY IS NULL
               )`;
        params = { doc };
      }
      //  else {
      //   sql = `UPDATE GTLABENTRY a
      //          SET a.AAPPSTATUS = '',
      //              a.AAPPSTATUSDATE = '',
      //              a.REMARKS = ''
      //          WHERE a.DOCID = :doc 
      //            AND a.FABINWARDNO IN (
      //              SELECT INW.GTFABINWARDID
      //              FROM GTFABINWARD INW
      //              WHERE INW.ALLOMACHINE IS NULL
      //                AND INW.PENTRY IS NULL
      //          )`;
      //   params = { doc };
      // }
    }


    response = await connection.execute(sql, params);
    await connection.commit();

    if (response.rowsAffected === 1) {
      return res.json({ statusCode: 0, data: "Approved" });
    } else {
      return res.json({ statusCode: 1, data: "Po Does not Exist" });
    }
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await connection.close();
  }
}


export async function getMachineMast
  (req, res) {
  const connection = await getConnection(res)

  try {

    const sql = `
   select GTMACHINEMASTID,MACHINENAME from gtMachineMast
    `


    const result = await connection.execute(sql);
    const resp = result.rows.map(del => ({
      machineId: del[0], machineNamee: del[1]
    }))
    return res.json({ statusCode: 0, data: resp })
  }
  catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    await connection.close()
  }
}

export async function getMachineAllocation(req, res) {
  const connection = await getConnection(res)

  try {
    const { allocated } = req.query
    let alldata = ''
    if (allocated === 'NotAllocated') {
      alldata = `AND C.ALLOMACHINE IS  NULL `
    } else {
      alldata = `AND C.ALLOMACHINE IS NOT NULL `
    }
    const sql = `
 SELECT DIA.Dia as FABDIA, H.COMPNAME COMPCODE1,
       A.DOCID,
        to_char(A.DOCDATE,'DD/MM/YYYY') as DOCDATE,
       C.DOCID FABRICINWARDNO,
       B.REQDIA,
       D.ROLLS AS RECROLL,
       D.WEIGHT AS RECQTY,
       B.AGSM,
       B.BGSM,
       B.WIDTH,
       B.ADIA,
       B.BDIA,
       B.KDIA1,
       B.AFTERGSM,
       B.AFTERWITH,
       B.REQGSM,
       B.MCSPEED,
       B.KDIA,
       B.LOADSHELL,
       B.FABQUAL,
       B.OVERFEED,
       A.ETYPE,
       F.FABNAME AS FABRIC,
       CL.COLORNAME AS COLOUR,
       C.DELTO AS CUSTOMER,
       to_char(C.DOCDATE,'DD/MM/YYYY')  AS INWDATE,
       A.ALLOMACHINE,
        c.ALLOMACHINE as INWMACHINEALO,
       C.pentry
FROM GTLABENTRY A
LEFT JOIN GTLABENTRYDET B ON A.GTLABENTRYID = B.GTLABENTRYID
RIGHT JOIN GTFABINWARD C ON C.GTFABINWARDID = A.FABINWARDNO
LEFT JOIN GTFABINWARDDET D ON D.GTFABINWARDID = C.GTFABINWARDID
LEFT JOIN GTMACHINEALLOCATE AL ON AL.JOBNO = A.GTLABENTRYID
LEFT JOIN gtcompmast H ON A.COMPCODE = H.GTCOMPMASTID
LEFT JOIN gtfabricmast F on D.FABNAME = F.GTFABRICMASTID
LEFT JOIN  gtcolormast CL on D.COLOUR = CL.GTCOLORMASTID
LEFT JOIN GTDIAMAST DIA on D.Dia =  DIA.GTDIAMASTID
WHERE 1=1 
AND (
    A.BAPPSTATUS = 'APPROVED' 
    OR C.BSKIP = 'YES' 
    OR C.ASKIP = 'YES' 
   )
${alldata}
    order by C.DOCID desc
 `


    const result = await connection.execute(sql);
    let resp = result.rows.map((i) => {
      let newObj = {};
      for (let columnIndex = 0; columnIndex < result.metaData.length; columnIndex++) {
        const element = result.metaData[columnIndex];
        newObj[element.name] = i[columnIndex];
      }
      return newObj;
    })
    return res.json({ statusCode: 0, data: resp })
  }
  catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    await connection.close()
  }
}
export async function createAllocation(req, res) {
  const versionId = 'Compacting-portal';
  const userId = 'Manoj';
  let connection;

  try {
    connection = await getConnection(res);
    const macDoc = await getNextMachineAllocationDocNo(connection);
    const { DOCID, MACHINE, PRIORITY, USER, inwNo } = req.body;


    const gtLabEntrySql = `
            SELECT inw.GTFABINWARDID as inward,  A.GTLABENTRYID, CM.GTCOMPMASTID, inw.ROLEID, A.GTLABENTRYID
        FROM GTLABENTRY A
        RIGHT JOIN GTFABINWARD inw ON A.FABINWARDNO = inw.GTFABINWARDID
        LEFT JOIN GTCOMPMAST CM on inw.COMPCODE = CM.GTCOMPMASTID
        WHERE 1=1 AND( A.DOCID = '${DOCID}' OR inw.DOCID = '${inwNo}' )
      `;
    console.log(gtLabEntrySql, 'gtLabEntrySql');

    const gtdFabricPoDetResult = await connection.execute(gtLabEntrySql);
    const [inwordNo, jobNo, comCode, roleId, labId] = gtdFabricPoDetResult.rows[0];
    const date = moment(new Date()).format("DD-MM-YYYY");
    const jobNum = jobNo;
    const insertSql = `
        INSERT INTO gtmachineallocate (
          GTMACHINEALLOCATEID, PRIORITY, MACHINENAME, JOBNO, FINWARDNO, DOCDATE, DOCID, COMPCODE, ROLEID, VERSIONID, USERID, CREATED_BY, IS_CANCELLED, GTLABENTRYID
        ) VALUES (
          react_seq.nextVal, '${PRIORITY}', '${MACHINE}', ${jobNum}, '${inwordNo}', TO_DATE('${date}','DD-MM-YYYY'), '${macDoc}', '${comCode}', '${roleId}', 
          '${versionId}', '${USER}', '${USER}', 'F',  ${jobNum}
        )
      `;

    const updateLabEntrySql = `
              UPDATE gtfabinward a
SET a.ALLOMACHINE = (
    SELECT C.MACHINENAME
    FROM gtmachineallocate B
    LEFT JOIN gtmachinemast C ON B.MACHINENAME = C.GTMACHINEMASTID
    WHERE a.GTFABINWARDID = B.FINWARDNO AND C.GTMACHINEMASTID ='${MACHINE}'
)
WHERE a.DOCID ='${inwNo}'
      `;

    console.log(insertSql, 'LabEntrySql');
    console.log(updateLabEntrySql, 'updateLabEntrySql');


    await connection.execute(insertSql);
    await connection.execute(updateLabEntrySql);
    ;



    await connection.commit();
    res.status(200).json({ statusCode: 0, data: 'Allocation Added sucessfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating allocations:', error);
    res.status(500).send('An error occurred while creating allocations.');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function deleteAllocation(req, res) {

  let connection;
  try {
    connection = await getConnection(res);
    const { inwNo } = req.query;
    console.log(inwNo, 'inwNo');

    const deleteAllocation = `UPDATE gtfabinward a
    SET a.ALLOMACHINE = (
      SELECT C.MACHINENAME
      FROM gtmachineallocate B
      LEFT JOIN gtmachinemast C ON B.MACHINENAME = C.GTMACHINEMASTID
      WHERE a.GTFABINWARDID = B.FINWARDNO AND a.PENTRY IS NULL AND C.GTMACHINEMASTID =''
      )
      WHERE a.DOCID ='${inwNo}'`
    const updateInward = `
delete from gtmachineallocate A
WHERE A.FINWARDNO IN (SELECT gtfabinwardid from gtfabinward 
where gtfabinward.docid = '${inwNo}')
        `;


    await connection.execute(deleteAllocation);
    await connection.execute(updateInward);
    ;


    await connection.commit();
    res.status(200).json({ statusCode: 0, data: 'Allocation Added sucessfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating allocations:', error);
    res.status(500).send('An error occurred while creating allocations.');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function getAfter(req, res) {
  const connection = await getConnection(res)
  try {
    const { inwNo } = req.query;
    let poNumCondition = '';
    if (inwNo) {
      poNumCondition = `AND C. DOCID  = '${inwNo}'`;
    }
    const sql = `
             SELECT 
         B.KDIA1,
         B.BDIA,
         B.ADIA,
        B.WIDTH,
        B.BGSM,
        B.AGSM,
        A. DOCID,
           B.FLENGTH
                          FROM GTLABENTRY A
      JOIN GTLABENTRYDET B ON A.GTLABENTRYID=B.GTLABENTRYID 
      JOIN GTFABINWARD C ON C.GTFABINWARDID=A.FABINWARDNO 
      JOIN GTFABINWARDDET D ON D.GTFABINWARDID=C.GTFABINWARDID
      WHERE  ETYPE = 'BEFORE'  ${poNumCondition}
      union
      SELECT 
         B.KDIA1,
         B.BDIA,
         B.ADIA,
        B.WIDTH,
        B.BGSM,
        B.AGSM,
        A. DOCID,
           B.FLENGTH
                          FROM GTLABENTRY A
      JOIN GTLABENTRYDET B ON A.GTLABENTRYID=B.GTLABENTRYID 
      JOIN GTFABINWARD C ON C.GTFABINWARDID=A.FABINWARDNO 
      JOIN GTFABINWARDDET D ON D.GTFABINWARDID=C.GTFABINWARDID
        WHERE  ETYPE = 'BEFORE'  ${poNumCondition}
     `



    const result = await connection.execute(sql)


    let resp = result.rows.map(po => ({
      kdia: po[0], bDia: po[1], bADia: po[2], bWidth: po[3], bGsm: po[4], aGsm: po[5], jobNo: po[6], length: po[7]


    }))
    return res.json({ statusCode: 0, data: resp })
  }
  catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    await connection.close()
  }
}
export async function createApprovalSts(req, res) {

  let connection;

  try {
    connection = await getConnection(res);



    const macDoc = await getNextMachineAllocationDocNo(connection);
    const { doc, type, apStatus, user } = req.body;




    const gtLabEntrySql = `
        SELECT inw.DOCID as inward, A.GTLABENTRYID, A.COMPCODE, A.ROLEID, A.GTLABENTRYID
        FROM GTLABENTRY A
        LEFT JOIN GTFABINWARD inw ON A.FABINWARDNO = inw.GTFABINWARDID
        WHERE A.DOCId = '${doc}'
      `;


    const gtdFabricPoDetResult = await connection.execute(gtLabEntrySql);


    if (gtdFabricPoDetResult.rows.length === 0) {
      console.error(`No GTLABENTRY found for DOCId: ${data.doc}`);
      throw new Error(`No GTLABENTRY found for DOCId: ${data.doc}`);
    }

    const [inwordNo, jobNo, comCode, roleId, labId] = gtdFabricPoDetResult.rows[0];



    const date = moment(new Date()).format('DD/MM/YY');
    const sql = `
        INSERT INTO Approvalstatus (
          AUTOGENERATEID, ETYPE, GRNNO, JOBNO, APPSTATUS, APPOVALDATE, USERID
        ) VALUES (
          react_seq.nextVal, '${type}', '${inwordNo}', '${doc}', '${apStatus}', TO_DATE('${date}', 'DD/MM/YY'), '${user}'
        )
      `;
    await connection.execute(sql);
    await connection.commit();
    res.status(200).json({ statusCode: 0, data: "Appproval Status Updated successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating allocations:', error);
    res.status(500).send('An error occurred while creating allocations.');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}



export async function createAllocationEntry(req, res) {
  let connection;

  try {
    connection = await getConnection(res);

    const { doc, type, apStatus, user, inwNo } = req.body;
    let docId = '';
    let fInwNo = '';
    if (doc) {
      docId = `AND A.DOCID = '${doc}'`;
    }
    if (inwNo) {
      fInwNo = `AND inw.DOCID = '${inwNo}'`;
    }

    const gtLabEntrySql = `
     SELECT
       A.DOCID as alloc,
       A.GTLABENTRYID as GTLABENTRYID_A,
       A.COMPCODE,
       A.ROLEID,
       to_char(A.DOCDATE, 'DD/MM/YYYY') as DOCDATE,
       gtmachinemast.MACHINENAME,
       priority,
       FINWARDNO
     FROM
       GTMACHINEALLOCATE A
     LEFT JOIN
       gtmachinemast ON A.MACHINENAME = gtmachinemast.GTMACHINEMASTID
     LEFT JOIN
       gtlabentry B ON A.GTLABENTRYID = B.GTLABENTRYID
     RIGHT JOIN 
       GTFABINWARD inw on A.FINWARDNO = inw.GTFABINWARDID
     WHERE 1=1 ${fInwNo}
    `;

    const gtdFabricPoDetResult = await connection.execute(gtLabEntrySql);
    const [allNo, labId, comCode, roleId, docDate, machine, priority, inwarnNo] = gtdFabricPoDetResult.rows[0];
    const date = moment(new Date()).format("DD-MM-YYYY HH:mm:ss");

    const sql = `
      INSERT INTO MACHINEALLOHISTORY (
        GRNNO, JOBNO, MACHINENAME, ALLOCATEDDATE, PRIORITY, USERID
      ) VALUES (
        '${inwarnNo}', '${doc}', '${machine}',
        TO_DATE('${date}', 'DD-MM-YYYY HH24:MI:SS'), '${priority}', '${user}'
      )
    `;

    await connection.execute(sql);
    await connection.commit();
    res.status(200).json({ statusCode: 0, data: "Machine Allocated successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating allocations:', error);
    res.status(500).send('An error occurred while creating allocations.');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}




