import { getConnection } from "../constants/db.connection.js"
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { COMPCODE, PROJECTID, POTYPE, TRANSTYPE, TAXTEMP, ACC_BILL_ENTRY_PTRANSACTION } from "../constants/defaultQueryValues.js"
import { getSupplierName } from "../queries/supplier.js";
import { getAccessoryPoInvoiceNo } from "../queries/sequences.js";
import { partyState } from "../queries/supplier.js";
import { getRemovedItems } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const accPoIno = await getAccessoryPoInvoiceNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: accPoIno })
}
async function createTaxGridDetails(connection, taxGridDetails, GTACCPBILLENTRYID) {
    const promises = taxGridDetails.map(async (tax) => {
        const taxCreate = `INSERT INTO gtaccpbillentrytaxdet 
        (GTACCPBILLENTRYTAXDETID,GTACCPBILLENTRYID,NOTES1,
        SF,TAX1,
        REGISTERVALUE,ADVALUE,ADTEMPRND,ADSUGGESTIVE,ADFORMULA,ADID,
        ADORDER, ADPORM,ADNAME,GTACCPBILLENTRYTAXDETROW)
        VALUES (supplierseq.nextVal,'${GTACCPBILLENTRYID}', '${tax.notes}',
        '${tax.sf}', '${tax.numId}', 
        '${tax.adId === "RND" ? 0 : 1}', '${tax.adValue}', '${tax.adValue}', '${tax.adSuggestive}', '${tax.adFormula}', '${tax.adId}',
        0, '${tax.adPorm}','${tax.adType}', '${tax.gtAdddedDetailRow}' )`
        console.log(taxCreate, 'crt')
        return await connection.execute(taxCreate)
    })
    return Promise.all(promises)
}
async function deleteTaxGridDetails(connection, GTACCPBILLENTRYID) {
    return await connection.execute(`DELETE FROM gtaccpbillentrytaxdet WHERE GTACCPBILLENTRYID=${GTACCPBILLENTRYID}`)
}

async function getTaxGridDetails(connection, GTACCPBILLENTRYID) {
    const sql = `select sf, notes1, adname, adformula, adid, adporm, adsuggestive,GTACCPBILLENTRYTAXDETROW, advalue,TAX1 FROM gtaccpbillentrytaxdet where GTACCPBILLENTRYID = ${GTACCPBILLENTRYID}`
    let result = await connection.execute(sql);
    result = result.rows.map(i => ({ sf: i[0], notes: i[1], adType: i[2], adFormula: i[3], adId: i[4], adPorm: i[5], adSuggestive: i[6], gtAdddedDetailRow: i[7], adValue: i[8], numId: i[9] }))
    return result
}

