import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder',
];

export default function MultipleSelectCheckmarks({onSelectionName}) {
  const [personName, setPersonName] = React.useState([]);
  console.log(personName);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    const updatedNames = typeof value === 'string' ? value.split(',') : value
    setPersonName(updatedNames);
    onSelectionName(updatedNames)
  };

  return (
    <div>
      <FormControl  sx={{ m: 1, width: 120 }}>
        <InputLabel   InputLabelProps={{
    style: { color: '#fff' },
  }}id="demo-multiple-checkbox-label">Machines </InputLabel>
        <Select
       sx={{
        '.&MuiTypography-root':{
          fontSize:'small',
       

        },
        "& fieldset": {
          border: "none",
        },
      }}
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput label="Tag" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem sx={{'&.MuiButtonBase-root':{
              '&.MuiMenuItem-root':{
                '&.MuiTypography-root':{fontWeight:'700'}
              }
            }}} key={name} value={name}>
              <Checkbox checked={personName.indexOf(name) > -1} />
              <ListItemText sx={{'&.MuiListItemText-root':{fontSize:'85px',fontStyle:'oblique'},
            '&.MuiTypography-root':{fontWeight:'100'}
            }} primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
