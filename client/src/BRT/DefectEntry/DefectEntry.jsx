// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// import Select from "react-select";
// import { customSelectStyles } from "../../Utils/helper.js";
// import { useGetWorkStatusQuery } from "../../redux/services/TableandLot";
// import {
//   useGetLotsQuery,
//   useGetPiecesQuery,
//   useGetlotDetailsQuery,
//   useGetDefectsQuery,
//   useUpdateDefectEntryMutation,
// } from "../../redux/services/defectEntry.js";
// import { useGetRolesQuery } from "../../redux/userservice";
// import { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Typography,
// } from "@mui/material";
// import { MdDelete } from "react-icons/md";
// import Swal from "sweetalert2";

// import { ExpandMore } from "@mui/icons-material";
// const DefectEntry = () => {
//   const [allocationId, setAllocationId] = useState("");
//   const [checkerId, setCheckerId] = useState("");
//   const [checkingSectionId, setCheckingSectionId] = useState("");
//   const [lotId, setLotId] = useState("");
//   const [pieceId, setPieceId] = useState("");
//   const [tableId, settableId] = useState([]);
//   const [sectionName, setSectionName] = useState("");
//   const [checkerName, setCheckerName] = useState("");
//   const [pieceNo, setPieceNo] = useState("");
//   const [meters, setMeters] = useState("");
//   const [tableNo, setTableNo] = useState([]);
//   const [expandedIndex, setExpandedIndex] = useState(null);
//   const [defectExpandedIndex, setDefectExpandedIndex] = useState(null);
//   const [checkedMeter, setCheckedMeter] = useState("");
//   const [defectId, setDefectId] = useState("");
//   const [defectName, setDefectName] = useState("");
//   const [defectTimes, setDefectTimes] = useState("");
//   const [defectPoints, setDefectPoints] = useState("");
//   const [totalDefectPoints, setTotalDefectPoints] = useState("");
//   const [splitPieces, setSplitPieces] = useState([]);
//   const [translatedDefects, setTranslatedDefects] = useState([]);

//   const [startMeter, setStartMeter] = useState(1);
//   const [endMeter, setEndMeter] = useState(meters);
//   const [subPieceNo, setSubPieceNo] = useState("");
//   const [subPieceId, setSubPieceId] = useState("");
//   const [data, setData] = useState({
//     lotDetails: [],
//   });

//   const lotIdRef = useRef(null);
//   const storedUserId = Number(localStorage.getItem("userId"));
//   const storedRoleId = Number(localStorage.getItem("roleId"));
//   const { data: roles } = useGetRolesQuery();

//   const adminRole = roles?.data?.find(
//     (val) => val?.ROLENAME?.toLowerCase() === "admin",
//   );

//   const supervisorRole = roles?.data?.find(
//     (val) => val?.ROLENAME?.toLowerCase() === "supervisor",
//   );

//   let adminId = adminRole?.ROLEID;

//   let supervisorId = supervisorRole?.ROLEID;
//   const isAdmin = Number(storedRoleId) === adminId;
//   const isSuppervisor = Number(storedRoleId) === supervisorId;
//   const rolesLoaded = !!roles?.data?.length;

//   const shouldSkipWorkStatus =
//     !storedUserId || !rolesLoaded || isAdmin || isSuppervisor;

//   const { data: workStatus } = useGetWorkStatusQuery(storedUserId, {
//     skip: shouldSkipWorkStatus,
//   });

//   console.log(data.lotDetails, "workStatus");

//   const { data: lots } = useGetLotsQuery();
//   console.log(tableNo, "tableNo");

//   const { data: pieces } = useGetPiecesQuery({ lotId }, { skip: !lotId });
//   const { data: lotDetails } = useGetlotDetailsQuery(
//     { pieceId },
//     { skip: !pieceId },
//   );
//   console.log(lotDetails, "lotDetails");
//   const { data: defectEntry } = useGetDefectsQuery();
//   console.log(defectEntry, "defectEntry");
//   useEffect(() => {
//     if (!pieceNo || !meters) return;

//     setData({
//       lotDetails: [
//         {
//           lotId,
//           pieceNo,
//           pieceId,
//           subPieceNo: pieceNo.toString(),
//           startMeter: 1,
//           endMeter: meters,
//           meters,
//           tableNo,
//           checkerName,
//           checkerId,
//           checkingSectionId,
//           sectionName,
//           defects: [],
//         },
//       ],
//     });
//   }, [pieceNo]);
//   const lotOptions = useMemo(
//     () =>
//       lots?.data?.map((lot) => ({
//         value: lot?.LOTID,
//         label: lot?.DOCID,
//         allocationId: lot?.ALLOCATIONID,
//       })),
//     [lots?.data],
//   );

//   const pieceOptions = useMemo(() => {
//     if (!lotId) return [];

