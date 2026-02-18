/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  useGetPieceReceiptQuery,
  useDeletePieceReceiptMutation,
} from "../../redux/services/PieceReceipt";
import PieceReceipt from "./PieceReceipt"; // your form component
import { MdDelete,MdModeEdit  } from "react-icons/md";

const PieceReport = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedLotId, setSelectedLotId] = useState("");
  const [selectedGridId,setSelectedGridId] = useState("")
  const [selectedClothId, setSelectedClothId] = useState("");

  const { data, isLoading, error } = useGetPieceReceiptQuery({});
  const [deleteReceipt] = useDeletePieceReceiptMutation();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteReceipt(id);
    }
  };

  // 🔹 If openForm true → Show Form Page
  if (openForm) {
    return (
      <PieceReceipt
        editData={editData}
        selectedLotId={selectedLotId}
        setSelectedLotId={setSelectedLotId}
        selectedClothId={selectedClothId}
        setSelectedClothId={setSelectedClothId} selectedGridId={selectedGridId} setSelectedGridId={setSelectedGridId}
        onClose={() => {
          setOpenForm(false);
          setEditData(null);
        }}
      />
    );
  }

  // 🔹 Otherwise Show Report Table
  return (
    <div className="h-[75vh]  pt-0">
      {/* Header */}
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold">Piece Receipt </h1>

        <button
          onClick={() => {
            setSelectedLotId('')
            setOpenForm(true)}}
          className="bg-green-600 mr-2 text-white px-5 py-1 rounded-lg hover:bg-green-700 transition"
        >
          + create
        </button>
      </div>

      {/* Table */}
      <div className="h-[70vh]  overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
        <table className="w-full lg:w-[55vw] border border-gray-200 table-fixed border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm ">
            <tr>
              <th className="w-4 px-0 border py-1">S.No</th>
              <th className="w-20 border">Lot No</th>
              <th className="w-48 border">Cloth Name</th>
              {/* <th className="w-8 border ">Actions</th> */}
            </tr>
          </thead>

          <tbody className="text-xs  text-center">
            {/* 🔹 No Data */}
            {(isLoading || error || data?.data?.length === 0) && (
              <tr className="border-none">
                <td colSpan="5" className="p-3 text-gray-500 text-center">
                  No records found
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              data?.data?.length > 0 &&
              data?.data?.map((row, index) => {
                const clothName = row?.details
                  ?.map((val) => val?.clothName)
                  .join(", ");
                return (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                    <td className="px-0 border">{index + 1}</td>
                    <td className="pl-1 py-1.5 border text-left">{row.docId}</td>
                    <td className="pl-1 border text-left">{clothName}</td>

                    {/* <td className=" border">
                      <button
                        onClick={() => {
                          setEditData(row);
                          setOpenForm(true);
                        }}
                        className="bg-blue-500 text-white px-1 mr-1 py-1 rounded text-sm"
                      >
                        <MdModeEdit  />
                      </button>

                      <button
                        onClick={() => handleDelete(row.id)}
                        className="bg-red-500 text-white px-1 py-1 rounded text-sm"
                      >
                        <MdDelete />
                      </button>
                    </td> */}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PieceReport;
