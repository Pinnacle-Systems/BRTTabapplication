// DataViewComponent.jsx
import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import './LotPreparation.css';

const DataViewComponent = ({
  title,
  data,
  isLoading,
  error,
  refetch,
  filters,
  setFilters,
  renderDetailView,
  columns,
  mobileColumns,
  filterFields
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [viewMode, setViewMode] = useState(isMobile ? 'cards' : 'table');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filteredData = data?.statusCode === 0 
    ? (data.data || []).filter(item => {
        let matches = true;
        for (const [key, value] of Object.entries(filters)) {
          if (value && item[key]) {
            if (key.includes('Date')) {
              const itemDate = new Date(item[key]);
              const filterDate = new Date(value);
              matches = matches && itemDate >= filterDate;
            } else {
              matches = matches && 
                String(item[key]).toLowerCase().includes(String(value).toLowerCase());
            }
          }
        }
        return matches;
      })
    : [];

  const hasDataError = !isLoading && !error && data?.statusCode !== 0;
  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(Object.fromEntries(
      Object.keys(filters).map(key => [key, ''])
    ))
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {title.toLowerCase()} data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error loading {title.toLowerCase()} data:</p>
        <p>{error.message || 'Unknown error'}</p>
        <button onClick={refetch} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (hasDataError) {
    return (
      <div className="error-container">
        <p className="error-message">Unexpected data format:</p>
        <p>Received status code: {data?.statusCode}</p>
        <button onClick={refetch} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const renderFilterModal = () => (
    <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
      <div className="filter-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Filter {title}</h3>
          <button className="close-button" onClick={() => setShowFilterModal(false)}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          {filterFields.map(field => (
            <div className="filter-group" key={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={filters[field.name]}
                onChange={handleFilterChange}
                placeholder={`Filter by ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="modal-button reset" onClick={resetFilters}>
            Reset Filters
          </button>
          <button className="modal-button apply" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div className="cards-view">
      <div className="cards-container">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div 
              key={item.IID} 
              className="lot-card"
              onClick={() => setSelectedItem(item)}
            >
              <div className="card-header">
                <span className="batch-no">{item.BATCHNO || item.LOTNO || item.ID}</span>
              </div>
              <div className="card-content">
                {mobileColumns.map(col => (
                  <div className="card-row" key={col.key}>
                    <span className="card-label">{col.header}:</span>
                    <span className="card-value">{item[col.key] || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-message">
            {data?.data?.length === 0 ? 
              `No ${title.toLowerCase()} data available` : 
              'No items match your filters'}
          </div>
        )}
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="table-view">
      <div className="table-container">
        {filteredData.length > 0 ? (
          <table className="lot-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} className={col.align || ''}>
                    {col.header}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr 
                  key={item.IID}
                  onClick={() => setSelectedItem(item)}
                  className="clickable-row"
                >
                  {columns.map(col => (
                    <td key={col.key} className={col.align || ''}>
                      {col.render ? col.render(item) : item[col.key] || '-'}
                    </td>
                  ))}
                  <td className="actions">
                    <button 
                      className="action-button view"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data-message">
            {data?.data?.length === 0 ? 
              `No ${title.toLowerCase()} data available` : 
              'No items match your filters'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="lot-preparation-container">
      <div className="page-header">
        <h2 className="page-title">{title}</h2>
        <div className="header-actions">
          {!isMobile && (
            <div className="view-toggle">
              <button
                className={`toggle-button ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
              <button
                className={`toggle-button ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
            </div>
          )}
          <button 
            className={`filter-button ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setShowFilterModal(true)}
          >
            <span className="filter-icon">🔎</span> Filters
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
          <button className="refresh-button" onClick={refetch}>
            Refresh
          </button>
        </div>
      </div>

      {viewMode === 'table' ? renderTableView() : renderCardsView()}

      {showFilterModal && renderFilterModal()}
      {selectedItem && renderDetailView(selectedItem, () => setSelectedItem(null))}
    </div>
  );
};

export default DataViewComponent;