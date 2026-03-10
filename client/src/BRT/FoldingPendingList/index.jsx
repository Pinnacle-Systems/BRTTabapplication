/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";
import {
  useGetLotPieceReceiptQuery,
  useUpdatePieceReceiptMutation,
  useGetPieceReceiptByIdQuery,
} from "../../redux/services/PieceReceipt";
import { useEffect } from "react";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import Select from "react-select";
import { useGetFoldingPendingByIdQuery, useGetFoldingPendingQuery, useUpdateFoldingPendingMutation } from "../../redux/services/FoldingPendingList";

const FoldingPendingList = ({
  // onClose,
  // selectedLotId,
  // setSelectedLotId,
  // selectedClothId,
  // setSelectedClothId,
  // setSelectedGridId,
  // selectedGridId,
}) => {


const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "13px",
      height: "36px",
      padding: "0px 4px",
      fontSize: "14px",
      borderRadius: "8px",

      color: state.isDisabled ? "#6b7280" : "black",
      backgroundColor: state.isDisabled ? "white" : "white", // bg-gray-100 vs bg-white
      cursor: state.isDisabled ? "not-allowed" : "default",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", // blue-500 vs gray-300
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : base.boxShadow,
      "&:hover": {
        borderColor: state.isDisabled ? "#d1d5db" : "#9ca3af", // keep gray when disabled
      },
      zIndex:"999"
    }),
    valueContainer: (base, state) => ({
      ...base,
      padding: "0 3px",
      fontSize: "14px",

      color: state.isDisabled ? "black" : "black",
    }),
    input: (base, state) => ({
      ...base,
      margin: 0,
      fontSize: "14px",
      padding: 0,

      color: state.isDisabled ? "black" : "black",
    }),
    singleValue: (base, state) => ({
      ...base,

      fontSize: "14px",
      color: state.isDisabled ? "black" : "black",
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


  const [foldingItems, setFoldingItems] = useState([]);
  const [lotNo, setLotNo] = useState('')

  useEffect(() => {
    if (foldingItems?.length >= 20) return;
    setFoldingItems((prev) => {
      let newArray = Array.from({ length: 20 - prev.length }, (i) => {
        return {
          yarnId: "",
          qty: "0.00",
          tax: "0",
          colorId: "",
          uomId: "",
          price: "0.00",
          discountValue: "0.00",
          noOfBags: "0",
          discountType: "",
          weightPerBag: "0.00",
          poItemsId: ""
        };
      });
      return [...prev, ...newArray];
    });
  }, [foldingItems, setFoldingItems]);


  const { data: foldingPendingData } = useGetFoldingPendingQuery();



  const {
    data: singleData,
    isLoading: isSingleLoading,
    isFetching: isSingleFetching,
  } = useGetFoldingPendingByIdQuery({ lotNo }, { skip: !lotNo },
  );

  const [updateData] = useUpdateFoldingPendingMutation();


  const syncFormWithDb = useCallback(
    (data) => {

      setFoldingItems(data);


    },
    [],
  );

  console.log(foldingItems, "foldingItems");

  useEffect(() => {
    setFoldingItems([]);

    if (singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [singleData, syncFormWithDb]);

  const data = {
    foldingItems: foldingItems?.filter(i => i.ID),
    lotNo
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

    if (foldingItems?.filter(i => i.TABAPPROVAL)?.length === 0) {
      Swal.fire({

        icon: "warning",
        title: "Add at least Approve One Folding Items",

      });

      return;
    }

    handleSubmitCustom(updateData, data);
  };






  const flodingOptions = foldingPendingData?.data?.map((cloth) => ({
    label: cloth?.DOCID,
    value: cloth?.RECEIPTNO,
  }));



  const handleInputChange = (value, index, field) => {
    console.log(value, "value", index, "index", field, "field")
    const newBlend = structuredClone(foldingItems);

    newBlend[index][field] = value ? "YES" : "";
    setFoldingItems(newBlend);
  };







  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold text-center">Folding Pending List</h1>
        <div>
          {/* <button
            // onClick={onClose}
            className="bg-red-600 mr-2 text-white  py-1 rounded-lg hover:bg-red-700 transition px-2"
          >
            Back
          </button> */}
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


                {/* Cloth Name */}
                <div className="col-span-2 lg:col-span-2 z-40">
                  <label className="block font-medium mb-1">Lot name</label>
                  <Select
                    options={flodingOptions}
                    value={
                      flodingOptions?.find(
                        (option) => option.value === lotNo,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setLotNo(selectedOption?.value || "");
                    }}
                    placeholder="Select Lot"
                    isClearable={false} // ✅ disable cross icon
                    styles={customSelectStyles}
                    isSearchable={true}
                  />
                </div>




              </div>
            </div>
          </div>


        </form>
        <div className="flex gap-4 mt-2">
          <div className=" md:w-[120vw] lg:w-[100vw] rounded-lg overflow-y-auto mt-2 p-2">
            <div className="max-h-[45vh] overflow-y-auto overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm border table-fixed">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-1 py-2 border w-6 text-center">S.No</th>
                    <th className="px-1 py-2 border w-16 text-center">Base Pcs No</th>
                    <th className="px-1 py-2 border w-16 text-center">Split Pcs No</th>
                    <th className="px-1 py-2 border w-32 text-center">Checker</th>
                    <th className="px-1 py-2 border w-12 text-center">Table No</th>
                    <th className="px-1 py-2 border w-20 text-center">Receipt Mtrs</th>
                    <th className="px-1 py-2 border w-16 text-center">Start Mtr</th>
                    <th className="px-1 py-2 border w-12 text-center">End Mtr</th>
                    <th className="px-1 py-2 border w-12 text-center">Meters</th>
                    <th className="px-1 py-2 border w-24 text-center">Defect Points</th>
                    <th className="px-1 py-2 border w-12 text-center">Approve</th>

                  </tr>
                </thead>

                <tbody>{console.log(singleData?.data > 0, "singleData?.data > 0")}
                  {foldingItems?.length > 0 ? (
                    foldingItems.map((item, index) => (
                      <tr key={index} className="text-sm hover:bg-gray-50">
                        <td className="px-2 py-1 border text-center">
                          {index + 1}
                        </td>

                        <td className="py-1 px-2  border focus:ring-2 focus:border-2 text-right">
                          {item?.BASEPCSNO}
                        </td>

                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-left">
                          {item?.SPLITPCSNO}
                        </td>

                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-left">
                          {item?.CHECKERNAME}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.TABLENOTAB}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.RECEIPTMETER?.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.STARTMTR?.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.ENDMTR?.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.ACTUALMETER?.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.TOTPOINTSTAB}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-center ">
                          {item?.RECEIPTNO ?

                            <input
                              type="checkbox"
                              onChange={(e) => handleInputChange(e.target.checked, index, "TABAPPROVAL")}
                              checked={item.TABAPPROVAL}
                            />

                            : ""}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center  py-4 border text-gray-500 font-medium"
                      >
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FoldingPendingList;
