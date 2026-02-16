import { getConnection } from "../constants/db.connection.js"
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { COMPCODE, PROJECTID, POTYPE, TRANSTYPE, TAXTEMP, DF_BILL_ENTRY_PTRANSACTION } from "../constants/defaultQueryValues.js"
import { getSupplierName } from "../queries/supplier.js";
import { getNextDyedFabpurPoInvoiceNo } from "../queries/sequences.js";
import { partyState } from "../queries/supplier.js";
import { getRemovedItems } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const fpino = await getNextDyedFabpurPoInvoiceNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: fpino })
}
async function createTaxGridDetails(connection, taxGridDetails, GTDFPBILLENTRYID) {
    const promises = taxGridDetails.map(async (tax) => {
        const taxCreate = `INSERT INTO gtdfpbillentrytax 
        (GTDFPBILLENTRYTAXID,GTDFPBILLENTRYID,ADFORMULA,NOTES1,
        SF,TAX1,
        REGISTERVALUE,ADVALUE,ADTEMPRND1,ADTEMPRND,ADSUGGESTIVE,ADID,
        ADORDER, ADPORM,ADNAME,GTDFPBILLENTRYTAXROW)
        VALUES (supplierseq.nextVal,'${GTDFPBILLENTRYID}','${tax.adFormula}',  '${tax.notes}',
        '${tax.sf}', '${tax.numId}', 
        '${tax.adId === "RND" ? 0 : 1}', '${tax.adValue}', 0,'${tax.adValue}', '${tax.adSuggestive}', '${tax.adId}',
        0, '${tax.adPorm}','${tax.adType}', '${tax.gtAdddedDetailRow}' )`
        return await connection.execute(taxCreate)
    })
    return Promise.all(promises)
}
async function deleteTaxGridDetails(connection, GTDFPBILLENTRYID) {
    return await connection.execute(`DELETE FROM gtdfpbillentrytax WHERE GTDFPBILLENTRYID=${GTDFPBILLENTRYID}`)
}

