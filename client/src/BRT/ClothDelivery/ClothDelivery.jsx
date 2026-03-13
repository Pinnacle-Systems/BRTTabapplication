import React, { useState } from "react";
import Select from "react-select";
import { useLanguage } from "../../Context/LanguageContext";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Cloth Delivery - Bale Verification",
    back: "Back",
    save: "Save",
    // DC Details
    dcDetails: "DC Details",
    dcNo: "Dc No.",
    select: "Select",
    partyName: "Party Name",
    totalBales: "Total Bales",
    totalMeters: "Total Meters",
    scannedBales: "Scanned Bales",
    scannedMeters: "Scanned Meters",
    unScannedBales: "Un-Scanned Bales",
    unScannedMeters: "Un-Scanned Meters",
    // BarCode
    barCodeSelection: "BarCode Selection",
    barCode: "BAR CODE",
    checkDelivery: "CHECK DELIVERY",
    // DC Bale Details table
    dcBaleDetails: "DC Bale Details",
    baleNo: "Bale No.",
    clothName: "Cloth Name",
    pcs: "Pcs",
    meters: "Meters",
    weight: "Weight",
    noData: "No Data Found",
  },
  ta: {
    title: "துணி வழங்கல் - மூட்டை சரிபார்ப்பு",
    back: "பின்செல்",
    save: "சேமி",
    dcDetails: "DC விவரங்கள்",
    dcNo: "DC எண்.",
    select: "தேர்ந்தெடு",
    partyName: "கட்சி பெயர்",
    totalBales: "மொத்த மூட்டைகள்",
    totalMeters: "மொத்த மீட்டர்கள்",
    scannedBales: "ஸ்கேன் செய்த மூட்டைகள்",
    scannedMeters: "ஸ்கேன் செய்த மீட்டர்கள்",
    unScannedBales: "ஸ்கேன் செய்யாத மூட்டைகள்",
    unScannedMeters: "ஸ்கேன் செய்யாத மீட்டர்கள்",
    barCodeSelection: "பார்கோட் தேர்வு",
    barCode: "பார்கோட்",
    checkDelivery: "வழங்கல் சரிபார்",
    dcBaleDetails: "DC மூட்டை விவரங்கள்",
    baleNo: "மூட்டை எண்.",
    clothName: "துணி பெயர்",
    pcs: "துண்டுகள்",
    meters: "மீட்டர்கள்",
    weight: "எடை",
    noData: "தரவு இல்லை",
  },
  hi: {
    title: "कपड़ा डिलीवरी - गांठ सत्यापन",
    back: "वापस",
    save: "सहेजें",
    dcDetails: "DC विवरण",
    dcNo: "DC नं.",
    select: "चुनें",
    partyName: "पार्टी का नाम",
    totalBales: "कुल गांठें",
    totalMeters: "कुल मीटर",
    scannedBales: "स्कैन की गई गांठें",
    scannedMeters: "स्कैन किए गए मीटर",
    unScannedBales: "बिना स्कैन की गांठें",
    unScannedMeters: "बिना स्कैन के मीटर",
    barCodeSelection: "बारकोड चयन",
    barCode: "बारकोड",
    checkDelivery: "डिलीवरी जांचें",
    dcBaleDetails: "DC गांठ विवरण",
    baleNo: "गांठ नं.",
    clothName: "कपड़े का नाम",
    pcs: "पीस",
    meters: "मीटर",
    weight: "वजन",
    noData: "कोई डेटा नहीं मिला",
  },
};

