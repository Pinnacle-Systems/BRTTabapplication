import React, { useState } from "react";
import LabreportSts from "./LabApprovalStatus";
import { getCommonParams } from "../Utils/helper";



const LabStatus = ({ setType, type }) => {
    const [open, setOpen] = useState()

    return (
        <div className="p-2">
            <LabreportSts setType={setType} type={type} setOpen={setOpen} open={open} />
        </div>

    )
}
export default LabStatus