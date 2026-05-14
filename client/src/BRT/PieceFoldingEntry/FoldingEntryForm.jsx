/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";

import { useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import {
  useGetFoldingPendingQuery,
  useGetGradeMasterQuery,
} from "../../redux/services/FoldingPendingList";
import {
  useGetpieceEntryByIdQuery,
  useGetpieceFoldingEntryByIdQuery,
  useUpdatepieceFoldingEntryMutation,
} from "../../redux/services/PieceFoldingEntry";
import { useGetRolesQuery, useGetUsersQuery } from "../../redux/userservice";
import { useLanguage } from "../../Context/LanguageContext";

const translations = {
  en: {
    title: "Piece Folding Entry",
    back: "Back",
    save: "Save",
    lotDetails: "Lot Details",
    lotNo: "Lot No",
    selectLot: "Select Lot",
    pieceNo: "Piece No",
    loomNo: "Loom No",
    weaverPieceNo: "Weaver Pcs No",
    folderName: "Folder Name",
    selectUser: "Select User",
    tableNo: "Table No",
    receiptMeters: "Receipt Meters",
    meters: "Meters",
    defectPoints: "Defect Points",
    checkedMeters: "Folded Meters",
    grade: "GRADE",
    points: "Points",
    foldPct: "Fold %",
    weight: "Weight",
    gradeCalc: "Grade Calculation:",
    noGrade: "No Grade",
    belowTwenty: "⚠ Folded meters below 20 — minimum C GRADE applied",
    loading: "Loading...",
    errorLoading: "Error loading lots",
    selectLotMsg: "Select Lot",
    selectPieceMsg: "Select Piece",
    enterLoomNo: "Entry Loom No",
    chooseFolderName: "Choose Folder Name",
    enterCheckedMeters: "Entry Folded Meters",
    enterWeight: "Entry Weight",
    addedSuccess: "Added Successfully",
    submissionError: "Submission error",
    somethingWentWrong: "Something went wrong!",
  },
  ta: {
    title: "பீஸ் மடிப்பு பதிவு",
    back: "பின்செல்",
    save: "சேமி",
    lotDetails: "லாட் விவரங்கள்",
    lotNo: "லாட் எண்",
    selectLot: "லாட் தேர்ந்தெடு",
    pieceNo: "பீஸ் எண்",

    folderName: "மடிப்பாளர் பெயர்",
    selectUser: "பயனரை தேர்ந்தெடு",
    tableNo: "மேஜை எண்",
    receiptMeters: "ரசீது மீட்டர்கள்",
    meters: "மீட்டர்கள்",
    defectPoints: "குறைபாடு புள்ளிகள்",
    checkedMeters: "மடிப்பு மீட்டர்கள்",
    grade: "தரம்",
    points: "புள்ளிகள்",
    foldPct: "மடிப்பு %",
    weight: "எடை",
    gradeCalc: "தர கணக்கீடு:",
    noGrade: "தரம் இல்லை",
    belowTwenty:
      "⚠ சரிபார்க்கப்பட்ட மீட்டர்கள் 20க்கும் குறைவு — குறைந்தபட்சம் C தரம்",
    loading: "ஏற்றுகிறது...",
    errorLoading: "லாட்டை ஏற்றுவதில் பிழை",
    selectLotMsg: "லாட்டை தேர்ந்தெடுக்கவும்",
    selectPieceMsg: "துண்டை தேர்ந்தெடுக்கவும்",
    enterLoomNo: "நெசவு எண்ணை உள்ளிடவும்",
    chooseFolderName: "மடிப்பாளர் பெயரை தேர்ந்தெடுக்கவும்",
    enterCheckedMeters: "மடிப்பு மீட்டர்களை உள்ளிடவும்",
    enterWeight: "எடையை உள்ளிடவும்",
    addedSuccess: "வெற்றிகரமாக சேர்க்கப்பட்டது",
    submissionError: "சமர்ப்பிப்பு பிழை",
    somethingWentWrong: "ஏதோ தவறு நடந்தது!",
    loomNo: "லூம் எண்",
    weaverPieceNo: "வீவர் பீஸ் எண்",
  },
  hi: {
    title: "पीस फोल्डिंग प्रविष्टि",
    back: "वापस",
    save: "सहेजें",
    lotDetails: "लॉट विवरण",
    lotNo: "लॉट नं.",
    selectLot: "लॉट चुनें",
    pieceNo: "पीस नं.",

    folderName: "फोल्डर का नाम",
    selectUser: "उपयोगकर्ता चुनें",
    tableNo: "टेबल नं.",
    receiptMeters: "रसीद मीटर",
    meters: "मीटर",
    defectPoints: "दोष अंक",
    checkedMeters: "फोल्ड मीटर",
    grade: "ग्रेड",
    points: "अंक",
    foldPct: "फोल्ड %",
    weight: "वजन",
    gradeCalc: "ग्रेड गणना:",
    noGrade: "कोई ग्रेड नहीं",
    belowTwenty: "⚠ फोल्ड मीटर 20 से कम — न्यूनतम C ग्रेड लागू",
    loading: "लोड हो रहा है...",
    errorLoading: "लॉट लोड करने में त्रुटि",
    selectLotMsg: "लॉट चुनें",
    selectPieceMsg: "पीस चुनें",
    enterLoomNo: "लूम नं. दर्ज करें",
    chooseFolderName: "फोल्डर का नाम चुनें",
    enterCheckedMeters: "जांचे गए मीटर दर्ज करें",
    enterWeight: "वजन दर्ज करें",
    addedSuccess: "सफलतापूर्वक जोड़ा गया",
    submissionError: "सबमिट त्रुटि",
    somethingWentWrong: "कुछ गलत हो गया!",
    loomNo: "लूम नं ",
    weaverPieceNo: "वीवर पीसी नं",
  },
};

const PieceFoldingForm = ({ onClose }) => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];
  const lotIdRef = useRef(null);

  const [selectedLotNo, setSelectedLotNo] = useState("");
  const [tableNo, setTableNo] = useState("");
  // const [loomNo, setLoomNo] = useState("");
  const [checkerId, setCheckerId] = useState("");
  const [selectedPiece, setSelectedPiece] = useState("");
  const [pieceNo, setPieceNo] = useState("");
  const [receiptMeters, setReceiptMeters] = useState("");
  const [meters, setMeters] = useState("");
  const [defectPoints, setDefectPoints] = useState("");
  const [checkedMeters, setCheckedMeters] = useState("");
  const [gradeName, setGradeName] = useState("");
  const [actualPoints, setActualPoints] = useState("");
  const [foldPercentage, setFoldPercentage] = useState("100");
  const [weight, setWeight] = useState("");
  const [subGridId, setSubGrid] = useState("");
  const [loomNo, setLoomNo] = useState("");
  const [weaverPieceNo, setWeaverPieceNo] = useState("");
  const [setNo, setSetNo] = useState("");
  let PCSFOLDED = "YES";
  const resetForm = () => {
    setSelectedLotNo("");
    setTableNo("");
    setLoomNo("");
    setCheckerId("");
    setSelectedPiece("");
    setPieceNo("");
    setReceiptMeters("");
    setMeters("");
    setDefectPoints("");
    setCheckedMeters("");
    setGradeName("");
    setActualPoints("");
    setFoldPercentage("");
    setWeight("");
    setWeaverPieceNo("");
    setSetNo("");
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "13px",
      height: "36px",
      padding: "0px 4px",
      fontSize: "14px",
      borderRadius: "8px",

      color: state.isDisabled ? "#6b7280" : "black",
      backgroundColor: state.isDisabled ? "#f3f4f6" : "white", // bg-gray-100 vs bg-white
      cursor: state.isDisabled ? "not-allowed" : "default",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", // blue-500 vs gray-300
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : base.boxShadow,
      "&:hover": {
        borderColor: state.isDisabled ? "#d1d5db" : "#9ca3af", // keep gray when disabled
      },
    }),
    valueContainer: (base, state) => ({
      ...base,
      padding: "0 3px",
      fontSize: "14px",

      color: state.isDisabled ? "#6b7280" : "black",
    }),
    input: (base, state) => ({
      ...base,
      margin: 0,
      fontSize: "14px",
      padding: 0,

      color: state.isDisabled ? "#6b7280" : "black",
    }),
    singleValue: (base, state) => ({
      ...base,

      fontSize: "14px",
      color: state.isDisabled ? "#6b7280" : "black",
    }),
    placeholder: (base) => ({
      ...base,
      // marginTop: "20px",

      color: "black",
      fontSize: "14px",
    }),
    menu: (base, state) => ({
      ...base,

      maxHeight: 140,
      // overflowY: "auto",
      fontSize: "14px",
      color: state.isDisabled ? "#6b7280" : "black",
    }),
    option: (base, state) => ({
      ...base,

      fontSize: "14px",
      color: state.isDisabled ? "#6b7280" : "black",
      padding: "6px 8px",
    }),
    dropdownIndicator: () => ({}),

    indicatorSeparator: () => ({ display: "none" }),
    menuList: (base) => ({
      ...base,
      maxHeight: 140,
      // overflowY: "auto",
    }),
  };

  const { data: gradeData } = useGetGradeMasterQuery();

  const {
    data: foldingPendingData,
    isLoading,
    isFetching,
    error,
  } = useGetFoldingPendingQuery();

  const flodingOptions = foldingPendingData?.data?.map((cloth) => ({
    label: cloth?.DOCID,
    value: cloth?.RECEIPTNO,
  }));

  console.log(foldingPendingData, "foldingPendingData");

  const { data: singleData } = useGetpieceFoldingEntryByIdQuery(
    { selectedPiece },
    { skip: !selectedPiece },
  );
  console.log(singleData, "singleData");
  const syncFormWithDb = useCallback(
    (data) => {
      console.log(data, "data");
      setTableNo(data?.TABLENOTAB);
      setMeters(data?.ACTUALMETER);
      setDefectPoints(Number(data?.TOTPOINTSTAB));
      setReceiptMeters(data?.RECEIPTMETER);
      setLoomNo(data?.LOOMNO);
      setWeaverPieceNo(data?.WEAVERPCSNO);
      setSetNo(data?.SETNO);
    },
    [selectedPiece],
  );

  useEffect(() => {
    if (selectedPiece && singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [selectedPiece, singleData, syncFormWithDb]);
  const checkedMetersNum = Number(checkedMeters || 0);

  const value =
    checkedMetersNum > 0 ? (defectPoints / checkedMetersNum) * 100 : null;

  const result = (() => {
    if (value === null) return null;

    const pointsGrade = gradeData?.data?.find(
      (r) => value >= r.STPOINTS && (r.ENDPOINTD === 0 || value < r.ENDPOINTD),
    );

    // ← Force C GRADE when checked meters < 20, no comparison needed
    if (checkedMetersNum <= 20) {
      const cGrade = gradeData?.data?.find((r) => r.GRADENAME === "C GRADE");
      return cGrade || pointsGrade || null;
    }

    return pointsGrade || null;
  })();
  console.log(result, "result");
  console.log(singleData?.data, "singleData");
  const {
    data: pieceData,
    isLoading: isSingleLoading,
    isFetching: isSingleFetching,
  } = useGetpieceEntryByIdQuery({ selectedLotNo }, { skip: !selectedLotNo });

  const pieceOptions = pieceData?.data
    ?.map((cloth) => ({
      label: String(cloth?.SPLITPCSNO ?? cloth?.BASEPCSNO),
      value: cloth?.ID,
      loomNo: cloth?.LOOMNO,
      weaverPcsNo: cloth?.WEAVERPCSNO,
    }))
    ?.sort((a, b) => {
      const valA = String(a.label);
      const valB = String(b.label);

      return valA.localeCompare(valB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  console.log(pieceOptions, "pieceOptions");
  const { data: roles } = useGetRolesQuery();
  const { data: userData } = useGetUsersQuery();

  const adminRole = roles?.data?.find(
    (val) => val?.ROLENAME?.toLowerCase() === "admin",
  );

  const supervisorRole = roles?.data?.find(
    (val) => val?.ROLENAME?.toLowerCase() === "supervisor",
  );
  const storedUserId = Number(localStorage.getItem("userId"));
  const storedRoleId = Number(localStorage.getItem("roleId"));
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

  useEffect(() => {
    if (!isAdmin && !isSuppervisor) {
      setCheckerId(storedUserId);
    }
  }, [isAdmin, isSuppervisor, storedUserId, setCheckerId]);
  useEffect(() => {
    if (value !== null && checkedMetersNum > 0) {
      setActualPoints(value.toFixed(2));
    } else {
      setActualPoints("");
    }
  }, [value, checkedMetersNum]);
  useEffect(() => {
    if (result?.GRADENAME) {
      setGradeName(result.GRADENAME);
    } else {
      setGradeName("");
    }
  }, [result?.GRADENAME]);

  const [updateData] = useUpdatepieceFoldingEntryMutation();

  const data = {
    selectedLotNo: Number(selectedLotNo),
    tableNo,
    loomNo,
    weaverPieceNo,
    checkerId: Number(checkerId),
    selectedPiece: Number(selectedPiece),
    pieceNo,
    meters: Number(meters),
    defectPoints: Number(defectPoints),
    checkedMeters: Number(checkedMeters),
    gradeName,
    actualPoints: Number(actualPoints),
    foldPercentage: Number(foldPercentage),
    weight: Number(weight),
    receiptMeters: Number(receiptMeters),
    PCSFOLDED,
    setNo,
  };
  const handleSubmitCustom = async (callback, data) => {
    try {
      let returnData = await callback(data).unwrap();
      Swal.fire({
        title: t.addedSuccess,
        icon: "success",
        draggable: true,
        timer: 2000,
        showConfirmButton: false,
      });
      resetForm();

      setTimeout(() => {
        lotIdRef.current?.focus();
        lotIdRef.current?.openMenu("first");
      }, 100);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t.submissionError,
        text: t.somethingWentWrong,
        timer: 2000,
      });
    }
  };
  const validateSaveData = () => {
    const checks = [
      { condition: !selectedLotNo, msg: t.selectLotMsg },
      { condition: !selectedPiece, msg: t.selectPieceMsg },

      { condition: !checkerId, msg: t.chooseFolderName },
      { condition: !checkedMeters, msg: t.enterCheckedMeters },
      { condition: !weight, msg: t.enterWeight },
    ];
    for (const { condition, msg } of checks) {
      if (condition) {
        Swal.fire({
          icon: "warning",
          title: msg,
          timer: 2000,
          showConfirmButton: true,
        });
        return false;
      }
    }
    return true;
  };
  const saveData = () => {
    if (!validateSaveData()) return;

    handleSubmitCustom(updateData, data);
  };
  if (isLoading) {
    return <div className="p-6 text-center">{t.loading}</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-500">{t.errorLoading}</div>;
  }

  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold text-center">{t.title}</h1>

        <div>
          {/* <button
            onClick={onClose}
            className="bg-red-600 mr-2 text-white  py-1 rounded-lg hover:bg-red-700 transition px-2"
          >
            {t.back}
          </button> */}
          <button
            onClick={saveData}
            className="bg-blue-600 mr-2 text-white py-1 rounded-lg hover:bg-blue-700 transition px-2"
          >
            {t.save}
          </button>
        </div>
      </div>
      <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
        <form className=" p-2">
          <div>
            <div>
              <h2 className="text-lg font-semibold mb-2">{t.lotDetails}</h2>
              <div className="grid grid-cols-5 lg:grid-cols-10 gap-4 text-sm">
                <div className="col-span-3 lg:col-span-2 z-999">
                  <label className="block font-medium mb-1">{t.lotNo}</label>
                  <Select
                    options={flodingOptions}
                    value={
                      flodingOptions?.find(
                        (option) => option.value === selectedLotNo,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedLotNo(selectedOption?.value || "");
                    }}
                    placeholder={t.selectLot}
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.pieceNo}</label>
                  <Select
                    options={pieceOptions}
                    value={
                      pieceOptions?.find(
                        (option) => option.value === selectedPiece,
                      ) || null
                    }
                    onChange={(sel) => {
                      setSelectedPiece(sel?.value);
                      setPieceNo(sel?.label);
                      setLoomNo(sel?.loomNo || "");
                      setWeaverPieceNo(sel?.weaverPcsNo || "");
                    }}
                    placeholder=" "
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                    className="text-right"
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.loomNo}</label>
                  <input
                    value={loomNo}
                    disabled
                    // onChange={(e) => setLoomNo(e.target.value)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
                <div className="col-span-1 lg:col-span-2">
                  <label className="block font-medium mb-1">
                    {t.weaverPieceNo}
                  </label>
                  <input
                    value={weaverPieceNo}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>

                <div className="flex flex-col flex-1  col-span-3 lg:col-span-3">
                  <label className="text-sm font-medium mb-1">
                    {t.folderName}
                  </label>

                  {isAdmin || isSuppervisor ? (
                    <>
                      <Select
                        options={userOptions}
                        value={
                          userOptions?.find(
                            (option) => option.value === checkerId,
                          ) || null
                        }
                        onChange={(selectedOption) => {
                          setCheckerId(selectedOption?.value || "");
                        }}
                        placeholder={t.selectUser}
                        isClearable={false} // ✅ disable cross icon
                        styles={customSelectStyles}
                        className="text-left"
                        isSearchable={true}
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={storedUsername}
                        readOnly
                        className="border rounded-lg text-left px-1 py-[7px] w-full bg-gray-100"
                      />
                    </>
                  )}
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.tableNo}</label>
                  <input
                    value={tableNo}
                    // readOnly={readonly}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
                <div className="col-span-2 lg:col-span-2 ">
                  <label className="block font-medium mb-1">
                    {t.receiptMeters}
                  </label>

                  <input
                    value={Number(receiptMeters)?.toFixed(2)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                    disabled
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.meters}</label>
                  <input
                    value={Number(meters)?.toFixed(2)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                    disabled
                  />
                </div>

                <div className="col-span-2 lg:col-span-2 ">
                  <label className="block font-medium mb-1">
                    {t.defectPoints}
                  </label>

                  <input
                    value={defectPoints}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>

                <div className="col-span-2 lg:col-span-2">
                  <label className="block font-medium mb-1">
                    {t.checkedMeters}
                  </label>

                  <input
                    type="number"
                    value={checkedMeters}
                    onBlur={(e) =>
                      setCheckedMeters(parseFloat(e.target.value).toFixed(2))
                    }
                    onChange={(e) => setCheckedMeters(e.target.value)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.grade}</label>

                  <input
                    value={gradeName || ""} // ← fallback to empty string
                    className={`w-full border rounded-lg px-1 py-1.5 text-left font-bold
      ${
        gradeName === "A GRADE"
          ? "text-green-600"
          : gradeName === "B GRADE"
            ? "text-orange-500"
            : gradeName === "C GRADE"
              ? "text-red-600"
              : "text-gray-500"
      }`}
                    disabled
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.points}</label>

                  <input
                    type="number"
                    value={actualPoints}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.foldPct}</label>

                  <input
                    type="number"
                    value={foldPercentage}
                    onChange={(e) => setFoldPercentage(e.target.value)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.weight}</label>

                  <input
                    type="number"
                    value={weight} // ← fallback to empty string
                    onChange={(e) => setWeight(e.target.value)}
                    onBlur={(e) =>
                      setWeight(parseFloat(e.target.value).toFixed(3))
                    }
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
              </div>

              {/* Grade Calculation Summary */}
              {value !== null && checkedMetersNum > 0 && (
                <div className="col-span-4 lg:col-span-10 mt-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      {t.gradeCalc}
                    </span>

                    <span>
                      ({defectPoints} ÷ {checkedMetersNum}) × 100
                    </span>
                    <span className="text-gray-400">=</span>
                    <span className="font-bold text-blue-600">
                      {value.toFixed(2)}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span
                      className={`font-bold ${
                        result?.GRADENAME === "A GRADE"
                          ? "text-green-600"
                          : result?.GRADENAME === "B GRADE"
                            ? "text-orange-500"
                            : "text-red-600"
                      }`}
                    >
                      {result?.GRADENAME || t.noGrade}
                    </span>
                    {checkedMetersNum < 20 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        {t.belowTwenty}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PieceFoldingForm;
