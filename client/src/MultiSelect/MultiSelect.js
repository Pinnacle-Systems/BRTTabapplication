import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
// import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Select, { components } from "react-select";

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



const RequiredLabel = ({ name }) => (
  <p>
    {`${name}`}
    <span className="text-red-500">*</span>{" "}
  </p>
);


const Option = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{ marginRight: 8 }}
      />
      {props.label}
    </components.Option>
  );
};

const ValueContainer = ({ children, ...props }) => {
  const { getValue } = props;
  const selected = getValue();

  const MAX_DISPLAY = 5;

  let displayText = "";

  if (selected.length > 0) {
    const labels = selected.slice(0, MAX_DISPLAY).map((item) => item.label);

    if (selected.length > MAX_DISPLAY) {
      displayText = `${labels.join(", ")} +${selected.length - MAX_DISPLAY
        } more`;
    } else {
      displayText = labels.join(", ");
    }
  }

  return (
    <components.ValueContainer {...props}>
      <div
        style={{
          fontSize: "13px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {displayText}
      </div>
      {children[1]}
    </components.ValueContainer>
  );
};

export const MultiSelectDropdownNew = ({
  name,
  selected,
  label,
  setSelected,
  options,
  readOnly = false,
  tabIndex = null,
  className = "",
  required,
  disabled,
  labelHidden = false,
}) => {

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "30px",
      height: "28px",
      borderRadius: "6px",
      fontSize: "13px",
      borderColor: "#d1d5db",
      padding: "0",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#f3f4f6"
        : "#ffffff",
      color: "#111827",
      fontSize: "11px",
      paddingTop: "4px",
      paddingBottom: "4px",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,   // 🔥 important
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,   // 🔥 for modals
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
      height: "28px",
    }),

    input: (base) => ({
      ...base,
      margin: "0",
      padding: "0",
    }),

    multiValue: (base) => ({
      ...base,
      padding: "0 4px",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "28px",
    }),
  };
  return (
    <div className={`block text-xs font-bold text-gray-600 mb-3 ${className} `}>
      {!labelHidden && (
        <span className="mb-3">
          {required ? <RequiredLabel name={label ? label : name} /> : (label || name)}
        </span>
      )}

      <div className="mt-1 ">
        <Select
          isMulti
          options={options}
          value={selected}
          onChange={setSelected}
          components={{ Option, ValueContainer }}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          placeholder=""
          maxMenuHeight={200}
          styles={customStyles}
          menuPortalTarget={document.body}
        />
      </div>
    </div>
  );
};