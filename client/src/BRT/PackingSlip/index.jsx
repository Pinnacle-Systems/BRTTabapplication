import React, { useState } from "react";
import Select from "react-select";
import { MdDelete } from "react-icons/md";

const PackingSlip = () => {
  const [packingType, setPackingType] = useState("BALE");
  const [baleGroup, setBaleGroup] = useState("AL");
  const [baleNo1, setBaleNo1] = useState("");
  const [baleNo3, setBaleNo3] = useState("");
  const [totalPcs, setTotalPcs] = useState("");
  const [totalMeters, setTotalMeters] = useState("");

  const baleGroups = [
    { id: "AL", label: "AL", color: "bg-[#004a99]" },
    { id: "ARJ", label: "ARJ", color: "bg-[#8dc63f]" },
    { id: "PL", label: "PL", color: "bg-[#00aeef]" },
    { id: "SU", label: "SU", color: "bg-[#d14124]" },
    { id: "SUL", label: "SUL", color: "bg-[#e3853d]" },
  ];

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

  const handleBaleGroupSelect = (group) => {
    setBaleGroup(group);
  };

  return (
    <div className="h-full md:h-[75vh] pt-0">
      {/* Header */}
      <div className="flex flex-wrap bg-white justify-between items-center py-2 px-2 rounded-lg gap-2">
        <h1 className="text-lg md:text-xl font-bold">Packing Slip</h1>
        <div className="flex gap-2">
          <button
            className="bg-red-600 text-white py-1.5 rounded-lg hover:bg-red-700 transition px-4 text-sm font-semibold whitespace-nowrap"
          >
            Back
          </button>
          <button
            className="bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition px-4 text-sm font-semibold whitespace-nowrap"
          >
            Save
          </button>
        </div>
      </div>

      <div className="h-auto md:h-[70vh] overflow-y-auto bg-white shadow-lg rounded-xl mt-2 p-3 md:p-3">
        {/* Selection Section */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold mb- border-b pb-1">Selection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-6 text-sm">
            <div className="sm:col-span-1 lg:col-span-3">
              <label className="block font-medium mb-2">Select Packing Type</label>
              <div className="flex flex-wrap gap-4">
                {["BALE", "ROLL", "BUNDLE"].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="packingType"
                      value={type}
                      checked={packingType === type}
                      onChange={(e) => setPackingType(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-1 lg:col-span-7">
              <label className="block font-medium mb-2">Select Bale No.</label>
              <div className="flex flex-wrap gap-2">
                {baleGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleBaleGroupSelect(group.id)}
                    className={`${group.color} text-white py-2 px-3 rounded-md font-bold text-xs shadow-sm hover:opacity-90 transition-opacity uppercase flex-1 sm:flex-none min-w-[60px] ${baleGroup === group.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bale Details Section */}
        <div className="mb-2">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1">Bale Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10 gap-4 text-sm">
            <div className="md:col-span-2 xl:col-span-4">
              <label className="block font-medium mb-1">Bale No</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={baleNo1}
                  onChange={(e) => setBaleNo1(e.target.value)}
                  className="w-1/4 border rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={baleGroup}
                  onChange={(e) => setBaleGroup(e.target.value)}
                  readOnly
                  className="w-1/4 border bg-gray-100 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={baleNo3}
                  onChange={(e) => setBaleNo3(e.target.value)}
                  className="w-1/4 border rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="xl:col-span-2">
              <label className="block font-medium mb-1">Packing Type</label>
              <select
                value={packingType}
                onChange={(e) => setPackingType(e.target.value)}
                className="w-full bg-white border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="BALE">BALE</option>
                <option value="ROLL">ROLL</option>
                <option value="BUNDLE">BUNDLE</option>
              </select>
            </div>

            <div className="xl:col-span-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Total Pcs</label>
                <input
                  type="number"
                  value={totalPcs}
                  onChange={(e) => setTotalPcs(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Total Meters</label>
                <input
                  type="number"
                  value={totalMeters}
                  onChange={(e) => setTotalMeters(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Print Bale and BarCode Selection Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Print Bale Section - MATCHING BARCODE STYLE */}
          {/* <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Print Bale</h3>
            <div className="flex flex-wrap sm:flex-nowrap items-end gap-3">
              <div className="flex flex-col flex-1 w-full">
                <label className="text-sm font-medium mb-1 uppercase text-[10px] tracking-wider">Bale No</label>
                <input
                  type="text"
                  className="border rounded-lg text-right px-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button className="bg-[#004a99] hover:bg-[#003d7e] text-white px-6 py-2 rounded-lg font-bold text-xs shadow-sm transition-all uppercase tracking-wider h-[34px]">
                Print Bale
              </button>
            </div>
          </div> */}

          {/* BarCode Selection Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">BarCode Selection</h3>
            <div className="flex flex-wrap sm:flex-nowrap items-end gap-3">
              <div className="flex flex-col flex-1 w-full">
                <label className="text-sm font-medium mb-1 uppercase text-[10px] tracking-wider">Bar Code</label>
                <input
                  type="text"
                  className="border rounded-lg text-right px-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button className="bg-green-600 px-6 text-white rounded-lg py-2 whitespace-nowrap hover:bg-green-700 transition font-semibold text-xs w-full sm:w-auto">
                Click & Add Pcs Details
              </button>
            </div>
          </div>
        </div>

        {/* Piece Details Section */}
        <div className="mt-2">
          <h2 className="text-lg font-semibold mb-3 border-b pb-1">Piece Details</h2>
          <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse table-auto min-w-[1000px]">
                <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="px-3 py-3 border-r text-center w-[50px]">S.No</th>
                    <th className="px-3 py-3 border-r text-center w-[100px]">Lot No</th>
                    <th className="px-3 py-3 border-r text-center w-[100px]">Pcs No</th>
                    <th className="px-3 py-3 border-r text-center w-[100px]">Loom No</th>
                    <th className="px-3 py-3 border-r text-center w-[80px]">Type</th>
                    <th className="px-3 py-3 border-r text-center w-[100px]">Meters</th>
                    <th className="px-3 py-3 border-r text-center w-[100px]">Weight</th>
                    <th className="px-3 py-3 border-r text-center w-[100px]">Wgt/Mtr</th>
                    <th className="px-3 py-3 border-r text-center w-[180px]">Cloth Name</th>
                    <th className="px-3 py-3 border-r text-center w-[80px]">Fold %</th>
                    <th className="px-3 py-3 border-r text-center w-[180px]">Weaver Name</th>
                    <th className="px-3 py-3 text-center w-[80px]">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-200">
                  <tr className="bg-white hover:bg-gray-50 transition-colors">
                    <td colSpan="12" className="text-center py-8 text-gray-500 font-bold">No Data Found</td>
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

export default PackingSlip;
