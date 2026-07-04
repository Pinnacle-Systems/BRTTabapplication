import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLanguage } from "./Context/LanguageContext";

import OutlinedCard from "./Users/Users";
import RoleManagement from "./Roles/Roles";
import { push, remove } from "./redux/features/opentabs";
import AiMessageButton from "./Alagendira/AiMessageButton";
import {
  CLOSE_ICON,
  MENU_ICON,
  LOT_ICON,
  UNLOADING_ICON,
  INSPECTION_ICON,
  SUN_ICON,
  MOON_ICON,
} from "./icons";
import useOutsideClick from "./CustomHooks/handleOutsideClick";
import {
  useGetLoadingDetailQuery,
  useGetUnLoadingDetailQuery,
  useGetApprovalDetailQuery,
  useGetRevertDetailQuery,
} from "./redux/services/LotDetailData";
import { useGetPieceReceiptQuery } from "./redux/services/PieceReceipt";
import { useGetUserslogQuery } from "./redux/userservice";
import { useGetInspectionDetailQuery } from "./redux/services/LotDetailData";
import {
  PieceReceipt,
  TableLotAllot,
  DefectEntry,
  FoldingPendingList,
  PieceFoldingEntry,
  PackingSlip,
  PieceVerification,
  ClothDelivery,
  DispatchVerification,
  StockVerification,
} from "./BRT";
import {
  MdLogout,
  MdArrowDropDown,
  MdPersonAdd,
  MdSettings,
  MdLanguage,
  MdMonitor, // ← NEW
  MdTune,
} from "react-icons/md";
import { FaTableCells } from "react-icons/fa6";
import { MdOutlinePendingActions } from "react-icons/md";
import { GiRolledCloth } from "react-icons/gi";
import { RiBillLine } from "react-icons/ri";
import ActiveMonitor from "./UserDetails/ActiveMonitor";
import FoldingRangeMaster from "./BRT/FoldingRangeMaster";
import {
  Menu,
  MenuItem,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  Slide,
  useScrollTrigger,
  Paper,
  Button,
} from "@mui/material";
import { useGetUsersQuery, useGetRolesQuery } from "./redux/userservice";
import { styled, alpha } from "@mui/material/styles";

const colors = {
  primary: "#1976d2",
  secondary: "#f5f5f5",
  textPrimary: "#212121",
  textSecondary: "#757575",
  white: "#ffffff",
  hover: "#e3f2fd",
  active: "#bbdefb",
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.white,
  color: colors.textPrimary,
  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
  borderBottom: `1px solid ${alpha(colors.textPrimary, 0.12)}`,
  transition: "all 0.3s ease",
  zIndex: 999999,
}));

const UserMenuPaper = styled(Paper)(({ theme }) => ({
  width: 320,
  padding: theme.spacing(2),
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
}));

const UserInfoSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 0),
  marginBottom: theme.spacing(1),
}));

const UserDetails = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// ── Language options ─────────────────────────────────────────────────────────
const LANGUAGES = [
  {
    code: "en",
    label: "English",
    // Flag using flagcdn.com image — works on all browsers including Windows desktop
    flagImg: "https://flagcdn.com/w40/gb.png",
    shortName: "EN",
  },
  {
    code: "ta",
    label: "தமிழ்",
    flagImg: "https://flagcdn.com/w40/in.png",
    shortName: "TA",
  },
  {
    code: "hi",
    label: "हिन्दी",
    flagImg: "https://flagcdn.com/w40/in.png",
    shortName: "HI",
  },
];

