import React from "react";
import { useState } from "react";

const FoldingRangeMaster = () => {
  const [name, setName] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Range Master
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              From
            </label>
            <input
              type="text"
              placeholder="Starting Range"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="text"
              placeholder="Ending Range"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-3 text-sm rounded shadow-sm hover:shadow transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoldingRangeMaster;
