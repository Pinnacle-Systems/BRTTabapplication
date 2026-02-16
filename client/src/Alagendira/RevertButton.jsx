import { useState } from "react";
import { FaUndoAlt, FaCheckCircle } from "react-icons/fa";

export default function RevertButton({ onApprove }) {
  const [loading, setLoading] = useState(false);
  const [reverted, setReverted] = useState(false);

  const handleRevert = async () => {
    setLoading(true);
    try {
      await onApprove();
      setReverted(true);
    } catch (error) {
      console.error("Revert failed:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setReverted(false), 2000);
    }
  };

  return (
    <button
      onClick={handleRevert}
      disabled={loading || reverted}
      className={`flex items-center gap-2 px-4 py-2 w-48 rounded-lg transition-all duration-300 text-white font-medium
        ${reverted ? "bg-green-600" : "bg-red-600 hover:bg-red-700"}
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
      ) : reverted ? (
        <FaCheckCircle className="h-5 w-5 text-white" />
      ) : (
        <FaUndoAlt className="h-5 w-5 text-white" />
      )}

      {reverted ? "Reverted" : loading ? "Reverting..." : "Revert"}
    </button>
  );
}
