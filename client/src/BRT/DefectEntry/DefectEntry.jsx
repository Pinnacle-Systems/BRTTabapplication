/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import Select from "react-select";
import { customSelectStyles } from "../../Utils/helper.js";
import { useGetWorkStatusQuery } from "../../redux/services/TableandLot";
import {
  useGetLotsQuery,
  useGetPiecesQuery,
  useGetlotDetailsQuery,
  useGetDefectsQuery,
  useUpdateDefectEntryMutation,
} from "../../redux/services/defectEntry.js";
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

const DefectEntry = () => {
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

  const [perPieceForm, setPerPieceForm] = useState({});
  const [translatedDefects, setTranslatedDefects] = useState([]);
  const translationCacheRef = useRef({});
  const [data, setData] = useState({ lotDetails: [] });
  const lotIdRef = useRef(null);
  const isInitialLotMount = useRef(true);

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

  const { data: lots } = useGetLotsQuery();
  const { data: pieces } = useGetPiecesQuery({ lotId }, { skip: !lotId });
  const { data: lotDetails } = useGetlotDetailsQuery(
    { pieceId },
    { skip: !pieceId },
  );
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
            meters: Number(meters),
            tableNo,
            checkerName,
            checkerId,
            checkingSectionId,
            sectionName,
            defects: existingDefects,
          },
        ],
      };
    });

    setPerPieceForm({});
  }, [pieceId, pieceNo, meters]);

  const lotOptions = useMemo(
    () =>
      lots?.data?.map((lot) => ({
        value: lot?.LOTID,
        label: lot?.DOCID,
        allocationId: lot?.ALLOCATIONID,
      })),
    [lots?.data],
  );

  const pieceOptions = useMemo(() => {
    if (!lotId) return [];
    return [...(pieces?.data || [])]
      .sort((a, b) => a.PCSNO - b.PCSNO)
      .map((piece) => ({
        label: piece?.PIECENO,
        value: piece?.PIECEID,
      }));
  }, [pieces?.data, lotId]);

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
    const Lot = data.lotDetails.map((piece, index) => {
      const pieceTotalPoints = piece.defects.reduce(
        (sum, d) => sum + Number(d.totalPoints || 0),
        0,
      );
      const entry = {
        lotId: parseInt(lotId),
        allocationId: parseInt(allocationId),
        pieceId: parseInt(pieceId),
        pieceNo: parseInt(pieceNo),
        subPieceNo: piece.subPieceNo, // ← add (for all pieces including index 0)

        startMeter: piece.startMeter,
        endMeter: piece.endMeter,
        meters: Number(meters),
        tableId,
        tableNo,
        checkerId: parseInt(checkerId),
        checkerName,
        checkingSectionId: parseInt(checkingSectionId),
        sectionName,
        totalPointsSum: pieceTotalPoints,
        defects: piece.defects,
      };
      return entry;
    });
    return { lotId: parseInt(lotId), Lot };
  };

  const handleSplit = (pieceIndex, splitMeter) => {
    if (!splitMeter) return;
    setData((prev) => {
      const lotDetails = [...prev.lotDetails];
      const piece = { ...lotDetails[pieceIndex] };

      if (splitMeter <= piece.startMeter || splitMeter >= piece.endMeter) {
        Swal.fire({ icon: "warning", title: "Invalid Split Meter" });
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
        endMeter: splitMeter,
        defects: piece.defects.filter((d) => d.meter <= splitMeter),
      };

      const newPiece = {
        ...piece,
        subPieceNo: `${piece.pieceNo}${nextLetter}`,
        startMeter: splitMeter + 1,
        endMeter: piece.endMeter,
        defects: piece.defects.filter((d) => d.meter > splitMeter),
      };

      const newLotDetails = [...lotDetails];
      newLotDetails[pieceIndex] = updatedPiece;
      newLotDetails.splice(pieceIndex + 1, 0, newPiece);
      return { lotDetails: newLotDetails };
    });
    setForm(pieceIndex, buildPerPieceForm());
  };

  const FillDefectArray = (e, pieceIndex) => {
    e.preventDefault();
    const form = getForm(pieceIndex);
    const { checkedMeter, defectId, defectName, defectPoints, defectTimes } =
      form;

    if (!checkedMeter) {
      Swal.fire({ icon: "warning", title: "Please select Meter", timer: 2000 });
      return;
    }
    if (!defectId) {
      Swal.fire({
        icon: "warning",
        title: "Please select a Defect",
        timer: 2000,
      });
      return;
    }
    if (!defectTimes && defectName !== "NO DEFECT") {
      Swal.fire({
        icon: "warning",
        title: "Please enter No of Times",
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
          title: "Same Defect Already Exists",
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
        title: "Added Successfully",
        icon: "success",
        draggable: true,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      const backendMessage =
        error?.data?.message || error?.data?.error || "Something went wrong!";
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: backendMessage,
        timer: 2500,
      });
    }
  };

  const validateSaveData = () => {
    if (!lotId) {
      Swal.fire({ icon: "warning", title: "Please select a Lot", timer: 2000 });
      return false;
    }
    if (!pieceId) {
      Swal.fire({
        icon: "warning",
        title: "Please select a Piece",
        timer: 2000,
      });
      return false;
    }
    if (data.lotDetails.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No piece data to save",
        timer: 2000,
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
        <div className="flex bg-white justify-between py-1 rounded-lg">
          <h1 className="text-xl ml-2 font-bold">Defect Entry</h1>
          <button
            type="button"
            onClick={saveData}
            className="bg-blue-600 mr-2 text-white py-1 rounded-lg hover:bg-blue-700 transition px-2"
          >
            Save
          </button>
        </div>

        <div className="h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl mt-2 p-2">
          {/* ══════════════════════════════════════════
              Lot Details — always visible for ALL roles
              Selects are editable only for admin/supervisor
              Checker sees auto-filled read-only values
          ══════════════════════════════════════════ */}
          <div className="border border-gray-300 rounded-lg p-3 mb-3">
            <p className="font-bold text-sm mb-2">Lot Details</p>
            <div className="grid grid-cols-5 lg:grid-cols-11 gap-4 text-sm">
              <div className="col-span-2 lg:col-span-2 z-[999]">
                <label className="block font-medium mb-1">Lot No</label>
                <Select
                  ref={lotIdRef}
                  options={lotOptions}
                  value={lotOptions?.find((o) => o.value === lotId) || null}
                  onChange={(sel) => {
                    setLotId(sel?.value || "");
                    setAllocationId(sel?.allocationId || "");
                  }}
                  placeholder="Select Lot"
                  isClearable={false}
                  styles={customSelectStyles}
                  isSearchable
                  isDisabled={!canEditLot}
                />
              </div>

              <div className="col-span-1 lg:col-span-1 z-[998]">
                <label className="block font-medium mb-1">Piece No</label>
                <Select
                  options={pieceOptions}
                  value={pieceOptions?.find((o) => o.value === pieceId) || null}
                  onChange={(sel) => {
                    setPieceId(sel?.value || "");
                    setPieceNo(sel?.label || "");
                  }}
                  placeholder="Select"
                  isClearable={false}
                  styles={customSelectStyles}
                  isSearchable
                  isDisabled={!canEditLot}
                  className="text-right"
                />
              </div>

              <div className="col-span-1 lg:col-span-1">
                <label className="block font-medium mb-1">Meters</label>
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

              <div className="col-span-1 lg:col-span-1">
                <label className="block font-medium mb-1">Table No</label>
                <input
                  type="text"
                  value={tableNo?.join(", ")}
                  readOnly
                  className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-50"
                />
              </div>

              <div className="col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-1">
                  Checker Name
                </label>
                <input
                  type="text"
                  value={checkerName}
                  readOnly
                  className="border rounded-lg text-left px-2 py-1.5 w-full uppercase bg-gray-50"
                />
              </div>

              <div className="col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-1">
                  Checking Section Name
                </label>
                <input
                  type="text"
                  value={sectionName}
                  readOnly
                  className="border rounded-lg text-left px-2 py-1.5 w-full bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              Piece Accordions — one per piece
              Appears once piece data is loaded
          ══════════════════════════════════════════ */}
          <form>
            {data.lotDetails.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-6">
                {canEditLot
                  ? "Select a Lot and Piece above to begin defect entry."
                  : "Loading piece details..."}
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
                        {piece.defects?.length > 0 && (
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            ({piece.defects.length} defect
                            {piece.defects.length > 1 ? "s" : ""})
                          </span>
                        )}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails sx={{ paddingTop: 0, paddingX: 1 }}>
                      {/* ── Defect Input Row ── */}
                      <p className="font-bold text-sm mb-2">Defect Details</p>
                      <div className="grid grid-cols-6 lg:grid-cols-9 gap-4 text-sm">
                        {/* Meter At + Split button */}
                        <div className="col-span-1 lg:col-span-1 z-[999]">
                          <div className="flex justify-between items-center mb-1">
                            <label className="font-medium">Meter At</label>
                          </div>
                          <Select
                            options={meterList}
                            value={
                              meterList.find(
                                (o) => o.value === Number(form.checkedMeter),
                              ) || null
                            }
                            onChange={(sel) =>
                              setForm(pieceIndex, {
                                checkedMeter: sel ? Number(sel.value) : "",
                                defectId: "",
                                defectPoints: "",
                                defectTimes: "",
                                totalDefectPoints: "",
                              })
                            }
                            placeholder="Select"
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
                            Defect Name
                          </label>
                          <Select
                            options={defectOptions}
                            value={
                              defectOptions.find(
                                (o) => o.value === Number(form.defectId),
                              ) || null
                            }
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
                            placeholder="Select"
                            isClearable={false}
                            styles={customSelectStyles}
                            isSearchable
                          />
                        </div>

                        {/* Points */}
                        <div className="col-span-1 lg:col-span-1">
                          <label className="block font-medium mb-1">
                            Points
                          </label>
                          <input
                            type="number"
                            value={form.defectPoints}
                            readOnly
                            className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-50"
                          />
                        </div>

                        {/* No of times */}
                        <div className="col-span-1 lg:col-span-1">
                          <label className="block font-medium mb-1">
                            No of times
                          </label>
                          <input
                            type="number"
                            value={form.defectTimes}
                            disabled={isNoDefectSelected}
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
                            Total Points
                          </label>
                          <input
                            type="number"
                            value={form.totalDefectPoints}
                            readOnly
                            className="border rounded-lg text-right px-2 py-1.5 w-full bg-gray-50"
                          />
                        </div>

                        {/* Add button */}
                        <div className="col-span-3 lg:col-span-1 flex items-end">
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                handleSplit(
                                  pieceIndex,
                                  Number(form.checkedMeter),
                                )
                              }
                              className="bg-purple-600 text-white py-1.5 rounded-lg hover:bg-purple-700 transition px-2"
                            >
                              Split
                            </button>
                          </div>
                          <div className="ml-1">
                            <button
                              type="button"
                              onClick={(e) => FillDefectArray(e, pieceIndex)}
                              className="bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 transition px-2"
                            >
                              Add
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
                                <th className="w-8 px-1 py-1 border">Meter</th>
                                <th className="w-44 border">Defect Name</th>
                                <th className="w-12 border">Points</th>
                                <th className="w-12 px-1 border">Times</th>
                                <th className="w-20 border">Total Points</th>
                                <th className="w-8 border">Action</th>
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
                                      onClick={() =>
                                        deleteRow(pieceIndex, index)
                                      }
                                      className="bg-red-500 text-white px-1 py-1 rounded text-sm"
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
                                  Total Points
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
