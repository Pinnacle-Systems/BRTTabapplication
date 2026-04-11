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
import { useLanguage } from "../../Context/LanguageContext"; // ← import context

// ─── Translations ────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: "Piece Receipt",
    back: "Back",
    save: "Save",
    lotDetails: "Lot Details",
    lotNo: "Lot No",
    selectLot: "Select Lot",
    clothName: "Cloth Name",
    selectClothName: "Select Cloth Name",
    receiptPcs: "Receipt Pcs",
    metersInDC: "Meters in DC",
    pieceDetails: "Piece Details",
    pieceNo: "Piece No",
    meters: "Meters",
    addBtn: "+ Add",
    sno: "S.No",
    total: "Total",
    actions: "Actions",
    noData: "No Data Found",
    summary: "Summary",
    enteredPcs: "Entered Pcs",
    balancePcs: "Balance Pcs",
    enteredMtrs: "Entered Mtrs",
    balanceMtrs: "Balance Mtrs",
    loading: "Loading...",
    errorLoading: "Error loading lots",
    // Alerts
    alertSelectLotCloth: "Select Lot and Cloth",
    alertAddPiece: "Add at least one piece",
    alertEnterPieceAndMeter: "Enter Piece No and Meter",
    alertPieceNotZero: "Piece Number cannot be 0",
    alertMeterNotZero: "Meter cannot be 0",
    alertExceededDCMeter: "Meter exceeding the DC Meter",
    alertTotalExceeded: "Meter exceeding the DC Meter",
    alertPieceExists: "Piece Number Already Exists",
    alertPieceGreaterThanReceipt:
      "Piece Number cannot be greater than Receipt Pieces",
    alertPieceAlreadyExists: "Piece Number already exists",
    alertTotalMeterExceeded: "Total meter exceeding DC Meter",
    alertAddedSuccess: "Added Successfully",
    alertSubmitError: "Something went wrong!",
    alertSubmitErrorTitle: "Submission error",
    exceeded: "Exceeded",
  },
  ta: {
    title: "துண்டு ரசீது",
    back: "பின்செல்",
    save: "சேமி",
    lotDetails: "லாட் விவரங்கள்",
    lotNo: "லாட் எண்",
    selectLot: "லாட் தேர்ந்தெடு",
    clothName: "துணி பெயர்",
    selectClothName: "துணி பெயரை தேர்ந்தெடு",
    receiptPcs: "ரசீது துண்டுகள்",
    metersInDC: "DC மீட்டர்கள்",
    pieceDetails: "துண்டு விவரங்கள்",
    pieceNo: "துண்டு எண்",
    meters: "மீட்டர்கள்",
    addBtn: "+ சேர்",
    sno: "வ.எண்",
    total: "மொத்தம்",
    actions: "செயல்கள்",
    noData: "தரவு இல்லை",
    summary: "சுருக்கம்",
    enteredPcs: "உள்ளிட்ட துண்டுகள்",
    balancePcs: "மீதமுள்ள துண்டுகள்",
    enteredMtrs: "உள்ளிட்ட மீட்டர்கள்",
    balanceMtrs: "மீதமுள்ள மீட்டர்கள்",
    loading: "ஏற்றுகிறது...",
    errorLoading: "லாட்டை ஏற்றுவதில் பிழை",
    // Alerts
    alertSelectLotCloth: "லாட் மற்றும் துணியை தேர்ந்தெடுக்கவும்",
    alertAddPiece: "குறைந்தது ஒரு துண்டு சேர்க்கவும்",
    alertEnterPieceAndMeter: "துண்டு எண் மற்றும் மீட்டர் உள்ளிடவும்",
    alertPieceNotZero: "துண்டு எண் 0 ஆக இருக்கக் கூடாது",
    alertMeterNotZero: "மீட்டர் 0 ஆக இருக்கக் கூடாது",
    alertExceededDCMeter: "மீட்டர் DC மீட்டரை மீறுகிறது",
    alertTotalExceeded: "மீட்டர் DC மீட்டரை மீறுகிறது",
    alertPieceExists: "துண்டு எண் ஏற்கனவே உள்ளது",
    alertPieceGreaterThanReceipt:
      "துண்டு எண் ரசீது துண்டுகளை விட அதிகமாக இருக்கக் கூடாது",
    alertPieceAlreadyExists: "துண்டு எண் ஏற்கனவே உள்ளது",
    alertTotalMeterExceeded: "மொத்த மீட்டர் DC மீட்டரை மீறுகிறது",
    alertAddedSuccess: "வெற்றிகரமாக சேர்க்கப்பட்டது",
    alertSubmitError: "ஏதோ தவறு நடந்தது!",
    alertSubmitErrorTitle: "சமர்ப்பிப்பு பிழை",
    exceeded: "மீறியது",
  },
  hi: {
    title: "पीस रसीद",
    back: "वापस",
    save: "सहेजें",
    lotDetails: "लॉट विवरण",
    lotNo: "लॉट नं.",
    selectLot: "लॉट चुनें",
    clothName: "कपड़े का नाम",
    selectClothName: "कपड़े का नाम चुनें",
    receiptPcs: "रसीद पीस",
    metersInDC: "DC में मीटर",
    pieceDetails: "पीस विवरण",
    pieceNo: "पीस नं.",
    meters: "मीटर",
    addBtn: "+ जोड़ें",
    sno: "क्र.सं.",
    total: "कुल",
    actions: "कार्रवाई",
    noData: "कोई डेटा नहीं मिला",
    summary: "सारांश",
    enteredPcs: "दर्ज पीस",
    balancePcs: "शेष पीस",
    enteredMtrs: "दर्ज मीटर",
    balanceMtrs: "शेष मीटर",
    loading: "लोड हो रहा है...",
    errorLoading: "लॉट लोड करने में त्रुटि",
    // Alerts
    alertSelectLotCloth: "लॉट और कपड़ा चुनें",
    alertAddPiece: "कम से कम एक पीस जोड़ें",
    alertEnterPieceAndMeter: "पीस नं. और मीटर दर्ज करें",
    alertPieceNotZero: "पीस नंबर 0 नहीं हो सकता",
    alertMeterNotZero: "मीटर 0 नहीं हो सकता",
    alertExceededDCMeter: "मीटर DC मीटर से अधिक है",
    alertTotalExceeded: "मीटर DC मीटर से अधिक है",
    alertPieceExists: "पीस नंबर पहले से मौजूद है",
    alertPieceGreaterThanReceipt: "पीस नंबर रसीद पीस से अधिक नहीं हो सकता",
    alertPieceAlreadyExists: "पीस नंबर पहले से मौजूद है",
    alertTotalMeterExceeded: "कुल मीटर DC मीटर से अधिक है",
    alertAddedSuccess: "सफलतापूर्वक जोड़ा गया",
    alertSubmitError: "कुछ गलत हो गया!",
    alertSubmitErrorTitle: "सबमिट त्रुटि",
    exceeded: "अधिक",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const PieceReceipt = ({
  onClose,
  selectedLotId,
  setSelectedLotId,
  selectedClothId,
  setSelectedClothId,
  setSelectedGridId,
  selectedGridId,
}) => {
  // ← Get language from global context (set by NavbarHeader)
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations["en"];

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
      backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
      cursor: state.isDisabled ? "not-allowed" : "default",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : base.boxShadow,
      "&:hover": { borderColor: state.isDisabled ? "#d1d5db" : "#9ca3af" },
      zIndex: 9999,
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
    placeholder: (base) => ({ ...base, color: "black", fontSize: "14px" }),
    menu: (base, state) => ({
      ...base,
      maxHeight: 140,
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
    menuList: (base) => ({ ...base, maxHeight: 140 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const { data: lots, error, isLoading } = useGetLotPieceReceiptQuery();
  const { data: lotReceiptDetails } = useGetLotPieceReceiptDetailsQuery(
    selectedLotId,
    { skip: !selectedLotId },
  );
  const { data: singleData } = useGetPieceReceiptByIdQuery(
    { selectedLotId, selectedGridId },
    { skip: !selectedLotId || !selectedGridId },
  );

  const [updateData] = useUpdatePieceReceiptMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      const mapped =
        data?.[0]?.lotItems?.flatMap((item) =>
          item?.lotItemsSubGrid?.map((val) => ({
            pcNo: Number(val?.sno),
            meters: Number(val?.mtr).toFixed(2),
            _isDbRow: true,
          })),
        ) || [];
      setLotItems(mapped);
    },
    [selectedLotId, selectedGridId],
  );

  useEffect(() => {
    setLotItems([]);
    if (selectedClothId && singleData?.data) syncFormWithDb(singleData.data);
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
      CHK,
      meters: parseFloat(item.meters),
    })),
  };

  const handleSubmitCustom = async (callback, data) => {
    try {
      await callback(data).unwrap();
      Swal.fire({
        title: t.alertAddedSuccess,
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
    } catch {
      Swal.fire({
        icon: "error",
        title: t.alertSubmitErrorTitle,
        text: t.alertSubmitError,
        timer: 2000,
      });
    }
  };

  const saveData = () => {
    if (!selectedLotId || !selectedClothId) {
      Swal.fire({
        icon: "warning",
        title: t.alertSelectLotCloth,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (lotItems?.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t.alertAddPiece,
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

  const clothOptions = lotReceiptDetails?.data?.map((cloth) => ({
    label: cloth?.CLOTHNAME,
    value: cloth?.CLOTHID,
  }));

  useEffect(() => {
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
    if (lotItems?.length === Number(receiptPcs)) setPieceNumber("");
  }, [lotItems, receiptPcs]);

  useEffect(() => {
    if (!receiptPcs) return;
    if (lotItems.length === 0) {
      setPieceNumber("");
      return;
    }
    const maxPieceNo = Math.max(
      ...lotItems?.map((item) => Number(item?.pcNo || 0)),
    );
    if (maxPieceNo >= Number(receiptPcs)) {
      setPieceNumber("");
      return;
    }
    setPieceNumber(maxPieceNo + 1);
  }, [lotItems, receiptPcs]);

  const handleAddItem = (e) => {
    e.preventDefault();
    const pc = Number(pieceNo);
    const mtr = Number(meter);

    if (!pieceNo || !meter) {
      Swal.fire({
        title: t.alertEnterPieceAndMeter,
        icon: "warning",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    if (isNaN(pc) || pc <= 0) {
      Swal.fire({
        title: t.alertPieceNotZero,
        icon: "warning",
        timer: 2000,
      });
      return;
    }
    // ❗ Meter validation (NEW)
    if (isNaN(mtr) || mtr <= 0) {
      Swal.fire({
        title: t.alertMeterNotZero,
        icon: "warning",
        timer: 2000,
      });
      return;
    }
    const newMeter = Number(meter);
    if (newMeter > Number(dcMeter)) {
      Swal.fire({
        icon: "error",
        title: t.exceeded,
        text: t.alertExceededDCMeter,
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    const totalMeters = lotItems?.reduce(
      (sum, item) => sum + Number(item?.meters || 0),
      0,
    );
    if (totalMeters + newMeter > Number(dcMeter)) {
      Swal.fire({
        title: t.exceeded,
        icon: "error",
        text: t.alertTotalExceeded,
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    const exists = lotItems?.some(
      (item) => Number(item?.pcNo) === Number(pieceNo),
    );
    if (exists) {
      Swal.fire({
        title: t.alertPieceExists,
        icon: "warning",
        timer: 2000,
        showConfirmButton: true,
      });
      return;
    }
    const newItem = {
      selectedLotId,
      selectedClothId,
      pcNo: Number(pieceNo),
      meters: Number(meter).toFixed(2),
      _isDbRow: false,
    };
    setLotItems((prev) => [...prev, structuredClone(newItem)]);
    setPieceNumber("");
    setMeter("");
    setTimeout(() => {
      pieceNoRef.current?.focus();
    }, 100);
  };

  const handleDeleteItem = (indexToDelete) => {
    const clonedItems = structuredClone(lotItems);
    clonedItems?.splice(indexToDelete, 1);
    setLotItems(clonedItems);
  };

  const handleChange = (index, value, field) => {
    const updated = structuredClone(lotItems);
    if (field === "pcNo") {
      const num = Number(value);
      if (num === 0) {
        Swal.fire({
          title: t.alertPieceNotZero,
          icon: "warning",
          timer: 2000,
          showConfirmButton: true,
        });
        return;
      }
      if (num > Number(receiptPcs)) {
        Swal.fire({
          title: t.alertPieceGreaterThanReceipt,
          icon: "error",
          timer: 2000,
          showConfirmButton: true,
        });
        return;
      }
      const exists = updated?.some(
        (item, i) => i !== index && Number(item.pcNo) === Number(value),
      );
      if (exists) {
        Swal.fire({
          title: t.alertPieceAlreadyExists,
          icon: "warning",
          timer: 2000,
          showConfirmButton: true,
        });
        return;
      }
    }
    if (field === "meters") {
      const newMeter = Number(value);
      if (newMeter > Number(dcMeter)) {
        Swal.fire({
          title: t.exceeded,
          text: t.alertExceededDCMeter,
          icon: "error",
          timer: 2000,
          showConfirmButton: true,
        });
        return;
      }
      const totalMeters = updated?.reduce((sum, item, i) => {
        if (i === index) return sum;
        return sum + Number(item.meters || 0);
      }, 0);
      if (totalMeters + newMeter > Number(dcMeter)) {
        Swal.fire({
          title: t.exceeded,
          text: t.alertTotalMeterExceeded,
          icon: "error",
          timer: 2000,
          showConfirmButton: true,
        });
        return;
      }
    }
    updated[index][field] = field === "pcNo" ? Number(value) : value;
    setLotItems(updated);
  };

  if (isLoading) return <div className="p-6 text-center">{t.loading}</div>;
  if (error)
    return <div className="p-6 text-center text-red-500">{t.errorLoading}</div>;

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
      {/* ── Header ── */}
      <div className="flex bg-white justify-between py-1 rounded-lg items-center">
        <h1 className="text-xl ml-2 font-bold text-center">{t.title}</h1>

        <div className="flex items-center gap-2 mr-2">
          {/* <button
            onClick={onClose}
            className="bg-red-600 text-white py-1 rounded-lg hover:bg-red-700 transition px-2"
          >
            {t.back}
          </button> */}
          <button
            onClick={saveData}
            className="bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 transition px-2"
          >
            {t.save}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="h-[70vh] overflow-x-auto bg-white shadow-lg rounded-xl mt-2">
        <form className="p-2">
          {/* Lot Details */}
          <div>
            <h2 className="text-lg font-semibold mb-2">{t.lotDetails}</h2>
            <div className="grid grid-cols-4 lg:grid-cols-10 gap-4 text-sm">
              {/* Lot No */}
              <div className="col-span-2 lg:col-span-2">
                <label className="block font-medium mb-1">{t.lotNo}</label>
                <Select
                  ref={lotIdRef}
                  options={lotOptions}
                  value={
                    lotOptions?.find(
                      (option) => option.value === selectedLotId,
                    ) || null
                  }
                  onChange={(selectedOption) =>
                    setSelectedLotId(selectedOption?.value || "")
                  }
                  placeholder={t.selectLot}
                  isClearable={false}
                  styles={customSelectStyles}
                  autoFocus
                  isSearchable={true}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>

              {/* Cloth Name */}
              <div className="col-span-4 lg:col-span-5">
                <label className="block font-medium mb-1">{t.clothName}</label>
                <select
                  value={selectedClothId}
                  onChange={(e) => setSelectedClothId(e.target.value)}
                  className="w-full bg-white border rounded-lg px-2 py-[7px]"
                >
                  <option value="">{t.selectClothName}</option>
                  {clothOptions?.map((cloth) => (
                    <option key={cloth?.value} value={cloth?.value}>
                      {cloth?.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Receipt Pcs */}
              <div className="col-span-1 lg:col-span-1 lg:min-w-[8rem]">
                <label className="block font-medium mb-1">{t.receiptPcs}</label>
                <input
                  type="number"
                  value={receiptPcs}
                  readOnly
                  className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-100"
                />
              </div>

              {/* Meters in DC */}
              <div className="col-span-1 lg:col-span-1 lg:ml-3">
                <label className="block font-medium mb-1">{t.metersInDC}</label>
                <input
                  type="number"
                  value={Number(dcMeter || 0)?.toFixed(2)}
                  readOnly
                  className="w-full border rounded-lg px-1 py-1.5 text-right bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Piece Details */}
          <div>
            <h2 className="text-lg font-semibold mt-2 pb-2">
              {t.pieceDetails}
            </h2>
            <div className="flex items-end gap-4 text-sm w-full">
              {/* Piece No */}
              <div className="flex flex-col flex-1 max-w-[8rem]">
                <label className="text-sm font-medium mb-1">{t.pieceNo}</label>
                <input
                  type="number"
                  name="pieceNo"
                  value={pieceNo}
                  max={receiptPcs}
                  min={1}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (num > receiptPcs) {
                      Swal.fire({
                        title: t.alertPieceGreaterThanReceipt,
                        icon: "error",
                        timer: 2000,
                        showConfirmButton: true,
                      });
                      return;
                    }
                    setPieceNumber(e.target.value);
                  }}
                  disabled={
                    !selectedClothId || lotItems.length === Number(receiptPcs)
                  }
                  className="border rounded-lg text-right px-2 py-1.5 w-full"
                />
              </div>

              {/* Meters */}
              <div className="flex flex-col flex-1 max-w-[8rem]">
                <label className="text-sm font-medium mb-1">{t.meters}</label>
                <input
                  ref={pieceNoRef}
                  type="number"
                  name="meter"
                  value={meter}
                  disabled={!pieceNo}
                  onChange={(e) => setMeter(e.target.value)}
                  className="border rounded-lg text-right px-2 py-1.5 w-full"
                />
              </div>

              {/* Add Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleAddItem}
                  className="bg-green-600 px-4 text-white rounded-lg py-2 whitespace-nowrap"
                >
                  {t.addBtn}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Table + Summary */}
        <div className="flex gap-4 mt-2">
          <div className="w-[70vw] lg:w-[30vw] rounded-lg overflow-hidden mt-2 p-2">
            <div className="max-h-[35vh] overflow-y-auto overflow-x-auto">
              <table className="min-w-full text-sm border-collapse table-fixed">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 border w-4 text-center">
                      {t.sno}
                    </th>
                    <th className="px-2 py-2 border w-28 text-center">
                      {t.pieceNo}
                    </th>
                    <th className="px-2 py-2 border text-center w-28">
                      {t.meters}
                    </th>
                    <th className="px-2 py-2 border text-center w-16">
                      {t.actions}
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
                            className="focus:border-none pr-1 bg-transparent focus:outline-none text-right w-full"
                          />
                        </td>
                        <td className="py-1 border text-right focus:ring-2 focus:border-2">
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
                            className="focus:border-none pr-1 bg-transparent focus:outline-none text-right w-full"
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
                        className="text-center py-4 border text-gray-500 font-medium"
                      >
                        {t.noData}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  {lotItems?.length > 0 && (
                    <tr className="bg-gray-100">
                      <td className="border font-bold text-center"></td>
                      <td className="text-center border font-bold py-1">
                        {t.total}
                      </td>
                      <td className="text-right border font-bold pr-1 py-1">
                        {totalMetersTable}
                      </td>
                      <td className="text-right border font-bold px-2 py-1"></td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="min-w-[180px] h-fit mt-4 border rounded-lg bg-gray-50 p-3 mr-2 shadow">
            <h3 className="font-semibold text-sm mb-2 text-gray-700">
              {t.summary}
            </h3>
            <div className="flex justify-between text-sm mb-1">
              <span>{t.enteredPcs}</span>
              <span className="font-bold">{totalPieces}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 text-red-600">
              <span>{t.balancePcs}</span>
              <span className="font-bold">{balancePcs}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-sm mb-1">
              <span>{t.enteredMtrs}</span>
              <span className="font-bold">{totalMetersTable}</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>{t.balanceMtrs}</span>
              <span className="font-bold">{balanceMeters}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieceReceipt;
