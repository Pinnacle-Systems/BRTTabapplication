import { useState } from "react";
import { FaSearch, FaCheckCircle } from "react-icons/fa";

export default function InspectButton({ onApprove }) {
  const [loading, setLoading] = useState(false);
  const [inspected, setInspected] = useState(false);

  const handleInspect = async () => {
    setLoading(true);
    try {
      await onApprove();
      setInspected(true);
    } catch (error) {
      console.error("Inspection failed:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setInspected(false), 2000);
    }
  };

  return (
    <button
      onClick={handleInspect}
      disabled={loading || inspected}
      className={`flex items-center gap-2 px-4 py-2 w-48 rounded-lg transition-all duration-300 text-white font-medium
        ${inspected ? "bg-green-600" : "bg-teal-600 hover:bg-teal-700"}
        ${loading ? "opacity-70 cursor-wait" : ""}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="white"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="white"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : inspected ? (
        <FaCheckCircle className="h-5 w-5 text-white" />
      ) : (
        <FaSearch className="h-5 w-5 text-white" />
      )}

      {inspected ? "Inspected" : loading ? "Inspecting..." : "Inspect"}
    </button>
  );
}