import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";

import { useGetBarCodeDataQuery } from "../../redux/services/PackingSlip.js";
import { useLanguage } from "../../Context/LanguageContext";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Packing Slip",
    back: "Back",
    save: "Save",
    // Selection section
    selection: "Selection",
    selectPackingType: "Select Packing Type",
    selectBaleNo: "Select Bale No.",
    // Bale Details section
    baleDetails: "Bale Details",
    baleNo: "Bale No",
    packingType: "Packing Type",
    totalPcs: "Total Pcs",
    totalMeters: "Total Meters",
    // BarCode section
    barCodeSelection: "BarCode Selection",
    barCode: "Bar Code",
    clickAddPcs: "Click & Add Pcs Details",
    // Piece Details section
    pieceDetails: "Piece Details",
    sno: "S.No",
    lotNo: "Lot No",
    pcsNo: "Pcs No",
    loomNo: "Loom No",
    type: "Type",
    meters: "Meters",
    weight: "Weight",
    wgtMtr: "Wgt/Mtr",
    clothName: "Cloth Name",
    foldPct: "Fold %",
    weaverName: "Weaver Name",
    action: "Action",
    noData: "No Data Found",
    printBale: "Print Bale",
    baleNoLabel: "Bale No",
    print: "Print",
  },
  ta: {
    title: "பேக்கிங் சீட்டு",
    back: "பின்செல்",
    save: "சேமி",
    selection: "தேர்வு",
    selectPackingType: "பேக்கிங் வகையை தேர்ந்தெடு",
    selectBaleNo: "மூட்டை எண்ணை தேர்ந்தெடு",
    baleDetails: "மூட்டை விவரங்கள்",
    baleNo: "மூட்டை எண்",
    packingType: "பேக்கிங் வகை",
    totalPcs: "மொத்த துண்டுகள்",
    totalMeters: "மொத்த மீட்டர்கள்",
    barCodeSelection: "பார்கோட் தேர்வு",
    barCode: "பார்கோட்",
    clickAddPcs: "கிளிக் செய்து துண்டு விவரங்களை சேர்",
    pieceDetails: "துண்டு விவரங்கள்",
    sno: "வ.எண்",
    lotNo: "லாட் எண்",
    pcsNo: "துண்டு எண்",
    loomNo: "நெசவு எண்",
    type: "வகை",
    meters: "மீட்டர்கள்",
    weight: "எடை",
    wgtMtr: "எடை/மீட்டர்",
    clothName: "துணி பெயர்",
    foldPct: "மடிப்பு %",
    weaverName: "நெசவாளர் பெயர்",
    action: "செயல்",
    noData: "தரவு இல்லை",
    printBale: "மூட்டை அச்சிடு",
    baleNoLabel: "மூட்டை எண்",
    print: "அச்சிடு",
  },
  hi: {
    title: "पैकिंग स्लिप",
    back: "वापस",
    save: "सहेजें",
    selection: "चयन",
    selectPackingType: "पैकिंग प्रकार चुनें",
    selectBaleNo: "गांठ नं. चुनें",
    baleDetails: "गांठ विवरण",
    baleNo: "गांठ नं.",
    packingType: "पैकिंग प्रकार",
    totalPcs: "कुल पीस",
    totalMeters: "कुल मीटर",
    barCodeSelection: "बारकोड चयन",
    barCode: "बारकोड",
    clickAddPcs: "क्लिक करें और पीस विवरण जोड़ें",
    pieceDetails: "पीस विवरण",
    sno: "क्र.सं.",
    lotNo: "लॉट नं.",
    pcsNo: "पीस नं.",
    loomNo: "लूम नं.",
    type: "प्रकार",
    meters: "मीटर",
    weight: "वजन",
    wgtMtr: "वजन/मीटर",
    clothName: "कपड़े का नाम",
    foldPct: "फोल्ड %",
    weaverName: "बुनकर का नाम",
    action: "कार्रवाई",
    noData: "कोई डेटा नहीं मिला",
    printBale: "गांठ प्रिंट करें",
    baleNoLabel: "गांठ नं.",
    print: "प्रिंट",
  },
};