// ── NavbarHeader Translations ────────────────────────────────────────────────
const navTranslations = {
  en: {
    langSettings: "Language Settings",
    chooseLanguage: "Choose your preferred language",
    current: "Current",
    cancel: "Cancel",
    apply: "Apply",
    operations: "Operations",
    noTabsOpen: "No tabs open",
    selectSidebar: "Select an option from the sidebar to get started",
    openPieceReceipt: "Open Piece Receipt",
    signOut: "Sign Out",
    createUser: "Create New User",
    users: "Users",
    roles: "Roles",
    // Tab labels
    pieceReceipt: "Piece Receipt",
    tableLotAlloc: "Table and Lot Allocation",
    defectEntry: "Defect Entry",
    foldingPending: "Folding Pending List",
    pieceFolding: "Piece Folding Entry",
    pieceVerification: "Piece Verification",
    packingSlip: "Packing Slip",
    clothDelivery: "Cloth Delivery",
    dispatchVerification: "Dispatch Verification",
    stockVerification: "Stock Verification",
    navText: "Banu Radha Textiles",
    activeMonitor: "Active Monitor",
  },
  ta: {
    langSettings: "மொழி அமைப்புகள்",
    chooseLanguage: "உங்கள் விருப்பமான மொழியை தேர்ந்தெடுக்கவும்",
    current: "தற்போதையது",
    cancel: "ரத்துசெய்",
    apply: "பயன்படுத்து",
    operations: "செயல்பாடுகள்",
    noTabsOpen: "தாவல்கள் இல்லை",
    selectSidebar: "தொடங்க பக்கப்பட்டியிலிருந்து ஒன்றை தேர்ந்தெடுக்கவும்",
    openPieceReceipt: "பீஸ் ரசீதை திற",
    signOut: "வெளியேறு",
    createUser: "புதிய பயனரை உருவாக்கு",
    users: "பயனர்கள்",
    roles: "பாத்திரங்கள்",
    // Tab labels
    pieceReceipt: "பீஸ் ரசீது",
    tableLotAlloc: "மேஜை மற்றும் லாட் ஒதுக்கீடு",
    defectEntry: "குறைபாடு பதிவு",
    foldingPending: "மடிப்பு நிலுவை பட்டியல்",
    pieceFolding: "பீஸ் மடிப்பு பதிவு",
    pieceVerification: "பீஸ் சரிபார்ப்பு",
    packingSlip: "பேக்கிங் சீட்டு",
    clothDelivery: "துணி வழங்கல்",
    dispatchVerification: "அனுப்புதல் சரிபார்ப்பு",
    stockVerification: "இருப்பு சரிபார்ப்பு",
    navText: "பானு ராதா டெக்ஸ்டைல்ஸ் ",
    activeMonitor: "செயலில் கண்காணிப்பு",
  },
  hi: {
    langSettings: "भाषा सेटिंग्स",
    chooseLanguage: "अपनी पसंदीदा भाषा चुनें",
    current: "वर्तमान",
    cancel: "रद्द करें",
    apply: "लागू करें",
    operations: "संचालन",
    noTabsOpen: "कोई टैब खुला नहीं",
    selectSidebar: "शुरू करने के लिए साइडबार से एक विकल्प चुनें",
    openPieceReceipt: "पीस रसीद खोलें",
    signOut: "साइन आउट",
    createUser: "नया उपयोगकर्ता बनाएं",
    users: "उपयोगकर्ता",
    roles: "भूमिकाएं",
    // Tab labels
    pieceReceipt: "पीस रसीद",
    tableLotAlloc: "टेबल और लॉट आवंटन",
    defectEntry: "दोष प्रविष्टि",
    foldingPending: "फोल्डिंग पेंडिंग सूची",
    pieceFolding: "पीस फोल्डिंग प्रविष्टि",
    pieceVerification: "पीस सत्यापन",
    packingSlip: "पैकिंग स्लिप",
    clothDelivery: "कपड़ा डिलीवरी",
    dispatchVerification: "प्रेषण सत्यापन",
    stockVerification: "स्टॉक सत्यापन",
    navText: "बानू राधा टेक्सटाइल्स चन्हे",
    activeMonitor: "सक्रिय मॉनिटर",
  },
};

