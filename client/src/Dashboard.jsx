import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { push } from './redux/features/opentabs';
import { MdLogout, MdMenu, MdArrowDropDown, MdPersonAdd, MdSettings } from "react-icons/md";
import { BiSolidUserRectangle } from "react-icons/bi";
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
  Button
} from '@mui/material';
import { useGetUsersQuery } from './redux/userservice';
import { styled, alpha } from '@mui/material/styles';
import logo from "../src/img/BRTImage.png";

const colors = {
  primary: '#1976d2',
  secondary: '#f5f5f5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  white: '#ffffff',
  hover: '#e3f2fd',
  active: '#bbdefb'
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.white,
  color: colors.textPrimary,
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  borderBottom: `1px solid ${alpha(colors.textPrimary, 0.12)}`,
  transition: 'all 0.3s ease',
}));

const UserMenuPaper = styled(Paper)(({ theme }) => ({
  width: 320,
  padding: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
}));

const UserInfoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
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

function DrawerAppBar({ onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuEl, setUserMenuEl] = useState(null);
  const dispatch = useDispatch();
  const { data: userData } = useGetUsersQuery();

  const storedUsername = localStorage.getItem('userName');

  const currentUser = useMemo(() => {
    return userData?.data?.find(user => user.userName === storedUsername);
  }, [userData, storedUsername]);

  const userRoles = useMemo(() => {
    return currentUser ? userData.data.filter(user => user.userName === storedUsername && user.role).map(user => user.role) : [];
  }, [currentUser, userData, storedUsername]);

  // Check if user is admin or has specific permissions
  const isAdmin = useMemo(() => {
    return currentUser?.userName === "Admin" || currentUser?.role === "Admin" || currentUser?.isAdmin;
  }, [currentUser]);

  const handleUserMenuOpen = (event) => {
    setUserMenuEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuEl(null);
  };

  const handleCreateUser = () => {
    dispatch(push({ id: 5, name: 'User' }));
    handleUserMenuClose();
  };

  return (
    <HideOnScroll>
      <StyledAppBar position="fixed"
        sx={{ backgroundColor: "#1976d2" }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  height: { xs: 30, sm: 40, md: 50 },
                  width: 'auto',
                }}
              />
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.3s',
                  }
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
                    {currentUser?.userName?.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
                <MdArrowDropDown
                  style={{
                    color: colors.textPrimary,
                    transition: 'transform 0.3s',
                    transform: Boolean(userMenuEl) ? 'rotate(180deg)' : 'rotate(0)'
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
                    overflow: 'visible',
                    mt: 1.5,
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <UserMenuPaper>
                  <UserInfoSection>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: colors.primary,
                        color: colors.white,
                        fontSize: '1.5rem',
                      }}
                    >
                      {currentUser?.userName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <UserDetails>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {currentUser?.userName}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary}>
                      </Typography>
                    </UserDetails>
                  </UserInfoSection>

                  <Divider sx={{ my: 1 }} />

                  {/* Menu Items - Only show for admin */}
                  {isAdmin && (
                    <Box sx={{ py: 1 }}>
                      <MenuItem
                        onClick={handleCreateUser}
                        sx={{
                          borderRadius: '8px',
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: colors.hover,
                          }
                        }}
                      >
                        <ListItemIcon>
                          <MdPersonAdd fontSize="20px" color={colors.primary} />
                        </ListItemIcon>
                        <ListItemText primary="Create New User" />
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          dispatch(push({ id: 6, name: 'User Settings' }));
                          handleUserMenuClose();
                        }}
                        sx={{
                          borderRadius: '8px',
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: colors.hover,
                          }
                        }}
                      >
                        <ListItemIcon>
                          <MdSettings fontSize="20px" color={colors.primary} />
                        </ListItemIcon>
                        <ListItemText primary="User Settings" />
                      </MenuItem>
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  {/* Logout Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                    <Button
                      onClick={onLogout}
                      startIcon={<MdLogout />}
                      sx={{
                        color: colors.textPrimary,
                        '&:hover': {
                          backgroundColor: alpha(colors.primary, 0.08),
                        }
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
                display: { xs: 'flex', md: 'none' },
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.08),
                }
              }}
            >
              <MdLogout />
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>
    </HideOnScroll>
  );
}

DrawerAppBar.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default DrawerAppBar;