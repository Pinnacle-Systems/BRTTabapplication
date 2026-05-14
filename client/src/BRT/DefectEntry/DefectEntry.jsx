/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import Select from "react-select";
import { customSelectStyles } from "../../Utils/helper.js";
import { useGetWorkStatusQuery } from "../../redux/services/TableandLot";
import {
  useGetLotsQuery,
  useGetPiecesQuery,
  useGetSetNOQuery,
  useGetlotDetailsQuery,
  useGetDefectsQuery,
  useUpdateDefectEntryMutation,
  useGetDefectDetailsQuery,
  useGetSavedLotsQuery, // ← add
  useGetSavedPiecesQuery,
} from "../../redux/services/defectEntry.js";
import { useGetloomWeaverByIdQuery } from "../../redux/services/PieceReceipt.js";
import { useGetRolesQuery } from "../../redux/userservice";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { ExpandMore } from "@mui/icons-material";
import { useLanguage } from "../../Context/LanguageContext.jsx";

// ─── Translations ──────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Defect Entry",
    save: "Save",
    // Lot Details section
    lotDetails: "Lot Details",
    lotNo: "Lot No",
    selectLot: "Select Lot",
    pieceNo: "Piece No",
    selectPiece: "Select",
    meters: "Meters",
    tableNo: "Table No",
    checkerName: "Checker Name",
    checkingSectionName: "Checking Section Name",
    completed: "Completed",
    // Piece accordion
    piece: "Piece",
    defectDetails: "Defect Details",
    meterAt: "Meter At",
    defectName: "Defect Name",
    points: "Points",
    noOfTimes: "No of times",
    totalPoints: "Total Points",
    add: "Add",
    split: "Split",
    deletePiece: "Delete Piece",
    // Table headers
    meter: "Meter",
    action: "Action",
    times: "Times",
    // Empty state
    emptyAdmin: "Select a Lot and Piece above to begin defect entry.",
    emptyChecker: "Loading piece details...",
    // Swal messages
    invalidSplitMeter: "Invalid Split Meter",
    cannotDeleteOnlyPiece: "Cannot delete the only piece",
    pleaseSelectMeter: "Please select Meter",
    pleaseSelectDefect: "Please select a Defect",
    pleaseEnterTimes: "Please enter No of Times",
    sameDefectExists: "Same Defect Already Exists",
    pleaseSelectLot: "Please select a Lot",
    pleaseSelectPiece: "Please select a Piece",
    noPieceData: "No piece data to save",
    pieceHasNoDefects: "has no defects",
    addDefectForEveryPiece:
      "Please add at least one defect for every piece before saving.",
    addedSuccess: "Added Successfully",
    submissionFailed: "Submission Failed",
    deletePieceConfirmTitle: "Delete Piece",
    deletePieceConfirmText:
      "This will remove the piece and its defects. Remaining pieces will be renumbered.",
    yesDelete: "Yes, delete",
    defect: "defect",
    defects: "defects",
    tablePoints: "Points",
    loomNo: "Loom No",
    weaverPieceNo: "Weaver Pcs No",
  },
  ta: {
    title: "குறைபாடு பதிவு",
    save: "சேமி",
    lotDetails: "லாட் விவரங்கள்",
    lotNo: "லாட் எண்",
    selectLot: "லாட் தேர்ந்தெடு",
    pieceNo: "பீஸ்",
    selectPiece: "தேர்ந்தெடு",
    meters: "மீட்டர்கள்",
    tableNo: "மேஜை",
    checkerName: "சரிபார்ப்பாளர் பெயர்",
    checkingSectionName: "சரிபார்ப்பு பிரிவு பெயர்",
    completed: "முடிந்தது",
    piece: "பீஸ்",
    defectDetails: "குறைபாடு விவரங்கள்",
    meterAt: "மீட்டர்",
    defectName: "குறைபாடு பெயர்",
    points: "புள்ளிகள்",
    noOfTimes: "எத்தனை முறை",
    totalPoints: "மொத்தம்",
    add: "சேர்",
    split: "பிரி",
    deletePiece: "துண்டை நீக்கு",
    meter: "மீட்டர்",
    action: "செயல்",
    times: "முறை",
    emptyAdmin: "குறைபாடு பதிவை தொடங்க மேலே லாட் மற்றும் துண்டை தேர்ந்தெடு.",
    emptyChecker: "பீஸ் விவரங்கள் ஏற்றப்படுகின்றன...",
    invalidSplitMeter: "தவறான பிரிவு மீட்டர்",
    cannotDeleteOnlyPiece: "ஒரே ஒரு துண்டை நீக்க முடியாது",
    pleaseSelectMeter: "மீட்டரை தேர்ந்தெடுக்கவும்",
    pleaseSelectDefect: "குறைபாட்டை தேர்ந்தெடுக்கவும்",
    pleaseEnterTimes: "எத்தனை முறை என்று உள்ளிடவும்",
    sameDefectExists: "இதே குறைபாடு ஏற்கனவே உள்ளது",
    pleaseSelectLot: "லாட்டை தேர்ந்தெடுக்கவும்",
    pleaseSelectPiece: "துண்டை தேர்ந்தெடுக்கவும்",
    noPieceData: "சேமிக்க பீஸ் தரவு இல்லை",
    pieceHasNoDefects: "பீஸ்க்கு குறைபாடு இல்லை",
    addDefectForEveryPiece:
      "சேமிக்கும் முன் ஒவ்வொரு பீஸ்க்கும் குறைந்தது ஒரு குறைபாடு சேர்க்கவும்.",
    addedSuccess: "வெற்றிகரமாக சேர்க்கப்பட்டது",
    submissionFailed: "சமர்ப்பிப்பு தோல்வி",
    deletePieceConfirmTitle: "துண்டை நீக்கு",
    deletePieceConfirmText:
      "இது பீஸ் மற்றும் அதன் குறைபாடுகளை நீக்கும். மீதமுள்ள பீஸ்கள் மறுவரிசைப்படுத்தப்படும்.",
    yesDelete: "ஆம், நீக்கு",
    defect: "குறைபாடு",
    defects: "குறைபாடுகள்",
    tablePoints: "புள்ளி",
    loomNo: "லூம் எண்",
    weaverPieceNo: "வீவர் பீஸ் எண்",
  },
  hi: {
    title: "दोष प्रविष्टि",
    save: "सहेजें",
    lotDetails: "लॉट विवरण",
    lotNo: "लॉट नं.",
    selectLot: "लॉट चुनें",
    pieceNo: "पीस नं.",
    selectPiece: "चुनें",
    meters: "मीटर",
    tableNo: "टेबल नं.",
    checkerName: "जांचकर्ता का नाम",
    checkingSectionName: "जांच अनुभाग नाम",
    completed: "पूर्ण",
    piece: "पीस",
    defectDetails: "दोष विवरण",
    meterAt: "मीटर पर",
    defectName: "दोष का नाम",
    points: "अंक",
    noOfTimes: "कितनी बार",
    totalPoints: "कुल अंक",
    add: "जोड़ें",
    split: "विभाजित",
    deletePiece: "पीस हटाएं",
    meter: "मीटर",
    action: "कार्रवाई",
    times: "बार",
    emptyAdmin: "दोष प्रविष्टि शुरू करने के लिए ऊपर लॉट और पीस चुनें।",
    emptyChecker: "पीस विवरण लोड हो रहा है...",
    invalidSplitMeter: "अमान्य विभाजन मीटर",
    cannotDeleteOnlyPiece: "एकमात्र पीस को हटाया नहीं जा सकता",
    pleaseSelectMeter: "कृपया मीटर चुनें",
    pleaseSelectDefect: "कृपया दोष चुनें",
    pleaseEnterTimes: "कृपया बार की संख्या दर्ज करें",
    sameDefectExists: "यही दोष पहले से मौजूद है",
    pleaseSelectLot: "कृपया लॉट चुनें",
    pleaseSelectPiece: "कृपया पीस चुनें",
    noPieceData: "सहेजने के लिए कोई पीस डेटा नहीं",
    pieceHasNoDefects: "में कोई दोष नहीं है",
    addDefectForEveryPiece: "सहेजने से पहले हर पीस में कम से कम एक दोष जोड़ें।",
    addedSuccess: "सफलतापूर्वक जोड़ा गया",
    submissionFailed: "सबमिशन विफल",
    deletePieceConfirmTitle: "पीस हटाएं",
    deletePieceConfirmText:
      "यह पीस और उसके दोषों को हटा देगा। शेष पीस पुनः क्रमबद्ध होंगे।",
    yesDelete: "हाँ, हटाएं",
    defect: "दोष",
    defects: "दोष",
    tablePoints: "अंक",
    loomNo: "लूम नं ",
    weaverPieceNo: "वीवर पीसी नं",
  },
};

