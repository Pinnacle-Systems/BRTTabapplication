/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import socket from "../../Utils/socket.js";
import { useDispatch } from "react-redux";
import tableLotApi, {
  useGetTablesQuery,
  useGetLotsQuery,
  useGetClothQuery,
  useGetPiecesQuery,
  useGetCheckingSectionQuery,
  useUpdateTableLotMutation,
  useGetWorkStatusQuery,
  useDeleteWorkStatusLotMutation,
  useRevertAllocationMutation,
} from "../../redux/services/TableandLot";
import { useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import CheckingNoGrid from "./CheckingNoGrid ";
import { push } from "../../redux/features/opentabs";
import { useLanguage } from "../../Context/LanguageContext";
import useInvalidateTags from "../../CustomHooks/useInvalidateTags.js";
import { getCommonParams } from "../../Utils/helper.js";

const translations = {
  en: {
    title: "Table and Lot Piece Allocation",
    back: "Back",
    save: "Save",
    tableDetails: "Table Details",
    checkingSection: "Checking Section",
    selectSection: "Select section",
    checkerName: "Checker Name",
    selectUser: "Select User",
    tablesChoosed: "Tables Choosed",
    lotDetails: "Lot Details",
    lotNo: "Lot No",
    selectLot: "Select Lot",
    clothName: "Cloth Name",
    selectCloth: "Select cloth",
    pieceNo: "Piece No",
    meters: "Meters",
    widerTable: "Multi Table",
    loading: "Loading...",
    errorLoading: "Error loading lots",
    activeWork: "Active Work In Progress",
    section: "Section",
    checker: "Checker",
    piece: "Piece No",
    tableNo: "Table No",
    goToDefect: "Go To Defect Entry",
    revertWork: "Revert Work",
    addedSuccess: "Added Successfully",
    submissionFailed: "Submission Failed",
    revertSuccess: "Work reverted successfully",
    revertFailed: "Failed to revert",
    validCheckingSection: "Please Select Checking Section",
    validCheckerName: "Please Select Checker Name",
    validLotNo: "Please Select Lot No",
    validCloth: "Please Select Cloth",
    validPiece: "Please Select Piece",
    validTable: "Please Select Table",
    loomNo: "Loom No",
    weaverPieceNo: "Weaver Pc No",
    validWeaver: "Weaver Pc No",
    validLoom: "Loom No",
  },
  ta: {
    title: "மேஜை,லாட் பீஸ் ஒதுக்கீடு",
    back: "பின்செல்",
    save: "சேமி",
    tableDetails: "மேஜை விவரங்கள்",
    checkingSection: "சரிபார்ப்பு பிரிவு",
    selectSection: "பிரிவை தேர்ந்தெடு",
    checkerName: "சரிபார்ப்பாளர் பெயர்",
    selectUser: "பயனரை தேர்ந்தெடு",
    tablesChoosed: "மேஜைகள்",
    lotDetails: "லாட் விவரங்கள்",
    lotNo: "லாட் எண்",
    selectLot: "லாட் தேர்ந்தெடு",
    clothName: "துணி பெயர்",
    selectCloth: "துணியை தேர்ந்தெடு",
    pieceNo: "பீஸ் எண்",
    meters: "மீட்டர்கள்",
    widerTable: "பல மேஜைகள்",
    loading: "ஏற்றுகிறது...",
    errorLoading: "லாட்டை ஏற்றுவதில் பிழை",
    activeWork: "தற்போது செயலில் உள்ள பணி",
    section: "பிரிவு",
    checker: "சரிபார்ப்பாளர்",
    piece: "பீஸ் எண்",
    tableNo: "மேஜை எண்",
    goToDefect: "குறைபாடு பதிவுக்கு செல்",
    revertWork: "பணியை திரும்பப் பெறு",
    addedSuccess: "வெற்றிகரமாக சேர்க்கப்பட்டது",
    submissionFailed: "சமர்ப்பிப்பு தோல்வி",
    revertSuccess: "பணி வெற்றிகரமாக திரும்பப் பெறப்பட்டது",
    revertFailed: "திரும்பப் பெற முடியவில்லை",
    validCheckingSection: "சரிபார்ப்பு பிரிவை தேர்ந்தெடுக்கவும்",
    validCheckerName: "சரிபார்ப்பாளர் பெயரை தேர்ந்தெடுக்கவும்",
    validLotNo: "லாட் எண்ணை தேர்ந்தெடுக்கவும்",
    validCloth: "துணியை தேர்ந்தெடுக்கவும்",
    validPiece: "துண்டை தேர்ந்தெடுக்கவும்",
    validTable: "மேஜையை தேர்ந்தெடுக்கவும்",
    validWeaver: "வீவர் பீஸ் தேர்ந்தெடுக்கவும்",
    validLoom: "லூம் தேர்ந்தெடுக்கவும்",
    loomNo: "லூம் எண்",
    weaverPieceNo: "வீவர் பீஸ் எண்",
  },
  hi: {
    title: "टेबल और लॉट पीस आवंटन",
    back: "वापस",
    save: "सहेजें",
    tableDetails: "टेबल विवरण",
    checkingSection: "जांच अनुभाग",
    selectSection: "अनुभाग चुनें",
    checkerName: "जांचकर्ता का नाम",
    selectUser: "उपयोगकर्ता चुनें",
    tablesChoosed: "चुनी गई टेबलें",
    lotDetails: "लॉट विवरण",
    lotNo: "लॉट नं.",
    selectLot: "लॉट चुनें",
    clothName: "कपड़े का नाम",
    selectCloth: "कपड़ा चुनें",
    pieceNo: "पीस नं.",
    meters: "मीटर",
    widerTable: "कई टेबल",
    loading: "लोड हो रहा है...",
    errorLoading: "लॉट लोड करने में त्रुटि",
    activeWork: "सक्रिय कार्य प्रगति में",
    section: "अनुभाग",
    checker: "जांचकर्ता",
    piece: "पीस नं.",
    tableNo: "टेबल नं.",
    goToDefect: "दोष प्रविष्टि पर जाएं",
    revertWork: "कार्य वापस करें",
    addedSuccess: "सफलतापूर्वक जोड़ा गया",
    submissionFailed: "सबमिशन विफल",
    revertSuccess: "कार्य सफलतापूर्वक वापस किया गया",
    revertFailed: "वापस करने में विफल",
    validCheckingSection: "कृपया जांच अनुभाग चुनें",
    validCheckerName: "कृपया जांचकर्ता का नाम चुनें",
    validLotNo: "कृपया लॉट नं. चुनें",
    validCloth: "कृपया कपड़ा चुनें",
    validPiece: "कृपया पीस चुनें",
    validTable: "कृपया टेबल चुनें",
    loomNo: "लूम नं ",
    weaverPieceNo: "वीवर पीसी नं",
    validWeaver: "कृपया वीवर पीसी चुनें",
    validLoom: "कृपया लूम चुनें",
  },
};

const TableLotForm = ({
  onClose,
  selectedLotNo,
  setSelectedLotNo,
  selectedClothId,
  setSelectedClothId,
  setSelectedGridId,
  selectedGridId,
  selectedPiece,
  setCheckerId,
  checkerId,
  setSelectedSubGridId,
  selectedSubGridId,
  setSelectedPiece,
  checkingSectionId,
  setCheckingSectionId,
  isAdmin,
  isSuppervisor,
  storedUsername,
  storedUserId,
  userOptions,
  setLotCheckingNoId,
  lotCheckingNoId,
  selectedNonGridId,
  setSelectedNonGridId,
  onNew,
  TABDATE,
  loomNo,
  setLoomNo,
  weaverPieceNo,
  setWeaverPieceNo,
  setSelectedClothName,
  selectedClothName,
}) => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];
  const socketRef = useRef(null);
  const [dcMeter, setDcMeter] = useState("");
  const [selectedTables, setSelectedTables] = useState([]);
  const [workingDetails, setWorkingDetails] = useState(null);
  const [allocationId, setAllocationId] = useState("");
  const [allocatedCheckerId, setAllocatedCheckerId] = useState("");
  const [allocatedCheckingSectionId, setAllocatedCheckingSectionId] =
    useState("");
  const [allocatedLotId, setAllocatedLotId] = useState("");
  const [allocatedPieceId, setAllocatedPieceId] = useState("");
  const [allocatedTableId, setAllocatedtableId] = useState([]);
  const [widerTable, setWiderTable] = useState("No");

  const { companyId } = getCommonParams();

  console.log(selectedLotNo, "selectedLotNo");

  let NOOFPCSSTK = 1;
  let PCSTAKEN = "Yes";
  let NOTES1 = "YES";
  const lotIdRef = useRef(null);
  const {
    data: tables,
    refetch,
    isUninitialized: tablesUninitialized,
  } = useGetTablesQuery();
  const {
    data: pieces,
    refetch: piecesrefetch,
    isUninitialized: piecesUninitialized,
  } = useGetPiecesQuery(
    {
      // selectedClothId,
      selectedLotNo,
      // lotCheckingNoId,
    },
    {
      skip: !selectedLotNo,
    },
  );
  const { data: workStatus, refetch: refetchWorkStatus } =
    useGetWorkStatusQuery(storedUserId, {
      skip: !storedUserId,
    });
  const dispatch = useDispatch();
  const [dispatchInvalidate] = useInvalidateTags();

  // useEffect(() => {
  //   socketRef.current = io(process.env.REACT_APP_SERVER_URL);

  //   socketRef.current.on("tableUpdated", (data) => {
  //     if (!tablesUninitialized) {

  //       // 🔥 Refetch tables automatically
  //       refetch();
  //     }
  //   });
  //   socketRef.current.on("pieceUpdated", (data) => {
  //     if (!piecesUninitialized) {
  //       piecesrefetch();
  //     }
  //   });
  //   socketRef.current.on("workStatusUpdated", () => {
  //     dispatch(tableLotApi.util.invalidateTags(["WorkStatus"]));
  //   });

  //   return () => {
  //     socketRef.current.disconnect();
  //   };
  // }, [
  //   refetch,
  //   piecesrefetch,
  //   refetchWorkStatus,
  //   piecesUninitialized,
  //   tablesUninitialized,
  // ]);
  useEffect(() => {
    const handleTableUpdate = () => {
      if (!tablesUninitialized) refetch();
    };
    const handlePieceUpdate = () => {
      if (!piecesUninitialized) piecesrefetch();
    };
    const handleWorkStatusUpdate = () =>
      dispatch(tableLotApi.util.invalidateTags(["WorkStatus"]));

    socket.on("tableUpdated", handleTableUpdate);
    socket.on("pieceUpdated", handlePieceUpdate);
    socket.on("workStatusUpdated", handleWorkStatusUpdate);

    return () => {
      socket.off("tableUpdated", handleTableUpdate);
      socket.off("pieceUpdated", handlePieceUpdate);
      socket.off("workStatusUpdated", handleWorkStatusUpdate);
    };
  }, [
    refetch,
    piecesrefetch,
    dispatch,
    tablesUninitialized,
    piecesUninitialized,
  ]);
  useEffect(() => {
    if (!isAdmin && !isSuppervisor) {
      setCheckerId(storedUserId);
    }
  }, [isAdmin, isSuppervisor, storedUserId, setCheckerId]);

  // ✅ RTK Query
  const {
    data: lots,
    error,
    isLoading,
  } = useGetLotsQuery({ params: { companyId } });
  const { data: checking } = useGetCheckingSectionQuery();

  const { data: cloths, refetch: clothsrefetch } = useGetClothQuery(
    selectedLotNo,
    {
      skip: !selectedLotNo,
    },
  );

  useEffect(() => {
    if (workStatus?.hasActiveWork) {
      const work = workStatus.data;
      setAllocationId(work?.allocationId);
      setAllocatedCheckerId(work?.checkerId);
      setAllocatedCheckingSectionId(work?.checkingSectionId);
      setAllocatedLotId(work?.lotId);
      setAllocatedPieceId(work?.pieceId);
      // safer table mapping
      const tableIds = work?.tables?.map((t) => t.tableId) || [];
      const tableNumbers = work?.tables?.map((t) => t.checkingNo) || [];

      setAllocatedtableId(tableIds);
      setWorkingDetails({
        allocationId: work.allocationId,
        sectionName: work.sectionName,
        userName: work.checkerName,
        lotNo: work.docId,
        pieceNo: work.pieceNo,
        tableNumbers,
        meters: work.meters,
      });
      if (work?.checkerId) {
        setCheckerId(work.checkerId);
      }
    } else {
      setWorkingDetails(null);
    }
  }, [workStatus]);
  let singleData;
  // const { data: singleData } = useGetTableLotByIdQuery(
  //   { selectedLotNo, selectedGridId },
  //   { skip: !selectedLotNo || !selectedGridId },
  // );
  console.log(singleData, "singleData");

  const [updateData] = useUpdateTableLotMutation();
  const [deleteAllocation] = useDeleteWorkStatusLotMutation();
  const [revertAllocation] = useRevertAllocationMutation();

  const syncFormWithDb = useCallback(
    (data) => {},
    [selectedLotNo, selectedGridId],
  );

  useEffect(() => {
    if (selectedClothId && singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [selectedClothId, singleData, syncFormWithDb]);

  const data = {
    selectedNonGridId: parseInt(selectedNonGridId),
    selectedLotNo: parseInt(selectedLotNo),
    selectedClothId: parseInt(selectedClothId),
    selectedGridId: parseInt(selectedGridId),
    selectedTables,
    checkerId: parseInt(checkerId),
    selectedPiece: parseInt(selectedPiece),
    checkingSectionId: parseInt(checkingSectionId),
    selectedSubGridId: parseInt(selectedSubGridId),
    dcMeter,
    TABDATE,
    NOOFPCSSTK,
    PCSTAKEN,
    NOTES1,
    storedUserId: parseInt(storedUserId),
    weaverPieceNo,
    loomNo,
    companyId,
  };

  const handleSubmitCustom = async (callback, data) => {
    try {
      let returnData = await callback(data).unwrap();
      dispatchInvalidate();
      Swal.fire({
        title: t.addedSuccess,
        icon: "success",
        draggable: true,
        timer: 2000,
        showConfirmButton: false,
      });
      await refetchWorkStatus();
      onNew();
      setSelectedTables([]);
      clothsrefetch();
      piecesrefetch();
      setDcMeter("");
      setSelectedLotNo("");

      setTimeout(() => {
        lotIdRef.current?.focus();
        lotIdRef.current?.openMenu("first");
      }, 100);
    } catch (error) {
      console.log("Full Error:", error);
      const backendMessage =
        error?.data?.message || error?.data?.error || "Something went wrong!";

      Swal.fire({
        icon: "error",
        title: t.submissionFailed,
        text: backendMessage,
        timer: 2500,
      });
    }
  };
  const lotOptions = useMemo(
    () =>
      lots?.data?.map((lot) => ({
        value: lot?.LOTID,
        label: lot?.LOTNO,
        nonGridId: lot?.NONGRIDID,
        clothName: lot?.CLOTHNAME,
      })),
    [lots?.data],
  );

  const checkingOptions = useMemo(
    () =>
      checking?.data?.map((check) => ({
        value: check?.GTCHECKINGMASTID,
        label: check?.SECTIONNAME,
      })),
    [checking?.data],
  );

  const clothOptions = useMemo(() => {
    if (!selectedLotNo) return [];

    return (
      cloths?.data?.map((cloth) => ({
        label: cloth?.CLOTHNAME,
        value: cloth?.GRIDID,
        clothId: cloth?.CLOTHID,
        lotchkId: cloth?.LOTCHKNOID,
      })) || []
    );
  }, [cloths?.data, selectedLotNo]);

  const pieceOptions = useMemo(() => {
    if (!selectedLotNo) return [];

    return [...(pieces?.data || [])]
      .sort((a, b) => a.PCSNO - b.PCSNO)
      .map((piece) => ({
        label: piece?.PCSNO,
        value: piece?.PCSNO,
        meter: piece?.METER,
        subGridId: piece?.SUBGRIDID,
      }));
  }, [pieces?.data, selectedLotNo]);
  console.log(pieceOptions, "pieceOptions");

  // Filter tables for selection
  const availableTables = tables?.data?.filter(
    (t) => !t.TABLEAVAILBLE || t.TABLEAVAILBLE.toUpperCase() !== "NO",
  );

  console.log(workingDetails, "workingDetails");

  const validateSaveData = () => {
    const validations = [
      { condition: !checkingSectionId, message: t.validCheckingSection },
      { condition: !checkerId, message: t.validCheckerName },
      { condition: !selectedLotNo, message: t.validLotNo },
      { condition: !selectedClothId, message: t.validCloth },
      { condition: !selectedPiece, message: t.validPiece },
      { condition: !weaverPieceNo, message: t.validWeaver },
      { condition: !loomNo, message: t.validLoom },
      { condition: selectedTables?.length === 0, message: t.validTable },
    ];
    for (const item of validations) {
      if (item.condition) {
        Swal.fire({
          icon: "warning",
          title: item.message,
          timer: 2000,
          showConfirmButton: false,
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
  useEffect(() => {
    if (lotIdRef.current) {
      lotIdRef.current.focus();
      lotIdRef.current?.openMenu("first");
    }
  }, []);
  const lastAutoFilledLot = useRef(null);
  useEffect(() => {
    // Reset when lot changes
    lastAutoFilledLot.current = null; // ← clear on lot change    setSelectedGridId("");
    setSelectedClothId("");
    setSelectedSubGridId("");
    setSelectedPiece("");
    setDcMeter("");
    // setCheckingSectionId("");
    // setCheckerId("");
    // setSelectedTables([]);
  }, [selectedLotNo]);
  // ── Auto-select first cloth once clothOptions loads after lot selection ──
  // ── Auto-select first cloth once clothOptions loads after lot selection ──
  useEffect(() => {
    if (
      clothOptions?.length > 0 &&
      selectedLotNo &&
      lastAutoFilledLot.current !== selectedLotNo // ← not yet filled for this lot
    ) {
      lastAutoFilledLot.current = selectedLotNo; // ← mark this lot as filled
      const first = clothOptions[0];
      setSelectedGridId(first.value || "");
      setSelectedClothId(first.clothId || "");
      setLotCheckingNoId(first.lotchkId || "");
    }
  }, [clothOptions, selectedLotNo]);

  const handleRevert = async (allocationId) => {
    try {
      await revertAllocation(allocationId).unwrap();
      Swal.fire({
        icon: "success",
        title: t.revertSuccess,
        timer: 2000,
        showConfirmButton: false,
      });
      onNew();
      // ✅ restore checker immediately
      if (!isAdmin && !isSuppervisor) {
        setCheckerId(storedUserId);
      }
    } catch (err) {
      Swal.fire({
        icon: "Warning",
        title: t.revertFailed,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  useEffect(() => {
    if (!selectedSubGridId || !cloths?.data) {
      setDcMeter("");
      return;
    }
  }, [selectedSubGridId, cloths]);

  if (isLoading) {
    return <div className="p-6 text-center">{t.loading}</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{t.errorLoading}</div>;
  }
  const handleSelect = (item) => {
    if (widerTable === "No") {
      // Single select mode
      setSelectedTables((prev) => {
        const exists = prev?.find(
          (t) => t.GTCHKTABLEMASTID === item.GTCHKTABLEMASTID,
        );
        return exists ? [] : [item]; // toggle: deselect if same, else replace
      });
    } else {
      // Multi select mode
      setSelectedTables((prev) => {
        const exists = prev?.find(
          (t) => t.GTCHKTABLEMASTID === item.GTCHKTABLEMASTID,
        );
        if (exists) {
          return prev?.filter(
            (t) => t.GTCHKTABLEMASTID !== item.GTCHKTABLEMASTID,
          );
        } else {
          return [...prev, item];
        }
      });
    }
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
      zIndex: 9999, // ← add this
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
    menuPortal: (base) => ({
      // ← add this entire block
      ...base,
      zIndex: 9999,
    }),
  };
  const handleDefectEntry = () => {
    dispatch(push({ id: "Defect Entry", name: "Defect Entry" }));
  };
  if (workStatus?.hasActiveWork) {
    return (
      <div className="min-h-[75vh] bg-gray-50 p-4 sm:p-6 flex items-start justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            {t.activeWork}
          </h1>

          {/* Details Card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500">{t.section}</p>
                <p className="font-semibold">{workingDetails?.sectionName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.checker}</p>
                <p className="font-semibold">{workingDetails?.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.lotNo}</p>
                <p className="font-semibold">{workingDetails?.lotNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.piece}</p>
                <p className="font-semibold">{workingDetails?.pieceNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.meters}</p>
                <p className="font-semibold">
                  {workingDetails?.meters?.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.tableNo}</p>
                <p className="font-semibold">
                  {workingDetails?.tableNumbers?.join(", ")}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg font-medium"
                onClick={handleDefectEntry}
              >
                {t.goToDefect}
              </button>

              <button
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 transition text-white px-6 py-2 rounded-lg font-medium"
                onClick={() => handleRevert(allocationId)}
              >
                {t.revertWork}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
      <div className="h-[70vh] overflow-y-auto overflow-x-hidden bg-white shadow-lg rounded-xl mt-2">
        <form className=" p-2">
          {/* Table Details */}

          <div>
            <h2 className="text-lg font-semibold">{t.tableDetails}</h2>

            <div className="flex items-end gap-4 mt-2 text-sm w-full">
              {/* Piece No */}

              <div className="flex flex-col flex-1 max-w-[14rem]">
                <label className="text-sm font-medium mb-1">
                  {t.checkingSection}
                </label>

                <Select
                  ref={lotIdRef}
                  options={checkingOptions}
                  value={
                    checkingOptions?.find(
                      (option) => option.value === checkingSectionId,
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    setCheckingSectionId(selectedOption?.value || "");
                  }}
                  autoFocus
                  placeholder={t.selectSection}
                  isClearable={false} // ✅ disable cross icon
                  styles={customSelectStyles}
                  className="text-left"
                  isSearchable={true}
                  menuPortalTarget={document.body} // ← renders menu outside the clipped container
                  menuPosition="fixed"
                />
              </div>

              <div className="flex flex-col flex-1 max-w-[17rem]">
                <label className="text-sm font-medium mb-1">
                  {t.checkerName}
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
                      isOptionDisabled={(option) => option?.isWorked} // ✅ disables click
                      formatOptionLabel={(option) => (
                        <div
                          style={{
                            color: option?.isWorked ? "red" : "inherit",
                          }}
                        >
                          {option?.label}
                        </div>
                      )}
                      placeholder={t.selectUser}
                      isClearable={false}
                      styles={customSelectStyles}
                      className="text-left"
                      isSearchable={true}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
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

              <div className="flex flex-col flex-1 max-w-[8rem]">
                <label className="text-sm font-medium mb-1">
                  {t.tablesChoosed}
                </label>

                <input
                  type="text"
                  value={selectedTables
                    ?.map((t) => t.CHECKINGNO)
                    ?.sort((a, b) => Number(a) - Number(b))
                    ?.join(", ")}
                  readOnly
                  className="
      border
      rounded-lg
      text-right pr-1
      px-1
      py-[7px]
      w-full
      bg-gray-100
      font-medium
    "
                />
              </div>
            </div>
          </div>
          {/* Lot Details */}
          <div className="mt-2">
            <div>
              <h2 className="text-lg font-semibold">{t.lotDetails}</h2>
              <div className="grid grid-cols-9 lg:grid-cols-10 gap-4 mt-2 text-sm">
                {/* Lot No */}
                <div className="col-span-3 lg:col-span-2 z-999">
                  <label className="block font-medium mb-1">{t.lotNo}</label>
                  <Select
                    options={lotOptions}
                    value={
                      lotOptions?.find(
                        (option) => option.value === selectedLotNo,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedLotNo(selectedOption?.value || "");
                      setSelectedNonGridId(selectedOption?.nonGridId || "");
                      setSelectedClothName(selectedOption?.clothName || "");
                    }}
                    placeholder={t.selectLot}
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                    menuPortalTarget={document.body} // ← renders menu outside the clipped container
                    menuPosition="fixed"
                  />
                </div>

                {/* Cloth Name */}
                <div className="col-span-4 lg:col-span-4">
                  <label className="block font-medium mb-1">
                    {t.clothName}
                  </label>

                  <input
                    type="text"
                    value={selectedClothName}
                    readOnly
                    className="
                  border
                  rounded-lg
                  text-left pl-1
                  px-1
                  py-[7px]
                  w-full
                  bg-gray-100
                  
                "
                  />
                </div>

                {/* Receipt Pcs */}
                <div className="col-span-2 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.pieceNo}</label>
                  <Select
                    options={pieceOptions}
                    value={
                      pieceOptions?.find(
                        (option) => option.value === selectedPiece,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedSubGridId(selectedOption?.subGridId || "");
                      setSelectedPiece(selectedOption?.value || "");
                      setDcMeter(selectedOption?.meter || "");
                    }}
                    placeholder=" "
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                    className="text-right"
                    menuPortalTarget={document.body} // ← renders menu outside the clipped container
                    menuPosition="fixed"
                  />
                </div>

                {/* Meters in DC */}
                <div className="col-span-2 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.meters}</label>
                  <input
                    type="number"
                    value={Number(dcMeter || 0)?.toFixed(3)}
                    readOnly
                    className="w-full border rounded-lg px-1 py-[7px] text-right bg-gray-100"
                  />
                </div>
                {/* Weaver pc no */}
                <div className="col-span-2 lg:col-span-1">
                  <label className="block font-medium mb-1">
                    {t.weaverPieceNo}
                  </label>
                  <input
                    type="text"
                    value={weaverPieceNo}
                    onChange={(e) => setWeaverPieceNo(e.target.value)}
                    className="w-full border rounded-lg px-1 py-[7px] text-right "
                  />
                </div>
                {/* Loom no */}
                <div className="col-span-2 lg:col-span-1">
                  <label className="block font-medium mb-1">{t.loomNo}</label>
                  <input
                    type="text"
                    value={loomNo}
                    onChange={(e) => setLoomNo(e.target.value)}
                    className="w-full border rounded-lg px-1 py-[7px] text-right "
                  />
                </div>
                {/* Multi Table */}
                <div className="col-span-2 lg:col-span-1 ">
                  <label className="text-sm font-medium mb-2">
                    {t.widerTable}
                  </label>

                  <Select
                    options={[
                      { value: "No", label: "No" },
                      { value: "Yes", label: "Yes" },
                    ]}
                    value={{ value: widerTable, label: widerTable }}
                    onChange={(selectedOption) => {
                      setWiderTable(selectedOption?.value || "No");
                      setSelectedTables([]); // reset tables on toggle
                    }}
                    isClearable={false}
                    styles={customSelectStyles}
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <CheckingNoGrid
          data={availableTables}
          selectedTables={selectedTables}
          setSelectedTables={setSelectedTables}
          handleSelect={handleSelect}
        />
      </div>
    </div>
  );
};

export default TableLotForm;
