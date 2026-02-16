import { getConnection } from "../constants/db.connection.js";
import { getCurrentFinancialYearId } from "../queries/financialYear.js";
import { STOREID, STORES, COMPCODE, COMPNAME, PROJECTID, GF_INWARD_PTRANSACTION, TCODE, TTYPE, LOCID, POTYPE, TRANSTYPE, STOCKTTYPE, COMPSHORTCODE, } from "../constants/defaultQueryValues.js"
import { getNextGreyFabPurInwardNo } from "../queries/sequences.js";
import { getSupplierName } from "../queries/supplier.js";
import moment from "moment";
import { getRemovedItems, substract } from "../Helpers/helper.js";
import { deleteYarnStock } from "../queries/stockHelper.js";
export async function getDocId(req, res) {
    const connection = await getConnection(res)
    const fPoIno = await getNextGreyFabPurInwardNo(connection);
    connection.close()
    return res.json({ statusCode: 0, docId: fPoIno })
}

export async function create(req, res) {
    const connection = await getConnection(res)
    const { supplierId: gtCompMastId, remarks: REMARKS, vehicleNo: VEHNO, supplierDcDate: SUPPDCDATE, supplierDcNo: SUPPDCNO, deliveryDetails } = req.body;
    try {
        if (!gtCompMastId) {
            return res.json({ statusCode: 1, message: 'Required Fields: supplierId, deliveryDetails' });
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const GFPOINDATE = moment(new Date()).format("DD-MM-YYYY");
        const FPIDATE = moment(new Date()).format("DD-MM-YYYY");
        const FINYEAR = await getCurrentFinancialYearId(connection);
        const FPINO = await getNextGreyFabPurInwardNo(connection);
        const SUPPLIER = await getSupplierName(connection, gtCompMastId);
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.grnQty), 0);
        const nonGridSql = `
        INSERT INTO gtFabPurInward (gtFabPurInwardId, FINYEAR, REMARKS, COMPCODE, TOTALQTY, TCODE, TTYPE, PTRANSACTION, COMPNAME, FPINO, LOCID, STORES, SUPPLIER, SUPPDCDATE, SUPPDCNO, FPIDATE, PROJECTID, VEHNO, ENTRYTYPE) 
        VALUES (supplierseq.nextVal, '${FINYEAR}', '${REMARKS}', '${COMPCODE}', '${TOTALQTY}', '${TCODE}', '${TTYPE}', '${GF_INWARD_PTRANSACTION}', '${COMPNAME}', '${FPINO}', '${LOCID}', '${STORES}', '${SUPPLIER}', TO_DATE('${SUPPDCDATE}', 'DD/MM/YY'), '${SUPPDCNO}', TO_DATE('${FPIDATE}', 'DD/MM/YY'), '${PROJECTID}', '${VEHNO}', 'SP')`
            ;
        console.log(nonGridSql, 'non grid');
        const nonGridResult = await connection.execute(nonGridSql)
        const lastRowData = await connection.execute(`
        select gtFabPurInwardId from gtFabPurInward where rowid = '${nonGridResult.lastRowid}'
        `)
        const gtFabPurInwardId = lastRowData.rows[0][0]
        await (async function createGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {

                let gtFabricPoDetResult = await connection.execute(`
                SELECT 
                det.aliasname,
                det.uom,
                det.fabdesign,
                det.fabcolor,
                det.fabrictype,
                det.fabric,
                det.fdia,
                det.kdia,
                det.ll,
                det.gg,
                det.gsm,
                det.buyercode,
                det.processName,
                det.porate,
                det.tax,
                det.orderno,
                det.poQty,
                po.gtfabricpoid,
                po.docdate,
                det.totalgrnqty,
                gtfabricmast.fabric,
                gtunitmast.unitname, gtcolormast.colorname, 
                gtprocessmast.PROCESSNAME, gtFinancialyear.finyr
            FROM 
                gtfabricpodet det
            JOIN 
                gtfabricpo po ON det.GTFABRICPOID = po.gtfabricpoid
            LEFT JOIN 
                gtfabricmast ON gtfabricmast.gtfabricmastid = det.fabric
            join gtunitmast on gtunitmast.GTUNITMASTID = det.uom
            join gtcolormast on gtcolormast.GTCOLORMASTID = det.FABCOLOR
            join gtprocessmast on gtprocessmast.gtprocessmastid = det.PROCESSNAME  
            join gtFinancialYear on gtFinancialYear.GTFINANCIALYEARID = po.finyear
                            where gtfabricpodetid =  ${deliveryItem.poDetId}
                `);
                const [aliasName, uom, fabdesign, fabcolor, fabrictype, fabric, fDia, kDia, ll, gg, gsm, buyerCode, processName, porate, tax, orderNo, poQty, poNo, poDate,
                    aGrnQty, fabName, unitName, colorName, proName, finYearCode] = gtFabricPoDetResult.rows[0]
                console.log(gtFabricPoDetResult, 'gtfabdet');

                const taxRate = porate + (porate / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty ? aGrnQty : 0)
                const totalGrnQty = parseFloat(deliveryItem.grnQty);
                let grnQty = totalGrnQty;
                let excessQty = 0;
                if (grnQty > balQty) {
                    grnQty = balQty
                    excessQty = totalGrnQty - balQty
                }
                const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                const gridSql = `
                INSERT INTO GTFABPURINWARDDET (GTFABPURINWARDDETID,gtFabPurInwardId,PROCESSNAME,KDIA,DESIGN,UOM,FDIA,LL,GG,GSM,COLOR, FABTYPE,FABRIC,ALIASNAME,PONO,TAXRATE,BUYERCODE,ORDERNO,PORATE,AGRNQTY,GRNQTY,BALQTY,POQTY,TOTALGRNQTY,EXCESSQTY,POID,GRNROLLS,LOTNO)                   
                    VALUES(supplierseq.nextVal,'${gtFabPurInwardId}','${processName}','${kDia}', '${fabdesign}', '${uom}', '${fDia}', 
                    '${ll}', '${gg}', '${gsm}','${fabcolor}','${fabrictype}','${fabric}','${aliasName}','${poNo}','${taxRate}','${buyerCode}','${orderNo}','${porate}','${aGrnQty}','${grnQty}','${balQty}','${poQty}','${totalGrnQty}', '${excessQty}', '${deliveryItem.poDetId}', 
                      '${deliveryItem.grnRolls}','${deliveryItem.lotNo}' )               
                `
                console.log(gridSql);
                await connection.execute(gridSql)
                const stockSql = `INSERT INTO gtyarnstockmast (GTYARNSTOCKMASTID, TAXRMRATE, RMRATE, PROJECTID, IS_CANCELLED, 
                    STOCKQTY, EXCESSQTY,COMPNAME, LOTNO, 
                    FINYEAR,COMPCODE, DOCID, DOCDATE, PLUSORMINUS, TRANSTYPE, ORDERNO, 
                    YARNNAME, COLOR, UOM, QTY, 
                    RATE, TAXRATE,AMOUNT,TAXAMT,
                    LOCID,STOREDID,PROCESSNAME,BUYCODE,TOTALRATE,TAXTOTALRATE,ORDERTRANSTYPE, STOCKTYPE) 
                    VALUES(supplierseq.nextVal, 0, 0, '${PROJECTID}', 'F', 
                    '${totalGrnQty}', '${excessQty}', '${COMPNAME}', '${deliveryItem.lotNo}', 
                    '${finYearCode}', '${COMPSHORTCODE}', '${FPINO}','${FPIDATE}', 'P', '${GF_INWARD_PTRANSACTION}','${orderNo}', 
                    '${fabName}', '${colorName}', '${unitName}', '${totalGrnQty}', ${porate}, '${taxRate}' , '${porate * totalGrnQty}',
                    '${totalGrnQty * grnQty}', 
                    '${LOCID}', '${STORES}', '${proName}','${buyerCode}', '${porate}', '${taxRate}', '${TRANSTYPE}', '${STOCKTTYPE}')`;
                console.log(stockSql, 'stockSql');
                await connection.execute(stockSql);
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE  gtfabricpodet
                SET totalGrnQty = ${accumulatedGrnQty},
                    excessQty = ${excessQty},
                    grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE GTFABRICPODETID = ${deliveryItem.poDetId}
                `
                await connection.execute(updatePoDetSql)
            })
            return Promise.all(promises)
        })()
        await getNextGreyFabPurInwardNo(connection)
        connection.commit()
        return res.json({ statusCode: 0, data: gtFabPurInwardId })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ error: err })
    } finally {
        await connection.close()
    }

}
export async function updateIsRec(req, res) {
    const connection = await getConnection(res)
    try {
        const { gtfabpurinwarddetId } = req.query;
        const response = await connection.execute(`
        UPDATE gtfabpurinwarddet a
        SET a.IS_REC = 1
        WHERE a.gtfabpurinwarddetId = :gtfabpurinwarddetId
                        `, { gtfabpurinwarddetId });

        connection.commit();

        if (response.rowsAffected === 1) {
            return res.json({ statusCode: 0, data: "Purchase Order Accepted" });
        } else {
            return res.json({ statusCode: 1, data: "ypoIno Does not Exist" });
        }
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        await connection.close();
    }
}
export async function get(req, res) {
    const connection = await getConnection(res)
    let result;
    try {
        const { gtCompMastId, itemWiseFilter, IS_REC } = req.query
        console.log(req.query, 'data');
        let isRec = IS_REC ? IS_REC.toString() : ""
        if (itemWiseFilter) {
            const sql = `
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
            gtFabTypeMast.fabType,
            gtProcessMast.processName,
            gtfabpurinwarddet.poNo,
            gtfabpurinwarddet.orderNo,
            gtfabpurinwarddet.totalgrnQty,
            gtfabpurinwarddet.poRate,
            gtfabpurinwarddet.balQty,
            gtfabpurinwarddet.poQty,
            gtfabpurinwarddet.grnRolls,
            gtfabpurinwarddet.lotNo,
            gtfabpurinwarddet.agrnQty,
            gtfabpurinwarddet.gtfabpurinwarddetId,
            gtFabricPoDet.gtFabricpoDetId,
            gtfabricPo.docid,
            del.delto,
            gtfabpurinward.remarks,
            gtfabpurinward.fpino,
            gtfabpurinward.vehno,
            gtFabpurInwardDet.IS_REC
            FROM
            gtFabpurInwardDet
            JOIN gtFabricMast ON gtFabricMast.gtfabricMastId = gtFabpurInwardDet.aliasName
            JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtFabpurInwardDet.uom
            JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtFabpurInwardDet.fDia
            JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtFabpurInwardDet.kDia
            JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtFabpurInwardDet.ll
            JOIN gtGgMast ON gtGgMast.gtGgMastId =gtFabpurInwardDet.gg
            JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtFabpurInwardDet.gsm
            JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtFabpurInwardDet.design
            JOIN gtFabTypeMast ON gtFabTypeMast.gtfabTypeMastId =gtFabpurInwardDet.fabType
            JOIN gtColorMast ON gtColorMast.gtColorMastId = gtFabpurInwardDet.color
            JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtFabpurInwardDet.processName
    JOIN
        gtFabricPoDet ON gtFabricPoDet.gtFabricPoDetId = gtfabpurinwarddet.poId
    JOIN                  
        gtFabpurInward ON gtFabpurInward.gtFabpurInwardId = gtfabpurinwarddet.gtFabpurInwardId
    JOIN 
        gtFabricPo ON gtFabricPo.gtFabricPoID = gtFabricPoDet.gtFabricPoID
    JOIN
        gtfabricpo del on del.gtfabricpoid = gtfabricpodet.gtfabricpoid
    LEFT JOIN 
        gtcompmast supp on supp.compname1 = del.delto
        where  SUPP.gtcompmastid = :gtcompmastid
        ${isRec ?
                    `AND gtFabpurInwardDet.IS_REC = ${isRec === 'true' ? 1 : 0}`
                    :
                    ""}
`
            result = await connection.execute(sql, { gtCompMastId })

            const resp = result.rows.map(del => ({
                fabric: del[0], color: del[1], uom: del[2], fDia: del[3], kDia: del[4],
                ll: del[5], gg: del[6], gsm: del[7], fabricDesign: del[8],
                fabType: del[9], processName: del[10], poId: del[11], orderNo: del[12], grnQty: del[13], poRate: del[14], balQty: del[15], poQty: del[16], grnRolls: del[17], lotNo: del[18], aDelQty: del[19], gtfabpurinwarddetId: del[20], poDetId: del[21], poNo: del[22], delto: del[23], remarks: del[24], fpino: del[25], vehno: del[26], isReceived: del[27]

            }))
            return res.json({ statusCode: 0, data: resp })
        } else {
            const result = await connection.execute(`
        SELECT gtfabpurinward.compname,
        gtfabpurinward.remarks,
        gtfabpurinward.vehno,
        gtfabpurinward.supplier,
        gtfabpurinward.suppdcdate,
        gtfabpurinward.suppdcno,
        gtfabpurinward.fpiDate,
        gtfabpurinward.fpino,
        gtfabpurinward.totalqty
 FROM   gtFabPurInward
 JOIN   gtCompMast ON gtCompMast.compName1 = gtfabpurinward.supplier
 JOIN gtfabpurinwardDet ON gtfabpurinwardDet.gtFabPurInwardId = gtfabpurinward.gtFabPurInwardId
  JOIN gtFabricPo ON gtfabpurinwardDet.poNo = gtFabricPo.gtFabricPoid
JOIN gtfabpurinwardDet ON gtfabpurinwardDet.gtFabPurInwardId = gtfabpurinward.gtFabPurInwardId
WHERE  gtCompMast.gtCompMastId = :gtCompMastId and gtFabPurInward.ENTRYTYPE = 'SP' 
    `, { gtCompMastId })
            const resp = result.rows.map(del => ({
                gfPoInwardNo: del[7], compName: del[0], remarks: del[1], vehicleNo: del[2], supplier: del[3], dcDate: del[4], supplierDcNo: del[5],
                gfPoInwardDate: del[6], totalQty: del[8],
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
        const { fpIno } = req.query
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
        gtFabTypeMast.fabType,
        gtProcessMast.processName,
        gtfabpurinwarddet.poNo,
        gtfabpurinwarddet.orderNo,
        gtfabpurinwarddet.totalgrnQty,
        gtfabpurinwarddet.poRate,
        gtfabpurinwarddet.balQty,
        gtfabpurinwarddet.poQty,
        gtfabpurinwarddet.grnRolls,
        gtfabpurinwarddet.lotNo,
        gtfabpurinwarddet.agrnQty,
        gtfabpurinwarddet.gtfabpurinwarddetId,
    gtFabricPoDet.gtFabricpoDetId,
    gtfabricPo.docid
        FROM
        gtFabpurInwardDet
        JOIN gtFabricMast ON gtFabricMast.gtfabricMastId = gtFabpurInwardDet.aliasName
        JOIN gtUnitMast ON gtUnitMast.gtUnitMastId =gtFabpurInwardDet.uom
        JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtFabpurInwardDet.fDia
        JOIN gtDiaMast ON gtDiaMast.gtDiaMastId =gtFabpurInwardDet.kDia
        JOIN gtLoopMast ON gtLoopMast.gtLoopMastId =gtFabpurInwardDet.ll
        JOIN gtGgMast ON gtGgMast.gtGgMastId =gtFabpurInwardDet.gg
        JOIN gtGsmMast ON gtGsmMast.gtGsmMastId =gtFabpurInwardDet.gsm
        JOIN gtDesignMast ON gtDesignMast.gtDesignMastId =gtFabpurInwardDet.design
        JOIN gtFabTypeMast ON gtFabTypeMast.gtfabTypeMastId =gtFabpurInwardDet.fabType
        JOIN gtColorMast ON gtColorMast.gtColorMastId = gtFabpurInwardDet.color
        JOIN gtProcessMast ON gtProcessMast.gtProcessMastId = gtFabpurInwardDet.processName
JOIN
    gtFabricPoDet ON gtFabricPoDet.gtFabricPoDetId = gtfabpurinwarddet.poId
JOIN                  
gtFabpurInward ON gtFabpurInward.gtFabpurInwardId = gtfabpurinwarddet.gtFabpurInwardId
JOIN 
    gtFabricPo ON gtFabricPo.gtFabricPoID = gtFabricPoDet.gtFabricPoID
WHERE
     gtFabpurInward.fpino = :fpino
        `, { fpIno })


        const resp = result.rows.map(del => ({
            fabric: del[0], color: del[1], uom: del[2], fDia: del[3], kDia: del[4],
            ll: del[5], gg: del[6], gsm: del[7], fabricDesign: del[8],
            fabType: del[9], processName: del[10], poId: del[11], orderNo: del[12], grnQty: del[13], poRate: del[14], balQty: del[15], poQty: del[16], grnRolls: del[17], lotNo: del[18], aDelQty: del[19], gtfabpurinwarddetId: del[20], poDetId: del[21], poNo: del[22]
        }))

        const result1 = await connection.execute(`
        SELECT
        gtfabpurinward.supplier,
        gtfabpurinward.suppdcdate,
        gtfabpurinward.suppDcNo,
        gtfabpurinward.fpIno,
        gtfabpurinward.fPIDate,
        gtfabpurinward.totalQty,
        gtfabpurinward.gtFabPurInwardId,
        gtfabpurinward.vehNo,
        gtfabpurinward.remarks,
        gtfabpurinward.compName
    FROM
    gtfabpurinward
    JOIN
        gtfabpurinwardDet ON gtfabpurinwardDet.gtFabPurInwardId = gtfabpurinward.gtFabPurInwardId
    WHERE
        gtfabpurinward.fpIno = :fpIno
        `, { fpIno })

        const po = result1.rows[0]
        const poId = resp[0] ? resp[0].poId : ""
        let fromToData = await connection.execute(`
        SELECT
        gtFabricpo.docid AS poNo,
        gtcompmast.phoneno,
        gtcompmast.citystate,
        gtcompmast.compname,
        gtcompmast.pincode,
        gtcompmast.panno,
        gtcompmast.gstno,
        gtcompmast.email,
        gtcompmast.address        
    FROM
        gtFabricpo
    JOIN
        gtcompmast ON gtFabricpo.supplier = gtcompmast.compname1
    WHERE 
        gtFabricpo.gtFabricpoid = ${poId}
        `)
        fromToData = fromToData.rows[0]
        const delNonGridDetails = {
            supplier: po[0], dcDate: po[1], suppDcNo: po[2], fpIno: po[3],
            gFPoInDate: po[4], totalQty: po[5], gtfabpurinward: po[6], vehicleNo: po[7], remarks: po[8], compName: po[9],
            from: {
                phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
                compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            },
            to: {
                phoneNo: fromToData[1], city: fromToData[2].split("|")[0] ? fromToData[2].split("|")[0].trim(" ") : "", state: fromToData[2].split("|")[1] ? fromToData[2].split("|")[1].trim(" ") : "",
                compName: fromToData[3], pinCode: fromToData[4], panNo: fromToData[5], gstNo: fromToData[6], email: fromToData[7], address: fromToData[8]
            }

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
    const { vehicleNo, remarks, supplierDcDate, supplierDcNo, fabpurInwardNo, deliveryDetails } = req.body;
    const connection = await getConnection(res);
    try {
        if (!fabpurInwardNo || !deliveryDetails) {
            return res.json({ statusCode: 1, message: 'Required Fields: fabpurInwardNo, deliveryDetails' });
        }
        if (deliveryDetails.length === 0) {
            return res.json({ statusCode: 1, message: 'Delivery Details Cannot be Empty' });
        }
        const TOTALQTY = deliveryDetails.reduce((a, c) => a + parseFloat(c.grnQty), 0);
        console.log('run');
        const nonGridSql = `
            UPDATE gtfabpurinward
            SET VEHNO = '${vehicleNo}',
                remarks = '${remarks}',
                SUPPDCDATE= TO_DATE('${supplierDcDate}', 'DD-MM-YYYY'),
                suppDcNo = '${supplierDcNo}',
                totalQty = ${TOTALQTY}
            WHERE fpIno= '${fabpurInwardNo}'
        `;
        console.log(nonGridSql, 'non')

        const nonGridResult = await connection.execute(nonGridSql);
        console.log(nonGridSql, 'non')
        const lastRowData = await connection.execute(`
        select gtFabPurInwardId from gtFabPurInward where rowid = '${nonGridResult.lastRowid}'
        `)
        const [gtFabPurInwardId, FPIDATE] = lastRowData.rows[0]

        let oldDeliveryDetailsItems = await connection.execute(`SELECT gtfabpurinwarddetid from gtfabpurinwardDET 
        WHERE gtFabPurInwardId = ${gtFabPurInwardId}`)
        oldDeliveryDetailsItems = oldDeliveryDetailsItems.rows.map(item => item[0])

        const newUpdateDeliveryItemsIds = deliveryDetails.filter(item => item?.gtfabpurinwardDetId).map(item => item?.gtfabpurinwardDetId)
        const removedItems = getRemovedItems(oldDeliveryDetailsItems, newUpdateDeliveryItemsIds);
        if (removedItems.length > 0) {
            await connection.execute(`DELETE FROM gtfabpurinwarddet WHERE gtfabpurinwardDETID IN (${removedItems}) `)
        }
        await deleteYarnStock(connection, fabpurInwardNo)
        await (async function updateGridDetails() {
            const promises = deliveryDetails.map(async (deliveryItem) => {
                console.log(deliveryItem.poDetId, ' deldeeet');
                const alreadyGrnResult = await connection.execute(`
                    select COALESCE(sum(totalgrnqty),0 ) as alreadyGrnQty 
                    from gtfabpurinwarddet 
                    where POID = ${deliveryItem.poDetId} and gtFabPurInwardId < ${gtFabPurInwardId}
                    `)
                const [aGrnQty] = alreadyGrnResult.rows[0]
                let gtFabricPoDetResult = await connection.execute(`
                select aliasname,det.uom,det.fabdesign,det.fabcolor,det.fabrictype,det.fabric,det.fdia,det.kdia,det.ll,det.gg,det.gsm,det.buyercode,det.processname,det.porate,tax,orderno, poQty, roll, po.gtfabricpoid, po.docdate,     gtfabricmast.fabric,
                gtunitmast.unitname, gtcolormast.colorname, 
                gtprocessmast.PROCESSNAME, gtFinancialyear.finyr              
                from gtfabricpodet det
                join gtfabricpo po on det.GTFABRICPOID = po.gtfabricpoid
                LEFT JOIN 
                gtfabricmast ON gtfabricmast.gtfabricmastid = det.fabric
            join gtunitmast on gtunitmast.GTUNITMASTID = det.uom
            join gtcolormast on gtcolormast.GTCOLORMASTID = det.FABCOLOR
            join gtprocessmast on gtprocessmast.gtprocessmastid = det.PROCESSNAME  
            join gtFinancialYear on gtFinancialYear.GTFINANCIALYEARID = po.finyear
                    where gtfabricpodetid = ${deliveryItem.poDetId}
                    `)
                const [aliasName, uom, fabdesign, fabcolor, fabrictype, fabric, fDia, kDia, ll, gg, gsm, buyerCode, processName, porate, tax, orderNo, poQty, roll, poNo, poDate, fabName, unitName, colorName, proName, finYearCode] = gtFabricPoDetResult.rows[0]
                const taxRate = porate + (porate / 100 * tax)
                const balQty = parseFloat(poQty) - parseFloat(aGrnQty)
                const totalGrnQty = parseFloat(deliveryItem.grnQty);
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
                    '${finYearCode}', '${COMPSHORTCODE}', '${fabpurInwardNo}','${(FPIDATE ? moment(FPIDATE).format("DD-MM-YYYY") : '')}', 'P', '${GF_INWARD_PTRANSACTION}','${orderNo}', 
                    '${fabName}', '${colorName}', '${unitName}', '${totalGrnQty}', ${porate}, '${taxRate}' , '${porate * totalGrnQty}',
                    '${totalGrnQty * grnQty}', 
                    '${LOCID}', '${STORES}', '${proName}','${buyerCode}', '${porate}', '${taxRate}', '${TRANSTYPE}', '${STOCKTTYPE}')`;
                console.log(stockSql, 'stockSql');
                await connection.execute(stockSql);

                if (deliveryItem?.gtfabpurinwardDetId) {
                    const gridSql = `
                                UPDATE gtfabpurinwardDet
                                SET totalGrnQty = '${totalGrnQty}',
                                grnBags = '${deliveryItem.delBags}',
                                lotNo = '${deliveryItem.lotNo}' 
                                WHERE gtfabpurinwardDetId = '${deliveryItem?.gtfabpurinwardDetId}'
                            `;
                    await connection.execute(gridSql)
                } else {
                    const convertedPoDate = moment(poDate).format("DD-MM-YYYY")
                    const gridSql = `
                    INSERT INTO GTFABPURINWARDDET (GTFABPURINWARDDETID,gtFabPurInwardId,PROCESSNAME,KDIA,DESIGN,UOM,FDIA,LL,GG,GSM,COLOR,FABTYPE,FABRIC,ALIASNAME,PONO,TAXRATE,BUYERCODE,ORDERNO,PORATE,AGRNQTY,GRNQTY,BALQTY,POQTY,TOTALGRNQTY,EXCESSQTY,POID,GRNROLLS,LOTNO)                   
                    VALUES(supplierseq.nextVal,'${gtFabPurInwardId}','${processName}','${kDia}', '${fabdesign}', '${uom}', '${fDia}', 
                    '${ll}', '${gg}', '${gsm}','${fabcolor}','${fabrictype}','${fabric}','${aliasName}','${poNo}','${taxRate}','${buyerCode}','${orderNo}','${porate}','${aGrnQty}','${grnQty}','${balQty}','${poQty}','${totalGrnQty}', '${excessQty}', '${deliveryItem.poDetId}', 
                      '${deliveryItem.grnRolls}','${deliveryItem.lotNo}' )                    
                    `
                    console.log(gridSql, 'hhhh');

                    await connection.execute(gridSql)

                }
                const accumulatedGrnQty = parseFloat(aGrnQty ? aGrnQty : 0) + parseFloat(totalGrnQty);
                const updatePoDetSql = `
                UPDATE GTFABRICPODET 
                SET totalGrnQty = ${accumulatedGrnQty},
                excessQty = ${excessQty},
                grnQty = ${substract(accumulatedGrnQty, excessQty)}
                WHERE gtfabricpodetid = ${deliveryItem.poDetId}
            `
                await connection.execute(updatePoDetSql)
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






