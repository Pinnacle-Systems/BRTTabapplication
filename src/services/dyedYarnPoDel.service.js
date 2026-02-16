import { getConnection } from "../constants/db.connection.js";
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { STOREID, COMPCODE, COMPNAME, PROJECTID, DY_INWARD_PTRANSACTION, TCODE, TTYPE, LOCID, POTYPE, TRANSTYPE, YARN_STORE_NAME, STOCKTTYPE, COMPSHORTCODE } from "../constants/defaultQueryValues.js"
import { getNextDyeddYarnPoInwardNo } from "../queries/sequences.js";
import { getSupplierName } from "../queries/supplier.js";
import moment from "moment";
import { getRemovedItems, substract } from "../Helpers/helper.js";
import { deleteYarnStock } from "../queries/stockHelper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const yPoIno = await getNextDyeddYarnPoInwardNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: yPoIno })
}

export async function create(req, res) {
    const connection = await getConnection(res)
    const { supplierId: gtCompMastId, remarks: REMARKS, vehicleNo: VEHICLENO, supplierDcDate: DCDATE, supplierDcNo: SUPPDCNO, deliveryDetails } = req.body;
    try {
        if (!gtCompMastId) {
            return res.json({ statusCode: 1, message: 'Required Fields: supplierId, deliveryDetails' });
        }

        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const YPOINDATE = moment(new Date()).format("DD-MM-YYYY");
        const FINYEAR = await getCurrentFinancialYearId(connection);
        const YPOINO = await getNextDyeddYarnPoInwardNo(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const nonGridSql = `
        INSERT INTO GTdYarnPoINWARD (GTdYarnPoINWARDID, STOREDID, FINYEAR, COMPCODE, TCODE, TTYPE, PTRANSACTION, COMPNAME,REMARKS, VEHICLENO, LOCID, SUPPLIER, DCDATE, SUPPDCNO, YPOINDATE, YPOINO,PROJECTID,ENTRYTYPE) 
        VALUES ( supplierseq.nextVal, '${STOREID}', '${FINYEAR}' , '${COMPCODE}' , '${TCODE}' , '${TTYPE}' , '${DY_INWARD_PTRANSACTION}' , '${COMPNAME}' ,'${REMARKS}' ,
             '${VEHICLENO}' , '${LOCID}' , '${SUPPLIER}', TO_DATE('${DCDATE}', 'DD/MM/YY'), '${SUPPDCNO}', TO_DATE('${YPOINDATE}','DD/MM/YY'), '${YPOINO}',
             '${PROJECTID}','SP')
        `
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtdYarnPoinwardid from gtdYarnPoinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const GTdYarnPoINWARDID = lastRowData.rows[0][0]
        await (async function createGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {

                let gtdYarnPoDetResult = await connection.execute(`
                select det.yarnname, color, det.buyercode, uom, det.processname, price, tax, orderno, poQty, noofbags , po.gtdYarnPoid, po.docdate,
                totalgrnqty,  gtunitmast.unitname, gtcolormast.colorname, gtbuyermast.buyercode,gtprocessmast.processName, gtFinancialyear.finyr,gtYarnMaster.yarnName
                from gtdYarnPodet det
                join gtdYarnPo po on det.GTdYarnPoID = po.gtdYarnPoid 
                join gtYarnMaster on gtYarnMaster.GTYARNMASTERID = det.yarnname
                join gtunitmast on gtunitmast.GTUNITMASTID = det.uom
                join gtcolormast on gtcolormast.GTCOLORMASTID = det.COLOR
                join gtbuyermast on gtbuyermast.gtbuyermastid = det.buyercode
                join gtprocessmast on gtprocessmast.gtprocessmastid = det.PROCESSNAME  
                join gtFinancialYear on gtFinancialYear.GTFINANCIALYEARID = po.finyear
                    where gtdYarnPodetid = ${deliveryItem.poDetId}
                `)

                const [yarnname, color, buyercode, uom, processname, price, tax, orderNo, poQty, poBags, gtdYarnPoid, poDate, aGrnQty, unitName, colorName, buyerCode, processName, finYearCode, yarnAliasName] = gtdYarnPoDetResult.rows[0]
                const taxRate = price + (price / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty ? aGrnQty : 0)
                const totalGrnQty = parseFloat(deliveryItem.delQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                const gridSql = `
                INSERT INTO GTdYarnPoINWARDDET (GTdYarnPoINWARDDETID,GTdYarnPoINWARDID,YARNPROCESS,BUYERCODE, YARNNAME, COLORNAME, PONO, 
                    UOM, TAXRATE, GTdYarnPoDETID, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNBAGS, TOTALGRNQTY, LOTNO, POBAGS, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${GTdYarnPoINWARDID},'${processname}','${buyercode}', '${yarnname}', '${color}', '${gtdYarnPoid}', 
                    '${uom}',  ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${price}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty},'${deliveryItem.lotNo}', ${poBags}, '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
               `
                console.log(gridSql)
                await connection.execute(gridSql)
                const stockSql = `INSERT INTO gtyarnstockmast (GTYARNSTOCKMASTID, TAXRMRATE, RMRATE, PROJECTID, IS_CANCELLED, 
                    STOCKQTY, EXCESSQTY,COMPNAME, LOTNO, 
                    FINYEAR,COMPCODE, DOCID, DOCDATE, PLUSORMINUS, TRANSTYPE, ORDERNO, 
                    YARNNAME, COLOR, UOM, QTY, 
                    RATE, TAXRATE,AMOUNT,TAXAMT,
                    LOCID,STOREDID,PROCESSNAME,BUYCODE,TOTALRATE,TAXTOTALRATE,ORDERTRANSTYPE, STOCKTYPE) 
                    VALUES(supplierseq.nextVal, 0, 0, '${PROJECTID}', 'F', 
                    '${totalGrnQty}', '${excessQty}', '${COMPNAME}', '${deliveryItem.lotNo}', 
                    '${finYearCode}', '${COMPSHORTCODE}', '${YPOINO}','${YPOINDATE}', 'P', '${DY_INWARD_PTRANSACTION}','${orderNo}', 
                    '${yarnAliasName}', '${colorName}', '${unitName}', '${totalGrnQty}', ${price}, '${taxRate}' , '${price * totalGrnQty}',
                    '${totalGrnQty * grnQty}', 
                    '${LOCID}', '${YARN_STORE_NAME}', '${processName}','${buyerCode}', '${price}', '${taxRate}', '${TRANSTYPE}', '${STOCKTTYPE}')`;

                await connection.execute(stockSql);
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE GTDYARNPODET 
                SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE GTDYARNPODETID = ${deliveryItem.poDetId}
                `
                await connection.execute(updatePoDetSql)

            })
            return Promise.all(promises)
        })()
        await getNextDyeddYarnPoInwardNo(connection)
        connection.commit()
        return res.json({ statusCode: 0, data: GTdYarnPoINWARDID })
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
        const { gtCompMastId, itemWiseFilter, IS_REC } = req.query
        let isRec = IS_REC ? IS_REC.toString() : ""
        if (itemWiseFilter) {
            const result = await connection.execute(`
            SELECT
            gtYarnMaster.yarnName,
            gtColorMast.colorName,
            gtdYarnPoInwardDet.poNo,
            gtdYarnPoInwardDet.orderNo,
            gtdYarnPoInwardDet.totalgrnQty,
            gtdYarnPoInwardDet.poPrice,
            gtdYarnPoInwardDet.balQty,
            gtdYarnPoInwardDet.poQty,
            gtdYarnPoInwardDet.grnBags,
            gtdYarnPoInwardDet.lotNo,
            gtdYarnPoInwardDet.gtdYarnPoInWardDetId,
            gtdYarnPoDet.gtdYarnPoDetId,
            gtdYarnPo.docid,poBags,
            del.delTO,
            gtdYarnPoInward.remarks, 
            gtdYarnPoInward.vehicleno,
            gtdYarnPoInward.ypoino
                    FROM
            gtdYarnPoInwardDet
        JOIN
            gtYarnMaster ON gtYarnMaster.gtYarnMasterId = gtdYarnPoInwardDet.YARNNAME
        JOIN
            gtColorMast ON gtColorMast.gtColorMastId = gtdYarnPoInwardDet.COLORNAME
        JOIN
            gtdYarnPoDet ON gtdYarnPoDet.GTdYarnPoDETID = gtdYarnPoInwardDet.GTdYarnPoDETID
        JOIN                  
            gtdYarnPoInward ON gtdYarnPoInward.gtdYarnPoInwardId = gtdYarnPoInwardDet.gtdYarnPoInwardId
        JOIN 
            gtdYarnPo ON gtdYarnPo.GTdYarnPoID = gtdYarnPoDet.GTdYarnPoID
        JOIN 
            gtdYarnPo del ON del.GTDYARNPOID = gtdYarnPoDet.GTDYARNPOID
        left JOIN 
            gtCompMast supp ON supp.compName1 = DEL.DELTO
        where  SUPP.gtcompmastid = :gtcompmastid  
        ${isRec ?
                    `AND gtdyarnPoInwardDet.IS_REC = ${isRec === 'true' ? 1 : 0}`
                    :
                    ""}      
               `, { gtCompMastId })

            const resp = result.rows.map(del => ({
                yarn: del[0], color: del[1], poId: del[2], poNo: del[12], orderNo: del[3],
                delQty: del[4], poPrice: del[5], balQty: del[6], poQty: del[7],
                delBags: del[8], lotNo: del[9], gtdYarnPoInwardDetId: del[10], poDetId: del[11], poBags: del[13], delTO: del[14], remarks: del[15], vehNo: del[16],
                ypoino: del[17]
            }))
            return res.json({ statusCode: 0, data: resp })
        } else {

            const result = await connection.execute(`
            SELECT gtdYarnPoInward.compname,
            gtdYarnPoInward.remarks,
            gtdYarnPoInward.vehicleno,
            gtdYarnPoInward.supplier,
            gtdYarnPoInward.dcdate,
            gtdYarnPoInward.suppdcno,
            gtdYarnPoInward.ypoinDate,
            gtdYarnPoInward.ypoino
     FROM   GTdYarnPoINWARD
     JOIN   gtCompMast ON gtCompMast.compName1 = gtdYarnPoInward.supplier
     JOIN gtdYarnPoInwardDet ON gtdYarnPoInwardDet.gtdYarnPoInwardId = gtdYarnPoInward.gtdYarnPoInwardId
      JOIN gtdYarnPo ON gtdYarnPoInwardDet.poNo = gtdYarnPo.gtdYarnPoid
    JOIN gtdYarnPoInwardDet ON gtdYarnPoInwardDet.gtdYarnPoInwardId = gtdYarnPoInward.gtdYarnPoInwardId
    WHERE  gtCompMast.gtCompMastId = :gtCompMastId and gtdYarnPoInward.ENTRYTYPE = 'SP' 
        `, { gtCompMastId })
            const resp = result.rows.map(del => ({
                dYarnPoInwardNo: del[7], compName: del[0], remarks: del[1], vehicleNo: del[2], supplier: del[3], dcDate: del[4], supplierDcNo: del[5],
                yPoInwardDate: del[6]
            }))
            return res.json({ statusCode: 0, data: resp })
        }

    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getDelDetails(req, res) {
    const connection = await getConnection(res)

    try {
        const { ypoIno } = req.query
        const result = await connection.execute(`
        SELECT
        gtYarnMaster.yarnName,
        gtColorMast.colorName,
        gtdYarnPoInwardDet.poNo,
        gtdYarnPoInwardDet.orderNo,
        gtdYarnPoInwardDet.totalgrnQty,
        gtdYarnPoInwardDet.poPrice,
        gtdYarnPoInwardDet.balQty,
        gtdYarnPoInwardDet.poQty,
        gtdYarnPoInwardDet.grnBags,
        gtdYarnPoInwardDet.lotNo,
        gtdYarnPoInwardDet.gtdYarnPoInWardDetId,
        gtdYarnPoDet.gtdYarnPoDetId,
        gtdYarnPo.docid,poBags
                FROM
        gtdYarnPoInwardDet
    JOIN
        gtYarnMaster ON gtYarnMaster.gtYarnMasterId = gtdYarnPoInwardDet.YARNNAME
    JOIN
        gtColorMast ON gtColorMast.gtColorMastId = gtdYarnPoInwardDet.COLORNAME
    JOIN
        gtdYarnPoDet ON gtdYarnPoDet.GTdYarnPoDETID = gtdYarnPoInwardDet.GTdYarnPoDETID
    JOIN                  
        gtdYarnPoInward ON gtdYarnPoInward.gtdYarnPoInwardId = gtdYarnPoInwardDet.gtdYarnPoInwardId
    JOIN 
        gtdYarnPo ON gtdYarnPo.GTdYarnPoID = gtdYarnPoDet.GTdYarnPoID
    WHERE
        gtdYarnPoInward.ypoIno = :ypoIno
        `, { ypoIno })

        const resp = result.rows.map(del => ({
            yarn: del[0], color: del[1], poId: del[2], poNo: del[12], orderNo: del[3],
            delQty: del[4], poPrice: del[5], balQty: del[6], poQty: del[7],
            delBags: del[8], lotNo: del[9], gtdYarnPoInwardDetId: del[10], poDetId: del[11], poBags: del[13]
        }))
        console.log(resp)
        const result1 = await connection.execute(`
        SELECT
        gtdYarnPoInward.supplier,
        gtdYarnPoInward.dcdate,
        gtdYarnPoInward.suppDcNo,
        gtdYarnPoInward.ypoIno,
        gtdYarnPoInward.yPoInDate,
        gtdYarnPoInward.gtdYarnPoInwardId,
        gtdYarnPoInward.vehicleNo,
        gtdYarnPoInward.remarks,
        gtdYarnPoInward.compName
    FROM
        gtdYarnPoInward
    JOIN
        gtdYarnPoInwardDet ON gtdYarnPoInwardDet.gtdYarnPoInwardId = gtdYarnPoInward.gtdYarnPoInwardId
    WHERE
        gtdYarnPoInward.ypoIno = :ypoIno
        `, { ypoIno })
        const po = result1.rows[0]
        const poId = resp[0] ? resp[0].poId : ""
        const sql = `
        SELECT
        gtdYarnPo.docid AS poNo,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,   
        gtcompmast.address
    FROM
        gtdYarnPo
    JOIN
        gtcompmast ON gtdYarnPo.supplier = gtcompmast.compname1
    WHERE 
        gtdYarnPo.gtdYarnPoid = ${poId}
        `
        console.log(sql)
        let fromToData = await connection.execute(sql)
        fromToData = fromToData.rows[0]
        const delNonGridDetails = {
            supplier: po[0], dcDate: po[1], suppDcNo: po[2], yPoIno: po[3],
            yPoInDate: po[4], totQty: po[5], gtdYarnPoInward: po[6], vehicleNo: po[7], remarks: po[8], compName: po[9],
            from: {
                phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
                compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            },

        }
        return res.json({ statusCode: 0, data: { ...delNonGridDetails, deliveryDetails: resp } })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close()
    }
}
export async function upDate(req, res) {
    const { vehicleNo, remarks, supplierDcDate, supplierDcNo, yarnPoInwardNo, deliveryDetails } = req.body;
    const connection = await getConnection(res);
    try {
        if (!yarnPoInwardNo || !deliveryDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: YarnPoInwardNo , deliveryDetails' })
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' })
        }
        const nonGridSql = `
            UPDATE gtdYarnPoInWard
            SET vehicleNo = '${vehicleNo}',
            remarks = '${remarks}',
            dcDate = TO_DATE('${supplierDcDate}', 'DD-MM-YYYY'),
            suppDcNo = '${supplierDcNo}'
            WHERE ypoIno= '${yarnPoInwardNo}'
        `
        const nonGridResult = await connection.execute(nonGridSql)
        console.log(nonGridResult, 'nonGridResult')

        console.log(nonGridResult, 'nonGridResult')
        const lastRowData = await connection.execute(`
        select gtdYarnPoinwardid,YPOINDATE from gtdYarnPoinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const [GTdYarnPoINWARDID, YPOINDATE] = lastRowData.rows[0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtdYarnPoinwarddetid from GTdYarnPoINWARDDET 
        WHERE gtdYarnPoinwardid = ${GTdYarnPoINWARDID}`)

        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])
        console.log(oldDeliveryDetailsItems, 'oldDeliveryDetailsItems')


        const newUpdateDeliveryItemsIds = deliveryDetails.filter(item => item?.gtdYarnPoInwardDetId).map(item => item?.gtdYarnPoInwardDetId)
        console.log(newUpdateDeliveryItemsIds, 'newUpdateDeliveryItemsIds')

        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);
        console.log(GTdYarnPoINWARDID, 'GTdYarnPoINWARDID')
        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtdYarnPoinwarddet WHERE GTdYarnPoINWARDDETID IN (${removedItems}) `)
        }
        await deleteYarnStock(connection, yarnPoInwardNo)
        await (async function updateGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                const alreadyGrnResult = await connection.execute(`
                    select COALESCE(sum(totalgrnqty),0 ) as alreadyGrnQty 
                    from gtdYarnPoinwarddet 
                    where GTdYarnPoDETID = ${deliveryItem.poDetId} and GTdYarnPoINWARDID < ${GTdYarnPoINWARDID}
                    `)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let gtdYarnPoDetResult = await connection.execute(`
                    select det.yarnname, color, det.buyercode, det.uom, det.processname, price, tax, orderno, poQty, noofbags , po.gtdYarnPoid, po.docdate, gtYarnMaster.yarnname,
                    gtunitmast.unitname, gtcolormast.colorname, gtbuyermast.buyercode,gtprocessmast.PROCESSNAME, gtFinancialyear.finyr
                    from gtdYarnPodet det
                    join gtdYarnPo po on det.GTdYarnPoID = po.gtdYarnPoid  join gtYarnMaster on gtYarnMaster.GTYARNMASTERID = det.yarnname
                    join gtunitmast on gtunitmast.GTUNITMASTID = det.uom
                    join gtcolormast on gtcolormast.GTCOLORMASTID = det.COLOR
                    join gtbuyermast on gtbuyermast.gtbuyermastid = det.buyercode
                    join gtprocessmast on gtprocessmast.gtprocessmastid = det.PROCESSNAME  
                    join gtFinancialYear on gtFinancialYear.GTFINANCIALYEARID = po.finyear            
                    where gtdYarnPodetid = ${deliveryItem.poDetId}
                    `)
                const [yarnname, color, buyercode, uom, processname, price, tax, orderNo, poQty, poBags, gtdYarnPoid, poDate, yarnAliasName, unitName, colorName, buyerCode, processName, finYearCode] = gtdYarnPoDetResult.rows[0]
                const taxRate = price + (price / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty)
                const totalGrnQty = parseFloat(deliveryItem.delQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                const stockSql = `INSERT INTO gtyarnstockmast (GTYARNSTOCKMASTID, TAXRMRATE, RMRATE, PROJECTID, IS_CANCELLED, 
                    STOCKQTY, EXCESSQTY,COMPNAME, LOTNO, 
                    FINYEAR,COMPCODE, DOCID, DOCDATE, PLUSORMINUS, TRANSTYPE, ORDERNO, 
                    YARNNAME, COLOR, UOM, QTY, 
                    RATE, TAXRATE,AMOUNT,TAXAMT,
                    LOCID,STOREDID,PROCESSNAME,BUYCODE,TOTALRATE,TAXTOTALRATE,ORDERTRANSTYPE, STOCKTYPE) 
                    VALUES(supplierseq.nextVal, 0, 0, '${PROJECTID}', 'F', 
                    '${totalGrnQty}', '${excessQty}', '${COMPNAME}', '${deliveryItem.lotNo}', 
                    '${finYearCode}', '${COMPSHORTCODE}', '${yarnPoInwardNo}','${(YPOINDATE ? moment(YPOINDATE).format("DD-MM-YYYY") : '')}', 'P', '${DY_INWARD_PTRANSACTION}','${orderNo}', 
                    '${yarnAliasName}', '${colorName}', '${unitName}', '${totalGrnQty}', ${price}, '${taxRate}' , '${price * totalGrnQty}',
                    '${totalGrnQty * grnQty}', 
                    '${LOCID}', '${YARN_STORE_NAME}', '${processName}','${buyerCode}', '${price}', '${taxRate}', '${TRANSTYPE}', '${STOCKTTYPE}')`;

                await connection.execute(stockSql);
                if (deliveryItem?.gtdYarnPoInwardDetId) {
                    const gridSql = `
                                UPDATE gtdYarnPoInwardDet
                                SET totalGrnQty = '${totalGrnQty}',
                                grnBags = '${deliveryItem.delBags}',
                                lotNo = '${deliveryItem.lotNo}' 
                                WHERE gtdYarnPoInwardDetId = '${deliveryItem?.gtdYarnPoInwardDetId}'
                            `;
                    await connection.execute(gridSql)
                } else {
                    const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                    const gridSql = `
                INSERT INTO GTdYarnPoINWARDDET (GTdYarnPoINWARDDETID,GTdYarnPoINWARDID,YARNPROCESS,BUYERCODE, YARNNAME, COLORNAME, PONO, 
                    UOM,AGRNQTY, TAXRATE, GTdYarnPoDETID, ORDERNO, GRNQTY, 
                    BALQTY, POPRICE, POQTY, GRNBAGS, TOTALGRNQTY, LOTNO, POBAGS, POTYPE, PODATE, TRANSTYPE, EXCESSQTY)
                    VALUES(supplierseq.nextVal, ${GTdYarnPoINWARDID},'${processname}','${buyercode}', '${yarnname}', '${color}', '${gtdYarnPoid}', 
                    '${uom}', ${aGrnQty}, ${taxRate}, '${deliveryItem.poDetId}', '${orderNo}', ${grnQty}, 
                    ${balQty}, ${price}, ${poQty}, ${deliveryItem.delBags}, ${totalGrnQty}, '${deliveryItem.lotNo}', ${poBags}, '${POTYPE}', 
                    TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'), '${TRANSTYPE}', ${excessQty}  )
                    `
                    await connection.execute(gridSql)
                    const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                    const updatePoDetSql = `
                    UPDATE GTdYarnPoDET 
                    SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                    WHERE GTdYarnPoDETID = ${deliveryItem.poDetId}
                `
                    await connection.execute(updatePoDetSql)
                }
            })
            return Promise.all(promises)
        })()
        await connection.commit()
        return res.json({ statusCode: 0, message: "Updated Successfully" })
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}






