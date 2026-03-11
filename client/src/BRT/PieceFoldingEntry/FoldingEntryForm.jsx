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

const PieceFoldingForm = ({ onClose }) => {
  const lotIdRef = useRef(null);

  const [selectedLotNo, setSelectedLotNo] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [loomNo, setLoomNo] = useState("");
  const [checkerId, setCheckerId] = useState("");
  const [selectedPiece, setSelectedPiece] = useState("");
  const [pieceNo, setPieceNo] = useState("");
  const [receiptMeters, setReceiptMeters] = useState("");
  const [meters, setMeters] = useState("");
  const [defectPoints, setDefectPoints] = useState("");
  const [checkedMeters, setCheckedMeters] = useState("");
  const [gradeName, setGradeName] = useState("");
  const [actualPoints, setActualPoints] = useState("");
  const [foldPercentage, setFoldPercentage] = useState("");
  const [weight, setWeight] = useState("");

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
  const syncFormWithDb = useCallback(
    (data) => {
      setTableNo(data?.TABLENOTAB);
      setMeters(data?.ACTUALMETER);
      setDefectPoints(Number(data?.TOTPOINTSTAB));
      setReceiptMeters(data?.RECEIPTMETER);
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

  const pieceOptions = pieceData?.data?.map((cloth) => ({
    // label: `${cloth?.BASEPCSNO} ${cloth?.SPLITPCSNO ? "-" : ""} ${cloth?.SPLITPCSNO ? cloth?.SPLITPCSNO : ""}`,
    label: cloth?.SPLITPCSNO,
    value: cloth?.ID,
  }));

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
  useEffect(() => {
    if (checkedMetersNum > 0) {
      setFoldPercentage((checkedMetersNum / 100).toFixed(2));
    } else {
      setFoldPercentage("");
    }
  }, [checkedMetersNum]);
  const [updateData] = useUpdatepieceFoldingEntryMutation();

  const data = {
    selectedLotNo: Number(selectedLotNo),
    tableNo,
    loomNo,
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
  };
  const handleSubmitCustom = async (callback, data) => {
    try {
      let returnData = await callback(data).unwrap();
      Swal.fire({
        title: "Added Successfully",
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
        title: "Submission error",
        text: "Something went wrong!",
        timer: 2000,
      });
    }
  };
  const validateSaveData = () => {
    if (!selectedLotNo) {
      Swal.fire({
        icon: "warning",

        title: "Select Lot",

        timer: 2000,

        showConfirmButton: true,
      });

      return false;
    }
    if (!selectedPiece) {
      Swal.fire({
        icon: "warning",

        title: "Select Piece",

        timer: 2000,

        showConfirmButton: true,
      });

      return false;
    }
    if (!loomNo) {
      Swal.fire({
        icon: "warning",

        title: "Entry Loom No",

        timer: 2000,

        showConfirmButton: true,
      });

      return false;
    }
    if (!checkerId) {
      Swal.fire({
        icon: "warning",

        title: "Choose Folder Name",

        timer: 2000,

        showConfirmButton: true,
      });

      return false;
    }
    if (!checkedMeters) {
      Swal.fire({
        icon: "warning",

        title: "Entry checked Meters",

        timer: 2000,

        showConfirmButton: true,
      });

      return false;
    }
    if (!weight) {
      Swal.fire({
        icon: "warning",

        title: "Entry Weight",

        timer: 2000,

        showConfirmButton: true,
      });

      return false;
    }
    return true;
  };
  const saveData = () => {
    if (!validateSaveData()) return;

    handleSubmitCustom(updateData, data);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">Error loading lots</div>
    );
  }

  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold text-center">
          Piece Folding Entry
        </h1>
        <div>
          <button
            onClick={onClose}
            className="bg-red-600 mr-2 text-white  py-1 rounded-lg hover:bg-red-700 transition px-2"
          >
            Back
          </button>
          <button
            onClick={saveData}
            className="bg-blue-600 mr-2 text-white  py-1 rounded-lg hover:bg-blue-700 transition px-2"
          >
            Save
          </button>
        </div>
      </div>
      <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
        <form className=" p-2">
          <div>
            <div>
              <h2 className="text-lg  font-semibold mb-2 ">Lot Details</h2>
              <div className="grid grid-cols-4 lg:grid-cols-10 gap-4 text-sm">
                <div className="col-span-2 lg:col-span-2 z-999">
                  <label className="block font-medium mb-1">Lot No</label>
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
                    placeholder="Select Lot"
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Piece No</label>
                  <Select
                    options={pieceOptions}
                    value={
                      pieceOptions?.find(
                        (option) => option.value === selectedPiece,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedPiece(selectedOption?.value);
                      setPieceNo(selectedOption?.label);
                    }}
                    placeholder=" "
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                    className="text-right"
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Loom No</label>
                  <input
                    value={loomNo}
                    onChange={(e) => setLoomNo(e.target.value)}
                    // readOnly={readonly}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>

                <div className="flex flex-col flex-1  col-span-2 max-w-[18rem]">
                  <label className="text-sm font-medium mb-1">
                    {" "}
                    Folder Name
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
                        placeholder="Select User"
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
                  <label className="block font-medium mb-1">Table No</label>
                  <input
                    value={tableNo}
                    // readOnly={readonly}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">
                    Receipt Meters
                  </label>
                  <input
                    value={Number(receiptMeters)?.toFixed(2)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                    disabled
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Meters</label>
                  <input
                    value={Number(meters)?.toFixed(2)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                    disabled
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">
                    Defect Points
                  </label>

                  <input
                    value={defectPoints}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">
                    Checked Meters
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

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">GRADE</label>

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
                  <label className="block font-medium mb-1">Points</label>

                  <input
                    type="number"
                    value={actualPoints}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Fold %</label>

                  <input
                    type="number"
                    value={foldPercentage}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Weight</label>

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
                      Grade Calculation:
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
                      {result?.GRADENAME || "No Grade"}
                    </span>
                    {checkedMetersNum < 20 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        ⚠ Checked meters below 20 — minimum C GRADE applied
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
