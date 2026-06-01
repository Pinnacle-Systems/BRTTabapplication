/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";

import { useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import {
  useGetFoldingPendingByIdQuery,
  useGetFoldingPendingQuery,
  useUpdateFoldingPendingMutation,
  useGetDefectsQuery,
} from "../../redux/services/FoldingPendingList";

import { useLanguage } from "../../Context/LanguageContext";
import { MdOpenInNew, MdClose } from "react-icons/md";
import useInvalidateTags from "../../CustomHooks/useInvalidateTags";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Folding Pending List",
    save: "Save",
    lotDetails: "Lot Details",
    lotName: "Lot name",
    selectLot: "Select Lot",
    sno: "S.No",
    basePcsNo: "Base Pcs No",
    splitPcsNo: "Split Pcs No",
    checker: "Checker",
    tableNo: "Table",
    receiptMtrs: "Receipt Mtrs",
    startMtr: "Start Mtr",
    endMtr: "End Mtr",
    meters: "Meters",
    defectPoints: "Defect Points",
    approve: "Approve",
    noData: "No Data Found",
    approveAtLeastOne: "Add at least Approve One Folding Items",
    addedSuccess: "Added Successfully",
    submissionError: "Submission error",
    somethingWentWrong: "Something went wrong!",
    open: "Open",
    modalTitle: "Defect Details",
    close: "Close",
    loomNo: "Loom No",
    weaverPieceNo: "Weaver Pc No",
  },
  ta: {
    modalTitle: "குறைபாடு விவரங்கள்",

    title: "மடிப்பு நிலுவை பட்டியல்",
    save: "சேமி",
    lotDetails: "லாட் விவரங்கள்",
    lotName: "லாட் பெயர்",
    selectLot: "லாட் தேர்ந்தெடு",
    sno: "எண்",
    basePcsNo: "அடிப்படை பீஸ் ",
    splitPcsNo: "பிரிந்த பீஸ் ",
    checker: "சரிபார்ப்பாளர்",
    tableNo: "மேஜை",
    receiptMtrs: "ரசீது மீட்டர்",
    startMtr: "தொடக்க மீட்டர்",
    endMtr: "இறுதி மீட்டர்",
    meters: "மீட்டர்கள்",
    defectPoints: "குறைபாடு புள்ளிகள்",
    approve: "அனுமதி",
    noData: "தரவு இல்லை",
    approveAtLeastOne: "குறைந்தது ஒரு மடிப்பு பொருளை அனுமதிக்கவும்",
    addedSuccess: "வெற்றிகரமாக சேர்க்கப்பட்டது",
    submissionError: "சமர்ப்பிப்பு பிழை",
    somethingWentWrong: "ஏதோ தவறு நடந்தது!",
    open: "திற",
    close: "மூடு",
    loomNo: "லூம் எண்",
    weaverPieceNo: "வீவர் பீஸ் எண்",
  },
  hi: {
    modalTitle: "दोष विवरण",

    title: "फोल्डिंग पेंडिंग सूची",
    save: "सहेजें",
    lotDetails: "लॉट विवरण",
    lotName: "लॉट नाम",
    selectLot: "लॉट चुनें",
    sno: "क्र.सं.",
    basePcsNo: "बेस पीस नं.",
    splitPcsNo: "विभाजित पीस नं.",
    checker: "जांचकर्ता",
    tableNo: "टेबल नं.",
    receiptMtrs: "रसीद मीटर",
    startMtr: "शुरुआत मीटर",
    endMtr: "अंत मीटर",
    meters: "मीटर",
    defectPoints: "दोष अंक",
    approve: "अनुमोदन",
    noData: "कोई डेटा नहीं मिला",
    approveAtLeastOne: "कम से कम एक फोल्डिंग आइटम को अनुमोदित करें",
    addedSuccess: "सफलतापूर्वक जोड़ा गया",
    submissionError: "सबमिट त्रुटि",
    somethingWentWrong: "कुछ गलत हो गया!",
    open: "खोलें",
    close: "बंद करें",
    loomNo: "लूम नं ",
    weaverPieceNo: "वीवर पीसी नं",
  },
};
const FoldingPendingList = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];
  // ── Modal state ──────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subGridId, setSubGridId] = useState("");
  const [defectArray, setDefectArray] = useState([]);

  const [dispatchInvalidate] = useInvalidateTags();


  const openModal = (item) => {
    setSelectedItem(item);
    setSubGridId(item.SUBGRIDID); // ✅ important
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setSubGridId("");

    setIsModalOpen(false);
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
      backgroundColor: state.isDisabled ? "white" : "white", // bg-gray-100 vs bg-white
      cursor: state.isDisabled ? "not-allowed" : "default",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", // blue-500 vs gray-300
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : base.boxShadow,
      "&:hover": {
        borderColor: state.isDisabled ? "#d1d5db" : "#9ca3af", // keep gray when disabled
      },
      zIndex: "999",
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
  const [lotNo, setLotNo] = useState("");

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
          poItemsId: "",
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
  } = useGetFoldingPendingByIdQuery({ lotNo }, { skip: !lotNo });

  const [updateData] = useUpdateFoldingPendingMutation();

  const syncFormWithDb = useCallback((data) => {
    setFoldingItems(data);
  }, []);

  console.log(foldingItems, "foldingItems");

  useEffect(() => {
    setFoldingItems([]);

    if (singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [singleData, syncFormWithDb]);

  const data = {
    foldingItems: foldingItems?.filter((i) => i.SUBGRIDID),
    lotNo,
  };

  const { data: defectItems } = useGetDefectsQuery(
    { subGridId },
    { skip: !subGridId },
  );
  console.log(defectItems, "defectItems");

  const handleSubmitCustom = async (callback, data) => {
    try {
      let returnData = await callback(data).unwrap();
      dispatchInvalidate()
      Swal.fire({
        title: t.addedSuccess,
        icon: "success",
        draggable: true,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t.submissionError,
        text: t.somethingWentWrong,
        timer: 2000,
      });
    }
  };

  const saveData = () => {
    if (foldingItems?.filter((i) => i.TABAPPROVAL)?.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t.approveAtLeastOne,
      });

      return;
    }

    handleSubmitCustom(updateData, data);
  };
  useEffect(() => {
    if (defectItems) {
      console.log("Defect API Data:", defectItems);
    }
  }, [defectItems]);

  useEffect(() => {
    if (defectItems?.data) {
      setDefectArray(defectItems.data);
    }
  }, [defectItems]);

  const flodingOptions = foldingPendingData?.data?.map((cloth) => ({
    label: cloth?.DOCID,
    value: cloth?.RECEIPTNO,
  }));

  const handleInputChange = (value, index, field) => {
    console.log(value, "value", index, "index", field, "field");
    const newBlend = structuredClone(foldingItems);

    newBlend[index][field] = value ? "YES" : "";
    setFoldingItems(newBlend);
  };

  return (
    <div className="h-[75vh] pt-0">
      <div className="flex bg-white justify-between py-1 rounded-lg">
        <h1 className="text-xl ml-2 font-bold text-center">{t.title}</h1>

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
            {t.save}
          </button>
        </div>
      </div>
      <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
        <form className=" p-2">
          {/* Lot Details */}
          <div>
            <div>
              <h2 className="text-lg font-semibold mb-2">{t.lotDetails}</h2>
              <div className="grid grid-cols-4 lg:grid-cols-10 gap-4 text-sm">
                {/* Cloth Name */}
                <div className="col-span-2 lg:col-span-2 z-40">
                  <label className="block font-medium mb-1">{t.lotName}</label>
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
                    placeholder={t.selectLot}
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
          <div className=" w-full rounded-lg overflow-y-auto mt-2 p-2">
            <div className="max-h-[45vh] overflow-y-auto overflow-x-auto">
              <table className="min-w-[900px]  w-full text-sm border table-fixed ">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-1 py-2 border w-12 text-center">
                      {t.sno}
                    </th>
                    <th className=" py-2 border w-40 text-center">
                      {t.basePcsNo}
                    </th>
                    <th className=" py-2 border w-36 text-center">
                      {t.splitPcsNo}
                    </th>

                    <th className=" py-2 border w-24 text-center">
                      {t.receiptMtrs}
                    </th>
                    <th className=" py-2 border w-40 text-center">
                      {t.loomNo}
                    </th>
                    <th className=" py-2 border w-36 text-center">
                      {t.weaverPieceNo}
                    </th>
                    <th className=" py-2 border w-36 text-center">
                      {t.startMtr}
                    </th>
                    <th className=" py-2 border w-36 text-center">
                      {t.endMtr}
                    </th>
                    <th className=" py-2 border w-20 text-center">
                      {t.meters}
                    </th>
                    <th className=" py-2 border w-40 text-center">
                      {t.checker}
                    </th>
                    <th className=" py-2 border w-20 text-center">
                      {t.tableNo}
                    </th>
                    <th className=" py-2 border w-44 text-center">
                      {t.defectPoints}
                    </th>

                    <th className="px-1 py-2 border w-16 text-center">
                      {t.open}
                    </th>
                    <th className="px-1 py-2 border w-20 text-center">
                      {t.approve}
                    </th>
                  </tr>
                </thead>

                <tbody>
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

                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.RECEIPTMETER?.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.LOOMNO}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.WEAVERPCSNO}
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
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-left">
                          {item?.CHECKERNAME}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.TABLENOTAB}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.TOTPOINTSTAB}
                        </td>

                        {/* ── Open icon ── */}
                        <td className="py-1 px-2 border text-center">
                          {item?.RECEIPTNO ? (
                            <button
                              type="button"
                              onClick={() => openModal(item)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title={t.open}
                            >
                              <MdOpenInNew size={18} />
                            </button>
                          ) : (
                            ""
                          )}
                        </td>

                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-center ">
                          {item?.RECEIPTNO ? (
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                handleInputChange(
                                  e.target.checked,
                                  index,
                                  "TABAPPROVAL",
                                )
                              }
                              // checked={!!item.TABAPPROVAL}
                              checked={item.TABAPPROVAL === "YES"}
                            />
                          ) : (
                            ""
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center  py-4 border text-gray-500 font-medium"
                      >
                        {t.noData}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* ── Detail Modal ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="w-full fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl lg:max-w-[60vw]  p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-base font-semibold text-gray-800">
                {/* {t.modalTitle} */}
                Defect Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            {defectArray?.length > 0 && (
              <div className="mt-6">
                <table className="w-full text-sm border table-fixed">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border w-6 px-1 py-1">S.No</th>
                      <th className="border w-44 px-1 py-1">Defect Name</th>
                      <th className="border w-12 px-1 py-1">Points</th>
                      <th className="border w-12 px-1 py-1">Times</th>
                      <th className="border w-12 px-1 py-1">Total</th>
                      <th className="border w-12 px-1 py-1">Meter At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {defectArray.map((defect, index) => (
                      <tr key={index} className="text-center">
                        <td className="border px-2 py-1">{index + 1}</td>
                        <td className="border px-2 py-1 text-left">
                          {defect.DEFECTNAME}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          {defect.DEFECTPOINS1}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          {defect.NOOGTIME}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          {defect.TOTPOINS1}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          {defect.MTRAT?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
              >
                {/* {t.close} */}
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoldingPendingList;