//     return [...(pieces?.data || [])]
//       ?.sort((a, b) => a.PCSNO - b.PCSNO)
//       ?.map((piece) => ({
//         label: piece?.PIECENO,
//         value: piece?.PIECEID,
//       }));
//   }, [pieces?.data, lotId]);
//   useEffect(() => {
//     if (workStatus?.hasActiveWork && !isAdmin && !isSuppervisor) {
//       const work = workStatus?.data;
//       setAllocationId(work?.allocationId);
//       setCheckerId(work?.checkerId);
//       setCheckingSectionId(work?.checkingSectionId);
//       setLotId(work?.lotId);
//       setPieceId(work?.pieceId);
//       // safer table mapping
//       const tableIds = work?.tables?.map((t) => t.tableId) || [];
//       const tableNumbers = work?.tables?.map((t) => t.checkingNo) || [];
//       settableId(tableIds);
//       setSectionName(work?.sectionName);
//       setCheckerName(work?.checkerName);
//       setPieceNo(work?.pieceNo);
//       setMeters(work?.meters);
//       setTableNo(tableNumbers);
//     }
//   }, [workStatus, isAdmin, isSuppervisor]);
//   useEffect(() => {
//     const work = lotDetails?.data; // 👈 safest way
//     if (!work) return;

//     setMeters(work?.meters || "");

//     const tableIds = work?.tables?.map((t) => t.tableId) || [];
//     const tableNumbers = work?.tables?.map((t) => t.checkingNo) || [];

//     settableId(tableIds);
//     setTableNo(tableNumbers);

//     setCheckerId(work?.checkerId || "");
//     setCheckerName(work?.checkerName || "");
//     setCheckingSectionId(work?.checkingSectionId || "");
//     setSectionName(work?.sectionName || "");
//   }, [lotDetails]);
//   console.log(checkerName, "checkerName");
//   const totalPointsSum = data.lotDetails.reduce(
//     (sum, piece) =>
//       sum +
//       piece.defects.reduce((pSum, d) => pSum + Number(d.totalPoints || 0), 0),
//     0,
//   );
//   const datato = {
//     lotId: parseInt(lotId), // 👈 ADD THIS
//     allocationId: parseInt(allocationId),
//     pieceId: parseInt(pieceId),
//     pieceNo: parseInt(pieceNo),
//     startMeter,
//     endMeter,
//     meters,
//     tableId,
//     tableNo,
//     checkerId: parseInt(checkerId),
//     checkerName,
//     checkingSectionId: parseInt(checkingSectionId),
//     sectionName,
//     splitPieces,
//     totalPointsSum: parseInt(totalPointsSum),
//   };
//   const handleSplit = (pieceIndex, splitMeter) => {
//     if (!splitMeter) return;

//     setData((prev) => {
//       const lotDetails = [...prev.lotDetails];
//       const piece = lotDetails[pieceIndex];

//       if (splitMeter <= piece.startMeter || splitMeter >= piece.endMeter) {
//         Swal.fire({
//           icon: "warning",
//           title: "Invalid Split Meter",
//         });
//         return prev;
//       }

//       const letter = String.fromCharCode(97 + pieceIndex); // a,b,c

//       const newPiece = {
//         ...piece,
//         subPieceNo: `${piece.pieceNo}${letter}`,
//         startMeter: splitMeter + 1,
//         endMeter: piece.endMeter,
//         defects: piece.defects.filter((d) => d.meter > splitMeter),
//       };

//       const updatedPiece = {
//         ...piece,
//         endMeter: splitMeter,
//         defects: piece.defects.filter((d) => d.meter <= splitMeter),
//       };

//       lotDetails[pieceIndex] = updatedPiece;

//       lotDetails.splice(pieceIndex + 1, 0, newPiece);

//       return { lotDetails };
//     });
//   };
//   const addDefect = (pieceIndex, defectData) => {
//     setData((prev) => {
//       const lotDetails = [...prev.lotDetails];

//       lotDetails[pieceIndex].defects.push({
//         checkedMeter: defectData.checkedMeter,
//         defectId: defectData.defectId,
//         defectName: defectData.defectName,
//         defectPoints: defectData.defectPoints,
//         defectTimes: defectData.defectTimes,
//         totalPoints: defectData.defectPoints * defectData.defectTimes,
//       });

//       return { lotDetails };
//     });
//   };
//   const [updateData] = useUpdateDefectEntryMutation();
//   const handleSubmitCustom = async (callback, data) => {
//     try {
//       let returnData = await callback(data).unwrap();
//       Swal.fire({
//         title: "Added Successfully",
//         icon: "success",
//         draggable: true,
//         timer: 2000,
//         showConfirmButton: false,
//       });
//     } catch (error) {
//       console.log("Full Error:", error);
//       const backendMessage =
//         error?.data?.message || error?.data?.error || "Something went wrong!";

//       Swal.fire({
//         icon: "error",
//         title: "Submission Failed",
//         text: backendMessage,
//         timer: 2500,
//       });
//     }
//   };
//   const saveData = () => {
//     // if (!validateSaveData()) return;

//     handleSubmitCustom(updateData, datato);
//   };

//   const canEditLot = isAdmin || isSuppervisor;

