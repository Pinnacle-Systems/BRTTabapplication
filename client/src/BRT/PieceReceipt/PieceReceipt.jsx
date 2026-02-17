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
  const [viewOnly, setViewOnly] = useState(true);
  const lotIdRef = useRef(null);
  const pieceNoRef = useRef(null);

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
      selectedClothId: parseInt(selectedClothId),
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
      lotIdRef.current.click(); // opens dropdown
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
  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-2xl ml-2 font-bold text-center">Piece Receipt</h1>
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
                <div className="col-span-2 lg:col-span-2 ">
                  <label className="block font-medium mb-1">Lot No</label>
                  <select
                    value={selectedLotId}
                    onChange={(e) => setSelectedLotId(e.target.value)}
                    className="w-full bg-white border rounded-lg px-2 py-1.5"
                    ref={lotIdRef}
                  >
                    <option value="">Select Lot</option>
                    {lots?.data?.map((lot) => (
                      <option
                        key={lot?.GTFABRICRECEIPTID}
                        value={lot?.GTFABRICRECEIPTID}
                      >
                        {lot?.DOCID}
                      </option>
                    ))}
                  </select>
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
                  disabled={!selectedClothId}
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
        <div className="w-[70vw] lg:w-[30vw] rounded-lg overflow-hidden mt-2 p-2">
          <div className="max-h-[35vh] overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-sm border-collapse table-fixed">
              <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 border w-4 text-center">S.No</th>
                  <th className="px-2 py-2 border w-28 text-center">
                    Piece No
                  </th>
                  <th className="px-2 py-2 border text-center w-28">Meters</th>
                  <th className="px-2 py-2 border text-center w-16">Actions</th>
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
      </div>
    </div>
  );
};

export default PieceReceipt;
