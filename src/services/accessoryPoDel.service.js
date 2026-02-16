import { getConnection } from "../constants/db.connection.js";
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { ACCSTOREID, COMPCODE, COMPNAME, PROJECTID, ACC_INWARD_PTRANSACTION, TCODE, TTYPE, STOCKTTYPE, LOCID, POTYPE, TRANSTYPE, ORDERTRANSTYPE } from "../constants/defaultQueryValues.js"
import { getNextAccPoInwardNo } from "../queries/sequences.js";
import { getSupplierName } from "../queries/supplier.js";
import moment from "moment";
import { getRemovedItems, substract } from "../Helpers/helper.js";

export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const aGrnNo = await getNextAccPoInwardNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: aGrnNo })
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
        const AGRNDATE = moment(new Date()).format("DD-MM-YYYY");
        const FINYEAR = await getCurrentFinancialYearId(connection);
        const AGRNNO = await getNextAccPoInwardNo(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const nonGridSql = `
        INSERT INTO gtaccPoInWard ( gtaccPoInWardID,
            STOREID,FINYEAR, COMPCODE,TCODE,TTYPE,PTRANSACTION,COMPNAME,REMARKS,VEHICLENO,LOCID,SUPPLIER,SUPPDCDATE,SUPPDCNO,AGRNDATE,AGRNNO,
            PROJECTID) 
        VALUES ( supplierseq.nextVal, '${ACCSTOREID}', '${FINYEAR}' , '${COMPCODE}' , '${TCODE}' , '${TTYPE}' , '${ACC_INWARD_PTRANSACTION}' , '${COMPNAME}' ,'${REMARKS}' ,
             '${VEHICLENO}' , '${LOCID}' , '${SUPPLIER}', TO_DATE('${DCDATE}', 'DD/MM/YY'), '${SUPPDCNO}', TO_DATE('${AGRNDATE}','DD/MM/YY'), '${AGRNNO}',
             '${PROJECTID}')
        `
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtaccPoInWardid from gtaccPoInWard where rowid = '${nonGridResult.lastRowid}'
        `)
        const gtaccPoInWardID = lastRowData.rows[0][0]
        await (async function createGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                let gtaccPoDetResult = await connection.execute(`
                select accSize, accColor,accName2, buyercode, uom, accGroup,tax,poRate, poQty,orderNo,accPoDate,po.gtaccPoId,gtaccPoDetId,totalGrnQty,grnQty,purchType
                from  gtaccpodet det 
                join gtaccpo po On po.gtaccpoId = det.gtaccPoId
                    where gtaccpodetId ='${deliveryItem.poDetId}'
                `)
                const [accSize, accColor, accName2, buyercode, uom, accGroup, tax, poRate, poQty,
                    orderNo, accPoDate, gtaccPoId, gtaccPoDetId, aGrnQty, grnQty, purchType
                ] = gtaccPoDetResult.rows[0]
                const taxRate = poRate + (poRate / 100 * tax)
                const totalGrnQty = parseFloat(deliveryItem.grnQty);
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty ? aGrnQty : 0)
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }

                const convertedPoDate = moment(accPoDate).format("DD-MM-YYYY")
                const gridSql = `
                INSERT INTO gtaccPoInwardDtl (
                    gtaccPoInwardDtlId,gtaccPoInWardID, UOM, PORATE, ACCNAME, PONO, POQTY, ACCCOLOR, ACCSIZE, ACCGRP,
                    BUYERCODE, balqty, totalGrnQty,grnQty, taxRate, gtAccPoDetID, orderNo, stockType, poDate, poType, orderTransType, excessQty,transType,purchType
                )
                    VALUES(supplierseq.nextVal,'${gtaccPoInWardID}','${uom}','${poRate}','${accName2}', '${gtaccPoId}', '${poQty}', '${accColor}', 
                    '${accSize}', '${accGroup}', '${buyercode}', '${balQty}','${totalGrnQty}', '${grnQty}' ,
                   '${taxRate}','${gtaccPoDetId}', '${orderNo}','${STOCKTTYPE}' , TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'),'${POTYPE}','${ORDERTRANSTYPE}','${excessQty}','${TRANSTYPE}' ,'${purchType}'  )
               `

                await connection.execute(gridSql)


            })
            return Promise.all(promises)
        })()
        await getNextAccPoInwardNo(connection)
        connection.commit()
        return res.json({ statusCode: 0, data: gtaccPoInWardID })
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
        const { gtCompMastId, itemWiseFilter } = req.query
        if (itemWiseFilter) {
            const result = await connection.execute(`
            SELECT
            gtaccpoDet.gtaccpoId,
            gtaccmast.accname,
            gtColorMast.colorName,
            gtProcessMast.processName,
            gtsizeMast.sizeName,
            gtaccGrpMast.accGrp,
            gtaccpoInwardDtl.agrnQty,
            gtaccpoInwardDtl.balQty, 
            gtaccpoInwardDtl.totalgrnQty,
            gtaccpoInwardDtl.grnQty,
            gtaccpoInwardDtl.excessQty,
            gtaccpoInwardDtl.gtaccpoInwardDtlId,
            gtaccpoInwardDtl.poDate,
            gtaccpoInwardDtl.OrderNo,
            gtaccPo.accPoNo AS poNo,
            gtaccPoInward.aGrnNo,
            gtProcessMast.gtProcessMastId 
        FROM
            gtaccpoInwardDtl
        JOIN
         gtaccmast ON gtaccmast.gtaccmastId = gtaccpoInwardDtl.ACCNAME
        JOIN
         gtColorMast ON gtColorMast.gtColorMastId = gtaccpoInwardDtl.ACCCOLOR
        JOIN
         gtProcessMast ON gtProcessMast.gtProcessMastId = gtaccpoInwardDtl.PURCHTYPE
        JOIN
         gtaccpoDet ON gtaccpoDet.gtaccpoDetId = gtaccpoInwardDtl.gtaccpoDetId
        JOIN
         gtsizeMast ON gtsizeMast.gtsizeMastId = gtaccpoInwardDtl.accSize
        JOIN
         gtAccGrpMast ON gtAccGrpMast.gtAccGrpMastId = gtaccpoInwardDtl.accGrp
        JOIN
         gtaccPoInward On gtaccPoInward.gtaccPoInwardId = gtaccPoInwardDtl.gtaccPoInwardId
        JOIN
         gtaccPo ON gtaccPo.gtaccPoId = gtaccpoInwardDtl.poNo
        left JOIN
         gtaccPo del on del.gtaccpoid = gtaccpoInwardDtl.gtaccpoinwardid
       left join
         gtcompmast supp on supp.compname1 = del.delto
       where 
            supp.gtcompmastid = :gtcompmastid
                          `, { gtCompMastId })

            const resp = result.rows.map(det => ({
                poDetId: det[0], accessory: det[1], color: det[2], processName: det[3], sizeName: det[4],
                accGrp: det[5], agrnQty: det[6], balQty: det[7], aDelQty: det[8],
                grnQty: det[9], excessQty: det[10], gtaccpoInwardDtlId: det[11], poDate: det[12], orderNo: det[13], poNo: det[14], aGrnNo: det[14], gtProcessMastId: det[15]
            }))
            return res.json({ statusCode: 0, data: resp })
        } else {

            const result = await connection.execute(`
            SELECT gtaccPoInward.compName,
            gtaccPoInward.remarks,
            gtaccPoInward.vehicleNo,
            gtaccPoInward.supplier,
            gtaccPoInward.suppdcDate,
            gtaccPoInward.suppdcno,
            gtaccPoInward.agrnDate,
            gtaccPoInward.agrnNo
     FROM   gtaccPoInward
     JOIN   gtCompMast ON gtCompMast.compName1 = gtaccPoInward.supplier
     JOIN gtaccPoInwardDtl ON gtaccPoInwardDtl.gtaccPoInwardId = gtaccPoInward.gtaccPoInwardId
      JOIN  gtaccPo ON gtaccPoInwardDtl.poNo = gtaccPo.gtaccPoid
      WHERE  gtCompMast.gtCompMastId = :gtCompMastId 
     
        `, { gtCompMastId })
            const resp = result.rows.map(del => ({
                compName: del[0], remarks: del[1], vehicleNo: del[2], supplier: del[3], dcDate: del[4], supplierDcNo: del[5],
                accPoInwardDate: del[6], accPoInwardNo: del[7]
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
        const { aGrnNo } = req.query
        const result = await connection.execute(`
        SELECT
        gtaccpoDet.gtaccpoId,
        gtaccmast.accname,
        gtColorMast.colorName,
        gtProcessMast.processName,
        gtsizeMast.sizeName,
        gtaccGrpMast.accGrp,
        gtaccpoInwardDtl.agrnQty,
        gtaccpoInwardDtl.balQty, 
        gtaccpoInwardDtl.totalgrnQty,
        gtaccpoInwardDtl.grnQty,
        gtaccpoInwardDtl.excessQty,
        gtaccpoInwardDtl.gtaccpoInwardDtlId,
        gtaccpoInwardDtl.poDate,
        gtaccpoInwardDtl.OrderNo,
        gtaccPo.accPoNo AS poNo,
        gtaccPoInward.aGrnNo,
        gtProcessMast.gtProcessMastId 
    FROM
        gtaccpoInwardDtl
    JOIN gtaccmast ON gtaccmast.gtaccmastId = gtaccpoInwardDtl.ACCNAME
    JOIN gtColorMast ON gtColorMast.gtColorMastId = gtaccpoInwardDtl.ACCCOLOR
    JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtaccpoInwardDtl.PURCHTYPE
    JOIN gtaccpoDet ON gtaccpoDet.gtaccpoDetId = gtaccpoInwardDtl.gtaccpoDetId
    JOIN gtsizeMast ON gtsizeMast.gtsizeMastId = gtaccpoInwardDtl.accSize
    JOIN gtAccGrpMast ON gtAccGrpMast.gtAccGrpMastId = gtaccpoInwardDtl.accGrp
    JOIN gtaccPoInward On gtaccPoInward.gtaccPoInwardId = gtaccPoInwardDtl.gtaccPoInwardId
    JOIN gtaccPo ON gtaccPo.gtaccPoId = gtaccpoInwardDtl.poNo
    where gtaccPoInward.aGrnNo = :aGrnNo
    
        `, { aGrnNo })

        const resp = result.rows.map(det => ({
            poDetId: det[0], accessory: det[1], color: det[2], processName: det[3], sizeName: det[4],
            accGrp: det[5], agrnQty: det[6], balQty: det[7], aDelQty: det[8],
            grnQty: det[9], excessQty: det[10], gtaccpoInwardDtlId: det[11], poDate: det[12], orderNo: det[13], poNo: det[14], aGrnNo: det[14], gtProcessMastId: det[15]
        }))
        console.log(resp, 'resp');
        const result1 = await connection.execute(`

        SELECT gtaccPoInward.compName,
        gtaccPoInward.remarks,
        gtaccPoInward.vehicleNo,
        gtaccPoInward.supplier,
        gtaccPoInward.suppdcDate,
        gtaccPoInward.suppdcno,
        gtaccPoInward.agrnDate,
        gtaccPoInward.agrnNo
 FROM   gtaccPoInward
 JOIN   gtCompMast ON gtCompMast.compName1 = gtaccPoInward.supplier
 JOIN   gtaccPoInwardDtl ON gtaccPoInwardDtl.gtaccPoInwardId = gtaccPoInward.gtaccPoInwardId
 JOIN   gtaccPo ON gtaccPoInwardDtl.poNo = gtaccPo.gtaccPoid 
 WHERE  gtaccPoInward.aGrnNo = :aGrnNo
        `, { aGrnNo })
        const po = result1.rows[0]
        const poId = resp[0] ? resp[0].poNo : ""
        const sql = `
        SELECT
        gtaccPo.accPoNo AS poNo,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,   
        gtcompmast.address
    FROM
        gtaccpo
    JOIN
        gtcompmast ON gtaccPo.supplier = gtcompmast.compname1
    WHERE
        gtaccPo.accpoNo = '${poId}'
        `
        let fromToData = await connection.execute(sql)
        fromToData = fromToData.rows[0]
        const delNonGridDetails = {
            compName: po[0], remarks: po[1], vehicleNo: po[2], supplier: po[3],
            suppdcDate: po[4], suppdcno: po[5], agrnDate: po[6], agrnNo: po[7],
            from: {
                poNo: fromToData[0], phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
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
    const { vehicleNo, remarks, supplierDcDate, supplierDcNo, accPoInwardNo, deliveryDetails } = req.body;
    const connection = await getConnection(res);
    try {
        if (!accPoInwardNo || !deliveryDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: accPoInwardNo , deliveryDetails' });
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const nonGridSql = `
            UPDATE gtaccPoInWard
            SET vehicleNo = '${vehicleNo}',
            remarks = '${remarks}',
            suppDcDate = TO_DATE('${supplierDcDate}', 'DD-MM-YYYY'),
            suppDcNo = '${supplierDcNo}'
            WHERE aGrnNo= '${accPoInwardNo}'`
        console.log(nonGridSql, 'nongrid');
        const nonGridResult = await connection.execute(nonGridSql);
        const lastRowData = await connection.execute(`
        select gtAccPoinwardid from gtAccPoinward where rowid = '${nonGridResult.lastRowid}'
        `)
        const gtaccPoInWardID = lastRowData.rows[0][0]
        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtaccPoInWardid from gtaccPoInWard 
        WHERE rowid ='${nonGridResult.lastRowid}'`);

        console.log(oldDeliveryDetailsItems);
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])
        const newUpdateDeliveryItemsIds = deliveryDetails.filter(item => item?.gtaccPoInwardDtlId).map(item => item?.gtaccPoInwardDtlId)
        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);
        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtaccPoInWardDtl  WHERE gtaccPoInWardDtlid  IN (${removedItems}) `)
        }
        await (async function updateGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                const alreadyGrnResult = await connection.execute(`
                    select COALESCE(sum(totalgrnqty),0 ) as alreadyGrnQty 
                    from gtaccPoInWardDtl  
                    where gtAccPoDetID = '${deliveryItem.poDetId}' and gtaccPoInWardID < '${gtaccPoInWardID}'

                    `)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let gtaccPoDetResult = await connection.execute(`
                select accSize, accColor,accName2, buyercode, uom, accGroup, balQty,tax,poRate,
  poQty,orderNo,accPoDate,po.gtaccPoId,gtaccPoDetId,EXCESSQTY,GRNQTY,TOTALGRNQTY
                from  gtaccpodet det 
                join gtaccpo po On po.gtaccpoId = det.gtaccPoId
                    where gtaccpodetId ='${deliveryItem.poDetId}'
                    
                                   `)
                const [accSize, accColor, accName2, buyercode, uom, accGroup, balQty, tax, poRate, poQty, orderNo, accPoDate, gtaccPoId, gtaccPoDetId, EXCESSQTY, GRNQTY, TOTALGRNQTY
                ] = gtaccPoDetResult.rows[0]
                console.log(gtaccPoDetResult, 'det');

                const taxRate = poRate + (poRate / 100 * tax)
                const totalGrnQty = parseFloat(deliveryItem.grnQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                console.log(deliveryItem, 'del items');
                if (deliveryItem?.gtaccPoInwardDetId) {
                    const gridSql = `
                                UPDATE gtaccPoInwardDet
                                SET totalGrnQty = '${totalGrnQty}',
                                excessQty = '${deliveryItem.excessQty}',
                                grnQty = '${deliveryItem.grnQty}' 
                                WHERE gtaccPoInwardDetId = '${deliveryItem?.gtaccPoInwardDetId}'
                            `;
                    await connection.execute(gridSql)
                } else {
                    const convertedPoDate = moment(accPoDate).format("DD-MM-YYYY")
                    const gridSql = `
                    INSERT INTO gtaccPoInwardDtl (
                        gtaccPoInwardDtlId,gtaccPoInWardID, UOM, PORATE, ACCNAME, PONO, POQTY, ACCCOLOR, ACCSIZE, ACCGRP,
                        BUYERCODE, balqty, taxRate, gtAccPoDetID, orderNo, stockType, poDate, poType, orderTransType, excessQty, grnQty,TOTALGRNQTY
                    )
                        VALUES(supplierseq.nextVal,'${gtaccPoInWardID}','${uom}', '${poRate}', '${accName2}', '${gtaccPoId}', '${poQty}', '${accColor}', 
                        '${accSize}', '${accGroup}', '${buyercode}', '${balQty}',  
                       '${taxRate}','${gtaccPoDetId}', '${orderNo}','${STOCKTTYPE}' , TO_DATE('${convertedPoDate}', 'DD-MM-YYYY'),'${POTYPE}','${TRANSTYPE}', '${EXCESSQTY}','${GRNQTY}','${TOTALGRNQTY}')
                   `
                    console.log(gridSql, 'grid sql');
                    await connection.execute(gridSql)
                    const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                    const updatePoDetSql = `
                    UPDATE GTAccPoDET 
                    SET totalGrnQty =${accumulatedGrnQty},
                    excessQty =${excessQty},
                    grnQty =${substract(accumulatedGrnQty, excessQty)}
                    WHERE GTAccPoDETID =${deliveryItem.poDetId}
                `
                    console.log(updatePoDetSql, 'acc grn');
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






