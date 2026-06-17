import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import useInvalidateTags from "../../CustomHooks/useInvalidateTags";

import {
  useGetDocIdQuery,
  useGetBarCodeDataQuery,
  useGetCurrentFinyearQuery,
  useGetClothDataQuery,
  useGetGradeDataQuery,
  useGetLoomDataQuery,
  useAddPackingSlipMutation,
} from "../../redux/services/PackingSlip.js";
import { useLanguage } from "../../Context/LanguageContext";
import { getCommonParams } from "../../Utils/helper";
import moment from "moment";
import Swal from "sweetalert2";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Packing Slip",
    back: "Back",
    save: "Save",
    // Selection section
    basicDetails: "Basic Details",
    compCode: "Comp Code",
    finYear: "Fin Year",
    docId: "Doc Id",
    docDate: "Doc Date",
    clothGrade: "Cloth Grade",
    loomName: "Loom Name",
    prefix: "Prefix",
    suffix: "Suffix",
    slipNo: "Slip No",
    folding: "Folding",
    selectCloth: "Select Cloth",
    selectGrade: "Select",
    selectLoom: "Select Loom",
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
    setNo: "Set No",
    weaverPcsNo: "Weaver Pcs No",
    orderNo: "Order No",
  },
  ta: {
    title: "பேக்கிங் சீட்டு",
    back: "பின்செல்",
    save: "சேமி",
    basicDetails: "அடிப்படை விவரங்கள்",
    compCode: "நிறுவன குறியீடு",
    finYear: "நிதியாண்டு",
    docId: "ஆவண எண்",
    docDate: "ஆவண தேதி",
    clothGrade: "துணி தரம்",
    loomName: "தறி பெயர்",
    prefix: "முன்னொட்டு",
    suffix: "பின்னொட்டு",
    slipNo: "சீட்டு எண்",
    folding: "மடிப்பு",
    selectCloth: "துணியை தேர்ந்தெடுக்கவும்",
    selectGrade: "தரத்தை தேர்ந்தெடுக்கவும்",
    selectLoom: "தறியை தேர்ந்தெடுக்கவும்",
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
    setNo: "செட் எண்",
    weaverPcsNo: "நெசவாளர் துண்டு எண்",
    orderNo: "ஆர்டர் எண்",
  },
  hi: {
    title: "पैकिंग स्लिप",
    back: "वापस",
    save: "सहेजें",
    basicDetails: "मूल विवरण",
    compCode: "कंपनी कोड",
    finYear: "वित्तीय वर्ष",
    docId: "दस्तावेज़ आईडी",
    docDate: "दस्तावेज़ दिनांक",
    clothGrade: "कपड़े का ग्रेड",
    loomName: "लूम का नाम",
    prefix: "उपसर्ग",
    suffix: "प्रत्यय",
    slipNo: "स्लिप नंबर",
    folding: "फोल्डिंग",
    selectCloth: "कपड़ा चुनें",
    selectGrade: "ग्रेड चुनें",
    selectLoom: "लूम चुनें",
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
    setNo: "सेट नं.",
    weaverPcsNo: "बुनकर पीस नं.",
    orderNo: "ऑर्डर नं.",
  },
};

