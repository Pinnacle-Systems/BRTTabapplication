/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback, useMemo } from "react";
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
import { useGetPiecesQuery } from "../../redux/services/TableandLot";
import { useGetFoldingPendingQuery, useGetGradeMasterQuery } from "../../redux/services/FoldingPendingList";
import { useGetpieceEntryByIdQuery, useGetpieceFoldingEntryByIdQuery } from "../../redux/services/PieceFoldingEntry";
import { useGetRolesQuery, useGetUsersQuery } from "../../redux/userservice";

const PieceFoldingForm = ({
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

  const [selectedLotNo, setSelectedLotNo] = useState('')
  const [selectedPiece, setSelectedPiece] = useState('')
  const [loomNo, setLoomNo] = useState('')
  const [checkerId, setCheckerId] = useState("");
  const [receiptMeters, setReceiptMeters] = useState('')
  const [checkedMeters, setCheckedMeters] = useState('')


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


  const { data: foldingPendingData, isLoading, isFetching, error } = useGetFoldingPendingQuery();

  const flodingOptions = foldingPendingData?.data?.map((cloth) => ({
    label: cloth?.DOCID,
    value: cloth?.RECEIPTNO,
  }));


  console.log(foldingPendingData, "foldingPendingData")

  const {
    data: singleData,

  } = useGetpieceFoldingEntryByIdQuery(
    { selectedPiece },
    { skip: !selectedPiece },
  );

  const value = singleData?.data?.TOTPOINTSTAB
 
  const result = gradeData?.data?.find(r =>
    value >= r.STPOINTS && (r.ENDPOINTD === null || value < r.ENDPOINTD)
  );
 console.log(result, "result")
  console.log(singleData?.data, "singleData")
  const {
    data: pieceData,
    isLoading: isSingleLoading,
    isFetching: isSingleFetching,
  } = useGetpieceEntryByIdQuery(
    { selectedLotNo },
    { skip: !selectedLotNo },
  );

  const pieceOptions = pieceData?.data?.map((cloth) => ({
    label: `${cloth?.BASEPCSNO} ${cloth?.SPLITPCSNO ? "-" : ""} ${cloth?.SPLITPCSNO ? cloth?.SPLITPCSNO : ""}`,
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


  const [updateData] = useUpdatePieceReceiptMutation();


  const syncFormWithDb = useCallback(
    (data) => {

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
      selectedClothId: parseInt(selectedClothId), CHK,

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



  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold text-center">Piece Folding Entry</h1>
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
                      setSelectedPiece(selectedOption?.value)
                    }}
                    placeholder=" "
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                    className="text-right"
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Table No</label>
                  <input
                    value={singleData?.data?.TABLENOTAB}
                    // readOnly={readonly}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
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
                  <label className="text-sm font-medium mb-1"> Folder Name</label>

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
                  <label className="block font-medium mb-1">Receipt Meters</label>
                  <input
                    value={parseFloat(singleData?.data?.ACTUALMETER).toFixed(2)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                    disabled
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Total Defect</label>

                  <input
                    value={singleData?.data?.TOTPOINTSTAB}
                    disabled
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>

                <div className="col-span-1 lg:col-span-1">
                  <label className="block font-medium mb-1">Checked Meters</label>

                  <input
                    value={checkedMeters}
                    onBlur={(e) => setCheckedMeters(parseFloat(e.target.value).toFixed(2))}

                    onChange={(e) => setCheckedMeters(e.target.value)}
                    className="w-full border rounded-lg px-1 py-1.5  text-right"
                  />
                </div>


              </div>
            </div>
          </div>


        </form>

      </div>
    </div>
  );
};

export default PieceFoldingForm;