// ── Language Popup (shown when user clicks Language Settings) ────────────────
const LanguagePopup = ({ currentLang, onSelect, onClose, nt }) => {
  const [selected, setSelected] = useState(currentLang);

  const handleApply = () => {
    onSelect(selected);
    onClose();
  };

  return (
    // backdrop
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999999,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* modal */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "320px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1976d2, #42a5f5)",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: "16px",
                margin: 0,
              }}
            >
              {nt.langSettings}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "12px",
                margin: "4px 0 0",
              }}
            >
              {nt.chooseLanguage}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Language options */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            const isCurrent = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid #1976d2"
                    : "2px solid #e5e7eb",
                  background: isSelected ? "#eff6ff" : "white",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.15s",
                }}
              >
                <img
                  src={lang.flagImg}
                  alt={lang.shortName}
                  style={{
                    width: "28px",
                    height: "20px",
                    borderRadius: "3px",
                    objectFit: "cover",
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    fontWeight: 600,
                    fontSize: "14px",
                    color: isSelected ? "#1976d2" : "#374151",
                  }}
                >
                  {lang.label}
                </span>

                {/* Current badge */}
                {isCurrent && (
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#dcfce7",
                      color: "#16a34a",
                      borderRadius: "20px",
                      padding: "2px 8px",
                      fontWeight: 600,
                    }}
                  >
                    {nt.current}
                  </span>
                )}

                {/* Radio dot */}
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: isSelected
                      ? "2px solid #1976d2"
                      : "2px solid #d1d5db",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#1976d2",
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "0 16px 16px", display: "flex", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {nt.cancel}
          </button>
          <button
            onClick={handleApply}
            disabled={selected === currentLang}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: selected === currentLang ? "#e5e7eb" : "#1976d2",
              color: selected === currentLang ? "#9ca3af" : "white",
              fontWeight: 600,
              fontSize: "14px",
              cursor: selected === currentLang ? "not-allowed" : "pointer",
            }}
          >
            {nt.apply}
          </button>
        </div>
      </div>
    </div>
  );
};
//

