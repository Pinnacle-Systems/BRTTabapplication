import React, { useState } from "react";
import Select from "react-select";

const ClothDelivery = () => {
  const [dcNo, setDcNo] = useState(null);
  const [barcode, setBarcode] = useState("");

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
      "&:hover": {
        borderColor: state.isDisabled ? "#d1d5db" : "#9ca3af",
      },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 3px", fontSize: "14px" }),
    input: (base) => ({ ...base, margin: 0, fontSize: "14px", padding: 0 }),
    singleValue: (base) => ({ ...base, fontSize: "14px" }),
    placeholder: (base) => ({ ...base, color: "black", fontSize: "14px" }),
    menu: (base) => ({ ...base, maxHeight: 140, fontSize: "14px" }),
    option: (base) => ({ ...base, fontSize: "14px", padding: "6px 8px" }),
    dropdownIndicator: () => ({}),
    indicatorSeparator: () => ({ display: "none" }),
    menuList: (base) => ({ ...base, maxHeight: 140 }),
  };

  return (
    <div className="h-full md:h-[75vh] pt-0">
      {/* Header */}
      <div className="flex flex-wrap bg-white justify-between items-center py-2 px-2 rounded-lg gap-2">
        <h1 className="text-lg md:text-xl font-bold">Cloth Delivery - Bale Verification</h1>
        <div className="flex gap-2">
          <button className="bg-red-600 text-white py-1.5 rounded-lg hover:bg-red-700 transition px-4 text-sm font-semibold whitespace-nowrap">
            Back
          </button>
          <button className="bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition px-4 text-sm font-semibold whitespace-nowrap">
            Save
          </button>
        </div>
      </div>

      <div className="h-auto md:h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl mt-2 p-3 md:p-4">
        {/* DC Details Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1 text-green-700 font-mono">DC Details</h2>
          <div className="flex flex-col gap-y-4 text-sm">
            {/* Dc No. and Party Name in same row for all views */}
            <div className="flex gap-x-4 items-end">
              <div className="w-[120px] sm:w-[150px]">
                <label className="block font-medium mb-1">Dc No.</label>
                <Select
                  styles={customSelectStyles}
                  options={[]}
                  placeholder="Select"
                  value={dcNo}
                  onChange={setDcNo}
                />
              </div>
              <div className="w-[180px] sm:w-[250px]">
                <label className="block font-medium mb-1">Party Name</label>
                <input
                  type="text"
                  readOnly
                  className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-4 mt-1">
              <div>
                <label className="block font-medium mb-1">Total Bales</label>
                <input
                  type="text"
                  readOnly
                  value="0"
                  className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Total Meters</label>
                <input
                  type="text"
                  readOnly
                  value="0.00"
                  className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Scanned Bales</label>
                <input
                  type="text"
                  readOnly
                  value="0"
                  className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Scanned Meters</label>
                <input
                  type="text"
                  readOnly
                  value="0.00"
                  className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Un-Scanned Bales</label>
                <input
                  type="text"
                  readOnly
                  value="0"
                  className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Un-Scanned Meters</label>
                <input
                  type="text"
                  readOnly
                  value="0.00"
                  className="w-full border bg-gray-100 rounded-lg px-2 py-1.5 h-[36px] text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BarCode Selection Section */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm w-full md:w-1/2">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">BarCode Selection</h2>
          <div className="flex flex-wrap sm:flex-nowrap items-end gap-3">
            <div className="flex flex-col flex-1 w-full">
              <label className="text-[10px] font-medium mb-1 uppercase tracking-wider text-gray-500">BAR CODE</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="border rounded-lg text-right px-2 py-1.5 w-full h-[36px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-bold text-xs shadow-sm transition-all uppercase tracking-wider h-[36px]">
              CHECK DELIVERY
            </button>
          </div>
        </div>

        {/* DC Bale Details Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1 text-green-700">DC Bale Details</h2>
          <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse table-auto">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-3 py-3 border-r text-center">Bale No.</th>
                    <th className="px-3 py-3 border-r text-center">Cloth Name</th>
                    <th className="px-3 py-3 border-r text-center">Pcs</th>
                    <th className="px-3 py-3 border-r text-center">Meters</th>
                    <th className="px-3 py-3 text-center">Weight</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-200">
                  <tr className="bg-white hover:bg-gray-50 transition-colors">
                    <td colSpan="5" className="text-center py-8 text-gray-500 font-bold">No Data Found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothDelivery;