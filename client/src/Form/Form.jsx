import React, { useEffect, useState } from "react";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../redux/userservice";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  alpha,
  styled,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BadgeIcon from "@mui/icons-material/Badge";

const CompactTextField = styled(TextField)(({ theme, primarycolor }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontSize: "0.875rem",
    "&.Mui-focused fieldset": {
      borderColor: primarycolor,
    },
  },
}));

const CompactButton = styled(Button)(({ primarycolor }) => ({
  backgroundColor: primarycolor,
  color: "white",
  fontSize: "0.875rem",
  padding: "6px 16px",
  borderRadius: "6px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: alpha(primarycolor, 0.9),
  },
}));

const CompactCheckbox = styled(FormControlLabel)(({ primarycolor }) => ({
  margin: 0,
  "& .MuiCheckbox-root": {
    padding: "4px 8px",
    color: alpha(primarycolor, 0.6),
    "&.Mui-checked": {
      color: primarycolor,
    },
  },
  "& .MuiTypography-root": {
    fontSize: "0.875rem",
  },
}));

const Form = ({ onClose, primaryColor, Roles, editUser }) => {
  const isEditMode = !!editUser; // ← derive mode
  console.log(editUser, "editUser"); // ← check exact field names
  const [username, setUserName] = useState(editUser?.USERNAME || "");
  const [roleId, setRoleId] = useState(editUser?.ROLEID || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (editUser) {
      setUserName(editUser.USERNAME || "");
      setRoleId(Number(editUser.ROLEID) || ""); // ← cast to Number
      setPassword("");
    } else {
      setUserName("");
      setRoleId("");
      setPassword("");
    }
  }, [editUser]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !roleId || (!isEditMode && !password)) {
      toast.info("Please fill all required fields");
      return;
    }

    if (!window.confirm(isEditMode ? "Update this user?" : "Create this user?"))
      return;

    if (isEditMode) {
      // ← Edit mode: send userId + changed fields
      const formData = {
        userId: editUser.USERID,
        username,
        roleId: Number(roleId),
        ...(password ? { password } : {}), // ← only send password if changed
      };
      updateUser(formData)
        .unwrap()
        .then((response) => {
          if (response.statusCode === 1) {
            toast.error(response.message);
          } else {
            toast.success("User updated");
            onClose();
          }
        })
        .catch((error) => toast.error(`Error: ${error.message}`));
    } else {
      // ← Create mode
      const formData = { username, password, roleId };
      createUser(formData)
        .unwrap()
        .then((response) => {
          if (response.statusCode === 1) {
            toast.error(response.message);
          } else {
            toast.success("User created");
            onClose();
          }
        })
        .catch((error) => toast.error(`Error: ${error.message}`));
    }
  };

  return (
    <Box sx={{ p: 0, height: "50vh" }}>
      <Box
        sx={{
          p: 2,
          bgcolor: primaryColor,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" fontWeight="600">
          {isEditMode ? "Edit User" : "Create User"} {/* ← dynamic title */}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <CompactTextField
                fullWidth
                size="small"
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon
                        fontSize="small"
                        sx={{ color: alpha("#000", 0.6) }}
                      />
                    </InputAdornment>
                  ),
                }}
                primarycolor={primaryColor}
              />
            </Grid>

            <Grid item xs={12}>
              <CompactTextField
                fullWidth
                size="small"
                label={
                  isEditMode ? "New Password (leave blank to keep)" : "Password"
                }
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        fontSize="small"
                        sx={{ color: alpha("#000", 0.6) }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon fontSize="small" />
                        ) : (
                          <VisibilityIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                primarycolor={primaryColor}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="role-label">Role</InputLabel>

                <Select
                  labelId="role-label"
                  label="Role"
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))} // ← cast to Number
                  startAdornment={
                    <InputAdornment position="start">
                      <BadgeIcon
                        fontSize="small"
                        sx={{ color: alpha("#000", 0.6), mr: 1 }}
                      />
                    </InputAdornment>
                  }
                  sx={{ height: 40 }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // ✅ dropdown height
                      },
                    },
                  }}
                >
                  {Roles?.data?.map((role) => (
                    <MenuItem key={role.ROLEID} value={role.ROLEID}>
                      {role.ROLENAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end " gap={1} mt={12}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onClose}
                  sx={{
                    fontSize: "0.875rem",
                    textTransform: "none",
                  }}
                >
                  Cancel
                </Button>
                <CompactButton
                  type="submit"
                  size="small"
                  disabled={isLoading}
                  primarycolor={primaryColor}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  {isLoading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update"
                      : "Create"}
                </CompactButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default Form;
