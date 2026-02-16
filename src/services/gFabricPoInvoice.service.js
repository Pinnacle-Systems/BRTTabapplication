import { getConnection } from "../constants/db.connection.js"
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { COMPCODE, PROJECTID, POTYPE, TRANSTYPE, TAXTEMP, GF_BILL_ENTRY_PTRANSACTION, FROM_SUPPLIER_PORTAL } from "../constants/defaultQueryValues.js"
import { getSupplierName } from "../queries/supplier.js";
import { getGreyFabricPoInvoiceNo } from "../queries/sequences.js";
import { partyState } from "../queries/supplier.js";
import { getRemovedItems } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const gfPoIno = await getGreyFabricPoInvoiceNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: gfPoIno })
}
async function createTaxGridDetails(connection, taxGridDetails, GTGFPBILLENTRYID) {
    const promises = taxGridDetails.map(async (tax) => {
        const taxCreate = `INSERT INTO  gtgfpbillentrytax 
        (GTGFPBILLENTRYTAXID, GTGFPBILLENTRYID, NOTES1,
         SF, TAX1, REGISTERVALUE, ADVALUE, ADTEMPRND,
         ADSUGGESTIVE, ADFORMULA, ADID, ADORDER, ADPORM,
         ADNAME,GTGFPBILLENTRYTAXROW)
        VALUES (supplierseq.nextVal,'${GTGFPBILLENTRYID}', '${tax.notes}',
        '${tax.sf}', '${tax.numId}', 
        '${tax.adId === "RND" ? 0 : 1}', '${tax.adValue}', '${tax.adValue}', '${tax.adSuggestive}', '${tax.adFormula}', '${tax.adId}',
        0, '${tax.adPorm}','${tax.adType}', '${tax.gtAdddedDetailRow}' )`
        return await connection.execute(taxCreate)
    })
    return Promise.all(promises)
}
async function deleteTaxGridDetails(connection, GTGFPBILLENTRYID) {
    return await connection.execute(`DELETE FROM  GTGFPBILLENTRYTAX WHERE GTGFPBILLENTRYID=${GTGFPBILLENTRYID}`)
}

async function getTaxGridDetails(connection, GTGFPBILLENTRYID) {
    const sql = `   select sf, notes1, adname, adformula, adid, adporm, adsuggestive, GTGFPBILLENTRYTAXROW, advalue,TAX1 FROM  gtgfpbillentrytax where GTGFPBILLENTRYID  = ${GTGFPBILLENTRYID}`
    let result = await connection.execute(sql);
    result = result.rows.map(i => ({ sf: i[0], notes: i[1], adType: i[2], adFormula: i[3], adId: i[4], adPorm: i[5], adSuggestive: i[6], gtAdddedDetailRow: i[7], adValue: i[8], numId: i[9] }))
    return result
}