const DefectEntry = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];
  const [allocationId, setAllocationId] = useState("");
  const [checkerId, setCheckerId] = useState("");
  const [checkingSectionId, setCheckingSectionId] = useState("");
  const [lotId, setLotId] = useState("");
  const [pieceId, setPieceId] = useState("");
  const [tableId, settableId] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [checkerName, setCheckerName] = useState("");
  const [pieceNo, setPieceNo] = useState("");
  const [meters, setMeters] = useState("");
  const [tableNo, setTableNo] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [setNo, setSetNo] = useState("");

  const [perPieceForm, setPerPieceForm] = useState({});
  const [translatedDefects, setTranslatedDefects] = useState([]);
  const translationCacheRef = useRef({});
  const [data, setData] = useState({ lotDetails: [] });
  const [isCompleted, setIsCompleted] = useState(false);
  const lotIdRef = useRef(null);
  const isInitialLotMount = useRef(true);
  const [loomNo, setLoomNo] = useState("");
  const [weaverPieceNo, setWeaverPieceNo] = useState("");
  const storedUserId = Number(localStorage.getItem("userId"));
  const storedRoleId = Number(localStorage.getItem("roleId"));
  const { data: roles } = useGetRolesQuery();

  const adminRole = roles?.data?.find(
    (val) => val?.ROLENAME?.toLowerCase() === "admin",
  );
  const supervisorRole = roles?.data?.find(
    (val) => val?.ROLENAME?.toLowerCase() === "supervisor",
  );

  const adminId = adminRole?.ROLEID;
  const supervisorId = supervisorRole?.ROLEID;
  const isAdmin = Number(storedRoleId) === adminId;
  const isSuppervisor = Number(storedRoleId) === supervisorId;
  const rolesLoaded = !!roles?.data?.length;
  const canEditLot = isAdmin || isSuppervisor;

  const shouldSkipWorkStatus =
    !storedUserId || !rolesLoaded || isAdmin || isSuppervisor;

  const { data: workStatus } = useGetWorkStatusQuery(storedUserId, {
    skip: shouldSkipWorkStatus,
  });

  const { data: lots, refetch: refetchLots } = useGetLotsQuery();
  const { data: pieces } = useGetPiecesQuery({ lotId }, { skip: !lotId });
  const { data: setNoData } = useGetSetNOQuery(
    { lotId, pcNo: pieceNo },
    { skip: !lotId },
  );
  console.log(setNoData, "setNoData");

  useEffect(() => {
    setSetNo(setNoData?.data[0]?.SETNO);
  }, [setNoData]);
  console.log(setNo, "setNO");

  const { data: lotDetails } = useGetlotDetailsQuery(
    { pieceId },
    { skip: !pieceId },
  );
  // ← new: for admin/supervisor view of saved entries
  const { data: savedLots, refetch: refetchSavedLots } = useGetSavedLotsQuery(
    undefined,
    { skip: !canEditLot },
  );
  const { data: savedPieces } = useGetSavedPiecesQuery(
    { lotId },
    { skip: !lotId || !canEditLot },
  );
  const { data: loomWeaver } = useGetloomWeaverByIdQuery(
    { lotId, pcno: pieceNo },
    { skip: !lotId || !pieceNo },
  );
  console.log(loomWeaver, "loomWeaver");

  const { data: defectEntry } = useGetDefectsQuery();

  const buildPerPieceForm = () => ({
    checkedMeter: "",
    defectId: "",
    defectName: "",
    defectPoints: "",
    defectTimes: "",
    totalDefectPoints: "",
  });

  const getForm = (index) => perPieceForm[index] || buildPerPieceForm();

  const setForm = (index, updater) => {
    setPerPieceForm((prev) => {
      const current = prev[index] || buildPerPieceForm();
      const updated =
        typeof updater === "function"
          ? updater(current)
          : { ...current, ...updater };
      return { ...prev, [index]: updated };
    });
  };

  useEffect(() => {
    if (!pieceId || !pieceNo || !meters) return;
    setIsCompleted(false); // ← reset on piece change
    setData((prev) => {
      const existingDefects =
        prev.lotDetails[0]?.pieceId === pieceId
          ? prev.lotDetails[0].defects
          : [];

      return {
        lotDetails: [
          {
            lotId,
            pieceNo,
            pieceId,
            subPieceNo: pieceNo.toString(),
            startMeter: 1,
            endMeter: Number(meters),
            actualMeters: Number(meters), // ← add
            meters: Number(meters),
            tableNo,
            checkerName,
            checkerId,
            checkingSectionId,
            sectionName,
            defects: existingDefects,
            originalPieceNo: pieceNo.toString(),
          },
        ],
      };
    });

    setPerPieceForm({});
  }, [pieceId, pieceNo, meters]);
  const { data: existingEntry } = useGetDefectDetailsQuery(
    { lotId, pieceId },
    { skip: !lotId || !pieceId },
  );
  console.log(existingEntry, "existingEntry");
  const isApproved = useMemo(() => {
    return existingEntry?.data?.some((p) => p.tabApproval === "YES");
  }, [existingEntry]);

  const approvedSubPieceNames = useMemo(() => {
    return existingEntry?.data
      ?.filter((p) => p.tabApproval === "YES")
      ?.map((p) => p.subPieceNo)
      ?.join(", ");
  }, [existingEntry]);

  useEffect(() => {
    if (!existingEntry?.data || existingEntry.data.length === 0) return;
    if (!pieceId || !pieceNo || !meters) return;

    // Map existing DB pieces into the same shape as data.lotDetails
    const lotDetails = existingEntry.data.map((p) => ({
      lotId,
      pieceId,
      pieceNo: p.pieceNo,
      subPieceNo: p.subPieceNo,
      startMeter: p.startMeter,
      endMeter: p.endMeter,
      actualMeters: p.endMeter - p.startMeter + 1,
      meters: Number(meters),
      tableNo,
      checkerName,
      checkerId,
      checkingSectionId,
      sectionName,
      defects: p.defects,
      originalPieceNo:
        p.originalPieceNo || p.subPieceNo || p.pieceNo.toString(),
    }));

    setData({ lotDetails });
    setPerPieceForm({});
  }, [existingEntry]);

  useEffect(() => {
    if (!loomWeaver?.data) return;
    setLoomNo(loomWeaver.data.loomNo || "");
    setWeaverPieceNo(loomWeaver.data.weaverPieceNo || "");
  }, [loomWeaver]);

  // ── replace lotOptions ──
  const lotOptions = useMemo(() => {
    const seen = new Set();
    // admin/supervisor → saved lots from defect tables
    const source = canEditLot ? savedLots?.data : lots?.data;
    return (
      source
        ?.filter((lot) => {
          if (seen.has(lot.LOTID)) return false;
          seen.add(lot.LOTID);
          return true;
        })
        .map((lot) => ({
          value: lot?.LOTID,
          label: lot?.DOCID,
        })) || []
    );
  }, [lots?.data, savedLots?.data, canEditLot]);
  console.log(checkingSectionId, "checkingSectionId");

  // ── replace pieceOptions ──
  const pieceOptions = useMemo(() => {
    if (!lotId) return [];

    // admin/supervisor → saved pieces from defect tables
    if (canEditLot) {
      return [...(savedPieces?.data || [])]
        .sort((a, b) => a.PIECENO - b.PIECENO)
        .map((piece) => ({
          label: piece?.PIECENO,
          value: piece?.PIECEID,
          allocationId: piece?.ALLOCATIONID,
          meter: piece?.METER,
          loomNo: piece?.LOOMNO,
          weaverPieceNo: piece?.WEAVERPCSNO,
          tableNo: piece?.TABLENO,
          checkerName: piece?.CHECKERNAME,
          sectionName: piece?.SECTIONNAME,
          checkerId: piece?.CHECKERID,
          checkingSectionId: piece?.CHECKINGSECTIONID, //
        }));
    }

    // checker → active pieces from CheckerWorkingDetails
    return [...(pieces?.data || [])]
      .sort((a, b) => a.PIECENO - b.PIECENO)
      .map((piece) => ({
        label: piece?.PIECENO,
        value: piece?.PIECEID,
        allocationId: piece?.ALLOCATIONID,
      }));
  }, [pieces?.data, savedPieces?.data, lotId, canEditLot]);

  useEffect(() => {
    if (workStatus?.hasActiveWork && !isAdmin && !isSuppervisor) {
      const work = workStatus?.data;
      setAllocationId(work?.allocationId);
      setCheckerId(work?.checkerId);
      setCheckingSectionId(work?.checkingSectionId);
      setLotId(work?.lotId);
      setPieceId(work?.pieceId);
      const tableIds = work?.tables?.map((t) => t.tableId) || [];
      const tableNumbers = work?.tables?.map((t) => t.checkingNo) || [];
      settableId(tableIds);
      setSectionName(work?.sectionName);
      setCheckerName(work?.checkerName);
      setPieceNo(work?.pieceNo);
      setMeters(work?.meters);
      setTableNo(tableNumbers);
    }
  }, [workStatus, isAdmin, isSuppervisor]);

  useEffect(() => {
    const work = lotDetails?.data;
    if (!work) return;

    setMeters(work?.meters || "");
    const tableIds = work?.tables?.map((t) => t.tableId) || [];
    const tableNumbers = work?.tables?.map((t) => t.checkingNo) || [];
    settableId(tableIds);
    setTableNo(tableNumbers);
    setCheckerId(work?.checkerId || "");
    setCheckerName(work?.checkerName || "");
    setCheckingSectionId(work?.checkingSectionId || "");
    setSectionName(work?.sectionName || "");
    if (work?.pieceNo) setPieceNo(work.pieceNo);
  }, [lotDetails]);

  useEffect(() => {
    if (!canEditLot) return;
    if (isInitialLotMount.current) {
      isInitialLotMount.current = false;
      return;
    }
    if (lotId) {
      setPieceId("");
      setPieceNo("");
      setTableNo([]);
      settableId([]);
      setMeters("");
      setCheckerName("");
      setSectionName("");
      setCheckerId("");
      setCheckingSectionId("");
      setData({ lotDetails: [] });
      setPerPieceForm({});
      setIsCompleted(false); // ← reset on lot change
      setLoomNo("");
      setWeaverPieceNo("");
    }
  }, [lotId, canEditLot]);

  useEffect(() => {
    if (lotIdRef.current && canEditLot) {
      lotIdRef.current.focus();
    }
  }, []);

  const translateText = async (text, targetLang) => {
    const cacheKey = `${text}__${targetLang}`;
    if (translationCacheRef.current[cacheKey]) {
      return translationCacheRef.current[cacheKey];
    }
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
      );
      const json = await res.json();
      const translated = json[0][0][0];
      translationCacheRef.current[cacheKey] = translated;
      return translated;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  useEffect(() => {
    if (!defectEntry?.data) return;
    const translateAll = async () => {
      const results = await Promise.all(
        defectEntry.data.map(async (def) => {
          const [hindi, tamil] = await Promise.all([
            translateText(def.DEFECTNAME, "hi"),
            translateText(def.DEFECTNAME, "ta"),
          ]);
          return {
            ...def,
            translatedLabel: `${def.DEFECTNAME} / ${hindi} / ${tamil}`,
          };
        }),
      );
      setTranslatedDefects(results);
    };
    translateAll();
  }, [defectEntry]);

  const defectOptions = translatedDefects.map((def) => ({
    label: def.translatedLabel,
    value: Number(def.GTPIECEDEFMASTID),
    points: def.POINTS,
    englishName: def.DEFECTNAME,
  }));

  const buildDataToSubmit = () => {
    const Lot = data.lotDetails.map((piece) => {
      const pieceTotalPoints = piece.defects.reduce(
        (sum, d) => sum + Number(d.totalPoints || 0),
        0,
      );
      // Only send subPieceNo for split pieces (e.g. "1A", "1B")
      // Parent piece (subPieceNo === pieceNo as string) sends null
      const isSplitPiece = piece.subPieceNo !== String(piece.pieceNo);
      return {
        lotId: parseInt(lotId),
        allocationId: parseInt(allocationId),
        pieceId: parseInt(pieceId),
        pieceNo: parseInt(pieceNo),
        subPieceNo: isSplitPiece ? piece.subPieceNo : null,
        startMeter: piece.startMeter,
        endMeter: piece.endMeter,
        actualMeters: piece.actualMeters,
        meters: Number(meters),
        tableId,
        tableNo,
        checkerId: parseInt(checkerId),
        checkerName,
        checkingSectionId: parseInt(checkingSectionId),
        sectionName,
        totalPointsSum: pieceTotalPoints,
        defects: piece.defects,
        loomNo: loomNo || null, // ← add
        weaverPcsNo: weaverPieceNo || null, // ← add,
        setNo,
        originalPieceNo: piece.originalPieceNo,
      };
    });
    return {
      lotId: parseInt(lotId),
      deleteWorkStatus: isCompleted,
      Lot,
    };
  };

  const handleSplit = (pieceIndex, splitMeter) => {
    if (!splitMeter) return;
    setData((prev) => {
      const lotDetails = [...prev.lotDetails];
      const piece = { ...lotDetails[pieceIndex] };

      if (splitMeter <= piece.startMeter || splitMeter >= piece.endMeter) {
        Swal.fire({ icon: "warning", title: t.invalidSplitMeter });
        return prev;
      }

      const existingSplitCount = lotDetails.filter(
        (p) =>
          String(p.pieceNo) === String(piece.pieceNo) &&
          p.subPieceNo !== String(p.pieceNo),
      ).length;

      const nextLetter = String.fromCharCode(65 + existingSplitCount);

      const updatedPiece = {
        ...piece,
        subPieceNo: String(piece.subPieceNo),
        originalPieceNo: String(piece.subPieceNo),
        endMeter: splitMeter,
        actualMeters: splitMeter - piece.startMeter + 1,
        defects: piece.defects.filter((d) => d.meter <= splitMeter),
      };

      const newPiece = {
        ...piece,
        subPieceNo: `${piece.pieceNo}${nextLetter}`,
        originalPieceNo: `${piece.pieceNo}${nextLetter}`,
        startMeter: splitMeter + 1,
        endMeter: piece.endMeter,
        actualMeters: piece.endMeter - splitMeter,
        defects: piece.defects.filter((d) => d.meter > splitMeter),
      };

      const newLotDetails = [...lotDetails];
      newLotDetails[pieceIndex] = updatedPiece;
      newLotDetails.splice(pieceIndex + 1, 0, newPiece);
      return { lotDetails: newLotDetails };
    });
    setForm(pieceIndex, buildPerPieceForm());
  };
  const deletePiece = (pieceIndex) => {
    setData((prev) => {
      const lotDetails = [...prev.lotDetails];

      if (lotDetails.length === 1) {
        Swal.fire({
          icon: "warning",
          title: t.cannotDeleteOnlyPiece,
          timer: 2000,
        });
        return prev;
      }

      const pieceToDelete = lotDetails[pieceIndex];
      const filtered = [...lotDetails];

      // ── Restore the previous piece's endMeter to the deleted piece's endMeter ──
      // So if piece[0] was 1–40 and piece[1] (1A) was 41–140,
      // deleting piece[1] restores piece[0] endMeter back to 140
      filtered[pieceIndex - 1] = {
        ...filtered[pieceIndex - 1],
        endMeter: pieceToDelete.endMeter,
        actualMeters:
          pieceToDelete.endMeter - filtered[pieceIndex - 1].startMeter + 1, // ← restore
        // Also merge the deleted piece's defects back into the previous piece
        defects: [
          ...filtered[pieceIndex - 1].defects,
          ...pieceToDelete.defects,
        ],
      };

      // Now remove the deleted piece
      const afterRemoval = filtered.filter((_, i) => i !== pieceIndex);

      // Renumber — index 0 keeps original subPieceNo, rest get A, B, C...
      const renumbered = afterRemoval.map((p, i) => {
        const newSub =
          i === 0
            ? String(p.pieceNo)
            : `${p.pieceNo}${String.fromCharCode(64 + i)}`;
        return {
          ...p,
          subPieceNo: newSub,
          originalPieceNo: newSub,
        };
      });

      return { lotDetails: renumbered };
    });

    // Shift perPieceForm keys down
    setPerPieceForm((prev) => {
      const updated = {};
      Object.entries(prev).forEach(([key, value]) => {
        const k = Number(key);
        if (k < pieceIndex) updated[k] = value;
        else if (k > pieceIndex) updated[k - 1] = value;
      });
      return updated;
    });
  };
  const FillDefectArray = (e, pieceIndex) => {
    e.preventDefault();
    const form = getForm(pieceIndex);
    const { checkedMeter, defectId, defectName, defectPoints, defectTimes } =
      form;

    if (!checkedMeter) {
      Swal.fire({ icon: "warning", title: t.pleaseSelectMeter, timer: 2000 });
      return;
    }
    if (!defectId) {
      Swal.fire({
        icon: "warning",
        title: t.pleaseSelectDefect,
        timer: 2000,
      });
      return;
    }
    if (!defectTimes && defectName !== "NO DEFECT") {
      Swal.fire({
        icon: "warning",
        title: t.pleaseEnterTimes,
        timer: 2000,
      });
      return;
    }

    const meter = Number(checkedMeter);

    setData((prev) => {
      const lotDetails = [...prev.lotDetails];
      const piece = lotDetails[pieceIndex];

      const exists = piece.defects.some(
        (d) => d.meter === meter && Number(d.defectId) === Number(defectId),
      );
      if (exists) {
        Swal.fire({
          icon: "warning",
          title: t.sameDefectExists,
          timer: 2000,
        });
        return prev;
      }

      const times = defectName === "NO DEFECT" ? 0 : Number(defectTimes);
      const newDefect = {
        meter,
        defectId: Number(defectId),
        defectName,
        points: Number(defectPoints),
        times,
        totalPoints: Number(defectPoints) * times,
        pieceNo: piece.pieceNo, // ← add
        subPieceNo: piece.subPieceNo,
      };

      const newLotDetails = [...lotDetails];
      newLotDetails[pieceIndex] = {
        ...piece,
        defects: [...piece.defects, newDefect],
      };
      return { lotDetails: newLotDetails };
    });

    setForm(pieceIndex, (prev) => ({
      ...buildPerPieceForm(),
      checkedMeter: prev.checkedMeter,
    }));
  };

  const deleteRow = (pieceIndex, defectIndex) => {
    setData((prev) => {
      const lotDetails = [...prev.lotDetails];
      const piece = { ...lotDetails[pieceIndex] };
      piece.defects = piece.defects.filter((_, i) => i !== defectIndex);
      lotDetails[pieceIndex] = piece;
      return { lotDetails };
    });
  };

  const [updateData] = useUpdateDefectEntryMutation();

  const handleSubmitCustom = async (callback, data) => {
    try {
      await callback(data).unwrap();
      Swal.fire({
        title: t.addedSuccess,
        icon: "success",
        draggable: true,
        timer: 2000,
        showConfirmButton: false,
      });
      // ← refetch correct source after save
      if (canEditLot) {
        refetchSavedLots();
      } else {
        refetchLots();
      }
      // ── Reset all fields ──
      setLotId("");
      setPieceId("");
      setPieceNo("");
      setAllocationId("");
      setMeters("");
      setTableNo([]);
      settableId([]);
      setCheckerName("");
      setSectionName("");
      setCheckerId("");
      setCheckingSectionId("");
      setLoomNo("");
      setWeaverPieceNo("");
      setIsCompleted(false);
      setData({ lotDetails: [] });
      setPerPieceForm({});
      setExpandedIndex(null);

      // Refocus lot selector for next entry
      setTimeout(() => {
        if (lotIdRef.current && canEditLot) {
          lotIdRef.current.focus();
        }
      }, 2100);
    } catch (error) {
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

  const validateSaveData = () => {
    if (!lotId) {
      Swal.fire({ icon: "warning", title: t.pleaseSelectLot, timer: 2000 });
      return false;
    }
    if (!pieceId) {
      Swal.fire({
        icon: "warning",
        title: t.pleaseSelectPiece,
        timer: 2000,
      });
      return false;
    }
    if (data.lotDetails.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t.noPieceData,
        timer: 2000,
      });
      return false;
    }
    // ← add this block
    const emptyPiece = data.lotDetails.find(
      (piece) => piece.defects.length === 0,
    );
    if (emptyPiece) {
      Swal.fire({
        icon: "warning",
        title: `${t.piece} ${emptyPiece.subPieceNo} ${t.pieceHasNoDefects}`,
        text: t.addDefectForEveryPiece,
        timer: 2500,
        showConfirmButton: false,
      });
      return false;
    }
    return true;
  };

  const saveData = () => {
    if (!validateSaveData()) return;
    handleSubmitCustom(updateData, buildDataToSubmit());
  };

  const getMeterList = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => {
      const meter = start + i;
      return { value: meter, label: meter.toString() };
    });

  return (
    <>
      <div className="h-[75vh] pt-0">
        {/* ── Header ── */}
        <div className="flex bg-white justify-between items-center py-1 rounded-lg">
          <div className="flex items-center">
            <h1 className="text-xl ml-2 font-bold">{t.title}</h1>
            {isApproved && (
              <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-bold rounded-full border border-yellow-200 uppercase animate-pulse">
                piece approved for folding: {approvedSubPieceNames}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mr-2">
            <label className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isCompleted}
                disabled={isApproved}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className={`w-4 h-4 accent-green-600 ${
                  isApproved ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              />
              {t.completed}
            </label>
            <button
              type="button"
              onClick={saveData}
              disabled={isApproved}
              className={`py-1 rounded-lg transition px-2 ${
                isApproved
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {t.save}
            </button>
          </div>
        </div>

        <div className="h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl mt-2 p-2">
          {/* ══════════════════════════════════════════
              Lot Details — always visible for ALL roles
              Selects are editable only for admin/supervisor
              Checker sees auto-filled read-only values
          ══════════════════════════════════════════ */}
          <div className="border border-gray-300 rounded-lg p-3 mb-3">
            <p className="font-bold text-sm mb-2">{t.lotDetails}</p>
            <div className="grid grid-cols-12 gap-x-4 gap-y-4 text-sm">
              {/* Lot No */}
              <div className="col-span-6 sm:col-span-4 lg:col-span-3 z-[999]">
                <label className="block font-medium mb-1">{t.lotNo}</label>
                <Select
                  ref={lotIdRef}
                  options={lotOptions}
                  value={lotOptions?.find((o) => o.value === lotId) || null}
                  onChange={(sel) => setLotId(sel?.value || "")}
                  placeholder={t.selectLot}
                  isClearable={false}
                  styles={customSelectStyles}
                  isSearchable
                  isDisabled={!canEditLot}
                />
              </div>

              {/* Piece No */}
              <div className="col-span-3 sm:col-span-2 lg:col-span-1 z-[998]">
                <label className="block font-medium mb-1">{t.pieceNo}</label>
                <Select
                  options={pieceOptions}
                  value={pieceOptions?.find((o) => o.value === pieceId) || null}
                  // ── update piece onChange to auto-fill for admin ──
                  onChange={(sel) => {
                    setPieceId(sel?.value || "");
                    setPieceNo(sel?.label || "");
                    setAllocationId(sel?.allocationId || "");
                    // ← auto-fill extra fields for admin/supervisor from savedPieces
                    if (canEditLot) {
                      setMeters(sel?.meter || "");
                      setLoomNo(sel?.loomNo || "");
                      setWeaverPieceNo(sel?.weaverPieceNo || "");
                      setTableNo(
                        sel?.tableNo ? sel.tableNo.toString().split(",") : [],
                      );
                      setCheckerName(sel?.checkerName || "");
                      setSectionName(sel?.sectionName || "");
                      setCheckerId(sel?.checkerId || "");
                      setCheckingSectionId(sel?.checkingSectionId || ""); // ← now works, removed the empty call
                    }
                  }}
                  placeholder={t.selectPiece}
                  isClearable={false}
                  styles={customSelectStyles}
                  isSearchable
                  isDisabled={!canEditLot}
                />
              </div>

              {/* Meters */}
              <div className="col-span-3 sm:col-span-2 lg:col-span-1">
                <label className="block font-medium mb-1">{t.meters}</label>
                <input
                  type="number"
                  value={
                    meters !== "" && meters !== null
                      ? Number(meters).toFixed(2)
                      : ""
                  }
                  readOnly
                  className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-50"
                />
              </div>

              {/* Loom No */}
              <div className="col-span-3 sm:col-span-2 lg:col-span-1">
                <label className="block font-medium mb-1">{t.loomNo}</label>
                <input
                  type="text"
                  value={loomNo}
                  readOnly
                  className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-50"
                />
              </div>

              {/* Weaver Pc No */}
              <div className="col-span-3 sm:col-span-2 lg:col-span-1">
                <label className="block font-medium mb-1 whitespace-nowrap">
                  {t.weaverPieceNo}
                </label>
                <input
                  type="text"
                  value={weaverPieceNo}
                  readOnly
                  className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-50"
                />
              </div>

              {/* Table No */}
              <div className="col-span-3 sm:col-span-2 lg:col-span-1">
                <label className="block font-medium mb-1">{t.tableNo}</label>
                <input
                  type="text"
                  value={tableNo?.join(", ")}
                  readOnly
                  className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-50"
                />
              </div>

              {/* Checker Name */}
              <div className="col-span-6 sm:col-span-4 lg:col-span-2">
                <label className="block font-medium mb-1">
                  {t.checkerName}
                </label>
                <input
                  type="text"
                  value={checkerName}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1.5 uppercase bg-gray-50"
                />
              </div>

              {/* Checking Section Name */}
              <div className="col-span-6 sm:col-span-4 lg:col-span-2">
                <label className="block font-medium mb-1">
                  {t.checkingSectionName}
                </label>
                <input
                  type="text"
                  value={sectionName}
                  readOnly
                  className="w-full border rounded-lg px-2 py-1.5 bg-gray-50"
                />
              </div>

              {/* Completed */}
              {/* <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col items-center pb-1">
                <label className="block font-medium mb-1">{t.completed}</label>
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="w-4 h-4 accent-green-600 cursor-pointer mt-1"
                />
              </div> */}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              Piece Accordions — one per piece
              Appears once piece data is loaded
          ══════════════════════════════════════════ */}
          <form>
            {data.lotDetails.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-6">
                {canEditLot ? t.emptyAdmin : t.emptyChecker}
              </p>
            )}

            {data.lotDetails.map((piece, pieceIndex) => {
              const meterList = getMeterList(piece.startMeter, piece.endMeter);
              const form = getForm(pieceIndex);
              const isNoDefectSelected =
                defectOptions.find((d) => d.value === Number(form.defectId))
                  ?.englishName === "NO DEFECT";

              return (
                <div key={`${piece.pieceId}-${pieceIndex}`} className="mb-2">
                  <Accordion
                    expanded={expandedIndex === pieceIndex}
                    onChange={() =>
                      setExpandedIndex(
                        expandedIndex === pieceIndex ? null : pieceIndex,
                      )
                    }
                    disableGutters
                    elevation={0}
                    square
                    sx={{
                      "&:before": { display: "none" },
                      border: "1px solid #d1d5db",
                      borderRadius: "8px !important",
                      mb: 1,
                      overflow: "visible",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        minHeight: "40px",
                        "& .MuiAccordionSummary-content": { margin: "8px 0" },
                      }}
                    >
                      <div className="flex items-center justify-between w-full pr-2">
                        <Typography
                          component="span"
                          sx={{
                            color: "black",
                            fontWeight: 700,
                            marginLeft: "-9px",
                          }}
                        >
                          Piece {piece.subPieceNo} ({piece.startMeter} –{" "}
                          {piece.endMeter})
                          <span className="ml-2 text-xs font-normal text-blue-500">
                            [{piece.actualMeters}m]
                          </span>
                          {piece.defects?.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              ({piece.defects.length} defect
                              {piece.defects.length > 1 ? "s" : ""})
                            </span>
                          )}
                        </Typography>

                        {/* Only show delete for split pieces */}
                        {pieceIndex > 0 && (
                          <button
                            type="button"
                            disabled={isApproved}
                            onClick={(e) => {
                              e.stopPropagation(); // prevent accordion toggle
                              Swal.fire({
                                icon: "warning",
                                title: `${t.deletePieceConfirmTitle} ${piece.subPieceNo}?`,
                                text: t.deletePieceConfirmText,
                                showCancelButton: true,
                                confirmButtonColor: "#d33",
                                confirmButtonText: "Yes, delete",
                              }).then((result) => {
                                if (result.isConfirmed) deletePiece(pieceIndex);
                              });
                            }}
                            className={`${
                              isApproved
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            } text-white text-xs px-2 py-1 rounded-lg ml-2 flex items-center gap-1`}
                          >
                            <MdDelete size={14} />
                            {t.deletePiece}
                          </button>
                        )}
                      </div>
                    </AccordionSummary>

                    <AccordionDetails sx={{ paddingTop: 0, paddingX: 1 }}>
                      {/* ── Defect Input Row ── */}
                      <p className="font-bold text-sm mb-2">
                        {t.defectDetails}
                      </p>
                      <div className="grid grid-cols-6 lg:grid-cols-9 gap-4 text-sm">
                        {/* Meter At + Split button */}
                        <div className="col-span-1 lg:col-span-1 z-[999]">
                          <div className="flex justify-between items-center mb-1">
                            <label className="font-medium">{t.meterAt}</label>
                          </div>
                          <Select
                            options={meterList}
                            value={
                              meterList.find(
                                (o) => o.value === Number(form.checkedMeter),
                              ) || null
                            }
                            isDisabled={isApproved}
                            onChange={(sel) =>
                              setForm(pieceIndex, {
                                checkedMeter: sel ? Number(sel.value) : "",
                                defectId: "",
                                defectPoints: "",
                                defectTimes: "",
                                totalDefectPoints: "",
                              })
                            }
                            placeholder={t.selectPiece}
                            isClearable={false}
                            styles={customSelectStyles}
                            isSearchable
                            menuPortalTarget={document.body} // ← add this
                            menuPosition="fixed"
                            className="text-right"
                          />
                        </div>

                        {/* Defect Name */}
                        <div className="col-span-5 lg:col-span-4">
                          <label className="block font-medium mb-1">
                            {t.defectName}
                          </label>
                          <Select
                            options={defectOptions}
                            value={
                              defectOptions.find(
                                (o) => o.value === Number(form.defectId),
                              ) || null
                            }
                            isDisabled={isApproved}
                            onChange={(sel) =>
                              setForm(pieceIndex, {
                                defectId: sel?.value ?? "",
                                defectPoints: sel?.points ?? "",
                                defectName: sel?.englishName ?? "",
                                defectTimes:
                                  sel?.englishName === "NO DEFECT" ? 0 : "",
                                totalDefectPoints:
                                  sel?.englishName === "NO DEFECT" ? 0 : "",
                              })
                            }
                            placeholder={t.selectPiece}
                            isClearable={false}
                            styles={customSelectStyles}
                            isSearchable
                          />
                        </div>

                        {/* Points */}
                        <div className="col-span-1 lg:col-span-1">
                          <label className="block font-medium mb-1">
                            {t.points}
                          </label>
                          <input
                            type="number"
                            value={form.defectPoints}
                            readOnly
                            className={`w-full border rounded-lg px-1 py-1.5 text-right bg-gray-50 
    ${Number(form.defectPoints) > 2 ? "text-red-600 font-bold" : "text-black"}`}
                          />
                        </div>

                        {/* No of times */}
                        <div className="col-span-2 lg:col-span-1">
                          <label className="block font-medium mb-1">
                            {t.noOfTimes}
                          </label>
                          <input
                            type="number"
                            value={form.defectTimes}
                            disabled={isNoDefectSelected || isApproved}
                            min={0}
                            onChange={(e) => {
                              const times = e.target.value;
                              setForm(pieceIndex, (prev) => ({
                                ...prev,
                                defectTimes: times,
                                totalDefectPoints:
                                  Number(prev.defectPoints) * Number(times),
                              }));
                            }}
                            className={`w-full border rounded-lg px-1 py-1.5 text-right ${
                              isNoDefectSelected
                                ? "bg-gray-200 cursor-not-allowed"
                                : ""
                            }`}
                          />
                        </div>

                        {/* Total Points */}
                        <div className="col-span-1 lg:col-span-1">
                          <label className="block text-sm font-medium mb-1">
                            {t.totalPoints}
                          </label>
                          <input
                            type="number"
                            value={form.totalDefectPoints}
                            readOnly
                            className="border rounded-lg text-right px-2 py-1.5 w-full bg-gray-50"
                          />
                        </div>

                        {/* Add button */}
                        <div className="col-span-2 lg:col-span-1 flex items-end">
                          <div>
                            <button
                              type="button"
                              disabled={isApproved}
                              onClick={(e) => FillDefectArray(e, pieceIndex)}
                              className={`${
                                isApproved
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white py-1.5 rounded-lg transition px-2`}
                            >
                              {t.add}
                            </button>
                          </div>
                          <div className="ml-1">
                            <button
                              type="button"
                              disabled={isApproved}
                              onClick={() =>
                                handleSplit(
                                  pieceIndex,
                                  Number(form.checkedMeter),
                                )
                              }
                              className={`${
                                isApproved
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-purple-600 hover:bg-purple-700"
                              } text-white py-1.5 rounded-lg transition px-2`}
                            >
                              {t.split}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── Defect Table ── */}
                      {piece.defects?.length > 0 && (
                        <div className="mt-3">
                          <table className="w-full lg:w-[55vw] border border-gray-200 table-fixed border-collapse">
                            <thead className="bg-gray-100 text-gray-700 text-sm">
                              <tr>
                                <th className="w-8 px-1 py-1 border">
                                  {t.meter}
                                </th>
                                <th className="w-44 border">{t.defectName}</th>
                                <th className="w-12 border">{t.tablePoints}</th>
                                <th className="w-12 px-1 border">{t.times}</th>
                                <th className="w-20 border">{t.totalPoints}</th>
                                <th className="w-8 border">{t.action}</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs text-center">
                              {piece.defects.map((defect, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }
                                >
                                  <td className="py-1.5 border text-right pr-1">
                                    {defect?.meter}
                                  </td>
                                  <td className="border text-left pl-1">
                                    {defect?.defectName}
                                  </td>
                                  <td className="border text-right pr-1">
                                    {defect?.points}
                                  </td>
                                  <td className="border text-right pr-1">
                                    {defect?.times}
                                  </td>
                                  <td className="border text-right pr-1">
                                    {defect?.totalPoints}
                                  </td>
                                  <td className="px-2 border text-center">
                                    <button
                                      type="button"
                                      disabled={isApproved}
                                      onClick={() =>
                                        deleteRow(pieceIndex, index)
                                      }
                                      className={`${
                                        isApproved
                                          ? "bg-gray-300 cursor-not-allowed"
                                          : "bg-red-500"
                                      } text-white px-1 py-1 rounded text-sm`}
                                    >
                                      <MdDelete />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="font-semibold text-sm">
                                <td
                                  className="border py-1 font-extrabold text-right pr-1"
                                  colSpan={4}
                                >
                                  {t.totalPoints}
                                </td>
                                <td className="border text-right pr-1">
                                  {piece.defects.reduce(
                                    (sum, d) =>
                                      sum + Number(d.totalPoints || 0),
                                    0,
                                  )}
                                </td>
                                <td className="border"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </div>
              );
            })}
          </form>
        </div>
      </div>
    </>
  );
};

export default DefectEntry;
