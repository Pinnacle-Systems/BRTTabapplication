import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import { useGetBranchDetailQuery } from "../redux/services/LotDetailData";

function BranchFinYearSelection() {
  const navigate = useNavigate();
  const [branch, setBranch] = useState("");
  const storedUsername = localStorage.getItem("userName");

  const { data: branchData, isLoading, error } = useGetBranchDetailQuery({ params: storedUsername });


  useEffect(() => {
    navigate("/dashboard");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // if (branch ) {
    //   secureLocalStorage.setItem("selectedBranch", branch);
    //   navigate("/dashboard");
    // }

    navigate("/dashboard");

  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading branches and financial years...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#03A454]">BRT Spinner Private Limited</h2>
            <div className="h-1 w-16 bg-[#03A454] mx-auto mt-2 rounded-full"></div>
          </div>

          <h1 className="text-xl font-semibold text-center mb-6">Select Branch</h1>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded mb-4">
              <p className="text-red-700 text-sm">{error.message || "Failed to fetch data"}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-[#03A454] focus:border-[#03A454]"
                required
              >
                <option value="">Select Branch</option>
                {branchData?.data?.map((br) => (
                  <option key={br.GCOMPCODE} value={br.GCOMPCODE}>
                    {br.GCOMPCODE}
                  </option>
                ))}
              </select>
            </div>



            <button
              type="submit"
              className="w-full py-2 bg-[#03A454] hover:bg-[#028a44] text-white font-semibold rounded-lg transition"
              disabled={!branch}
            >
              Continue to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BranchFinYearSelection;
