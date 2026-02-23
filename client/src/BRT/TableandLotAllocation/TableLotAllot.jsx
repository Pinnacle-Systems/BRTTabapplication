/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useGetPieceReceiptQuery } from "../../redux/services/PieceReceipt";
import TableLotForm from "./TableLotForm"; // your form component
import {
  useGetUsersQuery,
  useGetRolesQuery,
  useGetUserslogQuery,
} from "../../redux/userservice";

const TableLotAllot = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedLotNo, setSelectedLotNo] = useState("");
  const [selectedGridId, setSelectedGridId] = useState("");
  const [selectedClothId, setSelectedClothId] = useState("");
  const [selectedPiece, setSelectedPiece] = useState("");
  const [selectedSubGridId, setSelectedSubGridId] = useState("");
  const [checkingSectionId, setCheckingSectionId] = useState("");
  const [checkerId, setCheckerId] = useState("");
  const storedUserId = Number(localStorage.getItem("userId"));
  const storedRoleId = Number(localStorage.getItem("roleId"));

  const { data, isLoading, error } = useGetPieceReceiptQuery({});
  const { data: userData } = useGetUsersQuery();
  const { data: roles } = useGetRolesQuery();
  const { data: userlog } = useGetUserslogQuery();

  const adminRole = roles?.data?.find(
    (val) => val?.ROLENAME?.toLowerCase() === "admin",
  );

  const supervisorRole = roles?.data?.find(
    (val) => val?.ROLENAME?.toLowerCase() === "supervisor",
  );

  let adminId = adminRole?.ROLEID;

  let supervisorId = supervisorRole?.ROLEID;
  const isAdmin = Number(storedRoleId) === adminId;
  const isSuppervisor = Number(storedRoleId) === supervisorId;
  const storedUsername = localStorage.getItem("userName");

  console.log(isAdmin, isSuppervisor, "adminRole,adminId");

  const userOptions = userData?.data
    ?.filter?.((val) => val?.ROLEID != adminId && val?.ROLEID != supervisorId)
    ?.map((user) => ({
      label: user?.USERNAME,
      value: user?.USERID,
    }));
  console.log(userOptions, "useryajo");

  // 🔹 If openForm true → Show Form Page
  if (openForm) {
    return (
      <TableLotForm
        editData={editData}  isAdmin={isAdmin} isSuppervisor={isSuppervisor} storedUsername={storedUsername} userOptions={userOptions} storedUserId={storedUserId}
        selectedLotNo={selectedLotNo}
        setSelectedLotNo={setSelectedLotNo}
        selectedClothId={selectedClothId}
        selectedSubGridId={selectedSubGridId}
        setSelectedSubGridId={setSelectedSubGridId}
        setSelectedClothId={setSelectedClothId}
        checkerId={checkerId}
        setCheckerId={setCheckerId}
        selectedGridId={selectedGridId}
        checkingSectionId={checkingSectionId}
        setCheckingSectionId={setCheckingSectionId}
        setSelectedGridId={setSelectedGridId}
        selectedPiece={selectedPiece}
        setSelectedPiece={setSelectedPiece}
        onClose={() => {
          setOpenForm(false);
          setEditData(null);
        }}
      />
    );
  }
  return (
    <div className="h-[75vh]  pt-0">
      {/* Header */}
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold">
          Table and Lot Piece Allocation{" "}
        </h1>

        <button
          onClick={() => {
            setSelectedLotNo("");
            setCheckerId("")
            setCheckingSectionId("")
            
            setOpenForm(true);
          }}
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
                  <tr
                    key={row.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="px-0 border">{index + 1}</td>
                    <td className="pl-1 py-1.5 border text-left">
                      {row.docId}
                    </td>
                    <td className="pl-1 border text-left">{clothName}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableLotAllot;
