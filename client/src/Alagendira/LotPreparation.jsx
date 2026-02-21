import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useGetLotDetailQuery, useUpdateLotDetailMutation } from '../redux/services/LotDetailData';
import {
  FiFilter,
  FiRefreshCw,
  FiX,
  FiEdit2,
  FiCheckCircle,
  FiEye,
  FiSearch,
} from 'react-icons/fi';
import { MdTableChart, MdGridView } from 'react-icons/md';
import { BsThreeDotsVertical, BsCheckCircleFill } from 'react-icons/bs';
import './LotPreparation.css';
import { toast } from 'react-hot-toast';
import { useGetContractorDetailQuery } from '../redux/services/LotDetailData';

const LotPreparation = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [viewMode, setViewMode] = useState(isMobile ? 'cards' : 'table');
  const [selectedLot, setSelectedLot] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [selectedContractor,setSelectedContractor] = useState('')

  const filtersInitialState = {
    batchNo: '',
    customer: '',
    fabric: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  };
  const DropdownField = ({ label, value, options = [], valueKey, onChange }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <select
      className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2BA94C] text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
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

  const [filters, setFilters] = useState(filtersInitialState);
let apiResponse;
let error;
let isLoading;
let refetch;
  // const {
  //   data: apiResponse,
  //   error,
  //   isLoading,
  //   refetch
  // } = useGetLotDetailQuery();
  const {data:contractDet} = useGetContractorDetailQuery()
  const Contractor = contractDet?.data
  const [updateLot] = useUpdateLotDetailMutation();
  console.log(apiResponse?.data, "apiResponse")
  const filteredData = apiResponse?.statusCode === 0
    ? (apiResponse.data || []).filter(lot => {
      const matchesSearch = !searchQuery ||
        (lot?.BATCHNO?.toLowerCase?.().includes(searchQuery.toLowerCase())) ||
        (lot?.CUSTNAME?.toLowerCase?.().includes(searchQuery.toLowerCase())) ||
        (lot?.FABRIC?.toLowerCase?.().includes(searchQuery.toLowerCase()));

      const batchNoMatch = !filters.batchNo ||
        (lot?.BATCHNO?.toLowerCase?.().includes(filters.batchNo.toLowerCase()));
      const customerMatch = !filters.customer ||
        (lot?.CUSTNAME?.toLowerCase?.().includes(filters.customer.toLowerCase()));
      const fabricMatch = !filters.fabric ||
        (lot?.FABRIC?.toLowerCase?.().includes(filters.fabric.toLowerCase()));
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
    })
    : [];


  const hasDataError = !isLoading && !error && apiResponse?.statusCode !== 0;
  const hasActiveFilters = Object.values(filters).some(val => val !== '') || searchQuery;

  useEffect(() => {
    setViewMode(isMobile ? 'cards' : 'table');
  }, [isMobile]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };


  const getStatus = (lot) => {
    return lot.ENDT ? 'completed' : 'pending';
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters(filtersInitialState);
    setSearchQuery('');
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  const handleLotClick = (lot) => {
    setSelectedLot(lot);
    setShowActionsMenu(null);
  };

  const closeDetailView = () => {
    setSelectedLot(null);
  };

const markAsCompleted = async (lotData) => {
  console.log(lotData, "lotId");
  const loadingToast = toast.loading('Updating lot status...');

  try {
   if (!selectedContractor) {
         toast.error('Please select  Contractor');
         return;
       }
    await updateLot({
      ...lotData,
      status: 'COMPLETED',
      processName: 'LOT PREPARATION',CONTRACTORNAME: selectedContractor,
    }).unwrap();

    toast.success('Lot marked as completed!', { id: loadingToast });
    refetch();
    closeDetailView();
  } catch (err) {
    toast.error('Failed to update lot.', { id: loadingToast });
    console.error('Failed to update lot:', err);
  }
};


  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading lot preparation data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3 className="error-title">Error loading data</h3>
          <p className="error-message">{error.message || 'Unknown error occurred'}</p>
          <button onClick={refetch} className="btn btn-primary">
            <FiRefreshCw className="mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (hasDataError) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3 className="error-title">Data Format Error</h3>
          <p className="error-message">Received unexpected status code: {apiResponse?.statusCode}</p>
          <button onClick={refetch} className="btn btn-primary">
            <FiRefreshCw className="mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

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
          <div className="filter-group">
            <label className="filter-label">Batch No</label>
            <input
              type="text"
              name="batchNo"
              value={filters.batchNo}
              onChange={handleFilterChange}
              placeholder="Filter by batch no"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Customer</label>
            <input
              type="text"
              name="customer"
              value={filters.customer}
              onChange={handleFilterChange}
              placeholder="Filter by customer"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Fabric</label>
            <input
              type="text"
              name="fabric"
              value={filters.fabric}
              onChange={handleFilterChange}
              placeholder="Filter by fabric"
              className="filter-input"
            />
          </div>

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
    const mainItem = Array.isArray(selectedLot) ? selectedLot[0] : selectedLot;
    const isGrouped = Array.isArray(selectedLot) && selectedLot.length > 1;
    const totalQuantity = isGrouped ? selectedLot.reduce((sum, item) => sum + item.BATQTY, 0) : mainItem.BATQTY;
    return (

      <div className="detail-view-overlay" onClick={closeDetailView}>
        <div className="detail-view-container" onClick={e => e.stopPropagation()}>
          <div className="detail-view-header">
            <div className="flex items-center gap-3">
              <div className={`status-indicator-lg ${getStatus(selectedLot)}`}>
                {getStatus(mainItem) === 'completed' ? (
                  <BsCheckCircleFill size={18} />
                ) : (
                  <div className="pending-dot"></div>
                )}
              </div>
              <div>
                <h3 className="detail-title">{mainItem.BATCHNO}</h3>
                <p className="detail-subtitle">{mainItem.CUSTNAME}</p>
              </div>
            </div>
            <button className="detail-close-btn" onClick={closeDetailView}>
              <FiX size={20} />
            </button>
          </div>
          <div className="detail-view-content">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Color:</span>
                <span className="text-gray-900">{mainItem.COLOR}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Fabric:</span>
                <span className="text-gray-900">{mainItem.FABRIC}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Route:</span>
                <span className="text-gray-900">{mainItem.ROUTE || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">GRN No:</span>
                <span className="text-gray-900">{mainItem.GRNNO}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Quantity:</span>
                <span className="text-gray-900">{totalQuantity.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Party Dc:</span>
                <span className="text-gray-900">{mainItem.PARTYDC}</span>
              </div>
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
                          <td className="px-3 py-2">{item.BATQTY.toFixed(2)}</td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
              <DropdownField
                label="Contractor"
                value={selectedContractor}
                options={Contractor}
                valueKey="CONAME"
                onChange={setSelectedContractor}
              />

            {selectedLot.REMARKS && (
              <div className="remarks-section">
                <span className="detail-label">Remarks</span>
                <p className="remarks-text">{selectedLot.REMARKS}</p>
              </div>
            )}
          </div>
          <div className="detail-view-actions">
            <button className="btn btn-outline">
              <FiEdit2 className="mr-2" /> Edit Details
            </button>
            {!selectedLot.ENDT && (
              <button
                className="btn btn-primary"
                onClick={() => markAsCompleted(selectedLot?.[0])}
              >
                <FiCheckCircle className="mr-2" />Complete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }


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
                    { label: 'Quantity', value: item.BATQTY.toFixed(2) },
                    { label: 'Process Name', value: item.PROCESSNAME, highlight: true },
                    { label: 'Party Dc', value: item.PARTYDC }
                  ].map((field, idx) => (
                    <div key={idx} className="card-row">
                      <span className="card-label">{field.label}</span>
                      <span className={`${field.highlight ? "text-blue-600 font-semibold" : ""}`}>
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

  return (
    <div className="">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center mt-4 gap-3">
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
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md border ${viewMode === "table"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700"
                } hover:bg-green-500 hover:text-white transition`}
              title="Table View"
            >
              <MdTableChart size={20} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-md border ${viewMode === "cards"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700"
                } hover:bg-green-500 hover:text-white transition`}
              title="Card View"
            >
              <MdGridView size={20} />
            </button>
          </div>

          {filteredData.length > 0 && (
            <span className="inline-flex items-center bg-green-100 text-green-700 text-sm font-semibold  py-1 rounded-2xl shadow-sm">
              {filteredData.length} {filteredData.length === 1 ? "lot" : "lots"}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterModal(true)}
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

export default LotPreparation;