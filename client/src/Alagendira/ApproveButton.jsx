import { useState } from "react";

export default function ApproveButton({ onApprove }) {
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(); 
      setApproved(true);
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setApproved(false), 2000); 
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading || approved}
      className={`flex items-center gap-2 px-4 py-2  w-48 rounded-lg transition-all duration-300 text-white font-medium
        ${approved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"}
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
          ></circle>
          <path
            className="opacity-75"
            fill="white"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      ) : approved ? (
        <svg
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4"
          />
        </svg>
      )}

      {approved ? "Approved" : loading ? "Approving..." : "Approve"}
    </button>
  );
}

