import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef, useMemo } from "react";
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
} from "./BRT";
import {
  MdLogout,
  MdArrowDropDown,
  MdPersonAdd,
  MdSettings,
} from "react-icons/md";
import { FaTableCells } from "react-icons/fa6";
import { MdOutlinePendingActions } from "react-icons/md";
import { GiRolledCloth } from "react-icons/gi";
import { RiBillLine } from "react-icons/ri";

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
  Fade,
  useScrollTrigger,
  Paper,
  Stack,
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
const NavbarHeader = ({ onLogout }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(false);
  const tabContainerRef = useRef(null);
  const [count, setCount] = useState(0);
  const [userMenuEl, setUserMenuEl] = useState(null);
  const { data: userData } = useGetUsersQuery();
  const { data: roles } = useGetRolesQuery();
  console.log(roles, "roles");
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const { data: apiResponse } = useGetPieceReceiptQuery();
  const { data: loadingResponse } = useGetLoadingDetailQuery();
  const { data: UnLoading } = useGetUnLoadingDetailQuery();
  const { data: approval } = useGetApprovalDetailQuery();
  const { data: revert } = useGetRevertDetailQuery();
  const { data: InspectionDet } = useGetInspectionDetailQuery();
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
  (user) => user.USERID ===storedUserId,
  );
  const currentUserPermission = userlog?.data?.find(
    (item) => item?.ROLEID == storedRoleId,
  );

  console.log(userData, "userData");
  console.log(currentUser, "currentUser");

  // const userRoles = useMemo(() => {
  //   return currentUser
  //     ? userData.data
  //         ?.filter((user) => user.USERNAME === storedUserId && user.role)
  //         ?.map((user) => user.role)
  //     : [];
  // }, [currentUser, userData, storedUserId]);
  const isAdmin = Number(storedRoleId) === adminId;
  // Check if user is admin or has specific permissions
  // const isAdmin = useMemo(() => {
  //   return (
  //     currentUser?.USERNAME === "Admin" ||
  //     currentUser?.ROLENAME === "Admin" ||
  //     currentUser?.isAdmin
  //   );
  // }, [currentUser]);
  console.log(isAdmin, "isAdmin");

  const handleUserMenuOpen = (event) => {
    setUserMenuEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuEl(null);
  };

  const handleCreateUser = () => {
    dispatch(push({ id: 5, name: "User" }));
    handleUserMenuClose();
  };
  console.log(currentUser, "currentUser");

  const tabs = {
    "Piece Receipt": <PieceReceipt />,
    "Table and Lot Allocation": <TableLotAllot />,
    "Defect Entry": <DefectEntry />,
    "Folding Pending List": <FoldingPendingList />,
    "Piece Folding Entry": <PieceFoldingEntry />,
    PackingSlip: <PackingSlip />,
    PieceVerification: <PieceVerification />,
    User: <OutlinedCard />,
    Role: <RoleManagement />,
  };
  const tabData = [
    {
      name: "Piece Receipt",
      icon: LOT_ICON,
      value: count,
      gradient: "from-cyan-500 to-blue-600",
      key: "PIECERECEIPT",
    },
    {
      name: "Table and Lot Allocation",
      icon: <FaTableCells />,
      value: new Set(
        loadingResponse?.data?.map(
          (item) => `${item.BATCHNO}_${item.PROCESSNAME}`,
        ),
      ).size,
      gradient: "from-emerald-500 to-green-600",
      key: "TABLEANDLOTALLOCATION",
    },
    {
      name: "Defect Entry",
      icon: UNLOADING_ICON,
      value: new Set(
        UnLoading?.data?.map((item) => `${item.BATCHNO}_${item.PROCESSNAME}`),
      ).size,
      gradient: "from-amber-500 to-orange-600",
      key: "DEFECTENTRY",
    },
    {
      name: "Folding Pending List",
      icon: <MdOutlinePendingActions />,
      value: new Set(
        approval?.data?.map((item) => `${item.BATCHNO}_${item.PROCESSNAME}`),
      ).size,
      gradient: "from-violet-500 to-purple-600",
      key: "FOLDINGPENDINGLIST",
    },
    {
      name: "Piece Folding Entry",
      icon: <GiRolledCloth />,
      value: new Set(
        revert?.data?.map((item) => `${item.BATCHNO}_${item.PROCESSNAME}`),
      ).size,
      gradient: "from-rose-500 to-pink-600",
      key: "PIECEFOLDINGENTRY",
    },
    {
      name: "PackingSlip",
      icon: <RiBillLine />,
      value: new Set(
        InspectionDet?.data?.map(
          (item) => `${item.BATCHNO}_${item.PROCESSNAME}`,
        ),
      ).size,
      gradient: "from-teal-500 to-cyan-600",
      key: "PACKINGSLIP",
    },
    {
      name: "PieceVerification",
      icon: INSPECTION_ICON,
      value: new Set(
        InspectionDet?.data?.map(
          (item) => `${item.BATCHNO}_${item.PROCESSNAME}`,
        ),
      ).size,
      gradient: "from-teal-500 to-cyan-600",
      key: "PIECEVERIFICATION",
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
      dispatch(push({ id: name, name }));
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
                  BRT Sizing Mill
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
                            <ListItemText primary="Create New User" />
                          </MenuItem>

                          <MenuItem
                            onClick={() => {
                              dispatch(push({ id: 9, name: "Role" }));
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
                            <ListItemText primary="Roles" />
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
                          Sign Out
                        </Button>
                      </Box>
                    </UserMenuPaper>
                  </Menu>
                </Box>

                {/* Logout Button (mobile) */}
                <IconButton
                  onClick={onLogout}
                  size="small"
                  sx={{
                    color: colors.textPrimary,
                    display: { xs: "flex", md: "none" },
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

        <div className="flex-1 flex flex-col md:flex-row ">
          <div
            className={`hidden md:flex md:w-72 ${cardBg} shadow-lg flex-col space-y-1 p-4  border-r ${borderColor} transition-all duration-300`}
          >
            <div className="flex  justify-between items-center px-3 mb-2 border-b border-gray-500/20 ">
              <div>
                <h2 className={`text-xl font-bold ${textColor}`}>Operations</h2>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl ${hoverBg} transition-all bg-white`}
              >
                {darkMode ? SUN_ICON : MOON_ICON}
              </button>
            </div>

            <div className=" space-y-2">
              {filteredTabData?.map(({ name, icon, value, gradient }) => (
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
                      openTabs.tabs.some((tab) => tab.id === name && tab.active)
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
                      {name}
                    </h3>
                  </div>
                  <span
                    className={`text-xl font-bold px-2 py-1 rounded-full ${
                      openTabs.tabs.some((tab) => tab.id === name && tab.active)
                        ? "bg-white/20 text-white"
                        : `${darkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-600"}`
                    }`}
                  >
                    {value}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {showMobileMenu && (
            <div className="fixed inset-0 z-50 bg-black/40 md:hidden backdrop-blur-sm py-16">
              <div
                ref={ref}
                className={`h-full w-4/5 max-w-sm ${darkMode ? "bg-gray-800/95" : "bg-white/95"} shadow-xl overflow-y-auto animate-slide-in backdrop-blur-xl`}
              >
                <div className="p-5 border-b border-gray-500/20 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                  <h2 className="text-xl font-bold">Operations</h2>
                </div>
                <div className="flex flex-col p-3 space-y-2">
                  {filteredTabData.map(({ name, icon, value, gradient }) => (
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
                          {name}
                        </h3>
                      </div>
                      <span
                        className={`text-xl font-bold px-2 py-1 rounded-full ${
                          openTabs.tabs.some(
                            (tab) => tab.id === name && tab.active,
                          )
                            ? "bg-white/20 text-white"
                            : `${darkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-100 text-gray-600"}`
                        }`}
                      >
                        {value}
                      </span>
                    </button>
                  ))}
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
                      {tab.name}
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
                  className={`h-[70vh] flex flex-col items-center justify-center ${emptyStateBg} rounded-xl border-2 border-dashed ${darkMode ? "border-gray-700" : "border-gray-300"} backdrop-blur-sm`}
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
                      No tabs open
                    </h3>
                    <p className={`${mutedTextColor} mb-6`}>
                      Select an option from the sidebar to get started
                    </p>
                    <button
                      onClick={() => handleTabChange("Piece Receipt")}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg transform hover:-translate-y-0.5"
                    >
                      Open Piece Receipt
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
