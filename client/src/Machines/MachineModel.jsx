import React, { useState } from "react";
import { useCreateUserMutation } from "../redux/userservice";
import { toast } from "react-toastify";
import SelectSmall from "./MachineSelect";
import { useAddAllocationEntryMutation, useGetMachineQuery } from "../redux/machineservice";
import { useCreateAllocationMutation } from "../redux/labservice";
import { useDispatch } from "react-redux";
import { push } from "../redux/features/opentabs";

const MachineModel = ({ refetch, doc, onClose, setDocId, docId, data, inwNo }) => {
  const [formData, setFormData] = useState({
    DOCID: doc,
    MACHINE: '',
    PRIORITY: '',
    INWNO: inwNo,
  });
  console.log(formData, 'formData');
  const { data: machinedata } = useGetMachineQuery();
  const Machine = machinedata?.data || [];
  console.log(Machine.map(i => i.machineId))

  const [addData] = useCreateAllocationMutation();
  const [addAllocationDet] = useAddAllocationEntryMutation()
  const priority = [
    { machineId: 'High', machineNamee: "High" },
    { machineId: 'Medium', machineNamee: "Medium" },
    { machineId: 'Low', machineNamee: "Low" },
  ];


  const storedUsername = localStorage.getItem('userName');
  const type = localStorage.getItem('statusType');
  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateData = (data) => {
    if ((data.DOCID || data.INWNO) && data.MACHINE && data.PRIORITY) {
      return true;
    }
    return false;
  };


  const dispatch = useDispatch();
  const selectedData = formData.DOCID === doc
  const handleSubmit = async (e) => {
    e.preventDefault();
    const allocateData = { USER: storedUsername, DOCID: formData.DOCID, MACHINE: formData.MACHINE, PRIORITY: formData.PRIORITY, inwNo: inwNo };
    const allocateStsData = { doc: doc, user: storedUsername, type: type, inwNo: inwNo }


    console.log("Submitting form allocateData:", allocateData);

    if (!validateData(formData)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to save the details?")) {

      return;
    }

    try {
      const response = await addData(allocateData) && addAllocationDet(allocateStsData).unwrap();

      toast.success("Allocation Created Successfully");
      refetch()
      onClose();
      dispatch(push({ id: 4, name: 'Production Entry' }))

      return response;
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }


  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-lg mx-auto bg-white shadow-xl rounded-lg w-full h-full flex items-center">
      <div className="space-y-4">
        <div className="form-group flex items-center justify-between">
          < div ><label htmlFor="DOCID" className="block text-sm font-medium text-gray-700">JOB NO :</label>
            <p className="border p-1">{formData.DOCID}</p></div>
          <div><label htmlFor="DOCID" className="block text-sm font-medium text-gray-700">INWARD NO</label>
            <p className="border p-1">{formData.INWNO}</p></div>
        </div>
        <div className="flex justify-between"> <div className="form-group">
          <label htmlFor="MACHINE" className="block text-md font-medium text-gray-700">Machine:</label>
          <SelectSmall
            select={formData.MACHINE}
            setSelect={(value) => handleSelectChange("MACHINE", value)}
            menuItems={Machine}
          />
        </div>
          <div className="form-group">
            <label htmlFor="PRIORITY" className="block text-md font-medium text-gray-700">Priority:</label>
            <SelectSmall
              select={formData.PRIORITY}
              setSelect={(value) => handleSelectChange("PRIORITY", value)}
              menuItems={priority}
            />
          </div>
        </div>
        <div className="form-group">
          <button className="w-full py-2 px-2 bg-indigo-600 text-white font-medium rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" type="submit" on>
            Submit          </button>
        </div>
      </div>
    </form >
  );
};

export default MachineModel;