async function getTaxGridDetails(connection, GTDFPBILLENTRYID) {
    const sql = `select sf, notes1, adname, adformula,adTemprnd, adid, adporm, adsuggestive,GTDFPBILLENTRYTAXROW, advalue,TAX1 
    FROM gtdfpbillentrytax 
    where gtdfpbillentryid = ${GTDFPBILLENTRYID}`
    let result = await connection.execute(sql);
    result = result.rows.map(i => ({ sf: i[0], notes: i[1], adType: i[2], adFormula: i[3], adTemprnd: i[4], adId: i[5], adPorm: i[6], adSuggestive: i[7], gtAdddedDetailRow: i[8], adValue: i[9], numId: i[10] }))
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
        const DOCID = await getNextDyedFabpurPoInvoiceNo(connection)
        const PARTYSTATE = await partyState(connection, gtCompMastId)
        const nonGridSql =
            `INSERT INTO GTDFPBILLENTRY(GTDFPBILLENTRYID,TAXTEMP,FINYR,COMPCODE,NETAMOUNT,REMARKS,GROSSAMOUNT,TOTALQTY,NETBILLVALUE,
            PARTYBILLDATE,PARTYBILLNO,PARTYSTATE,SUPPLIER,PTRANSACTION,DOCDATE,DOCID,PROJECTID,ENTRYTYPE)
            VALUES ( supplierseq.nextVal,'${TAXTEMP}','${FINYR}','${COMPCODE}','${NETBILLVALUE}','${REMARKS}','${GROSSAMT}','${TOTALQTY}','${NETBILLVALUE}',
            TO_DATE('${PARTYBILLDATE}', 'DD/MM/YY'),'${partyBillNo}','${PARTYSTATE}','${SUPPLIER}','${DF_BILL_ENTRY_PTRANSACTION}', TO_DATE(CURRENT_DATE, 'DD/MM/YY'),'${DOCID}','${PROJECTID}', 'SP')`
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select GTDFPBILLENTRYID from GTDFPBILLENTRY where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTDFPBILLENTRYID = lastRowData.rows[0][0]
        await createTaxGridDetails(connection, taxGridDetails, GTDFPBILLENTRYID)
        await (async function createGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from gtdfabpurinwarddet 
                where poid = ${billItem.poDetId}
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let aBillQtySql = `
                select sum(billQty) from GTDFPBILLENTRYDET 
                where DETAILID = ${billItem.poDetId}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0

                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;

                const gtdFabricPoDetSql = `
                select aliasname,det.uom,fabdesign, fabcolor,fabrictype,fabric,fdia,kdia,ll,gg,gsm, det.processname, poRate, poQty, po.gtdfabricpoid, gtnorderentry.gtnorderentryid
                from gtdfabricpodet det
                join gtdfabricPo po on det.GTDFABRICPOID = po.gtdfabricpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.GTDFABRICPODETID = ${billItem.poDetId}
                `
                let gtdFabricPoDetResult = await connection.execute(gtdFabricPoDetSql)
                const [aliasname, uom, fabdesign, fabcolor, fabrictype, fabric, fdia, kdia, ll, gg, gsm, processname, poRate, poQty, gtdfabricpoid, orderid] =
                    gtdFabricPoDetResult.rows[0]
                const gridSql = `
                INSERT INTO GTDFPBILLENTRYDET (GTDFPBILLENTRYDETID, GTDFPBILLENTRYID,FDIA,KDIA,LL,GG,GSM,UOM,COLOR, PROCESSNAME,ALIASNAME,PONO,POQTY,DETAILID,TAX,AMOUNT,DVAL,
                    DISCAMT,DISCTYPE,BILLAMT,BILLRATE,BALQTY, 
                    BILLQTY,GRNQTY,  PORATE,ORDERNO,NOTES,
                   TRANSTYPE, POTYPE)
                    VALUES(supplierseq.nextVal, '${GTDFPBILLENTRYID}', '${fdia}','${kdia}','${ll}','${gg}','${gsm}','${uom}','${fabcolor}','${processname}','${aliasname}','${gtdfabricpoid}','${poQty}','${billItem.poDetId}', ' ${billItem.tax}','${amount}', '${billItem.discountValue}',  '${discAmount}','${billItem.discountType}',  '${billAmount}','${billItem.billRate}', '${balQty}', '${billItem.billQty}','${aGrnQty}' , '${poRate}','${orderid}',  '${billItem.notes}', '${TRANSTYPE}', '${POTYPE}' )`

                await connection.execute(gridSql)
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE GTDFABRICPODET 
                SET billQty = ${accumulatedBillQty}
                WHERE GTDFABRICPODETID = ${billItem.poDetId}
                `
                await connection.execute(updatePoBillSql)
            })
            return Promise.all(promises)
        })()
        await getNextDyedFabpurPoInvoiceNo(connection)
        connection.commit()
        return res.json({ statusCode: 0, data: GTDFPBILLENTRYID })
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
        GTDFPBILLENTRY.docid,
        GTDFPBILLENTRY.docdate,
        GTDFPBILLENTRY.supplier,
        GTDFPBILLENTRY.remarks,
        GTDFPBILLENTRY.partybilldate,
        GTDFPBILLENTRY.partybillno,
        GTDFPBILLENTRY.GROSSAMOUNT,
        GTDFPBILLENTRY.netbillvalue
        FROM   GTDFPBILLENTRY
        JOIN   gtCompMast ON gtCompMast.compName1 = GTDFPBILLENTRY.supplier
        WHERE  gtCompMast.gtCompMastId = :gtCompMastId and GTDFPBILLENTRY.ENTRYTYPE = 'SP'        `, { gtCompMastId })
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
        const { billEntryNo } = req.query
        const result = await connection.execute(`
        SELECT
        gtFabricMast.fabaliasName,
        gtColorMast.colorName,
        gtUnitMast.unitName,
        gtDiaMast.fDia,
        gtDiaMast.kDia,
        gtLoopMast.ll,
        gtGgMast.gg,
        gtGsmMast.gsm,
        gtDesignMast.design,
        gtProcessMast.processName,
        GTDFPBILLENTRYDET.billqty,
        GTDFPBILLENTRYDET.billRate,
        GTDFPBILLENTRYDET.tax,
        GTDFPBILLENTRYDET.poRate,
        GTDFPBILLENTRYDET.balQty,
        GTDFPBILLENTRYDET.poQty,  
        GTDFPBILLENTRYDET.GTDFPBILLENTRYDETID,
        gtdfabricPoDet.gtdfabricPoDetId,
        gtdfabricPo.docid,
        gtdfabricPoDet.roll,
    GTDFPBILLENTRYDET.grnQty,
    GTDFPBILLENTRYDET.notes,
    GTDFPBILLENTRYDET.dval,
    GTDFPBILLENTRYDET.discType
    FROM
    GTDFPBILLENTRYDET
    LEFT JOIN gtFabricMast ON gtFabricMast.gtfabricMastId = gtdfpbillentrydet.aliasName
    LEFT JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtdfpbillentrydet.uom
    LEFT JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdfpbillentrydet.fDia
    LEFT JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtdfpbillentrydet.kDia
    LEFT JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtdfpbillentrydet.ll
    LEFT JOIN gtGgMast ON gtGgMast.gtGgMastId =gtdfpbillentrydet.gg
    LEFT JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtdfpbillentrydet.gsm
    LEFT JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtdfpbillentrydet.design
    LEFT JOIN gtColorMast ON gtColorMast.gtColorMastId = gtdfpbillentrydet.color
    LEFT JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtdfpbillentrydet.processName
    LEFT JOIN
        gtdfabricPoDet ON gtdfabricPoDet.GTDFABRICPODETID = GTDFPBILLENTRYDET.DETAILID
    LEFT JOIN                  
    GTDFPBILLENTRY ON GTDFPBILLENTRY.GTDFPBILLENTRYID = GTDFPBILLENTRYDET.GTDFPBILLENTRYID
    LEFT JOIN 
        gtdfabricPo ON gtdfabricPo.GTDFABRICPOID = gtdfabricPoDet.GTDFABRICPOID
    WHERE
    GTDFPBILLENTRY.docid = '${billEntryNo}' `)

        const resp = result.rows.map(del => ({
            fabric: del[0], color: del[1], unit: del[2], fDia: del[3], kDia: del[4], ll: del[5], gg: del[6], gsm: del[7], design: del[8], processName: del[9], billQty: del[10], billRate: del[11], tax: del[12], poRate: del[13], balQty: del[14], poQty: del[15],
            gtdfpBillEntryDetId: del[16], poDetId: del[17], poNo: del[18],
            poRoll: del[19], aDelQty: del[20], notes: del[21], discountValue: del[22], discountType: del[23]
        }))
        const sql = `
        SELECT 
        ng.docid,
        ng.docdate,
        ng.supplier,
        ng.remarks,
        ng.partybilldate,
        ng.partybillno,
        ng.GROSSAMOUNT,
        ng.netbillvalue,
        ng.GTDFPBILLENTRYID,
        gtaddded.ADSCHEME
 FROM   GTDFPBILLENTRY ng
 JOIN   gtCompMast ON gtCompMast.compName1 = ng.supplier
 JOIN gtaddded on gtaddded.GTADDDEDID = ng.taxTemp
    WHERE
        ng.docid = '${billEntryNo}' `
        const result1 = await connection.execute(sql)
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
        partyBillDate: PARTYBILLDATE, invoiceDetails, yarnPoBillEntryNo } = req.body;
    const connection = await getConnection(res);
    try {
        if (!yarnPoBillEntryNo || !invoiceDetails || !taxGridDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: yarnPoBillEntryNo , invoiceDetails' });
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
            UPDATE GTDFPBILLENTRY
            SET remarks = '${REMARKS}',
                PARTYBILLDATE = TO_DATE('${PARTYBILLDATE}', 'DD-MM-YYYY'),
                PARTYBILLNO = '${partyBillNo}',
                TOTALQTY = '${TOTALQTY}',
                GROSSAMOUNT = '${GROSSAMT}',
                NETAMOUNT = ${NETBILLVALUE},
                NETBILLVALUE = ${NETBILLVALUE}
            WHERE docid= '${yarnPoBillEntryNo}'
        `;
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select GTDFPBILLENTRYID from GTDFPBILLENTRY where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTDFPBILLENTRYID = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT GTGRPBILLENTRYDETID from GTGRPBILLENTRYDET 
        WHERE GTGRPBILLENTRYID = ${GTDFPBILLENTRYID}`)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = invoiceDetails.filter(item => item?.gtYarnBillEntryDetId).map(item => item?.gtYarnBillEntryDetId)

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);

        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM GTGRPBILLENTRYDET WHERE GTGRPBILLENTRYDETID IN (${removedItems}) `)
        }
        await deleteTaxGridDetails(connection, GTDFPBILLENTRYID);
        await createTaxGridDetails(connection, taxGridDetails, GTDFPBILLENTRYID);
        await (async function updateGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from gtdfabpurinwarddet 
                where poid = ${billItem.poDetId}
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let aBillQtySql = `
                select sum(billQty) from GTDFPBILLENTRYDET 
                where DETAILID = ${billItem.poDetId}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0

                console.log(aGrnQty, "aGrnQty")
                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;

                const gtdFabricPoDetSql = `
                select aliasname,det.uom,fabdesign, fabcolor,fabrictype,fabric,fdia,kdia,ll,gg,gsm, det.processname, poRate, poQty, po.gtdfabricpoid, gtnorderentry.gtnorderentryid
                from gtdfabricpodet det
                join gtdfabricPo po on det.GTDFABRICPOID = po.gtdfabricpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.GTDFABRICPODETID = ${billItem.poDetId}
                `
                let gtdFabricPoDetResult = await connection.execute(gtdFabricPoDetSql)
                const [aliasname, uom, fabdesign, fabcolor, fabrictype, fabric, fdia, kdia, ll, gg, gsm, processname, poRate, poQty, gtdfabricpoid, orderid] =
                    gtdFabricPoDetResult.rows[0]
                if (billItem?.gtdfpBillEntryDetId) {
                    const gridSql = `
                    UPDATE GTDFPBILLENTRYDET
                    SET DISCAMT = ${discAmount},
                    AMOUNT =  ${amount},
                    DVAL = ${billItem.discountValue},
                    DISCTYPE = '${billItem.discountType}',
                    NOTES = '${billItem.notes}',
                    TAX = ${billItem.tax},
                    BILLAMT = ${billAmount},
                    BILLRATE = ${billItem.billRate},
                    BILLQTY = ${billItem.billQty},
                    BALQTY = ${balQty}
                    WHERE GTDFPBILLENTRYDETID = '${billItem.gtdfpBillEntryDetId}'
                    `;
                    console.log(gridSql);
                    await connection.execute(gridSql)
                } else {
                    const gridSql = `
                INSERT INTO GTDFPBILLENTRYDET (GTDFPBILLENTRYDETID, GTDFPBILLENTRYID,FDIA,KDIA,LL,GG,GSM,UOM,COLOR, PROCESSNAME,ALIASNAME,PONO,POQTY,DETAILID,TAX,AMOUNT,DVAL,
                    DISCAMT,DISCTYPE,BILLAMT,BILLRATE,BALQTY, 
                    BILLQTY,GRNQTY,  PORATE,ORDERNO,NOTES,
                   TRANSTYPE, POTYPE)
                    VALUES(supplierseq.nextVal, '${GTDFPBILLENTRYID}', '${fdia}','${kdia}','${ll}','${gg}','${gsm}','${uom}','${fabcolor}','${processname}','${aliasname}','${gtdfabricpoid}','${poQty}','${billItem.poDetId}', ' ${billItem.tax}','${amount}', '${billItem.discountValue}',  '${discAmount}','${billItem.discountType}',  '${billAmount}','${billItem.billRate}', '${balQty}', '${billItem.billQty}','${aGrnQty}' , '${poRate}','${orderid}',  '${billItem.notes}', '${TRANSTYPE}', '${POTYPE}' )`

                    await connection.execute(gridSql)
                }
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE GTDFABRICPODET 
                SET billQty = ${accumulatedBillQty}
                WHERE GTDFABRICPODETID = ${billItem.poDetId}
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

