/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";
import {
  useGetLotsQuery,
  useGetFoldQuery,
  useUpdatePieceVerificationMutation,
} from "../../redux/services/pieceVerification";
import { useEffect } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import { useLanguage } from "../../Context/LanguageContext";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Piece Verification",
    save: "Save",
    lotDetails: "Lot Details",
    lotName: "Lot name",
    selectLot: "Select Lot",
    // Table headers
    sno: "S.No",
    pcsNo: "Pcs No",
    loomNo: "Loom No",
    folderName: "Folder Name",
    tableNo: "Table No",
    meters: "Meters",
    checkedMtrs: "Checked Mtrs",
    defectPoints: "Defect Points",
    grade: "Grade",
    weight: "Weight",
    approve: "Approve",
    noData: "No Data Found",
    // Swal
    approveAtLeastOne: "Add at least Approve One Folding Items",
    addedSuccess: "Added Successfully",
    submissionError: "Submission error",
    somethingWentWrong: "Something went wrong!",
  },
  ta: {
    title: "பீஸ் சரிபார்ப்பு",
    save: "சேமி",
    lotDetails: "லாட் விவரங்கள்",
    lotName: "லாட் பெயர்",
    selectLot: "லாட் தேர்ந்தெடு",
    sno: "எண்",
    pcsNo: "பீஸ் எண்",
    loomNo: "நெசவு எண்",
    folderName: "மடிப்பாளர் பெயர்",
    tableNo: "மேஜை",
    meters: "மீட்டர்கள்",
    checkedMtrs: "சரிபார்க்கப்பட்ட மீட்டர்",
    defectPoints: "குறைபாடு புள்ளிகள்",
    grade: "தரம்",
    weight: "எடை",
    approve: "அனுமதி",
    noData: "தரவு இல்லை",
    approveAtLeastOne: "குறைந்தது ஒரு துண்டை அனுமதிக்கவும்",
    addedSuccess: "வெற்றிகரமாக சேர்க்கப்பட்டது",
    submissionError: "சமர்ப்பிப்பு பிழை",
    somethingWentWrong: "ஏதோ தவறு நடந்தது!",
  },
  hi: {
    title: "पीस सत्यापन",
    save: "सहेजें",
    lotDetails: "लॉट विवरण",
    lotName: "लॉट नाम",
    selectLot: "लॉट चुनें",
    sno: "क्र.सं.",
    pcsNo: "पीस नं.",
    loomNo: "लूम नं.",
    folderName: "फोल्डर का नाम",
    tableNo: "टेबल नं.",
    meters: "मीटर",
    checkedMtrs: "जांचे गए मीटर",
    defectPoints: "दोष अंक",
    grade: "ग्रेड",
    weight: "वजन",
    approve: "अनुमोदन",
    noData: "कोई डेटा नहीं मिला",
    approveAtLeastOne: "कम से कम एक पीस को अनुमोदित करें",
    addedSuccess: "सफलतापूर्वक जोड़ा गया",
    submissionError: "सबमिट त्रुटि",
    somethingWentWrong: "कुछ गलत हो गया!",
  },
};

const PieceVerification = () => {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];
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

  const { data: lotData } = useGetLotsQuery();

  const { data: foldDetailsData } = useGetFoldQuery(
    { lotNo },
    { skip: !lotNo },
  );
  console.log(foldDetailsData, "foldDetailsData");
  const [updateData] = useUpdatePieceVerificationMutation();

  const syncFormWithDb = useCallback((data) => {
    setFoldingItems(data);
  }, []);

  console.log(foldingItems, "foldingItems");

  useEffect(() => {
    setFoldingItems([]);

    if (foldDetailsData?.data) {
      syncFormWithDb(foldDetailsData.data);
    }
  }, [foldDetailsData, syncFormWithDb]);
  console.log(foldingItems, "foldingItems");

  const data = {
    foldingItems: foldingItems?.filter((i) => i.ID),
    lotNo,
  };

  const handleSubmitCustom = async (callback, data) => {
    try {
      let returnData = await callback(data).unwrap();
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
    if (foldingItems?.filter((i) => i.NOTES)?.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t.approveAtLeastOne,
      });

      return;
    }

    handleSubmitCustom(updateData, data);
  };

  const lotOptions = lotData?.data?.map((lot) => ({
    label: lot?.DOCID,
    value: lot?.LOTNO,
  }));

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(foldingItems);

    if (field === "NOTES") {
      newBlend[index]["NOTES"] = value ? "YES" : "";
      newBlend[index]["FOLDINGAPPROVED"] = value ? "WAITING FOR APPROVAL" : "";
    } else {
      newBlend[index][field] = value ? "YES" : "";
    }

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
                    options={lotOptions}
                    value={
                      lotOptions?.find((option) => option.value === lotNo) ||
                      null
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
              <table className="min-w-[900px] w-full text-sm border table-fixed">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-1 py-2 border w-12 text-center">
                      {t.sno}
                    </th>
                    <th className="px-1 py-2 border w-32 text-center">
                      {t.pcsNo}
                    </th>
                    {/* <th className="px-1 py-2 border w-32 text-center">
                      {t.loomNo}
                    </th> */}
                    <th className="px-1 py-2 border w-40 text-center">
                      {t.folderName}
                    </th>
                    <th className="px-1 py-2 border w-20 text-center">
                      {t.tableNo}
                    </th>
                    <th className="px-1 py-2 border w-20 text-center">
                      {t.meters}
                    </th>
                    <th className="px-1 py-2 border w-48 text-center">
                      {t.checkedMtrs}
                    </th>
                    <th className="px-1 py-2 border w-44 text-center">
                      {t.defectPoints}
                    </th>
                    <th className="px-1 py-2 border w-24 text-center">
                      {t.grade}
                    </th>
                    <th className="px-1 py-2 border w-20 text-center">
                      {t.weight}
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
                          {item?.PCSNO}
                        </td>

                        {/* <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-left">
                          {item?.LOOM_NO}
                        </td> */}

                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-left">
                          {item?.USERNAME}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.TABLE_NO}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.MTR?.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.CHKMTR?.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-right">
                          {item?.DEFECTPOINTS}
                        </td>
                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-left">
                          {item?.GRADEE}
                        </td>
                        <td className="py-1 pr-1 border focus:ring-2 focus:border-2 text-right">
                          {item?.WEIGHTTT?.toFixed(3)}
                        </td>

                        <td className="py-1 px-2 border focus:ring-2 focus:border-2 text-center ">
                          {item?.PCSNO ? (
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                handleInputChange(
                                  e.target.checked,
                                  index,
                                  "NOTES",
                                )
                              }
                              checked={!!item.NOTES}
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
    </div>
  );
};

export default PieceVerification;
