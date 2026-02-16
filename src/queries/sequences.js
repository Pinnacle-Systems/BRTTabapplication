import { COMPCODE, MACHINE_ALLOCATION, DESCRIPTION, PRODUCTION_ENTRY_DOCID, PRODUCTION_ALP, } from "../constants/defaultQueryValues.js";


import { getCurrentFinancialYearIdAndCode } from "./financialYear.js";
import { updateDocId } from "./general.js";

export async function getNextMachineAllocationDocNo(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection);
    const compCode = COMPCODE;
    const sql = `
             
          SELECT DOCID
        FROM (
            SELECT DOCID
            FROM gtmachineallocate MA
            left join gtcompmast COM  on COM.GTCOMPMASTID = MA.COMPCODE
            WHERE COM.compcode = '${compCode}'
            ORDER BY DOCID DESC
        )
        WHERE rownum = 1
    `;
    const result = await connection.execute(sql);
    console.log(result, 'seq');

    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0");
    } else {
        let prev = result.rows[0][0];
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    console.log(nextVal, 'nextVal');
    await updateDocId(connection, MACHINE_ALLOCATION, nextVal, DESCRIPTION);
    const newDocId = `${compCode}/${finyearCode}/${'TMA'}-${nextVal}`;
    console.log(newDocId, 'newDocId');
    return newDocId;
}

export async function getNextProductionEntryDocId(connection) {
    const { finyearCode, finYearId } = await getCurrentFinancialYearIdAndCode(connection);
    const compCode = COMPCODE;
    const sql = `
          SELECT DOCID
        FROM (
            SELECT PE.DOCID
            FROM GTPRODENTRY PE
             left join gtcompmast COM on COM.GTCOMPMASTID =  PE.compcode
            WHERE COM.compcode =  '${compCode}'
            ORDER BY DOCID DESC
        )
        WHERE rownum = 1
    `;
    console.log(sql, 'seq');
    const result = await connection.execute(sql);

    let nextVal;
    if (result.rows.length === 0) {
        nextVal = "1".padStart(6, "0");
    } else {
        let prev = result.rows[0][0];
        nextVal = new String(parseInt(prev.split("-")[2]) + 1).padStart(6, "0")
    }
    console.log(nextVal, 'nextVal');
    await updateDocId(connection, PRODUCTION_ENTRY_DOCID, nextVal, PRODUCTION_ALP);
    const newDocId = `${compCode}/${finyearCode}/${'TPRO'}-${nextVal}`;
    console.log(newDocId, 'newDocId');
    return newDocId;
}


