import React, { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function SelectSmall({ select, setSelect, menuItems }) {
  const [age, setAge] = useState('');
  console.log(menuItems)
  const handleChange = (event) => {
    console.log(event);
    setAge(event.target.value);
    setSelect(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 160 }} size="small">
      <InputLabel id="demo-select-small-label">Select</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={age}
        label="Age"
        onChange={handleChange}
        inputProps={{ 'aria-label': 'Without label' }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {menuItems.map((item) => (
          <MenuItem key={item.machineId} value={item.machineId}>
            {item.machineNamee}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
