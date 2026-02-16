import React, { useState } from "react";
import MachineAllocationData from "./MachineAllocation";
import { useGetAllocationQuery } from "../redux/machineservice";



const MachineAllocation = () => {

    return (
        <div className="p-5 "><MachineAllocationData

        /></div>
    )
}
export default MachineAllocation