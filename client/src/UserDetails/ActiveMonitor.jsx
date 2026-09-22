import { useState, useEffect } from "react";
import { useGetActiveUserDetailsQuery } from "../redux/services/userDetails.js";
import socket from "../Utils/socket.js";

const TAB = {
  ALL: "all",
  WORKERS: "workers",
  TABLES: "tables",
  TABLE_CHART: "table_chart",
};

const guessGenderEmoji = (name) => {
  if (!name) return "👨";
  const upper = name.toUpperCase().trim();
  // Common male names that might end in vowels
  const maleKeywords = ["DURAI", "SIVA", "RAJA", "BALA", "MUTHU", "KUMAR", "RAJ", "RAM", "HARI", "MANI", "KARTHICK", "PRABHU"];
  if (maleKeywords.some(k => upper.includes(k))) return "👨";
  // Female names commonly end in A, I, E, or Y
  if (/[AIEEYA]$/.test(upper)) return "👩";
  return "👨"; // Default to man
};

const ActiveMonitor = () => {
  const [activeTab, setActiveTab] = useState(TAB.ALL);

  const { data, isLoading, refetch } = useGetActiveUserDetailsQuery();

  // ── auto-refetch on socket events ──
  useEffect(() => {
    const handler = () => refetch();
    socket.on("tableUpdated", handler);
    socket.on("workStatusUpdated", handler);
    return () => {
      socket.off("tableUpdated", handler);
      socket.off("workStatusUpdated", handler);
    };
  }, [refetch]);

  console.log(data, "active monitor data");

  const workers = data?.data?.activeWorkers || [];
  const tables = data?.data?.lockedTables || [];

  const fmtDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-3 h-[75vh] flex flex-col">
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold">Active Monitor</h1>
        <div className="flex gap-2 text-xs">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
            {workers.length} Workers
          </span>
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
            {tables.length} Tables Locked
          </span>
          <button
            onClick={refetch}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-semibold transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Tab Buttons ── */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {[
          { key: TAB.ALL, label: "All" },
          { key: TAB.WORKERS, label: "Active Workers" },
          { key: TAB.TABLES, label: "Locked Tables" },
          { key: TAB.TABLE_CHART, label: "Table Chart" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition
              ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* ── Active Workers Table ── */}
        {(activeTab === TAB.ALL || activeTab === TAB.WORKERS) && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              Active Workers
              <span className="ml-2 text-blue-600">({workers.length})</span>
            </p>
            {workers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 border rounded-lg">
                No active workers
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-blue-50 text-gray-700 sticky top-0">
                    <tr>
                      <th className="border p-2 text-left">S.No</th>
                      <th className="border p-2 text-left">Checker</th>
                      <th className="border p-2 text-left">Section</th>
                      <th className="border p-2 text-left">Lot No</th>
                      <th className="border p-2 text-center">Piece</th>
                      <th className="border p-2 text-right">Meters</th>
                      <th className="border p-2 text-center">Tables</th>
                      <th className="border p-2 text-center">Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w, i) => (
                      <tr
                        key={w.ALLOCATIONID}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border p-2 text-center">{i + 1}</td>
                        <td className="border p-2 font-semibold uppercase">
                          {w.CHECKERNAME || "-"}
                        </td>
                        <td className="border p-2">{w.SECTIONNAME || "-"}</td>
                        <td className="border p-2">{w.LOTDOCID || "-"}</td>
                        <td className="border p-2 text-center">{w.PIECENO}</td>
                        <td className="border p-2 text-right">
                          {Number(w.METERS || 0).toFixed(2)}
                        </td>
                        <td className="border p-2 text-center">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                            {w.TABLENOS || "-"}
                          </span>
                        </td>
                        <td className="border p-2 text-center text-gray-500">
                          {fmtDate(w.CREATEDAT)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Locked Tables ── */}
        {(activeTab === TAB.ALL || activeTab === TAB.TABLES) && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              Locked Tables
              <span className="ml-2 text-red-600">({tables.length})</span>
            </p>
            {tables.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 border rounded-lg">
                No locked tables
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-red-50 text-gray-700 sticky top-0">
                    <tr>
                      <th className="border p-2 text-center">S.No</th>
                      <th className="border p-2 text-center">Table No</th>
                      <th className="border p-2 text-left">Locked By</th>
                      <th className="border p-2 text-center">Status</th>
                      <th className="border p-2 text-center">Locked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((tbl, i) => (
                      <tr
                        key={tbl.GTCHKTABLEMASTID}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border p-2 text-center">{i + 1}</td>
                        <td className="border p-2 text-center font-bold text-blue-700">
                          {tbl.CHECKINGNO}
                        </td>
                        <td className="border p-2 font-semibold uppercase">
                          {tbl.LOCKEDBYNAME || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                            {tbl.TABLEAVAILBLE}
                          </span>
                        </td>
                        <td className="border p-2 text-center text-gray-500">
                          {fmtDate(tbl.TABDATE)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Table Chart ── */}
        {activeTab === TAB.TABLE_CHART && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-4">
              Table Chart (1 - 20)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((tableNum) => {
                // Find worker for this table (handling comma separated if multiple)
                const worker = workers.find((w) => {
                  if (!w.TABLENOS) return false;
                  const assignedTables = String(w.TABLENOS)
                    .split(",")
                    .map((t) => t.trim());
                  return assignedTables.includes(String(tableNum));
                });
                return (
                  <div
                    key={tableNum}
                    className="flex flex-col items-center p-2 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
                  >
                    {worker ? (
                      <>
                        <div className="relative mb-2 mt-2">
                          <div className="text-5xl leading-none relative z-10">
                            {guessGenderEmoji(worker.CHECKERNAME)}
                          </div>
                          <div className="absolute bottom-0 -right-2 text-3xl z-20">
                            👕
                          </div>
                          <div className="absolute -top-3 -right-4 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-yellow-300 transform rotate-12 z-30 whitespace-nowrap">
                            Pc: {worker.PIECENO || "-"}
                          </div>
                        </div>
                        <div className="w-full bg-amber-600 rounded-t-lg h-12 flex flex-col items-center justify-center text-white shadow-inner relative overflow-hidden px-1">
                          <div className="text-[10px] opacity-80 uppercase tracking-widest leading-tight mt-0.5">
                            Table {tableNum}
                          </div>
                          <div className="text-xs font-bold truncate w-full text-center leading-tight">
                            Lot: {worker.LOTDOCID || "-"}
                          </div>
                        </div>
                        <div className="flex w-full justify-between px-3">
                          <div className="w-1.5 h-4 bg-amber-800 rounded-b-sm"></div>
                          <div className="w-1.5 h-4 bg-amber-800 rounded-b-sm"></div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold uppercase text-gray-700 text-center truncate w-full px-1">
                          {worker.CHECKERNAME || "Unknown"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-2 mt-2 opacity-30 grayscale">
                          <div className="text-5xl leading-none">👨</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-t-lg h-12 flex flex-col items-center justify-center text-gray-400 shadow-inner px-1">
                          <div className="text-[10px] uppercase tracking-widest">
                            Table {tableNum}
                          </div>
                        </div>
                        <div className="flex w-full justify-between px-3 opacity-50">
                          <div className="w-1.5 h-4 bg-gray-300 rounded-b-sm"></div>
                          <div className="w-1.5 h-4 bg-gray-300 rounded-b-sm"></div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-gray-400 text-center px-1">
                          Empty
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Combined: Worker + Tables view ── */}
        {activeTab === TAB.ALL && workers.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              Worker ↔ Table Map
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {workers.map((w) => (
                <div
                  key={w.ALLOCATIONID}
                  className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm uppercase text-gray-800">
                        {w.CHECKERNAME}
                      </p>
                      <p className="text-xs text-gray-500">{w.SECTIONNAME}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                      Table {w.TABLENOS || "-"}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                    <div className="bg-gray-50 rounded p-1 text-center">
                      <p className="text-gray-400">Lot</p>
                      <p className="font-semibold truncate">{w.LOTDOCID}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-1 text-center">
                      <p className="text-gray-400">Piece</p>
                      <p className="font-semibold">{w.PIECENO}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-1 text-center">
                      <p className="text-gray-400">Meters</p>
                      <p className="font-semibold">
                        {Number(w.METERS || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    Since {fmtDate(w.CREATEDAT)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveMonitor;
