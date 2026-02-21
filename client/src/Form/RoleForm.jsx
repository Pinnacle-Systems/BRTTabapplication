import React, { useState } from "react";
import { useCreateRoleMutation } from "../redux/userservice";
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
  Grid,
  InputAdornment,
  alpha,
  styled,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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

const Form = ({ onClose, primaryColor }) => {
  const [rolename, setrolename] = useState("");
 
  const [createRole, { isLoading }] = useCreateRoleMutation();
  const [checkboxes, setCheckboxes] = useState({});

  const pageNames = [
    { id: 1, label: "Piece Receipt" },
    { id: 2, label: "Table and Lot Allocation" },
    { id: 3, label: "Defect Entry" },
    { id: 4, label: "Folding Pending List" },
    { id: 5, label: "Piece Folding Entry" },
    { id: 6, label: "PackingSlip" },
    { id: 7, label: "PieceVerification" },
  ];

  const handleCheckboxChange = (id) => {
    setCheckboxes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCheckboxes = pageNames
      .filter((checkbox) => checkboxes[checkbox.id])
      .map((checkbox) => ({ id: checkbox.id, label: checkbox.label }));

    const formData = { rolename, checkboxes: selectedCheckboxes };

    if (!rolename  ) {
      toast.info("Please fill all required fields");
      return;
    }


    createRole(formData)
      .unwrap()
      .then((response) => {
        if (response.statusCode === 1) {
          toast.error(response.message);
        } else {
          toast.success("User created");
          onClose();
        }
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`);
      });
  };

  return (
    <Box sx={{ p: 0 }}>
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
          Create Role
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
                label="Rolename"
                variant="outlined"
                value={rolename}
                onChange={(e) => setrolename(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon    
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
              <Typography variant="body2" fontWeight="500" gutterBottom>
                Permissions
              </Typography>

              <Grid container spacing={1}>
                {pageNames.map((checkbox) => (
                  <Grid item xs={6} key={checkbox.id}>
                    <CompactCheckbox
                      control={
                        <Checkbox
                          size="small"
                          checked={checkboxes[checkbox.id] || false}
                          onChange={() => handleCheckboxChange(checkbox.id)}
                        />
                      }
                      label={checkbox.label}
                      primarycolor={primaryColor}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
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
                  {isLoading ? "Creating..." : "Create"}
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