const PackingSlip = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];
  const { companyId, companyName } = getCommonParams();
  const [finyear, SetFinyear] = useState("");
  const [finyearId, SetFinyearId] = useState("");
  const [docId, setDocId] = useState("");
  const [docNo, setDocNo] = useState("");
  const [docPrefix, setDocPrefix] = useState("");
  const [date, setDate] = useState(moment().format("DD-MM-YYYY"));
  const [docTime, setDocTime] = useState(moment().format("HH:mm:ss"));
  const [clothId, setClothId] = useState("");
  const [clothName, setClothName] = useState("");
  const [clothGrade, setClothGrade] = useState("");
  const [packingType, setPackingType] = useState("BALE");
  const [loomId, setLoomId] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [slipNo, setSlipNo] = useState("");
  const [foldind, setFolding] = useState("");

  const [barCode, setBarCode] = useState("");
  const [barCodeInput, setBarCodeInput] = useState(""); // typed value

  const [pieceRows, setPieceRows] = useState([]); // table rows
  // const [dispatchInvalidate] = useInvalidateTags();

  useEffect(() => {
    if (prefix || suffix || docNo) {
      setSlipNo(`${prefix || ""}${docNo || ""}${suffix ? "/" + suffix : ""}`);
    } else {
      setSlipNo("");
    }
  }, [prefix, suffix, docNo]);

  const { data: barCodeData, isFetching: isBarCodeFetching } = useGetBarCodeDataQuery(
    { companyName, barCode },
    { skip: !companyName || !barCode },
  );
  console.log(barCodeData, "barCodeData");

  const { data: currentFinyear } = useGetCurrentFinyearQuery();
  console.log(currentFinyear, docTime, "currentFinyear");

  const { data: clothData } = useGetClothDataQuery(
    { companyName },
    { skip: !companyName },
  );
  console.log(clothData, "clothData");

  const clothOptions = clothData?.data?.map?.((va) => {
    return {
      label: va?.CLOTHNAME,
      value: va?.GTCLOTHCREATIONID,
      prefix: va?.PREFIX,
      folding: va?.FOLDING,
      LOOMNAME: va?.LOOMTYNAME,
    };
  });

  const handleClothChange = (value) => {
    console.log(value, "value");

    const selectedOption = clothOptions?.find(
      (opt) => String(opt.value) === String(value),
    );
    console.log(selectedOption, "selectedOption");

    if (selectedOption) {
      setClothId(value);
      setClothName(selectedOption.label);
      setPrefix(selectedOption.prefix);
      setFolding(selectedOption.folding);
      setLoomId(selectedOption.LOOMNAME);
    } else {
      setClothId("");
      setClothName("");
      setPrefix("");
      setSuffix("");
      setFolding("");
      setLoomId("");
      setClothGrade("");
      setBarCode("");
      setBarCodeInput("");
      setPieceRows([]);
      setSlipNo("");
    }
  };
  console.log(clothName, "clothName");

  console.log(clothOptions, "clothOptions");

  const { data: gradeData } = useGetGradeDataQuery(
    { companyName, clothName },
    { skip: !companyName || !clothName },
  );
  console.log(gradeData, "gradeData");

  const { data: loomData } = useGetLoomDataQuery();
  console.log(loomData, "loomData");
  const loomOoptions = loomData?.data?.map((val) => ({
    label: val?.LOOMTYNAME,
    value: val?.GTLOOMMASTID,
    suffix: val?.SHORTNAME,
  }));

  const handleLoomChange = (value) => {
    setLoomId(value);
    const selectedLoom = loomOoptions?.find(
      (opt) => String(opt.value) === String(value),
    );
    if (selectedLoom) {
      setSuffix(selectedLoom.suffix || "");
    } else {
      setSuffix("");
    }
  };

  const gradeOptions = gradeData?.data?.map?.((val) => {
    return {
      label: val?.GRADEE,
    };
  });
  console.log(gradeOptions, "gradeOptions");

  useEffect(() => {
    if (currentFinyear) {
      const mappedData = currentFinyear?.data?.map?.((va) => {
        return {
          finYearName: va?.FINYR,
          finYearId: va?.GTFINANCIALYEARID,
        };
      });
      console.log(mappedData, "mappedData");

      SetFinyear(mappedData?.[0].finYearName);
      SetFinyearId(mappedData?.[0].finYearId);
    }
  }, [currentFinyear]);
  const { data: docData, refetch: refetchDocId } = useGetDocIdQuery(
    { companyName, finYear: finyear },
    { skip: !companyName || !finyear },
  );

  useEffect(() => {
    const dataList = docData?.data || docData; // handle if it's wrapped or not
    if (Array.isArray(dataList) && dataList.length > 0) {
      const docConf = dataList[0];
      if (
        docConf.PREFIX != null &&
        docConf.LASTNO != null &&
        docConf.ZEROPADDING != null
      ) {
        const nextNo = Number(docConf.LASTNO);
        const paddedNo = String(nextNo).padStart(
          Number(docConf.ZEROPADDING),
          "0",
        );
        setDocId(`${docConf.PREFIX}${paddedNo}`);
        setDocNo(paddedNo);
        setDocPrefix(docConf.PREFIX);
      }
    }
  }, [docData]);

  console.log(docData, "docData");
  useEffect(() => {
    if (!barCodeData?.data?.length || !barCode || isBarCodeFetching) return;
    
    const fetchedRow = barCodeData.data[0];

    if (fetchedRow.BARCODE !== barCode) return;

    if (pieceRows.length === 0) {
      const matchedCloth = clothOptions?.find(
        (opt) => opt.label === fetchedRow.CLOTHNAME
      );
      if (matchedCloth) {
        handleClothChange(matchedCloth.value);
      } else {
        // Fallback if not found in options but we still want to set it
        setClothName(fetchedRow.CLOTHNAME);
      }
      setClothGrade(fetchedRow.GRADE);
    } else {
      if (clothName !== fetchedRow.CLOTHNAME || clothGrade !== fetchedRow.GRADE) {
        Swal.fire({
          icon: "warning",
          title: "Cloth and grade not match for this barcode",
          timer: 3000,
          showConfirmButton: false,
        });
        setBarCode("");
        setBarCodeInput("");
        return;
      }
    }

    setPieceRows((prev) => {
      const existingIds = new Set(prev.map((r) => r.BARCODE));
      const newRows = barCodeData.data
        .filter((r) => !existingIds.has(r.BARCODE))
        .map((r) => ({
          ...r,
          WGTMTR: r.STOCKMTRS
            ? (Number(r.WEIGHTCALS) / Number(r.STOCKMTRS)).toFixed(3)
            : "-",
        }));
      return [...prev, ...newRows];
    });
    setBarCode(""); // reset so next scan triggers fresh query
    setBarCodeInput(""); // clear input
  }, [barCodeData, barCode, pieceRows.length, clothName, clothGrade]);

  const handleAddPcs = (value) => {
    const val = typeof value === "string" ? value : barCodeInput;
    setBarCode(val.trim());
  };
  const handleDeleteRow = (gridId) => {
    setPieceRows((prev) => prev.filter((r) => r.BARCODE !== gridId));
  };

  const [dispatchInvalidate] = useInvalidateTags();
  const [addData] = useAddPackingSlipMutation();

  const handleSubmitCustom = async (callback, data) => {
    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait while your data is being saved.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await callback(data).unwrap();
      dispatchInvalidate();

      Swal.fire({
        title: t.alertAddedSuccess || "Saved Successfully",
        icon: "success",
        draggable: true,
        timer: 2000,
        showConfirmButton: false,
      });

      setPieceRows([]);
      setBarCode("");
      setBarCodeInput("");
      setClothId("");
      setClothName("");
      setPrefix("");
      setSuffix("");
      setFolding("");
      setLoomId("");
      setClothGrade("");
      setSlipNo("");
      refetchDocId();
    } catch (error) {
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        t.alertSubmitError ||
        "Failed to save data";
      Swal.fire({
        icon: "error",
        title: t.alertSubmitErrorTitle || "Error",
        text: errorMsg,
        timer: 3000,
      });
    }
  };

  const saveData = () => {
    if (!clothName) {
      Swal.fire({
        icon: "warning",
        title: "Please select Cloth Name",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (!clothGrade) {
      Swal.fire({
        icon: "warning",
        title: "Please select Cloth Grade",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (!loomId) {
      Swal.fire({
        icon: "warning",
        title: "Please select Loom Name",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (!prefix) {
      Swal.fire({
        icon: "warning",
        title: "Prefix is missing",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (!suffix) {
      Swal.fire({
        icon: "warning",
        title: "Suffix is missing",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (!slipNo) {
      Swal.fire({
        icon: "warning",
        title: "Slip No is missing",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (pieceRows?.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Please add at least one piece before saving.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const payload = {
      companyId: parseInt(companyId),
      companyName,
      finyearId: parseInt(finyearId),
      finyear,
      docId,
      docPrefix,
      docDate: date,
      docTime,
      clothId: parseInt(clothId),
      clothName,
      clothGrade,
      packingType,
      loomId: parseInt(loomId),
      prefix,
      suffix,
      slipNo,
      details: pieceRows,
      foldind,
    };

    handleSubmitCustom(addData, payload);
  };
  console.log(pieceRows, "pieceRows");

  return (
    <div className="h-full md:h-[75vh] pt-0">
      {/* Header */}
      <div className="flex flex-wrap bg-white justify-between items-center py-1.5 px-2 rounded-lg gap-2">
        <h1 className="text-lg md:text-xl font-bold">{t.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={saveData}
            className="bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 transition px-4 text-sm font-semibold whitespace-nowrap"
          >
            {t.save}
          </button>
        </div>
      </div>

      <div className="h-auto md:h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl mt-2 p-3 md:p-3">
        {/* Selection Section */}
        <details className="mb-3 border border-gray-200 rounded-lg group" open>
          <summary className="p-2 font-semibold cursor-pointer outline-none bg-gray-50 rounded-lg group-open:rounded-b-none group-open:border-b flex justify-between items-center text-sm">
            {t.basicDetails}
            <span className="group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="p-3">
            {/* Responsive Selection Grid */}
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-2 items-end text-xs">
              {/* ROW 1 */}
              {/* Comp Code */}
              <div className="col-span-1 md:col-span-4">
                <label className="block font-medium mb-1">
                  {t.compCode}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none"
                />
              </div>
              {/* Fin Year */}
              <div className="col-span-1 md:col-span-4">
                <label className="block font-medium mb-1">
                  {t.finYear}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={finyear}
                  disabled
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none"
                />
              </div>
              {/* Doc Id */}
              <div className="col-span-3 md:col-span-4">
                <label className="block font-medium mb-1">
                  {t.docId}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={docId}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none"
                />
              </div>
              {/* Doc Date */}
              <div className="col-span-1 md:col-span-4">
                <label className="block font-medium mb-1">
                  {t.docDate}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={date}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none"
                />
              </div>

              {/* ROW 2 */}

              {/* Cloth Name */}
              <div className="col-span-3 md:col-span-4">
                <label className="block font-medium mb-1">
                  {t.clothName}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={clothId}
                  type="number"
                  onChange={(e) => handleClothChange(e.target.value)}
                  className="w-full border border-blue-500 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-[30px]"
                >
                  <option value="">{t.selectCloth}</option>
                  {clothOptions?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Cloth Grade */}
              <div className="col-span-1 md:col-span-4">
                <label className="block font-medium mb-1">{t.clothGrade}</label>
                <select
                  value={clothGrade}
                  onChange={(e) => setClothGrade(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-[30px]"
                >
                  <option value="">{t.selectGrade}</option>
                  {gradeOptions?.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ROW 3 */}
              {/* Loom Name */}
              <div className="col-span-2 md:col-span-3">
                <label className="block font-medium mb-1">{t.loomName}</label>
                <select
                  value={loomId}
                  onChange={(e) => handleLoomChange(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-[30px]"
                >
                  <option value="">{t.selectLoom}</option>
                  {loomOoptions?.map((val) => (
                    <option key={val.value} value={val.value}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Packing Type */}
              <div className="col-span-2 md:col-span-3">
                <label className="block font-medium mb-1">
                  {t.packingType}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={packingType}
                  onChange={(e) => setPackingType(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-[30px]"
                >
                  <option value="BALE">BALE</option>
                  <option value="ROLL">ROLL</option>
                  <option value="BUNDLE">BUNDLE</option>
                </select>
              </div>
              {/* Prefix */}
              <div className="col-span-1 md:col-span-3">
                <label className="block font-medium mb-1">
                  {t.prefix}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={prefix}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none"
                />
              </div>
              {/* Suffix */}
              <div className="col-span-1 md:col-span-3">
                <label className="block font-medium mb-1">
                  {t.suffix}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={suffix}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none"
                />
              </div>
              {/* Slip No */}
              <div className="col-span-2 md:col-span-3">
                <label className="block font-medium mb-1">
                  {t.slipNo}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={slipNo}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none h-[30px]"
                />
              </div>
              {/* Folding */}
              <div className="col-span-1 md:col-span-3">
                <label className="block font-medium mb-1">
                  {t.folding}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={foldind}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1 text-xs text-left bg-gray-100 focus:outline-none h-[30px]"
                />
              </div>

              {/* Barcode Input */}
              <div className="col-span-3 md:col-span-4">
                <label className="block font-medium mb-1 uppercase tracking-wider">
                  {t.barCode}
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg text-right px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 h-[30px]"
                  value={barCodeInput}
                  onChange={(e) => {
                    setBarCodeInput(e.target.value);
                    handleAddPcs(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPcs();
                    }
                  }}
                />
              </div>

              {/* Add button */}
              <div className="col-span-2 md:col-span-2 h-[30px]">
                <button
                  onClick={handleAddPcs}
                  className="bg-green-600 px-6 text-white rounded-lg whitespace-nowrap hover:bg-green-700 transition font-semibold text-xs w-full h-full"
                >
                  {t.clickAddPcs}
                </button>
              </div>
            </div>
          </div>
        </details>

        {/* Piece Details Section */}
        <div className="mt-3 w-full border border-gray-200 rounded-lg p-3 ">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1">
            {t.pieceDetails}
          </h2>

          <div className="rounded-lg border w-full border-gray-200 shadow-sm ">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse table-fixed">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="font-medium px-1 py-3 border-r text-center w-8">
                      {t.sno}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-48">
                      {t.lotNo}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-16">
                      {t.setNo}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-16">
                      {t.pcsNo}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-36">
                      {t.weaverPcsNo}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-[100px]">
                      {t.loomNo}
                    </th>

                    <th className="font-medium px-1 py-3 border-r text-center w-[100px]">
                      {t.meters}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-[100px]">
                      {t.weight}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-[100px]">
                      {t.wgtMtr}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-60">
                      {t.clothName}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-[80px]">
                      {t.foldPct}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-72">
                      {t.weaverName}
                    </th>
                    <th className="font-medium px-1 py-3 border-r text-center w-[180px]">
                      {t.orderNo}
                    </th>
                    <th className="font-medium px-1 py-3 text-center w-[80px]">
                      {t.action}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-200">
                  {pieceRows.length > 0 ? (
                    pieceRows.map((row, index) => (
                      <tr
                        key={row.BARCODE}
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className=" py-2 border-r text-center">
                          {index + 1}
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.LOTNO}
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.SETNO}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.SPLITNO}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.WEAVERPCSWNO}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.LOOMNO}
                        </td>

                        <td className=" py-2 border-r text-right pr-1">
                          {Number(row.STOCKMTRS).toFixed(2)}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {Number(row.WEIGHTCALS).toFixed(3)}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.WGTMTR}
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.CLOTHNAME}
                        </td>
                        <td className=" py-2 border-r text-right pr-1">
                          {row.FOLDPER}%
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.SUPPLIER}
                        </td>
                        <td className=" py-2 border-r text-left pl-1">
                          {row.ORDERNO}
                        </td>
                        <td className=" py-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(row.BARCODE)}
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
      </div>
    </div>
  );
};

export default PackingSlip;