export async function create(req, res) {
    const connection = await getConnection(res)
    const { supplierId: gtCompMastId, remarks: REMARKS, netAmount: NETAMT, netBillValue: NETBILLVALUE, partyBillNo,
        partyBillDate: PARTYBILLDATE, invoiceDetails, taxGridDetails } = req.body;
    try {
        if (!gtCompMastId || !invoiceDetails || !taxGridDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: supplierId, invoiceDetails, taxGridDetails' });
        }
        if (invoiceDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Invoice Details Cannot be Empty' });
        }
        if (taxGridDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Tax Details Cannot be Empty' });
        }
        const FINYR = await getCurrentFinancialYearId(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const TOTALQTY = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty), 0);
        const GROSSAMT = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty * c.billRate), 0);
        const DOCID = await getAccessoryPoInvoiceNo(connection)
        const PARTYSTATE = await partyState(connection, gtCompMastId)
        const nonGridSql =
            `INSERT INTO GTACCPBILLENTRY(GTACCPBILLENTRYID,TAXTEMP,FINYR,COMPCODE,NETAMT,REMARKS,GROSSAMT,TOTALQTY,NETBILLVALUE,
            PARTYBILLDATE,PARTYBILLNO,PARTYSTATE,SUPPLIER,DOCDATE,DOCID,PROJECTID)
            VALUES ( supplierseq.nextVal,'${TAXTEMP}','${FINYR}','${COMPCODE}','${NETBILLVALUE}','${REMARKS}','${GROSSAMT}','${TOTALQTY}','${NETBILLVALUE}',
            TO_DATE('${PARTYBILLDATE}', 'DD/MM/YY'),'${partyBillNo}','${PARTYSTATE}','${SUPPLIER}', TO_DATE(CURRENT_DATE, 'DD/MM/YY'),'${DOCID}','${PROJECTID}')`
        console.log(nonGridSql, 'nonGridSql')
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select GTACCPBILLENTRYID from GTACCPBILLENTRY where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTACCPBILLENTRYID = lastRowData.rows[0][0]
        await createTaxGridDetails(connection, taxGridDetails, GTACCPBILLENTRYID)
        await (async function createGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from gtaccPoInwardDtl 
                where GTAccPoDETID = ${billItem.poDetId}
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let aBillQtySql = `
                select sum(billQty) from gtaccpbillentrydet 
                where DETAILID = ${billItem.poDetId}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0

                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;


                let gtAccPoDetResult = await connection.execute(`
                select det.accsize, det.acccolor, det.uom, porate, poQty, po.gtaccpoid, gtnorderentry.gtnorderentryid
                from gtaccpodet det
                join gtaccpo po on det.gtaccpoid = po.gtaccpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.gtaccpodetid = ${billItem.poDetId}
                `)
                const [accsize, acccolor, uom, poRate, poQty, gtaccpoid, orderid] =
                    gtAccPoDetResult.rows[0]

                const gridSql = `
                INSERT INTO gtaccpbillentrydet (GTACCPBILLENTRYDETID, GTACCPBILLENTRYID,UOM,ACCCOLOR, accsize,ORDERNO,PONO,POQTY,
                    DISCAMT,AMOUNT,DVAL,DISCTYPE,DETAILID,NOTES,
                    TAX,BILLAMT, BILLRATE,BILLQTY,BALQTY,ABILLQTY,
                    PORATE,GRNQTY,  TRANSTYPE, POTYPE)
                                    VALUES(supplierseq.nextVal, '${GTACCPBILLENTRYID}','${uom}','${acccolor}', '${accsize}','${orderid}', '${gtaccpoid}','${poQty}',
                    '${discAmount}', '${amount}', '${billItem.discountValue}', '${billItem.discountType}', '${billItem.poDetId}', '${billItem.notes}',
                    '${billItem.tax}','${billAmount}','${billItem.billRate}', '${billItem.billQty}', '${balQty}', '${aBillQty}',
                    '${poRate}', '${aGrnQty}',  '${TRANSTYPE}', '${POTYPE}' )`
                console.log(gridSql, 'grid');
                await connection.execute(gridSql)
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE gtaccpodet 
                SET billQty = ${accumulatedBillQty}
                WHERE GTAccPoDETID = ${billItem.poDetId}
                `
                await connection.execute(updatePoBillSql)
            })
            return Promise.all(promises)
        })()
        await getAccessoryPoInvoiceNo(connection)
        connection.commit()
        return res.json({ statusCode: 0, data: GTACCPBILLENTRYID })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: err })
    } finally {
        await connection.close()
    }

}

