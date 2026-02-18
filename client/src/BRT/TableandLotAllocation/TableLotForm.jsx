/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";

import {
  useGetTablesQuery,
  useGetLotsQuery,
  useGetClothQuery,
  useGetPiecesQuery,
  useGetCheckingSectionQuery,
  useUpdateTableLotMutation,
  useGetTableLotByIdQuery,
} from "../../redux/services/TableandLot";
import { useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import CheckingNoGrid from "./CheckingNoGrid ";
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
}) => {
  const [dcMeter, setDcMeter] = useState("");
  const [selectedTables, setSelectedTables] = useState([]);

  const lotIdRef = useRef(null);
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
  // ✅ RTK Query
  const { data: lots, error, isLoading } = useGetLotsQuery();
  console.log(lots, "lots");
  const { data: checking } = useGetCheckingSectionQuery();
  console.log(checking, "checking");

  const { data: tables } = useGetTablesQuery();
  console.log(tables, "tables");

  const { data: cloths } = useGetClothQuery(selectedLotNo, {
    skip: !selectedLotNo,
  });
  console.log(cloths, "cloths");

  const { data: pieces } = useGetPiecesQuery(selectedGridId, {
    skip: !selectedGridId,
  });
  console.log(pieces, "pieces");

  const { data: singleData } = useGetTableLotByIdQuery(
    { selectedLotNo, selectedGridId },
    { skip: !selectedLotNo || !selectedGridId },
  );
  console.log(singleData, "singleData");

  const [updateData] = useUpdateTableLotMutation();
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
    selectedLotNo: parseInt(selectedLotNo),

    selectedClothId: parseInt(selectedClothId),
    selectedGridId: parseInt(selectedGridId),
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
      setSelectedLotNo("");
      setSelectedGridId("");
      setSelectedClothId("");
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
  const saveData = () => {
    if (!selectedLotNo || !selectedClothId) {
      Swal.fire({
        icon: "warning",

        title: "Select Lot and Cloth",

        timer: 2000,

        showConfirmButton: false,
      });

      return;
    }

    handleSubmitCustom(updateData, data);
  };
  useEffect(() => {
    if (lotIdRef.current) {
      lotIdRef.current.focus();
      lotIdRef.current?.openMenu("first");
    }
  }, []);

  const lotOptions = lots?.data?.map((lot) => ({
    value: lot?.LOTNO,
    label: lot?.LOTNO,
  }));
  const checkingOptions = checking?.data?.map((check) => ({
    value: check?.GTCHECKINGMASTID,
    label: check?.SECTIONNAME,
  }));

  const clothOptions = cloths?.data?.map((cloth) => ({
    label: cloth?.CLOTHNAME,
    value: cloth?.GRIDID,
    clothId: cloth?.CLOTHID,
  }));

  const pieceOptions = pieces?.data?.map((piece) => ({
    label: piece?.PCSNO,
    value: piece?.SUBGRIDID,
    meter: piece?.METER,
    pcNo: piece?.PCSNO,
  }));

  useEffect(() => {
    // Reset when lot changes
    setSelectedGridId("");
    setSelectedClothId("");
    setSelectedSubGridId("");
    setSelectedPiece("");
    setDcMeter("");
    setCheckingSectionId("");
    setCheckerId("");
    setSelectedTables([])
  }, [selectedLotNo]);

  useEffect(() => {
    if (!selectedSubGridId || !cloths?.data) {
      setDcMeter("");
      return;
    }
  }, [selectedSubGridId, cloths]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">Error loading lots</div>
    );
  }
  const handleSelect = (item) => {
    setSelectedTables((prev) => {
      const exists = prev.find(
        (t) => t.GTCHKTABLEMASTID === item.GTCHKTABLEMASTID,
      );

      if (exists) {
        return prev.filter((t) => t.GTCHKTABLEMASTID !== item.GTCHKTABLEMASTID);
      } else {
        return [...prev, item];
      }
    });
  };

  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold text-center">
          Table and Lot Piece Allocation
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
            <h2 className="text-lg  font-semibold  ">Table Details</h2>

            <div className="flex items-end gap-4 mt-2 text-sm w-full">
              {/* Piece No */}

              <div className="flex flex-col flex-1 max-w-[18rem]">
                <label className="text-sm font-medium mb-1">
                  Checking Section
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
                  placeholder="Select section"
                  isClearable={false} // ✅ disable cross icon
                  styles={customSelectStyles}
                  className="text-left"
                  isSearchable={true}
                />
              </div>

              {/* Meters */}
              <div className="flex flex-col flex-1 max-w-[18rem]">
                <label className="text-sm font-medium mb-1">Checker Name</label>
                <input
                  type="text"
                  name="checkerId"
                  value={checkerId}
                  onChange={(e) => setCheckerId(e.target.value)}
                  className="border rounded-lg text-left px-1 py-[7px] w-full"
                />
              </div>
              <div className="flex flex-col flex-1 max-w-[8rem]">
                <label className="text-sm font-medium mb-1">
                  Tables Choosed
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

              {/* Button */}
            </div>
          </div>
          {/* Lot Details */}
          <div className="mt-2">
            <div>
              <h2 className="text-lg  font-semibold  ">Lot Details</h2>
              <div className="grid grid-cols-4 lg:grid-cols-10 gap-4 mt-2 text-sm">
                {/* Lot No */}
                <div className="col-span-2 lg:col-span-2 z-999">
                  <label className="block font-medium mb-1">Lot No</label>
                  <Select
                    options={lotOptions}
                    value={
                      lotOptions?.find(
                        (option) => option.value === selectedLotNo,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      setSelectedLotNo(selectedOption?.value || "")
                    }
                    placeholder="Select Lot"
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                  />
                </div>

                {/* Cloth Name */}
                <div className="col-span-4 lg:col-span-5">
                  <label className="block font-medium mb-1">Cloth Name</label>

                  <Select
                    options={clothOptions}
                    value={
                      clothOptions?.find(
                        (option) => option.value === selectedGridId,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedGridId(selectedOption?.value || "");
                      setSelectedClothId(selectedOption?.clothId || "");
                    }}
                    placeholder="Select cloth"
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                  />
                </div>

                {/* Receipt Pcs */}
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Piece No</label>
                  <Select
                    options={pieceOptions}
                    value={
                      pieceOptions?.find(
                        (option) => option.value === selectedSubGridId,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedSubGridId(selectedOption?.value || "");
                      setSelectedPiece(selectedOption?.pcNo || "");
                      setDcMeter(selectedOption?.meter || "");
                    }}
                    placeholder=" "
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                    className="text-right"
                  />
                </div>

                {/* Meters in DC */}
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Meters</label>
                  <input
                    type="number"
                    value={Number(dcMeter || 0)?.toFixed(2)}
                    readOnly
                    className="w-full border rounded-lg px-1 py-[7px] text-right bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <CheckingNoGrid
          data={tables?.data}
          selectedTables={selectedTables}
          setSelectedTables={setSelectedTables}
          handleSelect={handleSelect}
        />
      </div>
    </div>
  );
};

export default TableLotForm;