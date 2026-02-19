import * as React from "react";
import { useGetUsersQuery } from "../redux/userservice";
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
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import Form from '../Form/Form';

// Theme color
const primaryColor = '#2BA94C';
const hoverColor = alpha(primaryColor, 0.08);
const activeColor = alpha(primaryColor, 0.16);

// Compact styled components
const CompactPaper = styled(Paper)({
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
});

const CompactButton = styled(Button)({
  backgroundColor: primaryColor,
  color: 'white',
  textTransform: 'none',
  borderRadius: '6px',
  padding: '6px 16px',
  fontSize: '0.875rem',
  '&:hover': {
    backgroundColor: alpha(primaryColor, 0.9),
  }
});

const CompactTableRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: hoverColor,
  },
  '&.Mui-selected': {
    backgroundColor: activeColor,
  }
});

export default function UserManagement() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    refetch();
  };

  const { data: userData, refetch, isLoading } = useGetUsersQuery();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={24} sx={{ color: primaryColor }} />
      </Box>
    );
  }

  // if (!userData?.data) {
  //   return (
  //     <Typography variant="body1" color="textSecondary" textAlign="center" mt={2}>
  //       No user data available
  //     </Typography>
  //   );
  // }

  const groupedUsers = userData?.data?.reduce((acc, user) => {
    if (!acc[user?.USERNAME]) {
      acc[user?.USERNAME] = {
        USERNAME: user?.USERNAME,
        roles: [],
      };
    }
    if (user?.role && !acc[user?.USERNAME]?.roles?.includes(user?.role)) {
      acc[user?.USERNAME]?.roles.push(user?.role);
    }
    return acc;
  }, {});

  const uniqueRoles = [...new Set(userData?.data?.map(user => user.role)?.filter(role => role))];

  return (
    <Box sx={{ p: 2 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          gap: 1,
          flexWrap: 'wrap'
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="600"
          sx={{ color: primaryColor }}
        >
          User Management
        </Typography>
        
        <CompactButton
          startIcon={<AddIcon sx={{ fontSize: '18px' }} />}
          onClick={handleOpen}
        >
          Add User
        </CompactButton>
      </Box>

      <CompactPaper elevation={0}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
                <TableCell sx={{ fontWeight: '600', py: 1 }}>User</TableCell>

          
              </TableRow>
            </TableHead>
            <TableBody>
              {Object?.values(groupedUsers)?.map((user, index) => (
                <CompactTableRow key={index} hover>
                  <TableCell sx={{ py: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha(primaryColor, 0.2), 
                          color: primaryColor,
                          width: 28, 
                          height: 28,
                          fontSize: '0.875rem'
                        }}
                      >
                        {user?.userName?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{user?.userName}</Typography>
                    </Box>
                  </TableCell>
              
                
                </CompactTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CompactPaper>

      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '80%', md: '500px' },
              bgcolor: 'background.paper',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              p: 0,
              outline: 'none'
            }}
          >
            <Form onClose={handleClose} primaryColor={primaryColor} />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}