//   useEffect(() => {
//     if (!canEditLot) return;
//     if (lotId) {
//       setPieceId("");
//       setPieceNo("");
//       setTableNo([]);
//       settableId([]);
//       setMeters("");
//       setCheckerName("");
//       setSectionName("");
//       setCheckerId("");
//       setCheckingSectionId("");
//     }
//   }, [lotId, canEditLot]);
//   useEffect(() => {
//     if (checkedMeter) {
//       setDefectId("");
//       setDefectPoints("");
//       setDefectTimes("");
//       setTotalDefectPoints("");
//     }
//   }, [checkedMeter]);
//   useEffect(() => {
//     if (lotIdRef.current && canEditLot) {
//       lotIdRef.current.focus();
//       lotIdRef.current?.openMenu("first");
//     }
//   }, []);
//   const generateNumbers = (n) => {
//     if (!Number.isInteger(n) || n <= 0) return [];
//     return Array.from({ length: n }, (_, i) => i + 1);
//   };
//   // const meterList = generateNumbers(meters)?.map((num) => ({
//   //   value: num,
//   //   label: num.toString(),
//   // }));
//   // const meterList = generateNumbers(Number(meters))?.map((num) => ({
//   //   value: num,
//   //   label: num.toString(),
//   // }));
//   const getMeterList = (start, end) => {
//     return Array.from({ length: end - start + 1 }, (_, i) => {
//       const meter = start + i;
//       return {
//         value: meter,
//         label: meter.toString(),
//       };
//     });
//   };
//   // const defectOptions = defectEntry?.data?.map((def) => ({
//   //   label: def?.DEFECTNAME,
//   //   value: def?.GTPIECEDEFMASTID,
//   //   points: def?.POINTS,
//   // }));
//   const translateText = async (text, targetLang) => {
//     try {
//       const res = await fetch(
//         `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
//           text,
//         )}`,
//       );

//       const data = await res.json();
//       return data[0][0][0]; // translated text
//     } catch (error) {
//       console.error("Translation error:", error);
//       return text; // fallback to original
//     }
//   };
//   useEffect(() => {
//     const translateAll = async () => {
//       if (!defectEntry?.data) return;

//       const results = await Promise.all(
//         defectEntry.data.map(async (def) => {
//           const [hindi, tamil] = await Promise.all([
//             translateText(def.DEFECTNAME, "hi"),
//             translateText(def.DEFECTNAME, "ta"),
//           ]);

//           return {
//             ...def,
//             translatedLabel: `${def.DEFECTNAME} / ${hindi} / ${tamil}`,
//           };
//         }),
//       );

//       setTranslatedDefects(results);
//     };

//     translateAll();
//   }, [defectEntry]);
//   const defectOptions = translatedDefects.map((def) => ({
//     label: def.translatedLabel,
//     value: def.GTPIECEDEFMASTID,
//     points: def.POINTS,
//     englishName: def.DEFECTNAME,
//   }));
//   useEffect(() => {
//     const total = defectPoints * defectTimes;
//     setTotalDefectPoints(total);
//   }, [defectPoints, defectTimes]);

//   const FillDefectArray = (e) => {
//     e.preventDefault();

//     if (!checkedMeter) {
//       Swal.fire({
//         icon: "warning",
//         title: "Please select Meter",
//         timer: 2000,
//       });
//       return;
//     }

//     const meter = Number(checkedMeter);

//     setData((prev) => {
//       const lotDetails = [...prev.lotDetails];

//       const pieceIndex = lotDetails.findIndex(
//         (p) => meter >= p.startMeter && meter <= p.endMeter,
//       );

//       if (pieceIndex === -1) return prev;

//       const piece = lotDetails[pieceIndex];

//       const exists = piece.defects.some(
//         (d) => d.meter === meter && d.defectId === Number(defectId),
//       );

//       if (exists) {
//         Swal.fire({
//           icon: "warning",
//           title: "Same Defect Already Exists",
//           timer: 2000,
//         });
//         return prev;
//       }

//       const newDefect = {
//         meter,
//         defectId: Number(defectId),
//         defectName,
//         points: Number(defectPoints),
//         times: Number(defectTimes),
//         totalPoints: Number(defectPoints) * Number(defectTimes),
//       };

//       lotDetails[pieceIndex].defects.push(newDefect);

//       return { lotDetails };
//     });

//     setCheckedMeter("");
//     setDefectId("");
//     setDefectTimes("");
//   };
//   const deleteRow = (pieceIndex, defectIndex) => {
//     setData((prev) => {
//       const lotDetails = [...prev.lotDetails];

//       lotDetails[pieceIndex].defects.splice(defectIndex, 1);

//       return { lotDetails };
//     });
//   };
//   const isNoDefectSelected =
//     defectOptions?.find((d) => d.value === defectId)?.englishName ===
//     "NO DEFECT";

