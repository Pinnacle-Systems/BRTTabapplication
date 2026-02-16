import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import OutlinedCard from "../Users/Users";
import { push, remove } from "../redux/features/opentabs";
import AiMessageButton from '../Alagendira/AiMessageButton';
import {
    CLOSE_ICON,
    MENU_ICON,
    LOT_ICON,
    LOADING_ICON,
    UNLOADING_ICON,
    APPROVAL_ICON,
    INSPECTION_ICON,
    REVERT_ICON,
    SUN_ICON,
    MOON_ICON
} from "../icons";
import useOutsideClick from "../CustomHooks/handleOutsideClick";
import LotPreparation from "../Alagendira/LotPreparation";
import LoadingPage from "../Alagendira/LoadingPage";
import ApprovalPreparation from "../Alagendira/ApprovalPage";
import Inspection from "../Alagendira/Inspection"
import UnLoadingPreparation from "../Alagendira/UnloadingPage";
import Revert from "../Alagendira/Revert"
import { useGetLotDetailQuery,useGetLoadingDetailQuery,useGetUnLoadingDetailQuery,
    useGetApprovalDetailQuery, useGetRevertDetailQuery } from '../redux/services/LotDetailData';
import { useGetUserslogQuery } from "../redux/userservice";
import { useGetInspectionDetailQuery } from "../redux/services/LotDetailData";
import { PieceReceipt, TableLotAllot,DefectEntry,FoldingPendingList,PieceFoldingEntry,PackingSlip,PieceVerification } from "../BRT";