const NavbarHeader = ({ onLogout }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1280);
  const [darkMode, setDarkMode] = useState(false);
  const tabContainerRef = useRef(null);
  const [count, setCount] = useState(0);
  const [userMenuEl, setUserMenuEl] = useState(null);
  const { data: userData } = useGetUsersQuery();
  const { data: roles } = useGetRolesQuery();
  // ── Language via context ─────────────────────────────────────────────────
  const { lang: currentLang, changeLang } = useLanguage();
  const [showLangPopup, setShowLangPopup] = useState(false);

  const handleLangSelect = (code) => {
    changeLang(code); // updates context + localStorage globally
  };

  const activeLang = LANGUAGES.find((l) => l.code === currentLang);
  const nt = navTranslations[currentLang] ?? navTranslations["en"];

  console.log(roles, "roles");
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1280);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const { data: apiResponse } = useGetPieceReceiptQuery();
  // const { data: loadingResponse } = useGetLoadingDetailQuery();
  // const { data: UnLoading } = useGetUnLoadingDetailQuery();
  // const { data: approval } = useGetApprovalDetailQuery();
  // const { data: revert } = useGetRevertDetailQuery();
  // const { data: InspectionDet } = useGetInspectionDetailQuery();
  console.log(apiResponse, "apiResponse");
  useEffect(() => {
    const uniquePairs = apiResponse?.data?.length;
    console.log(uniquePairs, "uniquePairs");
    setCount(uniquePairs || 0);
  }, [apiResponse]);

  const ref = useOutsideClick(() => setShowMobileMenu(false));
  const { data: userlog } = useGetUserslogQuery();
  const storedUserId = Number(localStorage.getItem("userId"));
  const storedUsername = localStorage.getItem("userName");
  const storedRoleId = Number(localStorage.getItem("roleId"));
  const adminRole = roles?.data?.find(
    (val) => val?.ROLENAME?.toLowerCase() === "admin",
  );

  let adminId = adminRole?.ROLEID;
  console.log(adminId, "isRollAdmin");
  console.log(storedRoleId, "storedRoleId");
  console.log(storedUserId, "storedUserId");
  console.log(userlog, "userlog");

  // Find the current user from userlog data
  const currentUser = userlog?.data?.find(
    (user) => user.USERID === storedUserId,
  );
  const currentUserPermission = userlog?.data?.find(
    (item) => item?.ROLEID == storedRoleId,
  );

  console.log(userData, "userData");
  console.log(currentUser, "currentUser");

  const isAdmin = Number(storedRoleId) === adminId;

  console.log(isAdmin, "isAdmin");

  const handleUserMenuOpen = (event) => {
    setUserMenuEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuEl(null);
  };

  const handleCreateUser = () => {
    dispatch(push({ id: 5, name: "User", label: nt.users }));
    handleUserMenuClose();
  };
  console.log(currentUser, "currentUser");

  const tabs = {
    "Piece Receipt": <PieceReceipt />,
    "Table and Lot Allocation": <TableLotAllot />,
    "Defect Entry": <DefectEntry />,
    "Folding Pending List": <FoldingPendingList />,
    "Piece Folding Entry": <PieceFoldingEntry />,
    "Cloth Delivery": <ClothDelivery />,
    "Dispatch Verification": <DispatchVerification />,
    "Stock Verification": <StockVerification />,
    "Packing Slip": <PackingSlip />,
    "Piece Verification": <PieceVerification />,
    User: <OutlinedCard />,
    Role: <RoleManagement />,
    "Active Monitor": <ActiveMonitor />, // ← add
    FoldingRangeMaster: <FoldingRangeMaster />, // ← add
  };
  const tabData = [
    {
      name: "Piece Receipt",
      label: nt.pieceReceipt,
      icon: LOT_ICON,
      value: count,
      gradient: "from-cyan-500 to-blue-600",
      key: "PIECERECEIPT",
    },
    {
      name: "Table and Lot Allocation",
      label: nt.tableLotAlloc,
      icon: <FaTableCells />,
      value: count,
      gradient: "from-emerald-500 to-green-600",
      key: "TABLEANDLOTALLOCATION",
    },
    {
      name: "Defect Entry",
      label: nt.defectEntry,
      icon: UNLOADING_ICON,
      value: count,
      gradient: "from-amber-500 to-orange-600",
      key: "DEFECTENTRY",
    },
    {
      name: "Folding Pending List",
      label: nt.foldingPending,
      icon: <MdOutlinePendingActions />,
      value: count,
      gradient: "from-violet-500 to-purple-600",
      key: "FOLDINGPENDINGLIST",
    },
    {
      name: "Piece Folding Entry",
      label: nt.pieceFolding,
      icon: <GiRolledCloth />,
      value: count,
      gradient: "from-rose-500 to-pink-600",
      key: "PIECEFOLDINGENTRY",
    },
    {
      name: "Piece Verification",
      label: nt.pieceVerification,
      icon: INSPECTION_ICON,
      value: count,
      gradient: "from-teal-500 to-cyan-600",
      key: "PIECEVERIFICATION",
    },
    {
      name: "Packing Slip",
      label: nt.packingSlip,
      icon: <RiBillLine />,
      value: count,
      gradient: "from-teal-500 to-cyan-600",
      key: "PACKINGSLIP",
    },
    {
      name: "Cloth Delivery",
      label: nt.clothDelivery,
      icon: <RiBillLine />,
      value: count,
      gradient: "from-teal-500 to-cyan-600",
      key: "CLOTHDELIVERY",
    },
    {
      name: "Dispatch Verification",
      label: nt.dispatchVerification,
      icon: <RiBillLine />,
      value: count,
      gradient: "from-teal-500 to-cyan-600",
      key: "DispatchVerification",
    },
    {
      name: "Stock Verification",
      label: nt.stockVerification,
      icon: <RiBillLine />,
      value: count,
      gradient: "from-teal-500 to-cyan-600",
      key: "StockVerification",
    },
  ];

  // Filter tabs based on user permissions
  const filteredTabData = isAdmin
    ? tabData
    : tabData.filter((item) => {
        return currentUserPermission?.[item.key] === "Yes";
      });

  const handleTabChange = (name) => {
    if (!openTabs.tabs.some((tab) => tab.id === name)) {
      const tabEntry = tabData.find((t) => t.name === name);
      dispatch(push({ id: name, name, label: tabEntry?.label ?? name }));
    } else {
      dispatch(push({ id: name }));
    }
    if (isMobile) setShowMobileMenu(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const bgColor = darkMode
    ? "bg-gray-900"
    : "bg-gradient-to-br from-gray-100 to-gray-200";
  const cardBg = darkMode
    ? "bg-gray-800/90 backdrop-blur-sm"
    : "bg-white/90 backdrop-blur-sm";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const mutedTextColor = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-white" : "hover:bg-white";
  const tabInactive = darkMode
    ? "text-gray-400 hover:bg-gray-700/50"
    : "text-gray-500 hover:bg-gray-100";
  const tabActive = darkMode
    ? "bg-gray-800 text-white border-b-2 border-cyan-400"
    : "bg-white text-blue-600 border-b-2 border-blue-500";
  const emptyStateBg = darkMode
    ? "bg-gray-800/50 border-gray-700"
    : "bg-white border-gray-200";
  return (
    <>
      {showLangPopup && (
        <LanguagePopup
          currentLang={currentLang}
          onSelect={handleLangSelect}
          onClose={() => setShowLangPopup(false)}
          nt={nt}
        />
      )}
      <div
        className={`flex flex-col mt-16   w-full ${bgColor} overflow-hidden transition-colors duration-300`}
      >
        {/* <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`p-2 rounded-xl ${hoverBg} transition-all`}
        >
          {MENU_ICON}
        </button> */}
        <HideOnScroll>
          <StyledAppBar position="fixed" sx={{ backgroundColor: "#1976d2" }}>
            <Toolbar
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  sx={{ color: "white" }}
                >
                  {MENU_ICON}
                </IconButton>
              </Box>
              {/* ✅ CENTER LOGO */}

              {/* ✅ CENTER TITLE */}
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  px: 2,
                  maxWidth: "60%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.4rem" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {nt.navText}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box>
                  <IconButton onClick={toggleDarkMode} sx={{ color: "white" }}>
                    {darkMode ? SUN_ICON : MOON_ICON}
                  </IconButton>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    sx={{
                      p: 0,
                      "&:hover": {
                        transform: "scale(1.05)",
                        transition: "transform 0.3s",
                      },
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      variant="dot"
                      color="success"
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: colors.primary,
                          color: colors.white,
                        }}
                      >
                        {storedUsername?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                    <MdArrowDropDown
                      style={{
                        color: colors.textPrimary,
                        transition: "transform 0.3s",
                        transform: Boolean(userMenuEl)
                          ? "rotate(180deg)"
                          : "rotate(0)",
                      }}
                    />
                  </IconButton>

                  <Menu
                    anchorEl={userMenuEl}
                    open={Boolean(userMenuEl)}
                    onClose={handleUserMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        mt: 1.5,
                        zIndex: 99999999, // ← add this
                        "&:before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                      },
                    }}
                    sx={{ zIndex: 99999999 }} // ← add this too
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <UserMenuPaper>
                      <UserInfoSection>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: colors.primary,
                            color: colors.white,
                            fontSize: "1.5rem",
                          }}
                        >
                          {storedUsername?.charAt(0).toUpperCase()}
                        </Avatar>
                        <UserDetails>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {storedUsername || ""}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                          ></Typography>
                        </UserDetails>
                      </UserInfoSection>

                      <Divider sx={{ my: 1 }} />
                      {/* ── LANGUAGE SETTINGS MENU ITEM (NEW) ── */}
                      <MenuItem
                        onClick={() => {
                          handleUserMenuClose();
                          setShowLangPopup(true);
                        }}
                        sx={{
                          borderRadius: "8px",
                          py: 1.5,
                          "&:hover": { backgroundColor: colors.hover },
                        }}
                      >
                        <ListItemIcon>
                          <MdLanguage fontSize="20px" color={colors.primary} />
                        </ListItemIcon>
                        <ListItemText
                          primary={nt.langSettings}
                          secondary={
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                color: colors.textSecondary,
                              }}
                            >
                              <img
                                src={activeLang?.flagImg}
                                alt={activeLang?.shortName}
                                style={{
                                  width: "16px",
                                  height: "11px",
                                  borderRadius: "2px",
                                  objectFit: "cover",
                                }}
                              />
                              {activeLang?.label}
                            </span>
                          }
                        />
                      </MenuItem>

                      <Divider sx={{ my: 1 }} />
                      {/* Menu Items - Only show for admin */}
                      {isAdmin && (
                        <Box sx={{ py: 1 }}>
                          <MenuItem
                            onClick={handleCreateUser}
                            sx={{
                              borderRadius: "8px",
                              py: 1.5,
                              "&:hover": {
                                backgroundColor: colors.hover,
                              },
                            }}
                          >
                            <ListItemIcon>
                              <MdPersonAdd
                                fontSize="20px"
                                color={colors.primary}
                              />
                            </ListItemIcon>
                            <ListItemText primary={nt.createUser} />
                          </MenuItem>

                          <MenuItem
                            onClick={() => {
                              dispatch(
                                push({ id: 9, name: "Role", label: nt.roles }),
                              );
                              handleUserMenuClose();
                            }}
                            sx={{
                              borderRadius: "8px",
                              py: 1.5,
                              "&:hover": {
                                backgroundColor: colors.hover,
                              },
                            }}
                          >
                            <ListItemIcon>
                              <MdSettings
                                fontSize="20px"
                                color={colors.primary}
                              />
                            </ListItemIcon>
                            <ListItemText primary={nt.roles} />
                          </MenuItem>
                          {/* ← Active Monitor — added below Roles */}
                          <MenuItem
                            onClick={() => {
                              dispatch(
                                push({
                                  id: "Active Monitor",
                                  name: "Active Monitor",
                                  label: nt.activeMonitor ?? "Active Monitor",
                                }),
                              );
                              handleUserMenuClose();
                            }}
                            sx={{
                              borderRadius: "8px",
                              py: 1.5,
                              "&:hover": { backgroundColor: colors.hover },
                            }}
                          >
                            <ListItemIcon>
                              <MdMonitor
                                fontSize="20px"
                                color={colors.primary}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={nt.activeMonitor ?? "Active Monitor"}
                              secondary="Workers & Tables"
                            />
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              dispatch(
                                push({
                                  id: "FoldingRangeMaster",
                                  name: "FoldingRangeMaster",
                                  label: "Range Master",
                                }),
                              );
                              handleUserMenuClose();
                            }}
                            sx={{
                              borderRadius: "8px",
                              py: 1.5,
                              "&:hover": { backgroundColor: colors.hover },
                            }}
                          >
                            <ListItemIcon>
                              <MdTune
                                fontSize="20px"
                                color={colors.primary}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary="Range Master"
                            />
                          </MenuItem>
                        </Box>
                      )}

                      <Divider sx={{ my: 1 }} />

                      {/* Logout Button */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          pt: 1,
                        }}
                      >
                        <Button
                          onClick={onLogout}
                          startIcon={<MdLogout />}
                          sx={{
                            color: colors.textPrimary,
                            "&:hover": {
                              backgroundColor: alpha(colors.primary, 0.08),
                            },
                          }}
                        >
                          {nt.signOut}
                        </Button>
                      </Box>
                    </UserMenuPaper>
                  </Menu>
                </Box>

                <IconButton
                  onClick={onLogout}
                  size="small"
                  sx={{
                    color: colors.textPrimary,
                    display: { xs: "flex", xl: "none" },
                    "&:hover": {
                      backgroundColor: alpha(colors.primary, 0.08),
                    },
                  }}
                >
                  <MdLogout />
                </IconButton>
              </Box>
            </Toolbar>
          </StyledAppBar>
        </HideOnScroll>
        {/* <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl ${hoverBg} transition-all bg-white`}
        >
          {darkMode ? SUN_ICON : MOON_ICON}
        </button> */}

        <div className="flex-1 flex flex-col xl:flex-row ">
          <div
            className={`hidden xl:flex xl:w-72 ${cardBg} shadow-lg flex-col space-y-1 p-4 h-full min-h-[88vh] max-h-[90vh] overflow-y-auto border-r ${borderColor} transition-all duration-300`}
          >
            <div className="flex h-full  justify-between items-center px-3 mb-2 border-b border-gray-500/20 ">
              <div>
                <h2 className={`text-xl font-bold ${textColor}`}>
                  {nt.operations}
                </h2>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl ${hoverBg} transition-all bg-white`}
              >
                {darkMode ? SUN_ICON : MOON_ICON}
              </button>
            </div>

            <div className=" space-y-2">
              {filteredTabData?.map(
                ({ name, icon, value, gradient, label }) => (
                  <button
                    key={name}
                    onClick={() => handleTabChange(name)}
                    className={`flex items-center p-3 rounded-xl transition-all w-full group ${
                      openTabs.tabs.some((tab) => tab.id === name && tab.active)
                        ? `bg-gradient-to-r ${gradient} shadow-lg`
                        : `${hoverBg} border border-transparent group-hover:border-gray-300/50`
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-all ${
                        openTabs.tabs.some(
                          (tab) => tab.id === name && tab.active,
                        )
                          ? "bg-white/20 text-white"
                          : `${darkMode ? "bg-gray-700/50" : "bg-gray-100"} ${darkMode ? "text-gray-300" : "text-gray-600"}`
                      } mr-3`}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-medium ${
                          openTabs.tabs.some(
                            (tab) => tab.id === name && tab.active,
                          )
                            ? "text-white"
                            : textColor
                        }`}
                      >
                        {label ?? name}
                      </h3>
                    </div>
                    {/* <span
                      className={`text-xl font-bold px-2 py-1 rounded-full ${
                        openTabs.tabs.some(
                          (tab) => tab.id === name && tab.active,
                        )
                          ? "bg-white/20 text-white"
                          : `${darkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-600"}`
                      }`}
                    >
                      {value}
                    </span> */}
                  </button>
                ),
              )}
            </div>
          </div>
          {showMobileMenu && (
            <div className="fixed inset-0 z-[999999] bg-black/40 xl:hidden backdrop-blur-sm py-16">
              <div
                ref={ref}
                className={`h-full w-4/5 max-w-sm ${darkMode ? "bg-gray-800/95" : "bg-white/95"} shadow-xl overflow-y-auto animate-slide-in backdrop-blur-xl`}
              >
                <div className="p-5 border-b border-gray-500/20 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                  <h2 className="text-xl font-bold">{nt.operations}</h2>
                </div>
                <div className="flex flex-col p-3 space-y-2">
                  {filteredTabData.map(
                    ({ name, icon, value, gradient, label }) => (
                      <button
                        key={name}
                        onClick={() => handleTabChange(name)}
                        className={`flex items-center p-4 rounded-xl transition-all ${
                          openTabs.tabs.some(
                            (tab) => tab.id === name && tab.active,
                          )
                            ? `bg-gradient-to-r ${gradient} shadow-lg`
                            : `${hoverBg}`
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            openTabs.tabs.some(
                              (tab) => tab.id === name && tab.active,
                            )
                              ? "bg-white/20 text-white"
                              : `${darkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-600"}`
                          } mr-3`}
                        >
                          {icon}
                        </div>
                        <div className="flex-1 text-left">
                          <h3
                            className={`font-medium ${
                              openTabs.tabs.some(
                                (tab) => tab.id === name && tab.active,
                              )
                                ? "text-white"
                                : textColor
                            }`}
                          >
                            {label ?? name}
                          </h3>
                        </div>
                        {/* <span
                          className={`text-xl font-bold px-2 py-1 rounded-full ${
                            openTabs.tabs.some(
                              (tab) => tab.id === name && tab.active,
                            )
                              ? "bg-white/20 text-white"
                              : `${darkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-600"}`
                          }`}
                        >
                          {value}
                        </span> */}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className={`flex-1 flex flex-col h-full overflow-hidden ${darkMode ? "bg-gray-900/30" : "bg-gray-50/50"}`}
          >
            <div
              className={`hidden md:flex items-center p-2 ${cardBg} sticky top-0 z-10 border-b ${borderColor}`}
            >
              <div
                ref={tabContainerRef}
                className="flex gap-1 overflow-x-auto px-2 scrollbar-hide"
              >
                {openTabs.tabs.map((tab, index) => (
                  <div
                    key={index}
                    className={`relative px-4 py-2 rounded-t-lg flex items-center gap-2 cursor-pointer min-w-fit transition-all ${
                      tab.active ? tabActive : tabInactive
                    }`}
                  >
                    <button
                      onClick={() => dispatch(push({ id: tab.id }))}
                      className="focus:outline-none text-sm whitespace-nowrap flex items-center gap-1"
                    >
                      {tab.label ?? tab.name}
                    </button>
                    <button
                      className={`p-1 rounded-full transition-all ${darkMode ? "text-gray-400 hover:bg-gray-700/70 hover:text-white" : "text-gray-500 hover:bg-gray-200"}`}
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
                <div
                  className={`h-[80vh] flex flex-col items-center justify-center ${emptyStateBg} rounded-xl border-2 border-dashed ${darkMode ? "border-gray-700" : "border-gray-300"} backdrop-blur-sm`}
                >
                  <div className="text-center p-6 max-w-md">
                    <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gradient-to-r from-cyan-500 to-blue-600">
                      <div className="bg-white p-3 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className={`text-lg font-medium ${textColor} mb-2`}>
                      {nt.noTabsOpen}
                    </h3>
                    <p className={`${mutedTextColor} mb-6`}>
                      {nt.selectSidebar}
                    </p>
                    <button
                      onClick={() => handleTabChange("Piece Receipt")}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg transform hover:-translate-y-0.5"
                    >
                      {nt.openPieceReceipt}
                    </button>
                  </div>
                </div>
              )}
              {/* <AiMessageButton /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarHeader;