//   return (
//     <>
//       <div className="h-[75vh] pt-0">
//         <div className="flex bg-white justify-between py-1 rounded-lg">
//           <h1 className="text-xl ml-2 font-bold text-center">Defect Entry</h1>
//           <div>
//             <button
//               type="button"
//               onClick={saveData}
//               className="bg-blue-600 mr-2 text-white  py-1 rounded-lg hover:bg-blue-700 transition px-2"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//         <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
//           <form className=" p-2">
//             {/* Lot Details */}
//             {data.lotDetails.map((piece, pieceIndex) => {
//               const meterList = getMeterList(piece.startMeter, piece.endMeter);
//               return (
//                 <div key={pieceIndex} className="mb-6">
//                   <h3 className="font-bold text-sm mb-2">
//                     Piece {piece.subPieceNo} ({piece.startMeter} -{" "}
//                     {piece.endMeter})
//                   </h3>
//                   {/* Lot Details */}

//                   <div>
//                     <Accordion
//                       expanded={expandedIndex === pieceIndex}
//                       onChange={() =>
//                         setExpandedIndex(
//                           expandedIndex === pieceIndex ? null : pieceIndex,
//                         )
//                       }
//                       disableGutters
//                       elevation={0}
//                       square
//                       sx={{
//                         "&:before": { display: "none" }, // remove top divider line
//                         borderBottom:
//                           expandedIndex === pieceIndex
//                             ? "none"
//                             : "1px solid #d1d5db",
//                       }}
//                     >
//                       <AccordionSummary
//                         expandIcon={<ExpandMore />}
//                         sx={{
//                           minHeight: "40px",
//                           "& .MuiAccordionSummary-content": {
//                             margin: "8px 0",
//                           },
//                         }}
//                       >
//                         <Typography
//                           component="span"
//                           sx={{
//                             color: "black",
//                             fontWeight: 700,
//                             marginLeft: "-9px",
//                           }} // slate-700 color
//                         >
//                           Lot Details
//                         </Typography>{" "}
//                       </AccordionSummary>
//                       <AccordionDetails
//                         sx={{
//                           paddingTop: 0,
//                           // backgroundColor: "#f1f1f0", // ✅ correct
//                           paddingX: 1,
//                         }}
//                       >
//                         <div>
//                           <div className="grid grid-cols-5 lg:grid-cols-11 gap-4 text-sm">
//                             {/* Lot No */}
//                             <div className="col-span-2 lg:col-span-2 z-999">
//                               <label className="block font-medium mb-1">
//                                 Lot No
//                               </label>
//                               <Select
//                                 ref={lotIdRef}
//                                 options={lotOptions}
//                                 value={
//                                   lotOptions?.find(
//                                     (option) => option.value === lotId,
//                                   ) || null
//                                 }
//                                 onChange={(selectedOption) =>
//                                   setLotId(selectedOption?.value || "")
//                                 }
//                                 placeholder="Select Lot"
//                                 isClearable={false} // ✅ disable cross icon
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 isDisabled={!canEditLot}
//                               />
//                             </div>

//                             <div className="col-span-1 lg:col-span-1">
//                               <label className="block font-medium mb-1">
//                                 Piece No
//                               </label>
//                               <Select
//                                 options={pieceOptions}
//                                 value={
//                                   pieceOptions?.find(
//                                     (option) => option.value === pieceId,
//                                   ) || null
//                                 }
//                                 onChange={(selectedOption) =>
//                                   setPieceId(selectedOption?.value || "")
//                                 }
//                                 placeholder="Select"
//                                 isClearable={false} // ✅ disable cross icon
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 isDisabled={!canEditLot}
//                                 className="text-right"
//                               />
//                             </div>

//                             {/* Meter */}
//                             <div className="col-span-1 lg:col-span-1">
//                               <label className="block font-medium mb-1">
//                                 Meters
//                               </label>
//                               <input
//                                 type="number"
//                                 value={
//                                   meters !== "" &&
//                                   meters !== null &&
//                                   meters !== undefined
//                                     ? Number(meters).toFixed(2)
//                                     : ""
//                                 }
//                                 readOnly
//                                 className="w-full border rounded-lg px-1 py-1.5 text-right "
//                               />
//                             </div>
//                             {/* Meters in DC */}
//                             <div className="col-span-1 lg:col-span-1">
//                               <label className="block font-medium mb-1">
//                                 Table No
//                               </label>
//                               <input
//                                 type="number"
//                                 value={tableNo?.join(", ")}
//                                 readOnly
//                                 className="w-full border rounded-lg px-1 py-1.5 text-right "
//                               />
//                             </div>
//                             <div className="col-span-2 lg:col-span-3">
//                               <label className="block text-sm font-medium mb-1 ">
//                                 Checker Name
//                               </label>
//                               <input
//                                 type="text"
//                                 value={checkerName}
//                                 readOnly
//                                 className="border rounded-lg text-left px-2 py-1.5 w-full uppercase focus:border-none "
//                               />
//                             </div>

//                             {/* Meters */}
//                             <div className="col-span-2 lg:col-span-3 ">
//                               <label className="block text-sm font-medium mb-1">
//                                 Checking Section Name
//                               </label>
//                               <input
//                                 type="text"
//                                 value={sectionName}
//                                 readOnly
//                                 className="border rounded-lg text-left px-2 py-1.5 w-full"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </AccordionDetails>{" "}
//                     </Accordion>
//                   </div>

