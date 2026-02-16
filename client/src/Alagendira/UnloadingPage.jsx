import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
  useGetUnLoadingDetailQuery,
  useUpdateUnLoadingDetailMutation,
  useUpdateStopDetailMutation,
  useGetStopDetailQuery,
  useGetContractorDetailQuery,
  useGetMachineDetailQuery
} from '../redux/services/LotDetailData';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiEdit2,
  FiCheckCircle,
  FiEye,
  FiSearch,
  FiXCircle,
  FiPlay,
} from 'react-icons/fi';
import { MdTableChart, MdGridView } from 'react-icons/md';
import { BsCheckCircleFill } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import './LotPreparation.css';
import DateTimeInputExample, { getRailwayTime24 } from './utils';


const FILTERS_INITIAL_STATE = {
  batchNo: '',
  customer: '',
  fabric: '',
  dateFrom: '',
  dateTo: '',
  status: ''
};

const StatusIndicator = ({ status }) => (
  <div className={`status-indicator ${status}`}>
    {status === 'completed' ? (
      <BsCheckCircleFill size={12} />
    ) : (
      <div className="pending-dot" />
    )}
  </div>
);


const InfoItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-medium text-gray-800">{value || '-'}</span>
  </div>
);
const DropdownField = ({ label, value, options = [], valueKey, onChange, disabled }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <select
      className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2BA94C] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Select {label}</option>
      {options.map((item, idx) => (
        <option key={idx} value={item[valueKey]}>
          {item[valueKey]}
        </option>
      ))}
    </select>
  </div>
);
const ReadonlyField = ({ label, value }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <div className="border p-2 rounded bg-gray-100 text-sm text-gray-700">
      {value || `No ${label}`}
    </div>
  </div>
);

const LoadingState = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p className="loading-text">Loading loading data...</p>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="error-container">
    <div className="error-card">
      <h3 className="error-title">Error loading data</h3>
      <p className="error-message">{error?.message || 'Unknown error occurred'}</p>
      <button onClick={onRetry} className="btn btn-primary">
        <FiRefreshCw className="mr-2" /> Retry
      </button>
    </div>
  </div>
);

const DataFormatError = ({ statusCode, onRetry }) => (
  <div className="error-container">
    <div className="error-card">
      <h3 className="error-title">Data Format Error</h3>
      <p className="error-message">Received unexpected status code: {statusCode}</p>
      <button onClick={onRetry} className="btn btn-primary">
        <FiRefreshCw className="mr-2" /> Retry
      </button>
    </div>
  </div>
);

