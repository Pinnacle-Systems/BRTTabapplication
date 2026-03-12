/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  useGetPieceReceiptQuery,
  useDeletePieceReceiptMutation,
} from "../../redux/services/PieceReceipt";
import PieceReceipt from "./PieceReceipt";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useLanguage } from "../../Context/LanguageContext"; // ← import context

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Piece Receipt",
    create: "+ Create",
    sno: "S.No",
    lotNo: "Lot No",
    clothName: "Cloth Name",
    noRecords: "No records found",
    deleteConfirm: "Are you sure you want to delete?",
  },
  ta: {
    title: "துண்டு ரசீது",
    create: "+ உருவாக்கு",
    sno: "வ.எண்",
    lotNo: "லாட் எண்",
    clothName: "துணி பெயர்",
    noRecords: "பதிவுகள் இல்லை",
    deleteConfirm: "நீக்க விரும்புகிறீர்களா?",
  },
  hi: {
    title: "पीस रसीद",
    create: "+ बनाएं",
    sno: "क्र.सं.",
    lotNo: "लॉट नं.",
    clothName: "कपड़े का नाम",
    noRecords: "कोई रिकॉर्ड नहीं मिला",
    deleteConfirm: "क्या आप वाकई हटाना चाहते हैं?",
  },
};

const PieceReport = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];

  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedLotId, setSelectedLotId] = useState("");
  const [selectedGridId, setSelectedGridId] = useState("");
  const [selectedClothId, setSelectedClothId] = useState("");

  const { data, isLoading, error } = useGetPieceReceiptQuery({});
  const [deleteReceipt] = useDeletePieceReceiptMutation();

  const handleDelete = async (id) => {
    if (window.confirm(t.deleteConfirm)) {
      await deleteReceipt(id);
    }
  };

  if (openForm) {
    return (
      <PieceReceipt
        editData={editData}
        selectedLotId={selectedLotId}
        setSelectedLotId={setSelectedLotId}
        selectedClothId={selectedClothId}
        setSelectedClothId={setSelectedClothId}
        selectedGridId={selectedGridId}
        setSelectedGridId={setSelectedGridId}
        onClose={() => {
          setOpenForm(false);
          setEditData(null);
        }}
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
            setSelectedLotId("");
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
                    {/* Action buttons commented out — uncomment if needed:
                    <td className="border">
                      <button onClick={() => { setEditData(row); setOpenForm(true); }}
                        className="bg-blue-500 text-white px-1 mr-1 py-1 rounded text-sm">
                        <MdModeEdit />
                      </button>
                      <button onClick={() => handleDelete(row.id)}
                        className="bg-red-500 text-white px-1 py-1 rounded text-sm">
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