//                   {/* Defect Details */}
//                   <div>
//                     <Accordion
//                       expanded={defectExpandedIndex === pieceIndex}
//                       onChange={() =>
//                         setDefectExpandedIndex(
//                           defectExpandedIndex === pieceIndex
//                             ? null
//                             : pieceIndex,
//                         )
//                       }
//                       disableGutters
//                       elevation={0}
//                       square
//                       sx={{
//                         "&:before": { display: "none" }, // remove top divider line
//                         // 👈 show line when closed
//                         borderBottom:
//                           defectExpandedIndex === pieceIndex
//                             ? "none"
//                             : "1px solid #d1d5db",
//                       }}
//                     >
//                       <AccordionSummary
//                         expandIcon={<ExpandMore />}
//                         sx={{
//                           minHeight: "40px",
//                           "& .MuiAccordionSummary-content": {
//                             margin: "8px 0",
//                           },
//                         }}
//                       >
//                         <Typography
//                           component="span"
//                           sx={{
//                             color: "black",
//                             fontWeight: 700,
//                             marginLeft: "-9px",
//                           }} // slate-700 color
//                         >
//                           Defect Details
//                         </Typography>{" "}
//                       </AccordionSummary>
//                       <AccordionDetails
//                         sx={{
//                           paddingTop: 0,
//                           // backgroundColor: "#f1f1f0", // ✅ correct
//                           paddingX: 1,
//                         }}
//                       >
//                         <div>
//                           <div className="grid grid-cols-5 lg:grid-cols-9 gap-4 text-sm">
//                             {/* Lot No */}
//                             <div className="col-span-1 lg:col-span-1 z-999">
//                               <label className="block font-medium mb-1">
//                                 Meter At
//                               </label>
//                               <Select
//                                 options={meterList}
//                                 value={
//                                   meterList.find(
//                                     (option) =>
//                                       option.value === Number(checkedMeter),
//                                   ) || null
//                                 }
//                                 onChange={(selectedOption) =>
//                                   setCheckedMeter(
//                                     selectedOption
//                                       ? Number(selectedOption.value)
//                                       : "",
//                                   )
//                                 }
//                                 placeholder="Select"
//                                 isClearable={false} // ✅ disable cross icon
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 className="text-right"
//                               />
//                               <button
//                                 type="button"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleSplit(pieceIndex, Number(checkedMeter));
//                                 }}
//                                 className="bg-purple-600 text-white px-2 rounded-lg"
//                               >
//                                 Split
//                               </button>
//                             </div>

//                             <div className="col-span-4 lg:col-span-4">
//                               <label className="block font-medium mb-1">
//                                 Defect Name
//                               </label>
//                               <Select
//                                 options={defectOptions}
//                                 value={
//                                   defectOptions?.find(
//                                     (option) => option.value === defectId,
//                                   ) || null
//                                 }
//                                 onChange={(selectedOption) => {
//                                   setDefectId(selectedOption?.value || "");
//                                   setDefectPoints(selectedOption?.points ?? "");
//                                   setDefectName(
//                                     selectedOption?.englishName ?? "",
//                                   );
//                                 }}
//                                 placeholder="Select"
//                                 isClearable={false} // ✅ disable cross icon
//                                 styles={customSelectStyles}
//                                 isSearchable={true}
//                                 className="text-left"
//                               />
//                             </div>

//                             {/* Meter */}
//                             <div className="col-span-1 lg:col-span-1">
//                               <label className="block font-medium mb-1">
//                                 Points
//                               </label>
//                               <input
//                                 type="number"
//                                 value={defectPoints}
//                                 readOnly
//                                 className="w-full border rounded-lg px-1 py-1.5 text-right "
//                               />
//                             </div>
//                             {/* Meters in DC */}
//                             <div className="col-span-1 lg:col-span-1">
//                               <label className="block font-medium mb-1">
//                                 No of times
//                               </label>
//                               <input
//                                 type="number"
//                                 value={defectTimes}
//                                 disabled={isNoDefectSelected}
//                                 onChange={(e) => setDefectTimes(e.target.value)}
//                                 className={`w-full border rounded-lg px-1 py-1.5 text-right ${
//                                   isNoDefectSelected
//                                     ? "bg-gray-200 cursor-not-allowed"
//                                     : ""
//                                 }`}
//                               />
//                             </div>
//                             <div className="col-span-1 lg:col-span-1">
//                               <label className="block text-sm font-medium mb-1 ">
//                                 Total Points
//                               </label>
//                               <input
//                                 type="number"
//                                 value={totalDefectPoints}
//                                 readOnly
//                                 className="border rounded-lg text-right px-2 py-1.5 w-full uppercase focus:border-none "
//                               />
//                             </div>
//                             <div className="col-span-1 lg:col-span-1">
//                               <button
//                                 type="button"
//                                 onClick={FillDefectArray}
//                                 className="bg-green-600 mr-2 mt-6 text-white  py-1.5 rounded-lg hover:bg-green-700 transition px-2"
//                               >
//                                 + Add
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </AccordionDetails>{" "}
//                     </Accordion>
//                   </div>