const UnLoadingPreparation = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [viewMode, setViewMode] = useState(isMobile ? 'cards' : 'table');
  const [selectedLot, setSelectedLot] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedUnContractor, setSelectedUnContractor] = useState('');

  const [currentDateTime, setCurrentDateTime] = useState('');
  console.log(selectedLot, "selectedLot")

  const [filters, setFilters] = useState(FILTERS_INITIAL_STATE);

  const {
    data: apiResponse,
    error,
    isLoading,
    refetch
  } = useGetUnLoadingDetailQuery();
  const { data: stopDetail } = useGetStopDetailQuery()
  const stopDetailList = stopDetail?.data
  console.log(stopDetailList, "stopDetail")
  const [updateLot] = useUpdateUnLoadingDetailMutation();
  const [stoplotdet] = useUpdateStopDetailMutation();

  const [machineStatus, setMachineStatus] = useState({
    isRunning: false,
    isStopped: false,
    issue: '',
    manualTime: null,
    remarks: ''
  });




  const { data: ContractorData } = useGetContractorDetailQuery();

  const {
    data: MachineData,
    refetch: refetchMachine
  } = useGetMachineDetailQuery(
    { params: { PROCESSNAME: selectedLot?.PROCESSNAME } },
    { skip: !selectedLot?.PROCESSNAME }
  );

  const machineDet = MachineData?.data || [];
  const contractDet = ContractorData?.data || [];
  const hasDataError = !isLoading && !error && apiResponse?.statusCode !== 0;
  const hasActiveFilters = useMemo(() =>
    Object.values(filters).some(val => val !== '') || searchQuery,
    [filters, searchQuery]
  );

  useEffect(() => {
    setViewMode(isMobile ? 'cards' : 'table');
  }, [isMobile]);

  useEffect(() => {
    if (selectedLot?.PROCESSNAME) {
      refetchMachine();
    }
  }, [selectedLot, refetchMachine]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  const getStatus = useCallback((lot) => {
    return lot.ENDT ? 'completed' : 'pending';
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(FILTERS_INITIAL_STATE);
    setSearchQuery('');
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const handleLotClick = useCallback((lot) => {
    setSelectedLot(lot);
  }, []);

  const closeDetailView = useCallback(() => {
    setSelectedLot(null);
    setSelectedMachine('');
    setSelectedContractor('');
    setSelectedUnContractor('')
  }, []);
  const matchedItem = apiResponse?.data.filter(item =>
    selectedLot?.some(lot =>
      lot.BATCHNO === item.BATCHNO &&
      lot.PROCESSNAME === item.PROCESSNAME
    )
  );

  console.log(matchedItem, "matchedItem")

  const markAsCompleted = async (lotData) => {
    if (!selectedUnContractor) {
      toast.error('Please select both Machine and Contractor');
      return;
    }

    const loadingToast = toast.loading('Updating lot status...');
    try {
      const payload = {
        CONTRACTORNAME: selectedUnContractor,
        // STDTIME: new Date(currentDateTime).toISOString(),
        STDTIME: getRailwayTime24(currentDateTime),

        STATUS: 'UNLOADING'
      };

      console.log('Submitting payload:', payload);

      await updateLot({ ...lotData, id: lotData.IID, payload }).unwrap();
      toast.success('Lot marked as completed!', { id: loadingToast });
      refetch();
      closeDetailView();
    } catch (err) {
      toast.error('Failed to update lot. ' + (err.data?.message || ''), { id: loadingToast });
      console.error('Failed to update lot:', err);
    }
  };
  console.log(stopDetailList, "stopDetail")
  const filteredData = useMemo(() => {
    if (apiResponse?.statusCode !== 0) return [];

    return (apiResponse.data || []).filter(lot => {
      const matchesSearch = !searchQuery ||
        lot.BATCHNO.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.CUSTNAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.FABRIC.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot?.MACHINE?.toLowerCase().includes(searchQuery.toLowerCase());

      const batchNoMatch = !filters.batchNo ||
        lot.BATCHNO.toLowerCase().includes(filters.batchNo.toLowerCase());
      const customerMatch = !filters.customer ||
        lot.CUSTNAME.toLowerCase().includes(filters.customer.toLowerCase());
      const fabricMatch = !filters.fabric ||
        lot.FABRIC.toLowerCase().includes(filters.fabric.toLowerCase());
      const statusMatch = !filters.status ||
        (filters.status === 'completed' ? lot.ENDT : !lot.ENDT);

      let dateMatch = true;
      if (filters.dateFrom) {
        const startDate = new Date(lot.STDT);
        const fromDate = new Date(filters.dateFrom);
        dateMatch = dateMatch && startDate >= fromDate;
      }
      if (filters.dateTo) {
        const endDate = new Date(lot.ENDT || lot.STDT);
        const toDate = new Date(filters.dateTo);
        dateMatch = dateMatch && endDate <= toDate;
      }

      return matchesSearch && batchNoMatch && customerMatch && fabricMatch && dateMatch && statusMatch;
    });
  }, [apiResponse, searchQuery, filters]);


  const renderFilterModal = () => (
    <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
      <div className="filter-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Filter Lots</h3>
          <button className="bg-red-600 rounded-full text-white p-1" onClick={() => setShowFilterModal(false)}>
            <FiX size={20} />
          </button>
        </div>
        <div className="modal-content">
          {Object.entries({
            batchNo: 'Batch No',
            customer: 'Customer',
            fabric: 'Fabric'
          }).map(([key, label]) => (
            <div key={key} className="filter-group">
              <label className="filter-label">{label}</label>
              <input
                type="text"
                name={key}
                value={filters[key]}
                onChange={handleFilterChange}
                placeholder={`Filter by ${label.toLowerCase()}`}
                className="filter-input"
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={resetFilters}>
            Reset Filters
          </button>
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
  const renderDetailView = () => {
    const stopDetail = stopDetailList?.find(item => item?.IID === selectedLot[0].IID);
    console.log(stopDetail, "stopDetail")
    const isStopped = stopDetail?.[0]?.STATUS === "STOP";
    const isRunning = !isStopped;
    const mainItem = Array.isArray(selectedLot) ? selectedLot[0] : selectedLot;
    const isGrouped = Array.isArray(selectedLot) && selectedLot.length > 1;
    const totalQuantity = isGrouped ? selectedLot.reduce((sum, item) => sum + item.BATQTY, 0) : mainItem.BATQTY;
    console.log(mainItem?.MACHINE, "Machine")

    const hasStopRecord = stopDetailList.some(item => item?.IID === selectedLot?.[0]?.IID);
    console.log(hasStopRecord, "hashStopRecord")
    const handleLotAction = async () => {
      try {
        let payload = {
          CONTRACTORNAME: selectedLot?.CONTRACTOR1 || '',
          STDTIME: new Date().toISOString()
        };

        if (!hasStopRecord) {
          payload = {
            ...payload,
            STATUS: 'STOP',
            STOPREASON: machineStatus.issue,
            MANUAL_TIME: machineStatus.manualTime,
            REMARKS: machineStatus.remarks
          };
        } else {
          payload = {
            ...payload,
            STATUS: 'START',
            STOPREASON: '',
            MANUAL_TIME: machineStatus.manualTime,
            REMARKS: ''

          };
        }

        await stoplotdet({
          matchedItem, payload

        }).unwrap();

        setMachineStatus(prev => ({
          ...prev,
          isStopped: !prev.isStopped,
          isRunning: prev.isStopped,
          issue: prev.isStopped ? '' : prev.issue,
          showStopForm: false
        }));

        toast.success(`Machine ${machineStatus.isStopped ? 'started' : 'stopped'} successfully`);

      } catch (error) {
        console.error('Failed to update machine status:', error);
        toast.error(`Failed to ${machineStatus.isStopped ? 'start' : 'stop'} machine`);
      }
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Machine Controls Render
    const renderMachineControls = () => {
      if (hasStopRecord) {
        return (
          <div className="space-y-3">
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm">
              <p className="font-medium">Machine Stopped</p>
              <p>Reason: {stopDetail?.REMARKS || 'Not specified'}</p>
              {stopDetail?.STDT && (
                <p>Stopped at: {formatDateTime(stopDetail.STDT)}</p>
              )}
            </div>

            <DateTimeInputExample
              setCurrentDateTime={(time) => setMachineStatus(prev => ({
                ...prev,
                manualTime: time
              }))}
              currentDateTime={machineStatus.manualTime}
              label="Actual Start Time"
            />

            <button
              className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 flex items-center justify-center text-sm"
              onClick={() => handleLotAction('start')}
            >
              <FiPlay className="mr-2" /> Start Machine
            </button>
          </div>
        );
      }

      if (machineStatus.showStopForm) {
        return (
          <>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Stop Reason</label>
              <select
                className="w-full border p-2 rounded text-sm"
                value={machineStatus.issue}
                onChange={(e) => setMachineStatus(prev => ({
                  ...prev,
                  issue: e.target.value
                }))}
                required
              >
                <option value="">Select reason</option>
                <option value="power_failure">Power Failure</option>
                <option value="mechanical_issue">Mechanical Issue</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 mt-2">
              <label className="block text-sm text-gray-600">Reason Remark</label>
              <input
                type="text"
                placeholder="Enter additional details"
                className="w-full border p-2 rounded text-sm"
                value={machineStatus.remarks}
                onChange={(e) =>
                  setMachineStatus((prev) => ({
                    ...prev,
                    remarks: e.target.value
                  }))
                }
              />
            </div>

            <DateTimeInputExample
              setCurrentDateTime={(time) => setMachineStatus(prev => ({
                ...prev,
                manualTime: time
              }))}
              currentDateTime={machineStatus.manualTime}
              label="Actual Stop Time"
            />

            <div className="flex gap-2">
              <button
                className="flex-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
                onClick={() => setMachineStatus(prev => ({
                  ...prev,
                  showStopForm: false
                }))}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 flex items-center justify-center text-sm"
                onClick={() => handleLotAction('stop')}
                disabled={!machineStatus.issue}
              >
                Confirm Stop
              </button>
            </div>
          </>
        );
      }

      return (
        <button
          className="w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 flex items-center justify-center text-sm"
          onClick={() => setMachineStatus(prev => ({
            ...prev,
            showStopForm: true,
            manualTime: new Date().toISOString()
          }))}
        >
          <FiXCircle className="mr-2" /> Stop Machine
        </button>
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start pt-20 pb-8 px-2 overflow-y-auto"
        onClick={closeDetailView}>
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-2 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-gray-100 px-4 py-3 border-b sticky top-0 z-10">
            <div className="flex items-center gap-2 min-w-0">
              <StatusIndicator status={getStatus(mainItem)} />
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{mainItem.BATCHNO}</h3>
                <p className="text-xs text-gray-500 truncate">{mainItem.CUSTNAME}</p>
              </div>
            </div>
            <button className="text-gray-500 hover:text-red-500 shrink-0" onClick={closeDetailView}>
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Color" value={mainItem.COLOR} />
              <InfoItem label="Fabric" value={mainItem.FABRIC} />
              <InfoItem label="Quantity" value={totalQuantity.toFixed(2)} />
              <InfoItem label="Process" value={mainItem.PROCESSNAME} />
              <InfoItem label="Party Dc" value={mainItem.PARTYDC} />
              {isStopped && <InfoItem label="Record ID" value={stopDetail?.IID} />}
            </div>
            {isGrouped && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">All Items in This Batch</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">GRN No</th>
                        <th className="px-3 py-2 text-left">Fabric</th>
                        <th className="px-3 py-2 text-left">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedLot.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{item.GRNNO}</td>
                          <td className="px-3 py-2">{item.FABRIC}</td>
                          <td className="px-3 py-2">{item.BATQTY}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contractor/Machine Info */}
            <div className="grid grid-cols-2 gap-4">
              <ReadonlyField label="Machine" value={mainItem?.MACHINE} />
              <ReadonlyField label="Contractor" value={mainItem?.CONTRACTOR} />

              <DropdownField
                label="UnLoading Contractor"
                value={selectedUnContractor}
                options={contractDet}
                valueKey="CONAME"
                onChange={setSelectedUnContractor}
              />
              <DateTimeInputExample
                setCurrentDateTime={setCurrentDateTime}
                currentDateTime={currentDateTime}
              />
            </div>


            {/* Remarks */}
            {selectedLot.REMARKS && (
              <div>
                <span className="block text-sm text-gray-600 mb-1">Remarks</span>
                <div className="bg-gray-50 p-2 rounded text-gray-700 text-sm border">
                  {selectedLot.REMARKS}
                </div>
              </div>
            )}

            {/* Machine Controls */}
            <div className="border-t pt-3">
              <h4 className="font-medium text-gray-800 mb-2">Machine Controls</h4>
              {renderMachineControls()}
            </div>

          </div>


          {/* Footer */}
          <div className="flex justify-between gap-2 px-4 py-3 border-t bg-gray-50 sticky bottom-0 z-10">
            <button
              className="flex-1 border text-gray-700 px-3 py-2 rounded hover:bg-gray-100 flex items-center justify-center text-sm"
              onClick={() => {/* Edit functionality */ }}
            >
              <FiEdit2 className="mr-1" /> Edit
            </button>

            <button
              className={`flex-1 px-3 py-2 rounded flex items-center justify-center text-sm
    ${hasStopRecord ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2BA94C] hover:bg-green-600 text-white'}`}
              onClick={() => markAsCompleted(selectedLot)}
              disabled={hasStopRecord}
            >
              <FiCheckCircle className="mr-1" /> Complete
            </button>

          </div>
        </div>
      </div>
    );
  };

  const renderCardsView = () => {
    const groupedData = filteredData.reduce((acc, item) => {
      const key = `${item.BATCHNO}_${item.PROCESSNAME}`;
      if (!acc[key]) {
        acc[key] = {
          ...item,
          items: [item],
          BATQTY: item.BATQTY,
          FABRIC: new Set([item.FABRIC]),
          GRNNO: new Set([item.GRNNO]),
        };
      } else {
        acc[key].BATQTY += item.BATQTY;
        acc[key].FABRIC.add(item.FABRIC);
        acc[key].GRNNO.add(item.GRNNO);
        acc[key].items.push(item);
      }
      return acc;
    }, {});

    const processedData = Object.values(groupedData).map(group => ({
      ...group,
      FABRIC: Array.from(group.FABRIC).join(', '),
      GRNNO: Array.from(group.GRNNO).join(', '),
    }));

    return (
      <div className="cards-view">
        {processedData.length > 0 ? (
          <div className="cards-grid">
            {processedData.map((item) => (
              <div
                key={item.IID}
                className={`lot-card ${getStatus(item)}`}
                onClick={() => handleLotClick(item.items)}
              >
                <div className="card-header">
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={getStatus(item)} />
                    <span className="batch-no">{item.BATCHNO}</span>
                  </div>
                  <div className="card-date">{formatDate(item.STDT)}</div>
                </div>
                <div className="card-content">
                  {[
                    { label: 'Customer', value: item.CUSTNAME },
                    { label: 'Color', value: item.COLOR },
                    { label: 'Fabric', value: item.FABRIC },
                    { label: 'GRN No', value: item.GRNNO },
                    { label: 'Quantity', value: item.BATQTY },
                    { label: 'Process Name', value: item.PROCESSNAME, highlight: true },
                    { label: 'Machine', value: item.MACHINE },
                    { label: 'Party Dc', value: item.PARTYDC }

                  ].map((field, idx) => (
                    <div key={idx} className="card-row">
                      <span className="card-label">{field.label}</span>
                      <span
                        className={`${field.highlight ? "text-blue-600 font-semibold" : ""}`}
                      >
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="card-actions">
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLotClick(item.items);
                    }}
                    title="View details"
                  >
                    <FiEye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            hasData={apiResponse?.data?.length > 0}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        )}
      </div>
    );
  };


  const renderTableView = () => {
    const groupedData = filteredData.reduce((acc, item) => {
      const key = `${item.BATCHNO}_${item.PROCESSNAME}`;

      if (!acc[key]) {
        acc[key] = {
          ...item,
          items: [item],
          BATQTY: item.BATQTY,
          FABRIC: new Set([item.FABRIC]),
          GRNNO: new Set([item.GRNNO]),
          hasIncomplete: !item.ENDT,
          PARTYDC: new Set([item.PARTYDC])
        };
      } else {
        acc[key].BATQTY += item.BATQTY;
        acc[key].FABRIC.add(item.FABRIC);
        acc[key].GRNNO.add(item.GRNNO);
        acc[key].PARTYDC.add(item.PARTYDC);
        acc[key].items.push(item);
        acc[key].hasIncomplete = acc[key].hasIncomplete || !item.ENDT;
      }
      return acc;
    }, {});

    const processedData = Object.values(groupedData).map(group => ({
      ...group,
      FABRIC: Array.from(group.FABRIC).join(', '),
      GRNNO: Array.from(group.GRNNO).join(', '),
      PARTYDC: Array.from(group.PARTYDC).join(', ')
    }));

    return (
      <div className="table-view">
        <div className="table-wrapper">
          {processedData.length > 0 ? (
            <table className="lot-table w-full table-auto border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="text-left px-4 py-2 min-w-[140px]">Batch No</th>
                  <th className="text-left px-4 py-2 min-w-[160px]">Customer</th>
                  <th className="text-left px-4 py-2 min-w-[160px]">Process</th>
                  <th className="text-left px-4 py-2 min-w-[160px]">Fabric</th>
                  <th className="text-left px-4 py-2 min-w-[120px]">GRN No</th>
                  <th className="text-right px-4 py-2 w-[80px]">Qty</th>
                  <th className="text-left px-4 py-2 min-w-[120px]">Status</th>
                  <th className="text-left px-4 py-2 min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {processedData.map((item) => (
                  <tr
                    key={item.IID}
                    onClick={() => handleLotClick(item.items)}
                    className="hover:bg-gray-50 cursor-pointer border-t"
                  >
                    <td className="px-4 py-2 font-medium">
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={getStatus(item)} />
                        {item.BATCHNO}
                      </div>
                    </td>
                    <td className="px-4 py-2">{item.CUSTNAME}</td>
                    <td className="px-4 py-2 font-medium text-blue-600">
                      {item.PROCESSNAME}
                    </td>
                    <td className="px-4 py-2">{item.FABRIC}</td>
                    <td className="px-4 py-2">{item.GRNNO}</td>
                    <td className="px-4 py-2 text-right">{item.BATQTY.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`status-badge ${getStatus(item)}`}>
                        {getStatus(item) === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-gray-500 hover:text-blue-600 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLotClick(item.items);
                          }}
                          title="View details"
                        >
                          <FiEye size={16} />
                        </button>

                        {item.hasIncomplete && (
                          <button
                            className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              item.items.forEach(lotItem => {
                                if (!lotItem.ENDT) markAsCompleted(lotItem);
                              });
                            }}
                            title="Mark all as completed"
                          >
                            <FiCheckCircle size={14} />
                            <span className="hidden md:inline">Complete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              hasData={apiResponse?.data?.length > 0}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
            />
          )}
        </div>
      </div>
    );
  };

  const EmptyState = ({ hasData, hasActiveFilters, onResetFilters }) => (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-state-icon">
          <FiSearch size={48} />
        </div>
        <h3 className="empty-state-title">
          {!hasData ? 'No Loading data available' : 'No lots match your search or filters'}
        </h3>
        <p className="empty-state-description">
          {!hasData ? 'Start by creating a new Loading entry' : 'Try adjusting your search or filters'}
        </p>
        {hasActiveFilters && (
          <button className="btn btn-primary" onClick={onResetFilters}>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (hasDataError) return <DataFormatError statusCode={apiResponse?.statusCode} onRetry={refetch} />;

  return (
    <div className="">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lots..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
              />
            </div>
            <ViewModeToggle
              currentMode={viewMode}
              onChange={setViewMode}
            />
          </div>

          {filteredData.length > 0 && (
            <span className="bg-green-100 text-green-700 text-sm font-medium py-1  rounded-full">
              {filteredData.length} {filteredData.length === 1 ? "lot" : "lots"}
            </span>
          )}

          <div className="flex items-center gap-2">
            <FilterButton
              hasActiveFilters={hasActiveFilters}
              onClick={() => setShowFilterModal(true)}
            />
            <button
              onClick={refetch}
              className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-green-500 hover:text-white transition"
              title="Refresh Data"
            >
              <FiRefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? renderTableView() : renderCardsView()}
      {showFilterModal && renderFilterModal()}
      {selectedLot && renderDetailView()}
    </div>
  );
};

const ViewModeToggle = ({ currentMode, onChange }) => (
  <>
    <button
      onClick={() => onChange("table")}
      className={`p-2 rounded-md border ${currentMode === "table"
        ? "bg-green-500 text-white"
        : "bg-gray-100 text-gray-700"
        } hover:bg-green-500 hover:text-white transition`}
      title="Table View"
    >
      <MdTableChart size={20} />
    </button>
    <button
      onClick={() => onChange("cards")}
      className={`p-2 rounded-md border ${currentMode === "cards"
        ? "bg-green-500 text-white"
        : "bg-gray-100 text-gray-700"
        } hover:bg-green-500 hover:text-white transition`}
      title="Card View"
    >
      <MdGridView size={20} />
    </button>
  </>
);

const FilterButton = ({ hasActiveFilters, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${hasActiveFilters
      ? "bg-green-600 text-white"
      : "border border-gray-300 text-gray-700"
      } hover:bg-green-500 hover:text-white transition`}
  >
    <FiFilter />
    {hasActiveFilters && (
      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
    )}
  </button>
);

export default UnLoadingPreparation;