const ActiveTabList = () => {
    const openTabs = useSelector((state) => state.openTabs);
    const [docId, setDocId] = useState('');
    const dispatch = useDispatch();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [darkMode, setDarkMode] = useState(false);
    const tabContainerRef = useRef(null);
    const [count, setCount] = useState(0)
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const {
        data: apiResponse,
           } = useGetLotDetailQuery();
           const {data:loadingResponse} = useGetLoadingDetailQuery();
           const {data:UnLoading} = useGetUnLoadingDetailQuery()
           const {data:approval} = useGetApprovalDetailQuery()
           const { data: revert} = useGetRevertDetailQuery()
           const {data : InspectionDet} =  useGetInspectionDetailQuery()

useEffect(() => {
  const uniquePairs = new Set(
    apiResponse?.data?.map(item => `${item.BATCHNO}_${item.PROCESSNAME}`)
  );
  setCount(uniquePairs.size || 0);
}, [apiResponse]);

    const ref = useOutsideClick(() => setShowMobileMenu(false));
    const {data:userlog} = useGetUserslogQuery()
    const storedUsername = localStorage.getItem('userName');
    
    // Find the current user from userlog data
    const currentUser = userlog?.data?.find(user => user.USERNAME === storedUsername);
    
    console.log(currentUser, "currentUser");

    const tabs = {
        "Piece Receipt": <PieceReceipt />,
        "Table and Lot Allocation": <TableLotAllot />,
        "Defect Entry": <DefectEntry />,
        "Folding Pending List": <FoldingPendingList />,
        "Piece Folding Entry": <PieceFoldingEntry />,
        "PackingSlip": <PackingSlip />,
        "PieceVerification":<PieceVerification />
    };
const tabData = [
  {
    name: "Piece Receipt",
    icon: LOT_ICON,
    value: count,
    gradient: "from-cyan-500 to-blue-600",
    key: "PIECERECEIPT"
  },
  {
    name: "Table and Lot Allocation",
    icon: LOADING_ICON,
    value: new Set(
      loadingResponse?.data?.map(item => `${item.BATCHNO}_${item.PROCESSNAME}`)
    ).size,
    gradient: "from-emerald-500 to-green-600",
    key: "TABLEANDLOTALLOCATION"
  },
  {
    name: "Defect Entry",
    icon: UNLOADING_ICON,
    value: new Set(
      UnLoading?.data?.map(item => `${item.BATCHNO}_${item.PROCESSNAME}`)
    ).size,
    gradient: "from-amber-500 to-orange-600",
    key: "DEFECTENTRY"
  },
  {
    name: "Folding Pending List",
    icon: APPROVAL_ICON,
    value: new Set(
      approval?.data?.map(item => `${item.BATCHNO}_${item.PROCESSNAME}`)
    ).size,
    gradient: "from-violet-500 to-purple-600",
    key: "FOLDINGPENDINGLIST"
  },
  {
    name: "Piece Folding Entry",
    icon: REVERT_ICON,
    value: new Set(
      revert?.data?.map(item => `${item.BATCHNO}_${item.PROCESSNAME}`)
    ).size,
    gradient: "from-rose-500 to-pink-600",
    key: "REVERT"
  },
  {
    name:"PackingSlip",
    icon: INSPECTION_ICON,
    value: new Set(
      InspectionDet?.data?.map(item => `${item.BATCHNO}_${item.PROCESSNAME}`)
    ).size,
    gradient: "from-teal-500 to-cyan-600",
    key: "PACKINGSLIP"
  },
  {
    name:"PieceVerification",
    icon: INSPECTION_ICON,
    value: new Set(
      InspectionDet?.data?.map(item => `${item.BATCHNO}_${item.PROCESSNAME}`)
    ).size,
    gradient: "from-teal-500 to-cyan-600",
    key: "PIECEVERIFICATION"
  },
];


    // Filter tabs based on user permissions
    const filteredTabData = storedUsername === "Admin" 
        ? tabData 
        : tabData.filter(item => {
            return currentUser && currentUser[item.key] == 1;
        });

    const handleTabChange = (name) => {
        if (!openTabs.tabs.some(tab => tab.id === name)) {
            dispatch(push({ id: name, name }));
        } else {
            dispatch(push({ id: name }));
        }
        if (isMobile) setShowMobileMenu(false);
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const bgColor = darkMode ? "bg-gray-900" : "bg-gradient-to-br from-gray-100 to-gray-200";
    const cardBg = darkMode ? "bg-gray-800/90 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm";
    const textColor = darkMode ? "text-gray-100" : "text-gray-800";
    const mutedTextColor = darkMode ? "text-gray-400" : "text-gray-500";
    const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
    const hoverBg = darkMode ? "hover:bg-white" : "hover:bg-white";
    const tabInactive = darkMode ? "text-gray-400 hover:bg-gray-700/50" : "text-gray-500 hover:bg-gray-100";
    const tabActive = darkMode ? "bg-gray-800 text-white border-b-2 border-cyan-400" : "bg-white text-blue-600 border-b-2 border-blue-500";
    const emptyStateBg = darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200";

    return (
        <div className={`flex flex-col mt-16   w-full ${bgColor} overflow-hidden transition-colors duration-300`}>
            <div className={`${cardBg} shadow-lg p-3 flex justify-between items-center md:hidden sticky top-0 z-20 border-b ${borderColor}`}>
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className={`p-2 rounded-xl ${hoverBg} transition-all`}
                >
                    {MENU_ICON}
                </button>
               
                <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-xl ${hoverBg} transition-all bg-white`}
                >
                    {darkMode ? SUN_ICON : MOON_ICON}
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                <div className={`hidden md:flex md:w-72 ${cardBg} shadow-lg flex-col space-y-1 p-4 h-full border-r ${borderColor} transition-all duration-300`}>
                    <div className="flex justify-between items-center px-3 mb-2 border-b border-gray-500/20">
                        <div>
                            <h2 className={`text-xl font-bold ${textColor}`}>Operations</h2>
                            <p className={`text-sm ${mutedTextColor} mt-1`}>Manage production workflows</p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`p-2 rounded-xl ${hoverBg} transition-all bg-white`}
                        >
                            {darkMode ? SUN_ICON : MOON_ICON}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {filteredTabData.map(({ name, icon, value, gradient }) => (
                            <button
                                key={name}
                                onClick={() => handleTabChange(name)}
                                className={`flex items-center p-3 rounded-xl transition-all w-full group ${
                                    openTabs.tabs.some(tab => tab.id === name && tab.active)
                                        ? `bg-gradient-to-r ${gradient} shadow-lg`
                                        : `${hoverBg} border border-transparent group-hover:border-gray-300/50`
                                }`}
                            >
                                <div className={`p-2 rounded-lg transition-all ${
                                    openTabs.tabs.some(tab => tab.id === name && tab.active)
                                        ? 'bg-white/20 text-white'
                                        : `${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`
                                } mr-3`}>
                                    {icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className={`font-medium ${
                                        openTabs.tabs.some(tab => tab.id === name && tab.active)
                                            ? 'text-white'
                                            : textColor
                                    }`}>{name}</h3>
                                </div>
                                <span className={`text-xl font-bold px-2 py-1 rounded-full ${
                                    openTabs.tabs.some(tab => tab.id === name && tab.active)
                                        ? 'bg-white/20 text-white'
                                        : `${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                                }`}>
                                    {value}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-500/20">
                        <div className="flex justify-between items-center px-3 py-2">
                            <span className={`text-sm ${mutedTextColor}`}>System Status</span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                <span className="text-sm text-emerald-500">Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
                {showMobileMenu && (
                    <div className="fixed inset-0 z-50 bg-black/40 md:hidden backdrop-blur-sm py-16">
                        <div
                            ref={ref}
                            className={`h-full w-4/5 max-w-sm ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} shadow-xl overflow-y-auto animate-slide-in backdrop-blur-xl`}
                        >
                            <div className="p-5 border-b border-gray-500/20 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                                <h2 className="text-xl font-bold">Operations</h2>
                                <p className="text-sm opacity-90 mt-1">Manage production workflows</p>
                            </div>
                            <div className="flex flex-col p-3 space-y-2">
                                {filteredTabData.map(({ name, icon, value, gradient }) => (
                                    <button
                                        key={name}
                                        onClick={() => handleTabChange(name)}
                                        className={`flex items-center p-4 rounded-xl transition-all ${openTabs.tabs.some(tab => tab.id === name && tab.active)
                                                ? `bg-gradient-to-r ${gradient} shadow-lg`
                                                : `${hoverBg}`
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${openTabs.tabs.some(tab => tab.id === name && tab.active)
                                                ? 'bg-white/20 text-white'
                                                : `${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                                            } mr-3`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className={`font-medium ${openTabs.tabs.some(tab => tab.id === name && tab.active)
                                                    ? 'text-white'
                                                    : textColor
                                                }`}>{name}</h3>
                                        </div>
                                        <span className={`text-xl font-bold px-2 py-1 rounded-full ${openTabs.tabs.some(tab => tab.id === name && tab.active)
                                                ? 'bg-white/20 text-white'
                                                : `${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'}`
                                            }`}>
                                            {value}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className={`flex-1 flex flex-col h-full overflow-hidden ${darkMode ? 'bg-gray-900/30' : 'bg-gray-50/50'}`}>
                    <div className={`hidden md:flex items-center p-2 ${cardBg} sticky top-0 z-10 border-b ${borderColor}`}>
                        <div
                            ref={tabContainerRef}
                            className="flex gap-1 overflow-x-auto px-2 scrollbar-hide"
                        >
                            {openTabs.tabs.map((tab, index) => (
                                <div
                                    key={index}
                                    className={`relative px-4 py-2 rounded-t-lg flex items-center gap-2 cursor-pointer min-w-fit transition-all ${tab.active ? tabActive : tabInactive
                                        }`}
                                >
                                    <button
                                        onClick={() => dispatch(push({ id: tab.id }))}
                                        className="focus:outline-none text-sm whitespace-nowrap flex items-center gap-1"
                                    >
                                        {tab.name}
                                    </button>
                                    <button
                                        className={`p-1 rounded-full transition-all ${darkMode ? 'text-gray-400 hover:bg-gray-700/70 hover:text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(remove({ id: tab.id }));
                                        }}
                                    >
                                        {CLOSE_ICON}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 md:p-6">
                        {openTabs.tabs.length > 0 ? (
                            openTabs.tabs.map((tab, index) => (
                                <div
                                    key={index}
                                    className={`${tab.active ? "block" : "hidden"} h-full w-full animate-fadeIn`}
                                >
                                    {tabs[tab.name]}
                                </div>
                            ))
                        ) : (
                            <div className={`h-full flex flex-col items-center justify-center ${emptyStateBg} rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-300'} backdrop-blur-sm`}>
                                <div className="text-center p-6 max-w-md">
                                    <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r from-cyan-500 to-blue-600">
                                        <div className="bg-white p-3 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className={`text-lg font-medium ${textColor} mb-2`}>No tabs open</h3>
                                    <p className={`${mutedTextColor} mb-6`}>Select an operation from the sidebar to get started</p>
                                    <button
                                        onClick={() => handleTabChange("Lot Preparation")}
                                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        Open Lot Preparation
                                    </button>
                                </div>
                            </div>
                        )}
                        <AiMessageButton />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveTabList;