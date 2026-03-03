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
  const [expanded, setExpanded] = useState(true);
  const [defectExpanded, setDefectExpanded] = useState(true);
  const [checkedMeter, setCheckedMeter] = useState("");
  const [defectId, setDefectId] = useState("");
  const [defectName, setDefectName] = useState("");
  const [defectTimes, setDefectTimes] = useState("");
  const [defectPoints, setDefectPoints] = useState("");
  const [totalDefectPoints, setTotalDefectPoints] = useState("");
  const [defectArray, setDefectArray] = useState([]);
  const lotIdRef = useRef(null);

  const storedUserId = Number(localStorage.getItem("userId"));
  const storedRoleId = Number(localStorage.getItem("roleId"));
  const { data: roles } = useGetRolesQuery();

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
  const rolesLoaded = !!roles?.data?.length;

  const shouldSkipWorkStatus =
    !storedUserId || !rolesLoaded || isAdmin || isSuppervisor;

  const { data: workStatus } = useGetWorkStatusQuery(storedUserId, {
    skip: shouldSkipWorkStatus,
  });

  console.log(workStatus, "workStatus");

  const { data: lots } = useGetLotsQuery();
  console.log(tableNo, "tableNo");

  const { data: pieces } = useGetPiecesQuery({ lotId }, { skip: !lotId });
  const { data: lotDetails } = useGetlotDetailsQuery(
    { pieceId },
    { skip: !pieceId },
  );
  console.log(lotDetails, "lotDetails");
  const { data: defectEntry } = useGetDefectsQuery();
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
      ?.sort((a, b) => a.PCSNO - b.PCSNO)
      ?.map((piece) => ({
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
      // safer table mapping
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
    const work = lotDetails?.data; // 👈 safest way
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
  }, [lotDetails]);
  console.log(checkerName, "checkerName");

  const canEditLot = isAdmin || isSuppervisor;

  useEffect(() => {
    if (!canEditLot) return;
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
    }
  }, [lotId, canEditLot]);
  useEffect(() => {
    if (lotIdRef.current && canEditLot) {
      lotIdRef.current.focus();
      lotIdRef.current?.openMenu("first");
    }
  }, []);
  const generateNumbers = (n) => {
    if (!Number.isInteger(n) || n <= 0) return [];
    return Array.from({ length: n }, (_, i) => i + 1);
  };
  const meterList = generateNumbers(meters)?.map((num) => ({
    value: num,
    label: num.toString(),
  }));
  const defectOptions = defectEntry?.data?.map((def) => ({
    label: def?.DEFECTNAME,
    value: def?.GTPIECEDEFMASTID,
    points: def?.POINTS,
  }));
  useEffect(() => {
    const total = defectPoints * defectTimes;
    setTotalDefectPoints(total);
  }, [defectPoints, defectTimes]);

  const FillDefectArray = (e) => {
    e.preventDefault();
    if (!checkedMeter || !defectId || !defectTimes) return;
    const alreadyExists = defectArray.some(
      (item) =>
        Number(item.meter) === Number(checkedMeter) &&
        Number(item.defectId) === Number(defectId),
    );

    if (alreadyExists) {
      Swal.fire({
        icon: "warning",
        title: "Same Defect Already Choosed",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    const newItem = {
      meter: Number(checkedMeter),
      defectId: Number(defectId),
      defectName,
      points: Number(defectPoints),
      times: Number(defectTimes),
      totalPoints: Number(totalDefectPoints),
    };

    setDefectArray((prev) => [...prev, newItem]);

    // Optional: Reset fields after adding
    setCheckedMeter("");
    setDefectId("");
    setDefectPoints("");
    setDefectTimes("");
  };
  const deleteRow = (indexToDelete) => {
    setDefectArray((prev) =>
      prev.filter((_, index) => index !== indexToDelete),
    );
  };

  console.log(defectArray, "defectArray");

  return (
    <>
      <div className="h-[75vh] pt-0">
        <div className="flex bg-white justify-between py-1 rounded-lg">
          <h1 className="text-xl ml-2 font-bold text-center">Defect Entry</h1>
          <div>
            <button
              // onClick={saveData}
              className="bg-blue-600 mr-2 text-white  py-1 rounded-lg hover:bg-blue-700 transition px-2"
            >
              Save
            </button>
          </div>
        </div>
        <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
          <form className=" p-2">
            {/* Lot Details */}
            <div>
              <Accordion
                expanded={expanded}
                onChange={() => setExpanded((prev) => !prev)}
                disableGutters
                elevation={0}
                square
                sx={{
                  "&:before": { display: "none" }, // remove top divider line
                  borderBottom: expanded ? "none" : "1px solid #d1d5db", // 👈 show line when closed
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: "40px",
                    "& .MuiAccordionSummary-content": {
                      margin: "8px 0",
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{ color: "black", fontWeight: 700, marginLeft: "-9px" }} // slate-700 color
                  >
                    Lot Details
                  </Typography>{" "}
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    paddingTop: 0,
                    // backgroundColor: "#f1f1f0", // ✅ correct
                    paddingX: 1,
                  }}
                >
                  <div>
                    <div className="grid grid-cols-5 lg:grid-cols-11 gap-4 text-sm">
                      {/* Lot No */}
                      <div className="col-span-2 lg:col-span-2 z-999">
                        <label className="block font-medium mb-1">Lot No</label>
                        <Select
                          ref={lotIdRef}
                          options={lotOptions}
                          value={
                            lotOptions?.find(
                              (option) => option.value === lotId,
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            setLotId(selectedOption?.value || "")
                          }
                          placeholder="Select Lot"
                          isClearable={false} // ✅ disable cross icon
                          styles={customSelectStyles}
                          isSearchable={true}
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
                              (option) => option.value === pieceId,
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            setPieceId(selectedOption?.value || "")
                          }
                          placeholder="Select"
                          isClearable={false} // ✅ disable cross icon
                          styles={customSelectStyles}
                          isSearchable={true}
                          isDisabled={!canEditLot}
                          className="text-right"
                        />
                      </div>

                      {/* Meter */}
                      <div className="col-span-1 lg:col-span-1">
                        <label className="block font-medium mb-1">Meters</label>
                        <input
                          type="number"
                          value={
                            meters !== "" &&
                            meters !== null &&
                            meters !== undefined
                              ? Number(meters).toFixed(2)
                              : ""
                          }
                          readOnly
                          className="w-full border rounded-lg px-1 py-1.5 text-right "
                        />
                      </div>
                      {/* Meters in DC */}
                      <div className="col-span-1 lg:col-span-1">
                        <label className="block font-medium mb-1">
                          Table No
                        </label>
                        <input
                          type="number"
                          value={tableNo?.join(", ")}
                          readOnly
                          className="w-full border rounded-lg px-1 py-1.5 text-right "
                        />
                      </div>
                      <div className="col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1 ">
                          Checker Name
                        </label>
                        <input
                          type="text"
                          value={checkerName}
                          readOnly
                          className="border rounded-lg text-left px-2 py-1.5 w-full uppercase focus:border-none "
                        />
                      </div>

                      {/* Meters */}
                      <div className="col-span-2 lg:col-span-3 ">
                        <label className="block text-sm font-medium mb-1">
                          Checking Section Name
                        </label>
                        <input
                          type="text"
                          value={sectionName}
                          readOnly
                          className="border rounded-lg text-left px-2 py-1.5 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionDetails>{" "}
              </Accordion>
            </div>

            {/* Defect Details */}
            <div>
              <Accordion
                expanded={defectExpanded}
                onChange={() => setDefectExpanded((prev) => !prev)}
                disableGutters
                elevation={0}
                square
                sx={{
                  "&:before": { display: "none" }, // remove top divider line
                  borderBottom: defectExpanded ? "none" : "1px solid #d1d5db", // 👈 show line when closed
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: "40px",
                    "& .MuiAccordionSummary-content": {
                      margin: "8px 0",
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{ color: "black", fontWeight: 700, marginLeft: "-9px" }} // slate-700 color
                  >
                    Defect Details
                  </Typography>{" "}
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    paddingTop: 0,
                    // backgroundColor: "#f1f1f0", // ✅ correct
                    paddingX: 1,
                  }}
                >
                  <div>
                    <div className="grid grid-cols-5 lg:grid-cols-9 gap-4 text-sm">
                      {/* Lot No */}
                      <div className="col-span-1 lg:col-span-1 z-999">
                        <label className="block font-medium mb-1">Meter</label>
                        <Select
                          options={meterList}
                          value={
                            meterList.find(
                              (option) => option.value === checkedMeter,
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            setCheckedMeter(selectedOption?.value || "")
                          }
                          placeholder="Select"
                          isClearable={false} // ✅ disable cross icon
                          styles={customSelectStyles}
                          isSearchable={true}
                          className="text-right"
                        />
                      </div>

                      <div className="col-span-4 lg:col-span-4">
                        <label className="block font-medium mb-1">
                          Defect Name
                        </label>
                        <Select
                          options={defectOptions}
                          value={
                            defectOptions?.find(
                              (option) => option.value === defectId,
                            ) || null
                          }
                          onChange={(selectedOption) => {
                            setDefectId(selectedOption?.value || "");
                            setDefectPoints(selectedOption?.points || "");
                            setDefectName(selectedOption?.label || "");
                          }}
                          placeholder="Select"
                          isClearable={false} // ✅ disable cross icon
                          styles={customSelectStyles}
                          isSearchable={true}
                          className="text-left"
                        />
                      </div>

                      {/* Meter */}
                      <div className="col-span-1 lg:col-span-1">
                        <label className="block font-medium mb-1">Points</label>
                        <input
                          type="number"
                          value={defectPoints}
                          readOnly
                          className="w-full border rounded-lg px-1 py-1.5 text-right "
                        />
                      </div>
                      {/* Meters in DC */}
                      <div className="col-span-1 lg:col-span-1">
                        <label className="block font-medium mb-1">
                          No of times
                        </label>
                        <input
                          type="number"
                          value={defectTimes}
                          onChange={(e) => setDefectTimes(e.target.value)}
                          className="w-full border rounded-lg px-1 py-1.5 text-right "
                        />
                      </div>
                      <div className="col-span-1 lg:col-span-1">
                        <label className="block text-sm font-medium mb-1 ">
                          Total Points
                        </label>
                        <input
                          type="number"
                          value={totalDefectPoints}
                          readOnly
                          className="border rounded-lg text-right px-2 py-1.5 w-full uppercase focus:border-none "
                        />
                      </div>
                      <div className="col-span-1 lg:col-span-1">
                        <button
                          type="button"
                          onClick={FillDefectArray}
                          className="bg-green-600 mr-2 mt-6 text-white  py-1.5 rounded-lg hover:bg-green-700 transition px-2"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </AccordionDetails>{" "}
              </Accordion>
            </div>

            {/* Defect Table */}
            {defectArray?.length > 0 ? (
              <>
                <div className="h-[30vh] overflow-y-auto overflow-x-auto bg-white   mt-2">
                  <table className="w-full lg:w-[55vw] border border-gray-200 table-fixed border-collapse">
                    <thead className="bg-gray-100 text-gray-700 text-sm ">
                      <tr>
                        <th className="w-8 px-1 py-1 border">Meter</th>
                        <th className="w-44 border">Defect Name</th>
                        <th className="w-12 border">Points</th>
                        <th className="w-12 px-1 border">Times</th>
                        <th className="w-20 border">Total Points</th>
                        <th className="w-8 border">Action</th>
                      </tr>
                    </thead>

                    <tbody className="text-xs  text-center">
                      {defectArray?.map((defect, index) => {
                        return (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            }
                          >
                            <td className=" py-1.5 border text-right pr-1">
                              {defect?.meter}
                            </td>
                            <td className=" border text-left pl-1">
                              {defect?.defectName}
                            </td>
                            <td className=" border text-right pr-1">
                              {defect?.points}
                            </td>
                            <td className=" border text-right pr-1">
                              {defect?.times}
                            </td>
                            <td className=" border text-right pr-1">
                              {defect?.totalPoints}
                            </td>
                            <td className=" px-2  border text-center">
                              <button
                                type="button"
                                onClick={() => deleteRow(index)}
                                className="bg-red-500 text-white px-1 py-1 rounded text-sm"
                              >
                                <MdDelete />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              ""
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default DefectEntry;