//                   {/* Piece Table */}
//                   {piece.defects?.length > 0 && (
//                     <div className="mt-2">
//                       <table className="w-full lg:w-[55vw] border border-gray-200 table-fixed border-collapse">
//                         <thead className="bg-gray-100 text-gray-700 text-sm">
//                           <tr>
//                             <th className="w-8 px-1 py-1 border">Meter</th>
//                             <th className="w-44 border">Defect Name</th>
//                             <th className="w-12 border">Points</th>
//                             <th className="w-12 px-1 border">Times</th>
//                             <th className="w-20 border">Total Points</th>
//                             <th className="w-8 border">Action</th>
//                           </tr>
//                         </thead>

//                         <tbody className="text-xs text-center">
//                           {piece.defects.map((defect, index) => (
//                             <tr
//                               key={index}
//                               className={
//                                 index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                               }
//                             >
//                               <td className="py-1.5 border text-right pr-1">
//                                 {defect?.meter}
//                               </td>

//                               <td className="border text-left pl-1">
//                                 {defect?.defectName}
//                               </td>

//                               <td className="border text-right pr-1">
//                                 {defect?.points}
//                               </td>

//                               <td className="border text-right pr-1">
//                                 {defect?.times}
//                               </td>

//                               <td className="border text-right pr-1">
//                                 {defect?.totalPoints}
//                               </td>

//                               <td className="px-2 border text-center">
//                                 <button
//                                   type="button"
//                                   onClick={() => deleteRow(pieceIndex, index)}
//                                   className="bg-red-500 text-white px-1 py-1 rounded text-sm"
//                                 >
//                                   <MdDelete />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>

//                         <tfoot>
//                           <tr className="font-semibold text-xs">
//                             <td
//                               className="border py-1 text-right pr-1"
//                               colSpan={4}
//                             >
//                               Piece Total
//                             </td>

//                             <td className="border text-right pr-1">
//                               {piece.defects.reduce(
//                                 (sum, d) => sum + Number(d.totalPoints || 0),
//                                 0,
//                               )}
//                             </td>