export async function create(req, res) {
    const connection = await getConnection(res)
    const { supplierId: gtCompMastId, remarks: REMARKS, netAmount: NETAMT, netBillValue: NETBILLVALUE, DOCID,
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
        const DOCID = await getGreyFabricPoInvoiceNo(connection)
        const PARTYSTATE = await partyState(connection, gtCompMastId)
        const nonGridSql =
            `INSERT INTO gtgfpbillentry(GTGFPBILLENTRYID,TAXTEMP,FINYR,COMPCODE,NETAMOUNT,REMARKS,GROSSAMOUNT,TOTALQTY,NETBILLVALUE,
            PARTYBILLDATE,DOCID,PARTYSTATE,SUPPLIER,PTRANSACTION,DOCDATE,PROJECTID,ENTRYTYPE)
            VALUES ( supplierseq.nextVal,'${TAXTEMP}','${FINYR}','${COMPCODE}','${NETBILLVALUE}','${REMARKS}','${GROSSAMT}','${TOTALQTY}','${NETBILLVALUE}',
            TO_DATE('${PARTYBILLDATE}', 'DD/MM/YY'),'${DOCID}','${PARTYSTATE}','${SUPPLIER}','${GF_BILL_ENTRY_PTRANSACTION}', TO_DATE(CURRENT_DATE, 'DD/MM/YY'),'${PROJECTID}', 'SP')`
        console.log(nonGridSql, 'nonGridSql')
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select GTGFPBILLENTRYID from gtgfpbillentry where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTGFPBILLENTRYID = lastRowData.rows[0][0]
        await createTaxGridDetails(connection, taxGridDetails, GTGFPBILLENTRYID)
        await (async function createGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from GTFABPURINWARDDET 
                where POID= ${billItem.poDetId}
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let aBillQtySql = `
                select sum(billQty) from GTGFPBILLENTRYDET 
                where DETAILID = ${billItem.poDetId}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0

                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;


                let gtfabricPoDetResult = await connection.execute(`
                select aliasname,det.uom,fabdesign, fabcolor,fabrictype,fabric,fdia,kdia,ll,gg,gsm, det.processname, poRate, poQty, po.gtfabricpoid, gtnorderentry.gtnorderentryid
                from gtfabricpodet det
                join gtfabricPo po on det.GTFABRICPOID = po.gtfabricpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.gtfabricpodetid  = ${billItem.poDetId}
                `)
                const [aliasname, uom, fabdesign, fabcolor, fabrictype, fabric, fdia, kdia, ll, gg, gsm, processname, poRate, poQty, gtgfabricpoid, orderid] =
                    gtfabricPoDetResult.rows[0]


                const gridSql = `		
               
                							
                INSERT INTO GTGFPBILLENTRYDET (GTGFPBILLENTRYDETID, GTGFPBILLENTRYID,FDIA,KDIA,LL,GG,GSM,UOM,COLOR, PROCESSNAME,ALIASNAME,PONO,POQTY,DETAILID,TAX,AMOUNT,DVAL,
                    DISCAMT,DISCTYPE,BILLAMT,BILLRATE,BALQTY, 
                    BILLQTY,GRNQTY,  PORATE,ORDERNO,NOTES,
                   TRANSTYPE, POTYPE)
                    VALUES(supplierseq.nextVal, '${GTGFPBILLENTRYID}', '${fdia}','${kdia}','${ll}','${gg}','${gsm}','${uom}','${fabcolor}','${processname}','${aliasname}','${gtgfabricpoid}','${poQty}','${billItem.poDetId}', ' ${billItem.tax}','${amount}', '${billItem.discountValue}',  '${discAmount}','${billItem.discountType}',  '${billAmount}','${billItem.billRate}', '${balQty}', '${billItem.billQty}','${aGrnQty}' , '${poRate}','${orderid}',  '${billItem.notes}', '${TRANSTYPE}', '${POTYPE}'  )									
	`
                console.log(gridSql, 'grid');
                await connection.execute(gridSql)
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE GTGFPBILLENTRYDET 
                SET billQty = ${accumulatedBillQty}
                WHERE GTGFPBILLENTRYDETID = ${billItem.poDetId}
                `
                await connection.execute(updatePoBillSql)
            })
            return Promise.all(promises)
        })()
        await getGreyFabricPoInvoiceNo(connection)
        connection.commit()
        return res.json({ statusCode: 0, data: GTGFPBILLENTRYID })
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
        const result = await connection.execute(`SELECT 
                GTGFPBILLENTRY.docid,
                GTGFPBILLENTRY.docdate,
                GTGFPBILLENTRY.supplier,
                GTGFPBILLENTRY.remarks,
                GTGFPBILLENTRY.partybilldate,
                GTGFPBILLENTRY.partybillno,
                GTGFPBILLENTRY.GROSSAMOUNT,
                GTGFPBILLENTRY.netbillvalue
                FROM   GTGFPBILLENTRY
                JOIN   gtCompMast ON gtCompMast.compName1 = GTGFPBILLENTRY.supplier
                WHERE  gtCompMast.gtCompMastId = :gtCompMastId and GTGFPBILLENTRY.ENTRYTYPE = 'SP'
                    `, { gtCompMastId })
        const resp = result.rows.map(billEntry => (
            {
                docId: billEntry[0], docDate: billEntry[1], compName: billEntry[2], remarks: billEntry[3],
                DOCID: billEntry[5], partyBillDate: billEntry[4], grossAmount: billEntry[6], netBillValue: billEntry[7]
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
        GTGFPBILLENTRYDET.billqty,
        GTGFPBILLENTRYDET.billRate,
        GTGFPBILLENTRYDET.tax,
        GTGFPBILLENTRYDET.poRate,
        GTGFPBILLENTRYDET.balQty,
        GTGFPBILLENTRYDET.poQty,  
        GTGFPBILLENTRYDET.GTGFPBILLENTRYDETID,
        gtfabricPoDet.gtfabricPoDetId,
        gtfabricPo.docid,
        gtfabricPoDet.roll,
    GTGFPBILLENTRYDET.grnQty,
    GTGFPBILLENTRYDET.notes,
    GTGFPBILLENTRYDET.dval,
    GTGFPBILLENTRYDET.discType
    FROM
    GTGFPBILLENTRYDET
    LEFT JOIN gtFabricMast ON gtFabricMast.gtfabricMastId = gtgfpbillentrydet.aliasName
    LEFT JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtgfpbillentrydet.uom
    LEFT JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtgfpbillentrydet.fDia
    LEFT JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtgfpbillentrydet.kDia
    LEFT JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtgfpbillentrydet.ll
    LEFT JOIN gtGgMast ON gtGgMast.gtGgMastId =gtgfpbillentrydet.gg
    LEFT JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtgfpbillentrydet.gsm
    LEFT JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtgfpbillentrydet.design
    LEFT JOIN gtColorMast ON gtColorMast.gtColorMastId = gtgfpbillentrydet.color
    LEFT JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtgfpbillentrydet.processName
    LEFT JOIN
        gtfabricPoDet ON gtfabricPoDet.GTFABRICPODETID = GTGFPBILLENTRYDET.DETAILID
    LEFT JOIN                  
    GTGFPBILLENTRY ON GTGFPBILLENTRY.GTGFPBILLENTRYID = GTGFPBILLENTRYDET.GTGFPBILLENTRYID
    LEFT JOIN 
        gtfabricPo ON gtfabricPo.GTFABRICPOID = gtfabricPoDet.GTFABRICPOID
                WHERE
                gtgfpbillentry.DOCID = '${billEntryNo}' `)

        const resp = result.rows.map(del => ({
            fabric: del[0], color: del[1], unit: del[2], fDia: del[3], kDia: del[4], ll: del[5], gg: del[6], gsm: del[7], design: del[8], processName: del[9], billQty: del[10], billRate: del[11], tax: del[12], poRate: del[13], balQty: del[14], poQty: del[15],
            gtgfpBillEntryDetId: del[16], poDetId: del[17], poNo: del[18],
            poRoll: del[19], aDelQty: del[20], notes: del[21], discountValue: del[22], discountType: del[23]
        }))

        const result1 = await connection.execute(`
                SELECT
                GTGFPBILLENTRY.docid,
                    GTGFPBILLENTRY.docdate,
                    GTGFPBILLENTRY.supplier,
                    GTGFPBILLENTRY.remarks,
                    GTGFPBILLENTRY.partybilldate,
                    GTGFPBILLENTRY.partybillno,
                    GTGFPBILLENTRY.grossamount,
                    GTGFPBILLENTRY.netbillvalue,
                    GTGFPBILLENTRY.gtgfpbillentryid,
                    gtaddded.ADSCHEME
 FROM   GTGFPBILLENTRY
 JOIN   gtCompMast ON gtCompMast.compName1 = GTGFPBILLENTRY.supplier
 JOIN gtaddded on gtaddded.GTADDDEDID = GTGFPBILLENTRY.taxTemp
                WHERE
                GTGFPBILLENTRY.docid = '${billEntryNo}' `)


        const billEntry = result1.rows[0]
        const delNonGridDetails = {
            docId: billEntry[0], docDate: billEntry[1], supplier: billEntry[2], remarks: billEntry[3],
            partyBillDate: billEntry[4], DOCID: billEntry[5], grossAmount: billEntry[6], netBillValue: billEntry[7], gtGrpBillEntryId: billEntry[8], taxTemp: billEntry[9]
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
    const { supplierId: gtCompMastId, remarks: REMARKS, netAmount: NETAMT, netBillValue: NETBILLVALUE, DOCID, taxGridDetails,
        partyBillDate: PARTYBILLDATE, invoiceDetails, yarnPoBillEntryNo } = req.body;
    const connection = await getConnection(res);
    try {
        if (!yarnPoBillEntryNo || !invoiceDetails || !taxGridDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: yarnPoBillEntryNo , invoiceDetails' });
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
            UPDATE gtgfpbillentry
            SET remarks = '${REMARKS}',
                    PARTYBILLDATE = TO_DATE('${PARTYBILLDATE}', 'DD-MM-YYYY'),
                    DOCID = '${DOCID}',
                    TOTALQTY = '${TOTALQTY}',
                    GROSSAMOUNT = '${GROSSAMT}',
                    NETAMOUNT = ${NETBILLVALUE},
                NETBILLVALUE = ${NETBILLVALUE}
            WHERE docid = '${yarnPoBillEntryNo}'
                    `;
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select GTGFPBILLENTRYID from gtgfpbillentry where rowid = '${nonGridResult.lastRowid}'
                    `)
        const GTGFPBILLENTRYID = lastRowData.rows[0][0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT GTGFPBILLENTRYDETID from GTGFPBILLENTRYDET 
        WHERE GTGFPBILLENTRYID = ${GTGFPBILLENTRYID} `)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = invoiceDetails.filter(item => item?.gtfabricBillEntryDetId).map(item => item?.gtfabricBillEntryDetId)

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);

        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM GTGFPBILLENTRYDET WHERE GTGFPBILLENTRYDETID IN(${removedItems})`)
        }
        await deleteTaxGridDetails(connection, GTGFPBILLENTRYID);
        await createTaxGridDetails(connection, taxGridDetails, GTGFPBILLENTRYID);
        await (async function updateGridDetails() {
            const promises = invoiceDetails.map(async (billItem) => {
                let aGrnSql = `
                select sum(totalgrnqty) as alreadyGrnQty from gtfabpurinwarddet 
                where poid = ${billItem.poDetId}
                `
                const alreadyGrnResult = await connection.execute(aGrnSql)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let aBillQtySql = `
                select sum(billQty) from GTGFPBILLENTRYDET 
                where DETAILID = ${billItem.poDetId}
                `
                const alreadyBillQtyResult = await connection.execute(aBillQtySql)
                const aBillQty = alreadyBillQtyResult.rows[0][0] ? alreadyBillQtyResult.rows[0][0] : 0

                const balQty = parseFloat(aGrnQty) - parseFloat(billItem.billQty)

                const billAmount = billItem.billQty * billItem.billRate
                const discAmount = billItem.discountType === "Per" ? (billItem.discountValue / 100) * billAmount : billItem.discountValue;
                const amount = billAmount - discAmount;

                let gtfabricPoDetResult = await connection.execute(`
                select aliasname,det.uom,fabdesign, fabcolor,fabrictype,fabric,fdia,kdia,ll,gg,gsm, det.processname, poRate, poQty, po.gtfabricpoid, gtnorderentry.gtnorderentryid
                from gtfabricpodet det
                join gtfabricPo po on det.GTfabricPOID = po.gtfabricpoid
                join gtnorderentry on gtnorderentry.orderno = det.orderno
                where det.gtfabricpodetid = ${billItem.poDetId}
                `)
                const [aliasname, uom, fabdesign, fabcolor, fabrictype, fabric, fdia, kdia, ll, gg, gsm, processname, poRate, poQty, gtfabricpoid, orderid] =
                    gtfabricPoDetResult.rows[0]
                if (billItem?.gtfabricBillEntryDetId) {
                    const gridSql = `
                    UPDATE GTGFPBILLENTRYDET
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
                    WHERE GTGFPBILLENTRYDETID = '${billItem.gtgfpBillEntryDetId}''
                    `;
                    await connection.execute(gridSql)
                } else {
                    const gridSql = `
                    INSERT INTO GTGFPBILLENTRYDET (GTGFPBILLENTRYDETID, GTGFPBILLENTRYID,FDIA,KDIA,LL,GG,GSM,UOM,COLOR, PROCESSNAME,ALIASNAME,PONO,POQTY,DETAILID,TAX,AMOUNT,DVAL,
                        DISCAMT,DISCTYPE,BILLAMT,BILLRATE,BALQTY, 
                        BILLQTY,GRNQTY,  PORATE,ORDERNO,NOTES,
                       TRANSTYPE, POTYPE)
                        VALUES(supplierseq.nextVal, '${GTGFPBILLENTRYID}', '${fdia}','${kdia}','${ll}','${gg}','${gsm}','${uom}','${fabcolor}','${processname}','${aliasname}','${gtfabricpoid}','${poQty}','${billItem.poDetId}', ' ${billItem.tax}','${amount}', '${billItem.discountValue}',  '${discAmount}','${billItem.discountType}',  '${billAmount}','${billItem.billRate}', '${balQty}', '${billItem.billQty}','${aGrnQty}' , '${poRate}','${orderid}',  '${billItem.notes}', '${TRANSTYPE}', '${POTYPE}')`
                    await connection.execute(gridSql)
                }
                const accumulatedBillQty = parseFloat(aBillQty ? aBillQty : 0) + parseFloat(billItem.billQty);
                const updatePoBillSql = `
                UPDATE GTGFPBILLENTRYDET 
                SET billQty = ${accumulatedBillQty}
                WHERE GTGFPBILLENTRYDETID = ${billItem.poDetId}
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






