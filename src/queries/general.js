import { COMPCODE, PROJECTID } from "../constants/defaultQueryValues.js"
import { getCompCodeFromId } from "./compCode.js"
import { getCurrentFinancialYearIdAndCode } from "./financialYear.js"

export async function get(connection, lastRowid, tableName) {
    const result = await connection.execute(`
    select * from ${tableName} where rowid = ${lastRowid}
    `)
    if (result.rows.length === 0) return []
    return result.rows[0]
}

export async function updateDocId(connection, MACHINE_ALLOCATION, nextVal, DESCRIPTION) {
    const compCode = COMPCODE
    const sql = ` 
    UPDATE AUTOGENERATE A 
    SET A.LASTNO = ${parseInt(nextVal)}
   where A.TX_VIEW_ID = '${MACHINE_ALLOCATION || PRODUCTION_ENTRY_DOCID}' AND A.PREFIX ='${DESCRIPTION}' 
    `

    await connection.execute(sql)
    connection.commit()
    return
}
