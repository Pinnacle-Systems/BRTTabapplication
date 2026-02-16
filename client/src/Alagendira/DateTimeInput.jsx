import { useEffect, useState } from 'react';

export default function DateTimeInput({ 
  setCurrentDateTime, 
  currentDateTime, 
  label = "Date & Time",
  allowManualEdit = true
}) {
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Convert ISO string to display format (YYYY-MM-DD HH:mm)
  const toDisplayFormat = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Convert display format to ISO string
  const parseManualInput = (input) => {
    // Try both space and T as separators
    const [datePart, timePart] = input.split(/[ T]/);
    if (!datePart || !timePart) return null;
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Validate
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        isNaN(hours) || isNaN(minutes)) {
      return null;
    }
    
    const date = new Date(year, month - 1, day, hours, minutes);
    return date.toISOString();
  };

  // Handle datetime-local input change
  const handlePickerChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setCurrentDateTime('');
      return;
    }
    
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    const date = new Date(year, month - 1, day, hours, minutes);
    setCurrentDateTime(date.toISOString());
  };

  // Handle manual input change
  const handleManualInputChange = (e) => {
    setManualInput(e.target.value);
  };

  // Submit manual input
  const submitManualInput = () => {
    const isoString = parseManualInput(manualInput);
    if (isoString) {
      setCurrentDateTime(isoString);
      setShowManualInput(false);
    }
  };

  // Set initial values
  useEffect(() => {
    if (currentDateTime) {
      setManualInput(toDisplayFormat(currentDateTime));
    } else {
      const now = new Date();
      setCurrentDateTime(now.toISOString());
      setManualInput(toDisplayFormat(now.toISOString()));
    }
  }, [currentDateTime, setCurrentDateTime]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="ml-1 text-xs text-gray-500">(24-hour format)</span>
      </label>
      
      {showManualInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={manualInput}
            onChange={handleManualInputChange}
            placeholder="YYYY-MM-DD HH:mm"
          />
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={submitManualInput}
          >
            OK
          </button>
          <button
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            onClick={() => setShowManualInput(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="datetime-local"
            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={currentDateTime ? toDisplayFormat(currentDateTime).replace(' ', 'T') : ''}
            onChange={handlePickerChange}
            step="60"
          />
          {allowManualEdit && (
            <button
              className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={() => setShowManualInput(true)}
            >
              Manual
            </button>
          )}
        </div>
      )}
      
      {showManualInput && (
        <p className="text-xs text-gray-500">
          Enter date and time in format: YYYY-MM-DD HH:mm (24-hour)
        </p>
      )}
    </div>
  );
}