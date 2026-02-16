import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faEye,
  faEyeSlash,
  faImages,
  faCartPlus,
  faGlobeAsia,
  faHouseMedicalFlag,
  faUserDoctor,
  faExternalLink,
  faHandHoldingMedical,
  faPlusCircle,
  faAmbulance,
  faPrescriptionBottleMedical,
  faCheck,
  faClose,
  faCaretDown,
  faFileExcel,
  faAngleDoubleRight,
  faBars,
  faBoxes,
  faTruck,
  faTruckLoading,
  faThumbsUp,
  faRotateLeft,
  faSun,
  faMoon,
  faGears,
  faMagnifyingGlass,
  faDolly, // ✅ add this
} from "@fortawesome/free-solid-svg-icons";

import {
  FaArrowAltCircleUp,
  FaArrowAltCircleDown,
} from "react-icons/fa";

// Exported Icons
export const MENU_ICON = <FontAwesomeIcon icon={faBars} />;
export const DELETE = (
  <span className="text-red-600">
    <FontAwesomeIcon icon={faTrashCan} />
  </span>
);
export const VIEW = (
  <span className="text-blue-600">
    <FontAwesomeIcon icon={faEye} />
  </span>
);
export const UNVIEW = (
  <span className="text-blue-600">
    <FontAwesomeIcon icon={faEyeSlash} />
  </span>
);
export const IMAGE_ICON = <span><FontAwesomeIcon icon={faImages} /></span>;
export const EMPTY_ICON = <span><FontAwesomeIcon icon={faCartPlus} /></span>;
export const GLOBE_ICON = <span><FontAwesomeIcon icon={faGlobeAsia} /></span>;
export const MEDICAL_USERS_ICON = <FontAwesomeIcon icon={faHouseMedicalFlag} />;
export const INSPECTION_ICON = <FontAwesomeIcon icon={faMagnifyingGlass} />;
export const LOT_ICON = <FontAwesomeIcon icon={faBoxes} />;
export const LOADING_ICON = <FontAwesomeIcon icon={faGears} />;
export const UNLOADING_ICON = <FontAwesomeIcon icon={faDolly} />;
export const DOCTOR_ICON = <FontAwesomeIcon icon={faUserDoctor} />;
export const PATIENT_ICON = <FontAwesomeIcon icon={faHandHoldingMedical} />;
export const WEB_LINK = <FontAwesomeIcon icon={faExternalLink} />;
export const PLUS = <FontAwesomeIcon icon={faPlusCircle} />;
export const EMERGENCY_ICON = <FontAwesomeIcon icon={faAmbulance} />;
export const PRESCRIPTION_ICON = <FontAwesomeIcon icon={faPrescriptionBottleMedical} />;
export const TICK_ICON = <FontAwesomeIcon icon={faCheck} />;
export const CLOSE_ICON = <FontAwesomeIcon icon={faClose} />;
export const APPROVAL_ICON = <FontAwesomeIcon icon={faThumbsUp} />;
export const REVERT_ICON = <FontAwesomeIcon icon={faRotateLeft} />;
export const CARET_DOWN_ICON = <FontAwesomeIcon icon={faCaretDown} />;
export const EXCEL_ICON = <FontAwesomeIcon icon={faFileExcel} />;
export const DOUBLE_NEXT_ICON = <FontAwesomeIcon icon={faAngleDoubleRight} />;

// ✅ Add SUN and MOON icons
export const SUN_ICON = <FontAwesomeIcon icon={faSun} />;
export const MOON_ICON = <FontAwesomeIcon icon={faMoon} />;

// Trend Icons
export const UP_TREND_ICON = (
  <span className="text-green-500">
    <FaArrowAltCircleUp />
  </span>
);
export const DOWN_TREND_ICON = (
  <span className="text-red-500">
    <FaArrowAltCircleDown />
  </span>
);