//                             <td className="border"></td>
//                           </tr>
//                         </tfoot>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default DefectEntry;
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
  const [defectExpandedIndex, setDefectExpandedIndex] = useState(null);

  // FIX #10: removed unused top-level startMeter/endMeter/subPieceNo/subPieceId states
  // They are managed inside data.lotDetails per piece

  // Per-piece defect form state — keyed by pieceIndex
  const [perPieceForm, setPerPieceForm] = useState({});

  const [translatedDefects, setTranslatedDefects] = useState([]);
  const translationCacheRef = useRef({}); // FIX #7: cache translations

  const [data, setData] = useState({ lotDetails: [] });

  const lotIdRef = useRef(null);
  // FIX #5: track if lotId effect should skip initial run
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

  // ─── Helper: initialise per-piece form state ───────────────────────────────
  const buildPerPieceForm = (index) => ({
    checkedMeter: "",
    defectId: "",
    defectName: "",
    defectPoints: "",
    defectTimes: "",
    totalDefectPoints: "",
  });

  const getForm = (index) => perPieceForm[index] || buildPerPieceForm(index);

  const setForm = (index, updater) => {
    setPerPieceForm((prev) => {
      const current = prev[index] || buildPerPieceForm(index);
      const updated =
        typeof updater === "function"
          ? updater(current)
          : { ...current, ...updater };
      return { ...prev, [index]: updated };
    });
  };

  // ─── FIX #1 & #2: Rebuild lotDetails whenever pieceId, pieceNo, meters, or
  //     checker info changes, preserving existing defects if the piece is the same ──
  useEffect(() => {
    if (!pieceId || !pieceNo || !meters) return;

    setData((prev) => {
      // If the first piece is already this pieceId keep its defects
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

    // Reset per-piece form when piece changes
    setPerPieceForm({});
  }, [pieceId, pieceNo, meters]);

  // ─── Lot options ────────────────────────────────────────────────────────────
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

  // ─── Work status (non-admin/supervisor) ────────────────────────────────────
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

  // ─── Lot details (admin/supervisor piece selection) ─────────────────────────
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

    // Also capture pieceNo from lotDetails if available
    if (work?.pieceNo) setPieceNo(work.pieceNo);
  }, [lotDetails]);

  // ─── FIX #5: Reset on lotId change — skip initial mount ────────────────────
  const canEditLot = isAdmin || isSuppervisor;

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

  // ─── Focus lot dropdown for admin/supervisor on mount ──────────────────────
  useEffect(() => {
    if (lotIdRef.current && canEditLot) {
      lotIdRef.current.focus();
    }
  }, []);
  console.log(data, "chekcimg");

  // ─── FIX #7: Translate defects with caching ─────────────────────────────────
  const translateText = async (text, targetLang) => {
    const cacheKey = `${text}__${targetLang}`;
    if (translationCacheRef.current[cacheKey]) {
      return translationCacheRef.current[cacheKey];
    }
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
      );
      const data = await res.json();
      const translated = data[0][0][0];
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

  // FIX #6: always store defectId as number consistently
  const defectOptions = translatedDefects.map((def) => ({
    label: def.translatedLabel,
    value: Number(def.GTPIECEDEFMASTID),
    points: def.POINTS,
    englishName: def.DEFECTNAME,
  }));

  // ─── Totals ─────────────────────────────────────────────────────────────────
  const totalPointsSum = data.lotDetails.reduce(
    (sum, piece) =>
      sum +
      piece.defects.reduce((pSum, d) => pSum + Number(d.totalPoints || 0), 0),
    0,
  );

  // ─── Build final payload: { Lot: [...] } ────────────────────────────────────
  // First element = original piece (no subPieceNo)
  // Subsequent elements = split sub-pieces (with subPieceNo)
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

      // Only split pieces (index > 0) get the subPieceNo field
      if (index > 0) {
        entry.subPieceNo = piece.subPieceNo;
      }

      return entry;
    });

    return { lotId: parseInt(lotId), Lot };
  };

  // ─── Split ──────────────────────────────────────────────────────────────────
  // FIX #4: letter based on how many splits already exist for this original piece
  const handleSplit = (pieceIndex, splitMeter) => {
    if (!splitMeter) return;

    setData((prev) => {
      const lotDetails = [...prev.lotDetails];
      const piece = { ...lotDetails[pieceIndex] };

      if (splitMeter <= piece.startMeter || splitMeter >= piece.endMeter) {
        Swal.fire({ icon: "warning", title: "Invalid Split Meter" });
        return prev;
      }

      // Count how many split sub-pieces already exist for this base pieceNo
      const existingSplitCount = lotDetails.filter(
        (p) =>
          String(p.pieceNo) === String(piece.pieceNo) &&
          p.subPieceNo !== String(p.pieceNo), // only count already-split pieces
      ).length;

      // Next letter: A, B, C …
      const nextLetter = String.fromCharCode(65 + existingSplitCount); // 65 = 'A'

      // Original piece keeps subPieceNo unchanged — always stays as "1"
      const updatedPiece = {
        ...piece,
        subPieceNo: String(piece.subPieceNo),
        endMeter: splitMeter,
        defects: piece.defects.filter((d) => d.meter <= splitMeter),
      };

      // New split piece gets letter suffix — "1A", "1B" …
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

    setForm(pieceIndex, buildPerPieceForm(pieceIndex));
  };

  // ─── Add defect ─────────────────────────────────────────────────────────────
  // FIX #3: Each piece accordion manages its own meter via perPieceForm[pieceIndex]
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

      // FIX #6: consistent number comparison
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
      };

      const newLotDetails = [...lotDetails];
      newLotDetails[pieceIndex] = {
        ...piece,
        defects: [...piece.defects, newDefect],
      };

      return { lotDetails: newLotDetails };
    });

    // Reset only this piece's form fields (keep meter for convenience)
    setForm(pieceIndex, (prev) => ({
      ...buildPerPieceForm(pieceIndex),
      checkedMeter: prev.checkedMeter, // keep meter so user can add multiple defects at same meter
    }));
  };

  // ─── Delete defect ──────────────────────────────────────────────────────────
  const deleteRow = (pieceIndex, defectIndex) => {
    setData((prev) => {
      const lotDetails = [...prev.lotDetails];
      const piece = { ...lotDetails[pieceIndex] };
      piece.defects = piece.defects.filter((_, i) => i !== defectIndex);
      lotDetails[pieceIndex] = piece;
      return { lotDetails };
    });
  };

  // ─── Save ───────────────────────────────────────────────────────────────────
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

  // FIX #13: basic validation before save
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

  // ─── Meter list helper ──────────────────────────────────────────────────────
  const getMeterList = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => {
      const meter = start + i;
      return { value: meter, label: meter.toString() };
    });

  return (
    <>
      <div className="h-[75vh] pt-0">
        <div className="flex bg-white justify-between py-1 rounded-lg">
          <h1 className="text-xl ml-2 font-bold text-center">Defect Entry</h1>
          <div>
            <button
              type="button"
              onClick={saveData}
              className="bg-blue-600 mr-2 text-white py-1 rounded-lg hover:bg-blue-700 transition px-2"
            >
              Save
            </button>
          </div>
        </div>

        <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
          <form className="p-2">
            {data.lotDetails.map((piece, pieceIndex) => {
              const meterList = getMeterList(piece.startMeter, piece.endMeter);
              const form = getForm(pieceIndex);

              // FIX #8: consistent type check for NO DEFECT
              const isNoDefectSelected =
                defectOptions.find((d) => d.value === Number(form.defectId))
                  ?.englishName === "NO DEFECT";

              return (
                <div key={`${piece.pieceId}-${pieceIndex}`} className="mb-6">
                  <h3 className="font-bold text-sm mb-2">
                    Piece {piece.subPieceNo} ({piece.startMeter} -{" "}
                    {piece.endMeter})
                  </h3>

                  {/* Lot Details Accordion */}
                  {pieceIndex === 0 && (
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
                        borderBottom:
                          expandedIndex === pieceIndex
                            ? "none"
                            : "1px solid #d1d5db",
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
                          Lot Details
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ paddingTop: 0, paddingX: 1 }}>
                        <div className="grid grid-cols-5 lg:grid-cols-11 gap-4 text-sm">
                          {/* Lot No — only show on first piece */}
                          {pieceIndex === 0 && (
                            <>
                              <div className="col-span-2 lg:col-span-2 z-999">
                                <label className="block font-medium mb-1">
                                  Lot No
                                </label>
                                <Select
                                  ref={lotIdRef}
                                  options={lotOptions}
                                  value={
                                    lotOptions?.find(
                                      (o) => o.value === lotId,
                                    ) || null
                                  }
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

                              <div className="col-span-1 lg:col-span-1">
                                <label className="block font-medium mb-1">
                                  Piece No
                                </label>
                                <Select
                                  options={pieceOptions}
                                  value={
                                    pieceOptions?.find(
                                      (o) => o.value === pieceId,
                                    ) || null
                                  }
                                  onChange={(sel) => {
                                    setPieceId(sel?.value || "");
                                    setPieceNo(sel?.label || "");
                                  }}
                                  placeholder="Select"
                                  isClearable={false}
                                  styles={customSelectStyles}
                                  isSearchable
                                  isDisabled={!canEditLot}
                                />
                              </div>
                            </>
                          )}

                          <div className="col-span-1 lg:col-span-1">
                            <label className="block font-medium mb-1">
                              Meters
                            </label>
                            <input
                              type="number"
                              value={
                                piece.meters !== "" && piece.meters !== null
                                  ? Number(piece.meters).toFixed(2)
                                  : ""
                              }
                              readOnly
                              className="w-full border rounded-lg px-1 py-1.5 text-right"
                            />
                          </div>

                          <div className="col-span-1 lg:col-span-1">
                            <label className="block font-medium mb-1">
                              Table No
                            </label>
                            <input
                              type="text"
                              value={piece.tableNo?.join(", ")}
                              readOnly
                              className="w-full border rounded-lg px-1 py-1.5 text-right"
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium mb-1">
                              Checker Name
                            </label>
                            <input
                              type="text"
                              value={piece.checkerName}
                              readOnly
                              className="border rounded-lg text-left px-2 py-1.5 w-full uppercase"
                            />
                          </div>

                          <div className="col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium mb-1">
                              Checking Section Name
                            </label>
                            <input
                              type="text"
                              value={piece.sectionName}
                              readOnly
                              className="border rounded-lg text-left px-2 py-1.5 w-full"
                            />
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  )}

                  {/* Defect Details Accordion */}
                  <Accordion
                    expanded={defectExpandedIndex === pieceIndex}
                    onChange={() =>
                      setDefectExpandedIndex(
                        defectExpandedIndex === pieceIndex ? null : pieceIndex,
                      )
                    }
                    disableGutters
                    elevation={0}
                    square
                    sx={{
                      "&:before": { display: "none" },
                      borderBottom:
                        defectExpandedIndex === pieceIndex
                          ? "none"
                          : "1px solid #d1d5db",
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
                        Defect Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingTop: 0, paddingX: 1 }}>
                      {/* FIX #3: each piece uses its own form state via perPieceForm */}
                      <div className="grid grid-cols-5 lg:grid-cols-9 gap-4 text-sm">
                        <div className="col-span-1 lg:col-span-1 z-999">
                          <label className="block font-medium mb-1">
                            Meter At
                          </label>
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
                                // FIX: reset defect fields when meter changes
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
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleSplit(pieceIndex, Number(form.checkedMeter))
                            }
                            className="bg-purple-600 text-white px-2 mt-1 rounded-lg"
                          >
                            Split
                          </button>
                        </div>

                        <div className="col-span-4 lg:col-span-4">
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

                        <div className="col-span-1 lg:col-span-1">
                          <label className="block font-medium mb-1">
                            Points
                          </label>
                          <input
                            type="number"
                            value={form.defectPoints}
                            readOnly
                            className="w-full border rounded-lg px-1 py-1.5 text-right"
                          />
                        </div>

                        <div className="col-span-1 lg:col-span-1">
                          <label className="block font-medium mb-1">
                            No of times
                          </label>
                          <input
                            type="number"
                            value={form.defectTimes}
                            disabled={isNoDefectSelected}
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

                        <div className="col-span-1 lg:col-span-1">
                          <label className="block text-sm font-medium mb-1">
                            Total Points
                          </label>
                          <input
                            type="number"
                            value={form.totalDefectPoints}
                            readOnly
                            className="border rounded-lg text-right px-2 py-1.5 w-full"
                          />
                        </div>

                        <div className="col-span-1 lg:col-span-1">
                          <button
                            type="button"
                            onClick={(e) => FillDefectArray(e, pieceIndex)}
                            className="bg-green-600 mr-2 mt-6 text-white py-1.5 rounded-lg hover:bg-green-700 transition px-2"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {/* Defect Table */}
                      {piece.defects?.length > 0 && (
                        <div className="mt-2">
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
                                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
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
                              <tr className="font-semibold text-xs">
                                <td
                                  className="border py-1 text-right pr-1"
                                  colSpan={4}
                                >
                                  Piece Total
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