const PackingSlip = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];
  const [packingType, setPackingType] = useState("BALE");
  const [baleGroup, setBaleGroup] = useState("AL");
  const [baleNo1, setBaleNo1] = useState("");
  const [baleNo3, setBaleNo3] = useState("");
  const [barCode, setBarCode] = useState("");
  const [barCodeInput, setBarCodeInput] = useState(""); // typed value

  const [pieceRows, setPieceRows] = useState([]); // table rows

  const [totalPcs, setTotalPcs] = useState("");
  const [totalMeters, setTotalMeters] = useState("");

  console.log(packingType, "packingType");
  console.log(baleGroup, "baleGroup");

  const baleGroups = [
    { id: "AL", label: "AL", color: "bg-[#004a99]" },
    { id: "ARJ", label: "ARJ", color: "bg-[#8dc63f]" },
    { id: "PL", label: "PL", color: "bg-[#00aeef]" },
    { id: "SU", label: "SU", color: "bg-[#d14124]" },
    { id: "SUL", label: "SUL", color: "bg-[#e3853d]" },
  ];

  const { data: barCodeData } = useGetBarCodeDataQuery(
    { barCode },
    { skip: !barCode },
  );
  useEffect(() => {
    if (!barCodeData?.data?.length) return;
    setPieceRows((prev) => {
      const existingIds = new Set(prev.map((r) => r.GRIDID));
      const newRows = barCodeData.data.filter(
        (r) => !existingIds.has(r.GRIDID),
      );
      return [...prev, ...newRows];
    });
    setBarCode(""); // reset so next scan triggers fresh query
    setBarCodeInput(""); // clear input
  }, [barCodeData]);
  const handleBaleGroupSelect = (group) => {
    setBaleGroup(group);
  };
  const handleAddPcs = () => {
    if (barCodeInput.trim()) setBarCode(barCodeInput.trim());
  };
  const handleDeleteRow = (gridId) => {
    setPieceRows((prev) => prev.filter((r) => r.GRIDID !== gridId));
  };
  return (
    <div className="h-full md:h-[75vh] pt-0">
      {/* Header */}
      <div className="flex flex-wrap bg-white justify-between items-center py-2 px-2 rounded-lg gap-2">
        <h1 className="text-lg md:text-xl font-bold">{t.title}</h1>
        <div className="flex gap-2">
          {/* <button className="bg-red-600 text-white py-1.5 rounded-lg hover:bg-red-700 transition px-4 text-sm font-semibold whitespace-nowrap">
            {t.back}
          </button> */}
          <button className="bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition px-4 text-sm font-semibold whitespace-nowrap">
            {t.save}
          </button>
        </div>
      </div>

      <div className="h-auto md:h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl mt-2 p-3 md:p-3">
        {/* Selection Section */}
        <div className="mb-3 border border-gray-200 rounded-lg p-3">
          <h2 className="text-lg font-semibold mb- border-b pb-1">
            {t.selection}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-6 text-sm mt-2">
            <div className="sm:col-span-1 lg:col-span-3">
              <label className="block font-medium mb-2">
                {t.selectPackingType}
              </label>

              <div className="flex flex-wrap gap-4">
                {["BALE", "ROLL", "BUNDLE"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="packingType"
                      value={type}
                      checked={packingType === type}
                      onChange={(e) => setPackingType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-1 lg:col-span-7">
              <label className="block font-medium mb-2">{t.selectBaleNo}</label>
              <div className="flex flex-wrap gap-2">
                {baleGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleBaleGroupSelect(group.id)}
                    className={`${group.color} text-white py-2 px-3 rounded-md font-bold text-xs shadow-sm hover:opacity-90 transition-opacity uppercase flex-1 sm:flex-none min-w-[60px] ${baleGroup === group.id ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Bale Details Section */}
          <div className="mb-3 col-span-1 border border-gray-200 rounded-lg p-3">
            <h2 className="text-lg font-semibold mb-3 border-b pb-1">
              {t.baleDetails}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10 gap-4 text-sm">
              <div className="md:col-span-2 xl:col-span-4">
                <label className="block font-medium mb-1">{t.baleNo}</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={baleNo1}
                    onChange={(e) => setBaleNo1(e.target.value)}
                    className="w-32 border rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={baleGroup}
                    onChange={(e) => setBaleGroup(e.target.value)}
                    readOnly
                    className="w-20 border bg-gray-100 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={baleNo3}
                    onChange={(e) => setBaleNo3(e.target.value)}
                    className="w-32 border rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BarCode Selection Section */}

          <div className="mb-3 col-span-1 border border-gray-200 rounded-lg p-3">
            <h2 className="text-lg font-semibold mb-3 border-b pb-1">
              {t.barCodeSelection}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10 gap-4 text-sm">
              <div className="flex   items-end gap-3">
                <div className="">
                  <label className="text-sm font-medium mb-1 block uppercase text-[10px] tracking-wider">
                    {t.barCode}
                  </label>
                  <input
                    type="text"
                    className="border rounded-lg text-right px-2 py-1.5  focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={barCode}
                    onChange={(e) => setBarCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPcs()}
                  />
                </div>
                <button
                  onClick={handleAddPcs}
                  className="bg-green-600 px-6 text-white rounded-lg py-2 whitespace-nowrap hover:bg-green-700 transition font-semibold text-xs w-full sm:w-auto"
                >
                  {t.clickAddPcs}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Piece Details Section */}
        <div className="mt-3 w-full border border-gray-200 rounded-lg p-3 ">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1">
            {t.pieceDetails}
          </h2>

          <div className="rounded-lg border w-full border-gray-200 shadow-sm ">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse table-fixed">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-1 py-3 border-r text-center w-8">
                      {t.sno}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-48">
                      {t.lotNo}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[100px]">
                      {t.pcsNo}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[100px]">
                      {t.loomNo}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[80px]">
                      {t.type}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[100px]">
                      {t.meters}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[100px]">
                      {t.weight}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[100px]">
                      {t.wgtMtr}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[180px]">
                      {t.clothName}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[80px]">
                      {t.foldPct}
                    </th>
                    <th className="px-1 py-3 border-r text-center w-[180px]">
                      {t.weaverName}
                    </th>
                    <th className="px-1 py-3 text-center w-[80px]">
                      {t.action}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-200">
                  {pieceRows.length > 0 ? (
                    pieceRows.map((row, index) => (
                      <tr
                        key={row.GRIDID}
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className=" py-2 border-r text-center">
                          {index + 1}
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.LOTNO}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.PCSNO}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.LOOMNO}
                        </td>
                        <td className=" py-2 border-r text-center pr-1">
                          {row.GRID_BARCODE ? "Grid" : "Non-Grid"}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {Number(row.METERS).toFixed(2)}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {Number(row.WEIGHT).toFixed(2)}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.METERS
                            ? (Number(row.WEIGHT) / Number(row.METERS)).toFixed(
                                3,
                              )
                            : "-"}
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.CLOTHID}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.FOLD_PERCENTAGE}%
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.WEAVERID}
                        </td>
                        <td className=" py-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(row.GRIDID)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white">
                      <td
                        colSpan="12"
                        className="text-center py-8 text-gray-500 font-bold"
                      >
                        {t.noData}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Print Bale Section - MATCHING BARCODE STYLE */}
        <div className="bg-white border  border-gray-200 rounded-lg p-3 md:p-4 shadow-sm flex flex-col justify-center mt-5">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            {t.printBale}
          </h3>
          <div className="flex flex-wrap  sm:flex-nowrap items-end gap-3">
            <div className="flex flex-col flex-1 w-full max-w-[9rem]">
              <label className="text-sm font-medium mb-1 uppercase text-[10px] tracking-wider">
                {t.baleNoLabel}
              </label>
              <input
                type="text"
                className="border rounded-lg text-right px-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="bg-[#004a99] hover:bg-[#003d7e] text-white px-6 py-2 rounded-lg font-bold text-xs shadow-sm transition-all uppercase tracking-wider h-[34px]">
              {t.print}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingSlip;
