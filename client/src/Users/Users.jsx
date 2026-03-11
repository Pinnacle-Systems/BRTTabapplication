import * as React from "react";
import { useGetUsersQuery, useGetRolesQuery } from "../redux/userservice";
import { useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Avatar,
  Tooltip,
  Fade,
  alpha,
  styled,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifiedIcon from "@mui/icons-material/Verified";
import Form from "../Form/Form";

// Theme color
const primaryColor = "#2BA94C";
const hoverColor = alpha(primaryColor, 0.08);
const activeColor = alpha(primaryColor, 0.16);
const tableHeader = "black"

// Compact styled components
const CompactPaper = styled(Paper)({
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
});

const CompactButton = styled(Button)({
  backgroundColor: primaryColor,
  color: "white",
  textTransform: "none",
  borderRadius: "6px",
  padding: "6px 16px",
  fontSize: "0.875rem",
  "&:hover": {
    backgroundColor: alpha(primaryColor, 0.9),
  },
});

const CompactTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: hoverColor,
  },
  "&.Mui-selected": {
    backgroundColor: activeColor,
  },
});

export default function UserManagement() {
  const [open, setOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null); // ← add

  const handleOpen = () => {
    setEditUser(null); // ← new user
    setOpen(true);
  };
  const handleEdit = (user) => {
    setEditUser(user); // ← existing user
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditUser(null); // ← reset
    refetch();
  };

  const { data: userData, refetch, isLoading } = useGetUsersQuery();
  const { data: Roles } = useGetRolesQuery();
  console.log(userData, "userData");

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress size={24} sx={{ color: primaryColor }} />
      </Box>
    );
  }

  if (!userData?.data) {
    return (
      <Typography
        variant="body1"
        color="textSecondary"
        textAlign="center"
        mt={2}
      >
        No user data available
      </Typography>
    );
  }


  return (
    <Box
      sx={{
        p: 2,
        height: "75vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" fontWeight="600" sx={{ color: primaryColor }}>
          User Management
        </Typography>

        <CompactButton
          startIcon={<AddIcon sx={{ fontSize: "18px" }} />}
          onClick={handleOpen}
        >
          Add User
        </CompactButton>
      </Box>

      <CompactPaper
        elevation={0}
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <TableContainer sx={{ height: "100%", overflow: "auto" }}>
          <Table size="small" sx={{ minWidth: 450 }} stickyHeader>
            <TableHead>
              <TableRow >
                <TableCell sx={{ fontWeight: "600", py: 1, bgcolor: "black", color: "white" }}>
                  User Name
                </TableCell>
                <TableCell sx={{ fontWeight: "600", py: 1, bgcolor: "black", color: "white" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: "600", py: 1, bgcolor: "black", color: "white" }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {userData?.data?.map((user, index) => (
                <CompactTableRow key={index} hover>
                  {/* USER COLUMN */}
                  <TableCell sx={{ py: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(primaryColor, 0.2),
                          color: primaryColor,
                          width: 28,
                          height: 28,
                          fontSize: "0.875rem",
                        }}
                      >
                        {user?.USERNAME?.charAt(0).toUpperCase()}
                      </Avatar>

                      <Typography variant="body2">{user?.USERNAME}</Typography>
                    </Box>
                  </TableCell>

                  {/* ROLE COLUMN */}
                  <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2">{user?.ROLENAME}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      sx={{ color: primaryColor }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>{" "}
                  </TableCell>
                </CompactTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CompactPaper>

      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: "80%", md: "500px" },
              bgcolor: "background.paper",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              p: 0,
              outline: "none",
            }}
          >
            <Form
              onClose={handleClose}
              Roles={Roles}
              primaryColor={primaryColor}
              editUser={editUser}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
