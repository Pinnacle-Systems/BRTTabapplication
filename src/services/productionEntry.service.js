import moment from "moment";
import { getConnection } from "../constants/db.connection.js";
import { getNextMachineAllocationDocNo, getNextProductionEntryDocId } from "../queries/sequences.js";
import { currentDate } from "../utils/helper.js";
export async function get(req, res) {
    const connection = await getConnection(res);

    try {
        const { inwardNo, type, completed } = req.query;
        let inwNo = ''
        if (inwardNo) {
            inwNo = ` AND inw.DOCID = '${inwardNo}'`
        }
        let sql = ''
        if (completed !== 'Completed') {
            sql = `
            select  inw.DELTO AS CUSTOMER,
               inw.TOTQTY AS RECQTY,
               DET.rolls AS rolls,
               AL.PRIORITY ,
                D.MACHINENAME,
                AL.USERID,
                inw.DOCID AS FINWARDNO,
               LAB.DOCID,
               to_char( LAB.DOCDATE,'DD/MM/YYYY') as JOBDATE,
               to_char(AL.DOCDATE,'DD/MM/YYYY') as DOCDATE,
                         fab.FABNAME AS FABRIC,
                          inw.PENTRY,
                clr.COLORNAME AS COLOUR
             from GTFABINWARD inw
            LEFT JOIN GTFABINWARDDET DET on inw.GTFABINWARDID = DET.GTFABINWARDID
            left join gtfabricmast Fab on det.FABNAME = fab.GTFABRICMASTID
         left JOIN gtcolormast clr on det.COLOUR =  clr.GTCOLORMASTID
            LEFT JOIN GTMACHINEALLOCATE AL ON inw.GTFABINWARDID = AL.FINWARDNO 
            LEFT JOIN GTLABENTRY LAB ON inw.GTFABINWARDID = LAB.GTFABINWARDID
           LEFT JOIN GTMACHINEMAST D on AL.MACHINENAME = D.GTMACHINEMASTID
           LEFT JOIN GTPRODENTRY PR ON inw.GTFABINWARDID = PR.FABRICINWARDNO
           WHERE  inw.PENTRY  IS NULL AND INW.ALLOMACHINE IS NOT NULL ${inwNo}
            order by  FINWARDNO desc
           
               `;
        } else {
            sql = `select  inw.DELTO AS CUSTOMER,
      inw.TOTQTY AS RECQTY,
      DET.rolls AS RECROLL,
      AL.PRIORITY ,
       D.MACHINENAME,
       AL.USERID,
       inw.DOCID AS FINWARDNO,
      LAB.DOCID,
      to_char( LAB.DOCDATE,'DD/MM/YYYY') as JOBDATE,
      to_char(AL.DOCDATE,'DD/MM/YYYY') as DOCDATE,
                fab.FABNAME AS FABRIC,
                inw.PENTRY,
       clr.COLORNAME AS COLOUR
    from GTFABINWARD inw
   LEFT JOIN GTFABINWARDDET DET on inw.GTFABINWARDID = DET.GTFABINWARDID
   left join gtfabricmast Fab on det.FABNAME = fab.GTFABRICMASTID
left JOIN gtcolormast clr on det.COLOUR =  clr.GTCOLORMASTID
   LEFT JOIN GTMACHINEALLOCATE AL ON inw.GTFABINWARDID = AL.FINWARDNO 
   LEFT JOIN GTLABENTRY LAB ON inw.GTFABINWARDID = LAB.GTFABINWARDID
  LEFT JOIN GTMACHINEMAST D on AL.MACHINENAME = D.GTMACHINEMASTID
  LEFT JOIN GTPRODENTRY PR ON inw.GTFABINWARDID = PR.FABRICINWARDNO
   WHERE  inw.PENTRY  IS NOT NULL AND LAB.ETYPE = 'BEFORE'
    order by  FINWARDNO desc
    `
        }
        console.log(sql, 'sql');

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



export async function createProductionEntry(req, res) {
    const versionId = 'Compacting-portal';
    const userId = 'Manoj';
    let connection;
    connection = await getConnection(res);

    try {
        const proDoc = await getNextProductionEntryDocId(connection);
        const { proDet } = req.body;

        const promises = proDet.map(async (proData, index) => {
            const prodEntry = `
              SELECT
                 A.GTLABENTRYID,
                    C.COMPCODE,
                    G.JOBNO,
                    C.GTFABINWARDID,
                    B.RECROLL,
                    B.RECQTY,
                    G.ROLEID,
                    G.Priority,
                   to_char(A.DOCDATE,'DD/MM/YYYY') as DOCDATE,
                    B.COLOUR,
                    B.FABRIC
                FROM GTLABENTRY A
                LEFT JOIN GTLABENTRYDET B ON A.GTLABENTRYID = B.GTLABENTRYID
                RIGHT JOIN GTFABINWARD C ON C.GTFABINWARDID = A.FABINWARDNO
                LEFT JOIN GTFABINWARDDET D ON D.GTFABINWARDID = C.GTFABINWARDID
                LEFT JOIN GTMACHINEALLOCATE G ON G.FINWARDNO = C.GTFABINWARDID
                WHERE C.DOCID = '${proData.FINWARDNO}'
            `;
            console.log(prodEntry, 'proentry');
            const gtdFabricPoDetResult = await connection.execute(prodEntry);
            const [labId, comp, jobNo, inwardNo, recRoll, recQty, roleId, PRIORITY, DOCDATE, colour, fabric] = gtdFabricPoDetResult.rows[0];




            const nonGridSql = `
                INSERT INTO gtprodentry (
                    GTPRODENTRYID, FABRICINWARDNO, JOBNO, DOCDATE, DOCID, COMPCODE, ROLEID, VERSIONID, PROJECTID, USERID, UNIQUE_ID_FIELD, IS_CANCELLED, PENTRY, GTLABENTRYID, CREATED_ON
                ) VALUES (
                    react_seq.nextVal, ${inwardNo}, ${jobNo}, TO_DATE('${currentDate}', 'DD-MM-YYYY HH:MI:SS AM'), '${proDoc}', '${comp}', '${roleId}', '${versionId}', 'PSSINC', react_seq.nextVal, '${userId}', 'F' ,'COMPLETED', ${labId}, TO_DATE('${currentDate}', 'DD-MM-YYYY HH:MI:SS AM')
                )
            `;
            console.log(nonGridSql, 'nonGridSql');
            const nonGridResult = await connection.execute(nonGridSql);

            const lastRowData = await connection.execute(`
                SELECT gtprodentryId FROM gtprodentry WHERE rowId = '${nonGridResult.lastRowid}'
            `);
            const gtprodentryId = lastRowData.rows[0][0];

            const gridSql = `
                INSERT INTO gtprodentryDet (
                    GTPRODENTRYDETID, GTPRODENTRYID, AFTERGSM, AFTERWITH, MCSPEED, LOADSHELL, OVERFEED, REQGSM, REQDIA, KDIA, FABQUAL, RECQTY, RECROLL, COLOUR, FABRIC, GTPRODENTRYDETROW
                ) VALUES (
                    react_seq.nextVal, ${gtprodentryId}, ${proData.AFTERGSM}, ${proData.AFTERWIDTH
                }, ${proData.MCSPEED}, ${proData.LOADSHELL}, ${proData.OVERFEED}, ${proData.REQGSM}, '${proData.REQDIA}', '${proData.KDIA}', '${proData.FABQUAL}', ${proData.RECQTY}, ${proData.RECROLL}, '${colour}', '${fabric}', '1'
                )
            `;
            console.log(gridSql, 'gridSql117');
            const updateLabEntrySql = `
                UPDATE gtfabinward a
                SET a.PENTRY = 'COMPLETED'
                WHERE a.DOCID = '${proData.FINWARDNO
                }'
            `;
            console.log(updateLabEntrySql, 'upsql');
            await connection.execute(gridSql);
            await connection.execute(updateLabEntrySql);
        });

        const results = await Promise.all(promises);

        await connection.commit();
        res.status(200).json({ statusCode: 0, data: results });
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


export async function imgFileName(req, res) {
    let connection;
    try {
        connection = await getConnection(res);
        const fileName = req.file.filename;
        console.log(fileName, 'file');

        const proEntryResult = await connection.execute(`SELECT MAX(gtprodentryID) AS maxId FROM gtprodentry`);
        const proId = proEntryResult.rows[0]
        console.log(proId, 'pro');


        const gridSql = `
            INSERT INTO gtprodentryimage (
                GTPRODENTRYIMAGEID, GTPRODENTRYID, IMAGEFIELDVALUE
            ) VALUES (
                react_seq.nextVal, ${proId}, '${fileName}'
            )`;
        console.log(gridSql, 'gridSql');

        await connection.execute(gridSql);

        await connection.commit();
        res.status(200).json({ statusCode: 0, data: 'Image data inserted successfully' });
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
