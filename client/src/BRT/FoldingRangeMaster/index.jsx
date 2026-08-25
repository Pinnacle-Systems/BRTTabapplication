import React, { useState } from "react";
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
  Avatar,
  Fade,
  alpha,
  styled,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

// Theme color matching the Roles component vibe (or a neat blue)
const primaryColor = "#1976d2";
const hoverColor = alpha(primaryColor, 0.08);
const activeColor = alpha(primaryColor, 0.16);

// Compact styled components as in Roles
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

// A form component for the Modal
const RangeForm = ({ onClose }) => {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Add/Edit Range
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          >
            <option value="">Select</option>

            <option value="Folding Meters">Folding Meters</option>
            <option value="Pick">Pick</option>
            <option value="Width">Width</option>
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Range
            </label>
            <input
              type="number"
              placeholder="Starting Range"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Range
            </label>
            <input
              type="number"
              placeholder="Ending Range"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 text-sm rounded shadow-sm hover:shadow transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </Box>
  );
};

const FoldingRangeMaster = () => {
  const [open, setOpen] = useState(false);
  // Temporary mock data for UI visualization
  const [ranges] = useState([
    { name: "Folding Meters", from: "1", to: "10" },
    { name: "Pick", from: "11", to: "20" },
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
          Range Master
        </Typography>

        <CompactButton
          startIcon={<AddIcon sx={{ fontSize: "18px" }} />}
          onClick={handleOpen}
        >
          Add Range
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
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "600",
                    py: 1,
                    bgcolor: "black",
                    color: "white",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "600",
                    py: 1,
                    bgcolor: "black",
                    color: "white",
                  }}
                >
                  From Range
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "600",
                    py: 1,
                    bgcolor: "black",
                    color: "white",
                  }}
                >
                  To Range
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "600",
                    py: 1,
                    bgcolor: "black",
                    color: "white",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranges.map((row, index) => (
                <CompactTableRow key={index} hover>
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
                        {row.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{row.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>{row.from}</TableCell>
                  <TableCell sx={{ py: 1 }}>{row.to}</TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <IconButton
                      size="small"
                      onClick={handleOpen}
                      sx={{ color: primaryColor }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </CompactTableRow>
              ))}
              {ranges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">
                      No ranges found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
              width: { xs: "95%", sm: "80%", md: "400px" },
              bgcolor: "background.paper",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              p: 0,
              outline: "none",
            }}
          >
            <RangeForm onClose={handleClose} />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default FoldingRangeMaster;