const ClothDelivery = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];

  const [dcNo, setDcNo] = useState(null);
  const [barcode, setBarcode] = useState("");

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "13px",
      height: "36px",
      padding: "0px 4px",
      fontSize: "14px",
      borderRadius: "8px",
      color: state.isDisabled ? "#6b7280" : "black",
      backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
      cursor: state.isDisabled ? "not-allowed" : "default",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : base.boxShadow,
      "&:hover": { borderColor: state.isDisabled ? "#d1d5db" : "#9ca3af" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 3px", fontSize: "14px" }),
    input: (base) => ({ ...base, margin: 0, fontSize: "14px", padding: 0 }),
    singleValue: (base) => ({ ...base, fontSize: "14px" }),
    placeholder: (base) => ({ ...base, color: "black", fontSize: "14px" }),
    menu: (base) => ({ ...base, maxHeight: 140, fontSize: "14px" }),
    option: (base) => ({ ...base, fontSize: "14px", padding: "6px 8px" }),
    dropdownIndicator: () => ({}),
    indicatorSeparator: () => ({ display: "none" }),
    menuList: (base) => ({ ...base, maxHeight: 140 }),
  };

  return (
    <div className="h-full md:h-[75vh] pt-0">
      {/* Header */}
      <div className="flex flex-wrap bg-white justify-between items-center py-2 px-2 rounded-lg gap-2">
        <h1 className="text-lg md:text-xl font-bold">{t.title}</h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition px-4 text-sm font-semibold whitespace-nowrap">
            {t.save}
          </button>
        </div>
      </div>

      <div className="h-auto md:h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl mt-2 p-3 md:p-4">
        {/* DC Details Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1">
            {t.dcDetails}
          </h2>
          {/* 1 st row */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4 text-sm mt-1">
            <div className="col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1">{t.dcNo}</label>
              <Select
                styles={customSelectStyles}
                options={[]}
                placeholder={t.select}
                value={dcNo}
                onChange={setDcNo}
              />
            </div>
            {/* 1 st row */}

            <div className="col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1">{t.partyName}</label>
              <input
                type="text"
                readOnly
                className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* 1 st row */}

            <div className="col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1">{t.totalBales}</label>
              <input
                type="text"
                readOnly
                value="0"
                className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* 2 st row */}

            <div className="col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1">{t.totalMeters}</label>
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* 2 st row */}
            <div className="col-span-2 lg:col-span-1">
              <label className="block font-medium mb-1">{t.scannedBales}</label>
              <input
                type="text"
                readOnly
                value="0"
                className="w-[12rem] lg:w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* 3 st row */}
            <div className="col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1 ">
                {t.scannedMeters}
              </label>
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* 3 st row */}

            <div className="col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1">
                {t.unScannedBales}
              </label>
              <input
                type="text"
                readOnly
                value="0"
                className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* 3 st row */}

            <div className="col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1">
                {t.unScannedMeters}
              </label>
              <input
                type="text"
                readOnly
                value="0.00"
                className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* BarCode Selection */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm w-full md:w-1/2">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">
            {t.barCodeSelection}
          </h2>
          <div className="flex flex-wrap sm:flex-nowrap items-end gap-3">
            <div className="flex flex-col flex-1 w-full">
              <label className="text-[10px] font-medium mb-1 uppercase tracking-wider text-gray-500">
                {t.barCode}
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="border rounded-lg text-right px-2 py-1.5 w-full h-[36px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-bold text-xs shadow-sm transition-all uppercase tracking-wider h-[36px]">
              {t.checkDelivery}
            </button>
          </div>
        </div>

        {/* DC Bale Details Table */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1 ">
            {t.dcBaleDetails}
          </h2>
          <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse table-auto">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-3 py-3 border-r text-center">
                      {t.baleNo}
                    </th>
                    <th className="px-3 py-3 border-r text-center">
                      {t.clothName}
                    </th>
                    <th className="px-3 py-3 border-r text-center">{t.pcs}</th>
                    <th className="px-3 py-3 border-r text-center">
                      {t.meters}
                    </th>
                    <th className="px-3 py-3 text-center">{t.weight}</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-200">
                  <tr className="bg-white hover:bg-gray-50 transition-colors">
                    <td
                      colSpan="5"
                      className="text-center py-8 text-gray-500 font-bold"
                    >
                      {t.noData}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothDelivery;