export async function get(req, res) {
    const connection = await getConnection(res)

    try {
        const { gtCompMastId } = req.query
        const result = await connection.execute(`
        SELECT 
        GTACCPBILLENTRY.docid,
        GTACCPBILLENTRY.docdate,
        GTACCPBILLENTRY.supplier,
        GTACCPBILLENTRY.remarks,
        GTACCPBILLENTRY.partybilldate,
        GTACCPBILLENTRY.partybillno,
        GTACCPBILLENTRY.grossamt,
        GTACCPBILLENTRY.netbillvalue
 FROM   GTACCPBILLENTRY
 JOIN   gtCompMast ON gtCompMast.compName1 = GTACCPBILLENTRY.supplier
 WHERE  gtCompMast.gtCompMastId = :gtCompMastId 
 
 `, { gtCompMastId })
        const resp = result.rows.map(billEntry => (
            {
                docId: billEntry[0], docDate: billEntry[1], compName: billEntry[2], remarks: billEntry[3],
                partyBillNo: billEntry[5], partyBillDate: billEntry[4], grossAmount: billEntry[6], netBillValue: billEntry[7]
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


export async function getInvoiceDetails(req, res) {
    const connection = await getConnection(res)

    try {
        const { billEntryNo } = req.query;
        console.log('billEntryNo', billEntryNo);
        const result = await connection.execute(`
        SELECT
        gtaccpodet.ACCNAME2,
        gtColorMast.colorName,
        gtaccpbillentrydet.billqty,
        gtaccpbillentrydet.billRate,
        gtaccpbillentrydet.tax,
        gtaccpbillentrydet.poRate,
        gtaccpbillentrydet.balQty,
        gtaccpbillentrydet.poQty,
        gtaccpbillentrydet.ABILLQTY,
        gtaccpbillentrydet.GTACCPBILLENTRYID,
        gtaccpodet.gtaccpodetId,
        gtaccpo.accpono,
        gtaccpbillentrydet.grnQty,
        gtaccpbillentrydet.notes,
        gtaccpbillentrydet.dval,
        gtaccpbillentrydet.discType,
        GTACCPBILLENTRY.docid,
        gtaccpo.PURCHTYPE1,
        gtaccpodet.ALIASNAME2
              FROM
        gtaccpbillentrydet
    LEFT JOIN
        gtaccmast ON gtaccmast.gtAccMastId = gtaccpbillentrydet.ACCNAME
    LEFT JOIN
        gtColorMast ON gtColorMast.gtColorMastId = gtaccpbillentrydet.ACCCOLOR
    LEFT JOIN
        gtaccpodet ON gtaccpodet.GTAccPoDETID = gtaccpbillentrydet.DETAILID
    LEFT JOIN                  
    GTACCPBILLENTRY ON GTACCPBILLENTRY.GTACCPBILLENTRYID = gtaccpbillentrydet.GTACCPBILLENTRYID
    LEFT JOIN 
        gtaccpo ON gtaccpo.gtaccpoid = gtaccpodet.gtaccpoid
WHERE
GTACCPBILLENTRY.docid = '${billEntryNo}' `)

        const resp = result.rows.map(del => ({
            acc: del[0], color: del[1], billQty: del[2], billRate: del[3], tax: del[4],
            poRate: del[5], balQty: del[6], poQty: del[7],
            aBillQty: del[8], gtaccpBillEntryDetId: del[9], poDetId: del[10], poNo: del[11], aDelQty: del[12], notes: del[13], discountValue: del[14], discountType: del[15], docDi: del[16], processName: del[17], ALIASNAME2: del[18]
        }))
        console.log(resp, 'response');
        const result1 = await connection.execute(`
        SELECT 
        GTACCPBILLENTRY.docid,
        GTACCPBILLENTRY.docdate,
        GTACCPBILLENTRY.supplier,
        GTACCPBILLENTRY.remarks,
        GTACCPBILLENTRY.partybilldate,
        GTACCPBILLENTRY.partybillno,
        GTACCPBILLENTRY.grossamt,
        GTACCPBILLENTRY.netbillvalue,
        GTACCPBILLENTRY.GTACCPBILLENTRYID,
        gtaddded.ADSCHEME
 FROM   GTACCPBILLENTRY
 JOIN   gtCompMast ON gtCompMast.compName1 = GTACCPBILLENTRY.supplier
 JOIN gtaddded on gtaddded.GTADDDEDID = GTACCPBILLENTRY.taxTemp
    WHERE
        GTACCPBILLENTRY.docid = '${billEntryNo}' `)

        const billEntry = result1.rows[0]
        const delNonGridDetails = {
            docId: billEntry[0], docDate: billEntry[1], supplier: billEntry[2], remarks: billEntry[3],
            partyBillDate: billEntry[4], partyBillNo: billEntry[5], grossAmount: billEntry[6], netBillValue: billEntry[7], gtGrpBillEntryId: billEntry[8], taxTemp: billEntry[9]
            // from: {
            //     phoneNo: fromToData[1], city: fromToData[2].split("|")[0].trim(" "), state: fromToData[2].split("|")[1].trim(" "),
            //     compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            // },
            // to: {
            //     phoneNo: fromToData[9], city: fromToData[10].split("|")[0].trim(" "), state: fromToData[10].split("|")[1].trim(" "), compName: fromToData[11],
            //     pinCode: fromToData[12], panNo: fromToData[13], gstNo: fromToData[14], email: fromToData[15], address: fromToData[16]
            // }
        }
        const taxDetails = await getTaxGridDetails(connection, billEntry[8])
        return res.json({ statusCode: 0, data: { ...delNonGridDetails, invoiceDetails: resp, taxDetails } })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close()
    }
}
export async function upDate(req, res) {
    const { supplierId: gtCompMastId, remarks: REMARKS, netAmount: NETAMT, netBillValue: NETBILLVALUE, partyBillNo, taxGridDetails,
        partyBillDate: PARTYBILLDATE, invoiceDetails, accBillEntryNo
    } = req.body;
    const connection = await getConnection(res);
    try {
        if (!accBillEntryNo || !invoiceDetails || !taxGridDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: accBillEntryNo, invoiceDetails' });
        }
        if (invoiceDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Invoice Details Cannot be Empty' });
        }
        if (taxGridDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Tax Details Cannot be Empty' });
        }
        if (invoiceDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Invoice Details Cannot be Empty' });
        }
        const TOTALQTY = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty), 0);
        const GROSSAMT = invoiceDetails.reduce((a, c) => a + parseFloat(c.billQty * c.billRate), 0);
        const nonGridSql = `
            UPDATE GTACCPBILLENTRY
            SET remarks = '${REMARKS}',
                PARTYBILLDATE = TO_DATE('${PARTYBILLDATE}', 'DD-MM-YYYY'),
                PARTYBILLNO = '${partyBillNo}',
                TOTALQTY = '${TOTALQTY}',
                GROSSAMT = '${GROSSAMT}',
                NETAMT = '${NETBILLVALUE}',
                NETBILLVALUE = '${NETBILLVALUE}'
            WHERE docid= '${accBillEntryNo}'
        `;
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select GTACCPBILLENTRYID from GTACCPBILLENTRY where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTACCPBILLENTRYID = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT GTACCPBILLENTRYID from gtaccpbillentrydet 
        WHERE GTACCPBILLENTRYID = ${GTACCPBILLENTRYID}`)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = invoiceDetails.filter(item => item?.gtaccpbillentrydetid).map(item => item?.gtaccpbillentrydetid)

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);

        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtaccpbillentrydet WHERE GTACCPBILLENTRYID IN (${removedItems}) `)
        }
        await deleteTaxGridDetails(connection, GTACCPBILLENTRYID);
        await createTaxGridDetails(connection, taxGridDetails, GTACCPBILLENTRYID);
        await (async function updateGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from gtaccPoInwardDtl 
                where GTAccPoDETID = ${billItem.poDetId} 
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let aBillQtySql = `
                select sum(billQty) from gtaccpbillentrydet 
                where DETAILID = ${billItem.poDetId} and GTACCPBILLENTRYID < ${GTACCPBILLENTRYID}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0

                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;

                let gtAccPoDetResult = await connection.execute(`
                select  det.acccolor, det.uom, det.purchtype, porate, poQty, po.gtaccpoid, gtnorderentry.gtnorderentryid
                from gtaccpodet det
                join gtaccpo po on det.gtaccpoid = po.gtaccpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.gtaccpodetid = ${billItem.poDetId}
                `)
                const [color, uom, processname, poRate, poQty, gtaccpoid, orderid] =
                    gtAccPoDetResult.rows[0]
                if (billItem?.gtaccpbillentrydetid) {
                    const gridSql = `
                    UPDATE gtaccpbillentrydet
                    SET DISCAMT = ${discAmount},
                    AMOUNT =  ${amount},
                    DVAL = ${billItem.discountValue},
                    DISCTYPE = '${billItem.discountType}',
                    NOTES = '${billItem.notes}',
                    TAX = ${billItem.tax},
                    BILLAMT = ${billAmount},
                    BILLRATE = ${billItem.billRate},
                    BILLQTY = ${billItem.billQty},
                    BALQTY = ${balQty},
                    ABILLQTY = ${aBillQty}
                    WHERE GTACCPBILLENTRYID = '${billItem.gtaccpbillentrydetid}'
                    `;
                    await connection.execute(gridSql)
                } else {
                    const gridSql = `
                    INSERT INTO gtaccpbillentrydet (GTACCPBILLENTRYDETID, GTACCPBILLENTRYID,UOM,ACCCOLOR, PROCESSNAME,ORDERNO,PONO,
                        DISCAMT,AMOUNT,DVAL,DISCTYPE,DETAILID,NOTES,
                        TAX,BILLAMT, BILLRATE,BILLQTY,BALQTY,ABILLQTY,
                        PORATE,GRNQTY, POQTY, TRANSTYPE, POTYPE)
                    VALUES(supplierseq.nextVal, ${GTACCPBILLENTRYID},${uom},${color},'${processname}','${orderid}', '${gtaccpoid}',
                    ${discAmount}, ${amount}, ${billItem.discountValue}, '${billItem.discountType}', ${billItem.poDetId}, '${billItem.notes}',
                    ${billItem.tax},${billAmount},${billItem.billRate}, ${billItem.billQty}, ${balQty}, ${aBillQty},
                    ${poRate}, ${aGrnQty}, ${poQty},  '${TRANSTYPE}', '${POTYPE}')`
                    console.log(gridSql, 'grid');
                    await connection.execute(gridSql)

                }
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE gtaccpodet 
                SET billQty = ${accumulatedBillQty}
                WHERE GTAccPoDETID = ${billItem.poDetId}
                `
                await connection.execute(updatePoBillSql)
            })
            return Promise.all(promises)
        })()
        connection.commit()
        return res.json({ statusCode: 0, message: "Updated Successfully" })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}






