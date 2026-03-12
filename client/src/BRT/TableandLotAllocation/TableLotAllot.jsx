/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useGetPieceReceiptQuery } from "../../redux/services/PieceReceipt";
import TableLotForm from "./TableLotForm";
import {
  useGetUsersQuery,
  useGetRolesQuery,
  useGetUserslogQuery,
} from "../../redux/userservice";
import { useLanguage } from "../../Context/LanguageContext";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Table and Lot Piece Allocation",
    create: "+ Create",
    sno: "S.No",
    lotNo: "Lot No",
    clothName: "Cloth Name",
    noRecords: "No records found",
  },
  ta: {
    title: "மேஜை,லாட் துண்டு ஒதுக்கீடு",
    create: "+ உருவாக்கு",
    sno: "வ.எண்",
    lotNo: "லாட் எண்",
    clothName: "துணி பெயர்",
    noRecords: "பதிவுகள் இல்லை",
  },
  hi: {
    title: "टेबल और लॉट पीस आवंटन",
    create: "+ बनाएं",
    sno: "क्र.सं.",
    lotNo: "लॉट नं.",
    clothName: "कपड़े का नाम",
    noRecords: "कोई रिकॉर्ड नहीं मिला",
  },
};

const TableLotAllot = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];

  const TABDATE = new Date().toLocaleDateString("en-GB");
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedLotNo, setSelectedLotNo] = useState("");
  const [selectedNonGridId, setSelectedNonGridId] = useState("");
  const [selectedGridId, setSelectedGridId] = useState("");
  const [selectedClothId, setSelectedClothId] = useState("");
  const [selectedPiece, setSelectedPiece] = useState("");
  const [selectedSubGridId, setSelectedSubGridId] = useState("");
  const [checkingSectionId, setCheckingSectionId] = useState("");
  const [checkerId, setCheckerId] = useState("");
  const [lotCheckingNoId, setLotCheckingNoId] = useState("");
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

  const userOptions = userData?.data
    ?.filter?.((val) => val?.ROLEID != adminId && val?.ROLEID != supervisorId)
    ?.map((user) => ({
      label: user?.USERNAME,
      value: user?.USERID,
    }));

  const onNew = () => {
    setCheckingSectionId("");
    setCheckerId("");
    setSelectedLotNo("");
    setSelectedGridId("");
    setSelectedClothId("");
    setSelectedPiece("");
    setLotCheckingNoId("");
  };

  if (openForm) {
    return (
      <TableLotForm
        editData={editData}
        lotCheckingNoId={lotCheckingNoId}
        setLotCheckingNoId={setLotCheckingNoId}
        selectedNonGridId={selectedNonGridId}
        setSelectedNonGridId={setSelectedNonGridId}
        isAdmin={isAdmin}
        userData={userData}
        isSuppervisor={isSuppervisor}
        storedUsername={storedUsername}
        userOptions={userOptions}
        storedUserId={storedUserId}
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
        onNew={onNew}
        TABDATE={TABDATE}
      />
    );
  }

  return (
    <div className="h-[75vh] pt-0">
      {/* Header */}
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold">{t.title}</h1>
        <button
          onClick={() => {
            setSelectedLotNo("");
            setCheckerId("");
            setCheckingSectionId("");
            onNew();
            setOpenForm(true);
          }}
          className="bg-green-600 mr-2 text-white px-5 py-1 rounded-lg hover:bg-green-700 transition"
        >
          {t.create}
        </button>
      </div>

      {/* Table */}
      <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
        <table className="w-full lg:w-[55vw] border border-gray-200 table-fixed border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="w-4 px-0 border py-1">{t.sno}</th>
              <th className="w-20 border">{t.lotNo}</th>
              <th className="w-48 border">{t.clothName}</th>
            </tr>
          </thead>
          <tbody className="text-xs text-center">
            {(isLoading || error || data?.data?.length === 0) && (
              <tr className="border-none">
                <td colSpan="5" className="p-3 text-gray-500 text-center">
                  {t.noRecords}
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
                    <td className="pl-1 py-1.5 border text-left">{row.docId}</td>
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
