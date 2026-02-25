/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";
import {
  useGetLotPieceReceiptQuery,
  useGetLotPieceReceiptDetailsQuery,
  useUpdatePieceReceiptMutation,
  useGetPieceReceiptByIdQuery,
} from "../../redux/services/PieceReceipt";
import { useEffect } from "react";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import Select from "react-select";

const PieceReceipt = ({
  onClose,
  selectedLotId,
  setSelectedLotId,
  selectedClothId,
  setSelectedClothId,
  setSelectedGridId,
  selectedGridId,
}) => {
  const [receiptPcs, setReceiptPcs] = useState("");
  const [dcMeter, setDcMeter] = useState("");
  const [pieceNo, setPieceNumber] = useState("");
  const [meter, setMeter] = useState("");
  const [lotItems, setLotItems] = useState([]);
  const lotIdRef = useRef(null);
  const pieceNoRef = useRef(null);
  let CHK = 1;
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
    dropdownIndicator: () => ({ }),

    indicatorSeparator: () => ({ display: "none" }),
    menuList: (base) => ({
      ...base,
      maxHeight: 140,
      // overflowY: "auto",
    }),
  };
  // ✅ RTK Query
  const { data: lots, error, isLoading } = useGetLotPieceReceiptQuery();

  const { data: lotReceiptDetails } = useGetLotPieceReceiptDetailsQuery(
    selectedLotId,
    { skip: !selectedLotId },
  );
  const {
    data: singleData,
    isLoading: isSingleLoading,
    isFetching: isSingleFetching,
  } = useGetPieceReceiptByIdQuery(
    { selectedLotId, selectedGridId },
    { skip: !selectedLotId || !selectedGridId },
  );
  console.log(singleData, "singleData");

  const [updateData] = useUpdatePieceReceiptMutation();
  const syncFormWithDb = useCallback(
    (data) => {
      // Map PayStructure to include payDescription and pickFrom
      const mapped =
        data?.[0]?.lotItems?.flatMap((item) =>
          item?.lotItemsSubGrid?.map((val) => ({
            pcNo: Number(val?.sno),
            meters: Number(val?.mtr).toFixed(2),
            _isDbRow: true, // ✅ frontend only flag
          })),
        ) || [];

      setLotItems(mapped);
      console.log("Mapped:", mapped);
    },
    [selectedLotId, selectedGridId],
  );

  console.log(lotItems, "dataCheck");

  useEffect(() => {
    setLotItems([]);

    if (selectedClothId && singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [selectedClothId, singleData, syncFormWithDb]);

  const data = {
    selectedLotId: parseInt(selectedLotId),
    selectedClothId: parseInt(selectedClothId),
    selectedGridId: parseInt(selectedGridId),

    lotItems: lotItems?.map(({ _isDbRow, ...item }) => ({
      pcNo: parseInt(item.pcNo),
      selectedLotId: parseInt(selectedLotId),
      selectedGridId: parseInt(selectedGridId),
      selectedClothId: parseInt(selectedClothId),    CHK,

      meters: parseFloat(item.meters),
    })),
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
      setLotItems([]);
      setSelectedClothId("");
      setSelectedLotId("");
      setSelectedGridId("");
      setPieceNumber("");
      setMeter("");
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
    if (!selectedLotId || !selectedClothId) {
      Swal.fire({
        icon: "warning",

        title: "Select Lot and Cloth",

        timer: 2000,

        showConfirmButton: false,
      });

      return;
    }
    if (lotItems?.length === 0) {
      Swal.fire({
        icon: "warning",

        title: "Add at least one piece",

        timer: 2000,

        showConfirmButton: false,
      });

      return;
    }

    handleSubmitCustom(updateData, data);
  };
  console.log(lotReceiptDetails, "lotReceiptDetails");
  useEffect(() => {
    if (lotIdRef.current) {
      lotIdRef.current.focus();
      lotIdRef.current?.openMenu("first");
    }
  }, []);
  const clothOptions = lotReceiptDetails?.data?.map((cloth) => ({
    label: cloth?.CLOTHNAME,
    value: cloth?.CLOTHID,
  }));
  useEffect(() => {
    // Reset when lot changes
    setSelectedClothId("");
    setReceiptPcs("");
    setDcMeter("");
    setSelectedGridId("");
    setLotItems([]);
  }, [selectedLotId]);

  useEffect(() => {
    if (!selectedClothId || !lotReceiptDetails?.data) {
      setReceiptPcs("");
      setDcMeter("");
      setPieceNumber("");
      setMeter("");
      return;
    }

    const selectedCloth = lotReceiptDetails?.data?.find(
      (cloth) => Number(cloth?.CLOTHID) === Number(selectedClothId),
    );

    if (selectedCloth) {
      setReceiptPcs(selectedCloth?.PCS || "");
      setDcMeter(selectedCloth?.MTRS || "");
      setSelectedGridId(selectedCloth?.GTFABRICRECEIPTDETID || "");
    }
  }, [selectedClothId, lotReceiptDetails]);

  useEffect(() => {
    if (lotItems?.length === Number(receiptPcs)) {
      setPieceNumber("");
    }
  }, [lotItems, receiptPcs]);

  useEffect(() => {
    if (!receiptPcs) return;

    // ✅ IMPORTANT: if table empty, don't autofill
    if (lotItems.length === 0) {
      setPieceNumber("");
      return;
    }

    const receipt = Number(receiptPcs);

    const maxPieceNo = Math.max(
      ...lotItems?.map((item) => Number(item?.pcNo || 0)),
    );

    if (maxPieceNo >= receipt) {
      setPieceNumber("");
      return;
    }

    setPieceNumber(maxPieceNo + 1);
  }, [lotItems, receiptPcs]);
  const handleAddItem = (e) => {
    e.preventDefault();

    if (!pieceNo || !meter) {
      Swal.fire({
        title: "Enter Piece No and Meter",
        icon: "warning",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    if (Number(pieceNo) === 0) {
      Swal.fire({
        title: "Piece Number cannot be 0",
        icon: "warning",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }

    const newMeter = Number(meter);
    const receiptMeter = Number(dcMeter);
    if (newMeter > receiptMeter) {
      Swal.fire({
        icon: "error",
        title: "Exceeded",
        text: "Meter exceeding the DC Meter",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    const totalMeters = lotItems?.reduce(
      (sum, item) => sum + Number(item?.meters || 0),
      0,
    );

    // ✅ check limit
    if (totalMeters + newMeter > Number(dcMeter)) {
      Swal.fire({
        title: "Exceeded",
        icon: "error",
        text: "Meter exceeding the DC Meter",

        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    const newItem = {
      selectedLotId,
      selectedClothId,
      pcNo: Number(pieceNo), // ✅ FIX
      meters: Number(meter).toFixed(2),
      _isDbRow: false, // ✅ frontend only flag
    };

    // ✅ structure clone
    const clonedItem = structuredClone(newItem);
    const exists = lotItems?.some(
      (item) => Number(item?.pcNo) === Number(pieceNo),
    );

    if (exists) {
      Swal.fire({
        title: "Piece Number Already Exists",
        icon: "warning",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }

    setLotItems((prev) => [...prev, clonedItem]);

    setPieceNumber("");
    setMeter("");
    setTimeout(() => {
      pieceNoRef.current?.focus();
    }, 100);
  };
  const handleDeleteItem = (indexToDelete) => {
    // clone array
    const clonedItems = structuredClone(lotItems);

    // remove item
    clonedItems?.splice(indexToDelete, 1);

    // update state
    setLotItems(clonedItems);
  };

  const handleChange = (index, value, field) => {
    const updated = structuredClone(lotItems);

    // ✅ validation only for pcNo
    /* ✅ PC NO VALIDATION */
    if (field === "pcNo") {
      const num = Number(value);
      const receipt = Number(receiptPcs);

      /* cannot be 0 */
      if (num === 0) {
        Swal.fire({
          title: "Piece Number cannot be 0",
          icon: "warning",
          timer: 2000,
          showConfirmButton: true,
        });

        return;
      }
      /* cannot exceed receipt pcs */
      if (num > receipt) {
        Swal.fire({
          title: "Piece Number cannot be greater than Receipt Pieces",
          icon: "error",
          timer: 2000,
          showConfirmButton: true,
        });

        return;
      }
      /* cannot exceed receipt pcs */
      const exists = updated?.some(
        (item, i) => i !== index && Number(item.pcNo) === Number(value),
      );

      if (exists) {
        Swal.fire({
          title: "Piece Number already exists",
          icon: "warning",
          timer: 2000,
          showConfirmButton: true,
        });
        return;
      }
    }

    /* ✅ METER VALIDATION */
    if (field === "meters") {
      const newMeter = Number(value);
      const receiptMeter = Number(dcMeter);

      if (newMeter > receiptMeter) {
        Swal.fire({
          title: "Exceeded",
          text: "Meter exceeding the DC Meter",
          icon: "error",
          timer: 2000,
          showConfirmButton: true,
        });
        return;
      }

      // calculate total excluding current row
      const totalMeters = updated?.reduce((sum, item, i) => {
        if (i === index) return sum;

        return sum + Number(item.meters || 0);
      }, 0);

      if (totalMeters + newMeter > receiptMeter) {
        Swal.fire({
          title: "Exceeded",
          text: "Total meter exceeding DC Meter",
          icon: "error",
          timer: 2000,
          showConfirmButton: true,
        });

        return;
      }
    }
    // ✅ update value
    updated[index][field] = field === "pcNo" ? Number(value) : value;

    setLotItems(updated);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">Error loading lots</div>
    );
  }
  const totalPcs = lotItems?.reduce(
    (sum, item) => sum + Number(item?.pcNo || 0),
    0,
  );
  const totalMetersTable = lotItems
    ?.reduce((sum, item) => sum + Number(item?.meters || 0), 0)
    ?.toFixed(2);
  const totalPieces = lotItems.length;

  const balancePcs = Number(receiptPcs || 0) - totalPieces;

  const balanceMeters = (
    Number(dcMeter || 0) - Number(totalMetersTable)
  ).toFixed(2);

  const lotOptions = lots?.data?.map((lot) => ({
    value: lot?.GTFABRICRECEIPTID,
    label: lot?.DOCID,
  }));

  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold text-center">Piece Receipt</h1>
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
          {/* Lot Details */}
          <div>
            <div>
              <h2 className="text-lg  font-semibold mb-2 ">Lot Details</h2>
              <div className="grid grid-cols-4 lg:grid-cols-10 gap-4 text-sm">
                {/* Lot No */}
                <div className="col-span-2 lg:col-span-2 z-999">
                  <label className="block font-medium mb-1">Lot No</label>
                  <Select
                    ref={lotIdRef} // ✅ ADD THIS
                    options={lotOptions}
                    value={
                      lotOptions?.find(
                        (option) => option.value === selectedLotId,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      setSelectedLotId(selectedOption?.value || "")
                    }
                    placeholder="Select Lot"
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    autoFocus
                    isSearchable={true}
                  />
                </div>

                {/* Cloth Name */}
                <div className="col-span-4 lg:col-span-5">
                  <label className="block font-medium mb-1">Cloth Name</label>
                  <select
                    value={selectedClothId}
                    onChange={(e) => setSelectedClothId(e.target.value)}
                    className="w-full bg-white border rounded-lg px-2 py-1.5"
                  >
                    <option value="">Select Cloth Name</option>
                    {clothOptions?.map((cloth) => (
                      <option key={cloth?.value} value={cloth?.value}>
                        {cloth?.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Receipt Pcs */}
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Receipt Pcs</label>
                  <input
                    type="number"
                    value={receiptPcs}
                    readOnly
                    className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-100"
                  />
                </div>

                {/* Meters in DC */}
                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Meters in DC</label>
                  <input
                    type="number"
                    value={Number(dcMeter || 0)?.toFixed(2)}
                    readOnly
                    className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Piece Details */}
          <div>
            <h2 className="text-lg  font-semibold  mt-2 pb-2">Piece Details</h2>

            <div className="flex items-end gap-4 text-sm w-full">
              {/* Piece No */}
              <div className="flex flex-col flex-1 max-w-[8rem]">
                <label className="text-sm font-medium mb-1">Piece No</label>
                <input
                  type="number"
                  ref={pieceNoRef}
                  name="pieceNo"
                  value={pieceNo}
                  max={receiptPcs}
                  min={1}
                  onChange={(e) => {
                    const num = Number(e.target.value);

                    if (num > receiptPcs) {
                      Swal.fire({
                        title:
                          "Piece Number cannot be greater than Receipt Pieces",
                        icon: "error",
                        timer: 2000,
                        showConfirmButton: true,
                      });
                      return;
                    }

                    setPieceNumber(e.target.value);
                  }}
                  disabled={
                    !selectedClothId || lotItems.length === Number(receiptPcs) // ✅ disable when limit reached
                  }
                  className="border rounded-lg text-right px-2 py-1.5 w-full"
                />
              </div>

              {/* Meters */}
              <div className="flex flex-col flex-1 max-w-[8rem]">
                <label className="text-sm font-medium mb-1">Meters</label>
                <input
                  type="number"
                  name="meter"
                  value={meter}
                  disabled={!pieceNo}
                  onChange={(e) => setMeter(e.target.value)}
                  className="border rounded-lg text-right px-2 py-1.5 w-full"
                />
              </div>

              {/* Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleAddItem}
                  className="bg-green-600 px-4  text-white rounded-lg py-2 whitespace-nowrap"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </form>
        <div className="flex gap-4 mt-2">
          <div className="w-[70vw] lg:w-[30vw] rounded-lg overflow-hidden mt-2 p-2">
            <div className="max-h-[35vh] overflow-y-auto overflow-x-auto">
              <table className="min-w-full text-sm border-collapse table-fixed">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 border w-4 text-center">S.No</th>
                    <th className="px-2 py-2 border w-28 text-center">
                      Piece No
                    </th>
                    <th className="px-2 py-2 border text-center w-28">
                      Meters
                    </th>
                    <th className="px-2 py-2 border text-center w-16">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lotItems?.length > 0 ? (
                    lotItems?.map((item, index) => (
                      <tr key={index} className="text-sm hover:bg-gray-50">
                        <td className="px-2 py-1 border text-center">
                          {index + 1}
                        </td>

                        <td className="py-1 border focus:ring-2 focus:border-2 text-right">
                          <input
                            type="number"
                            name="pcNo"
                            value={item?.pcNo}
                            onChange={(e) =>
                              handleChange(index, e.target.value, "pcNo")
                            }
                            className="focus:border-none pr-1  bg-transparent focus:outline-none text-right w-full"
                          />
                        </td>

                        <td className=" py-1 border text-right focus:ring-2 focus:border-2">
                          <input
                            type="number"
                            name="meters"
                            value={item?.meters}
                            onChange={(e) =>
                              handleChange(index, e.target.value, "meters")
                            }
                            onBlur={(e) =>
                              handleChange(
                                index,
                                Number(e.target.value || 0).toFixed(2),
                                "meters",
                              )
                            }
                            className="focus:border-none  pr-1 bg-transparent focus:outline-none text-right w-full"
                          />
                        </td>

                        <td className="px-2 py-1 border text-center">
                          <div className="flex justify-center gap-2">
                            {!item._isDbRow && (
                              <button
                                onClick={() => handleDeleteItem(index)}
                                className="bg-red-500 text-white px-1 py-1 rounded text-sm"
                              >
                                <MdDelete />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center  py-4 border text-gray-500 font-medium"
                      >
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  {lotItems?.length > 0 ? (
                    <>
                      <tr className="bg-gray-100">
                        <td className=" border font-bold text-center"></td>
                        <td className="text-center border font-bold  py-1">
                          Total
                        </td>
                        <td className="text-right border font-bold pr-1 py-1">
                          {totalMetersTable}
                        </td>
                        <td className="text-right border font-bold px-2 py-1"></td>
                      </tr>
                    </>
                  ) : (
                    <></>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
          <div className="min-w-[180px] h-fit mt-4 border rounded-lg bg-gray-50 p-3 mr-2 shadow">
            <h3 className="font-semibold text-sm mb-2 text-gray-700">
              Summary
            </h3>

            <div className="flex justify-between text-sm mb-1">
              <span>Entered Pcs</span>
              <span className="font-bold">{totalPieces}</span>
            </div>

            <div className="flex justify-between text-sm mb-2 text-red-600">
              <span>Balance Pcs</span>
              <span className="font-bold">{balancePcs}</span>
            </div>

            <hr className="my-2" />

            <div className="flex justify-between text-sm mb-1">
              <span>Entered Mtrs</span>
              <span className="font-bold">{totalMetersTable}</span>
            </div>

            <div className="flex justify-between text-sm text-red-600">
              <span>Balance Mtrs</span>
              <span className="font-bold">{balanceMeters}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieceReceipt;
