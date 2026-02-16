import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


const GenericDataTable = ({ fetchData, columns, keyField }) => {
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [data, setData] = useState([null]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        filters: {},
    });

    useEffect(() => {
        loadLazyData();
    }, [lazyState]);

    const loadLazyData = () => {
        setLoading(true);
        fetchData(lazyState).then((data) => {
            setTotalRecords(data.totalRecords);
            setData(data.items);
            setLoading(false);
        });
    };

    const onPage = (event) => {
        setLazyState(event);
    };

    const onSort = (event) => {
        setLazyState(event);
    };

    const onFilter = (event) => {
        event['first'] = 0;
        setLazyState(event);
    };

    const onSelectionChange = (event) => {
        const value = event.value;
        setSelectedItems(value);
        setSelectAll(value.length === totalRecords);
    };

    const onSelectAllChange = (event) => {
        const selectAll = event.checked;
        if (selectAll) {
            fetchData().then((data) => {
                setSelectAll(true);
                setSelectedItems(data.items);
            });
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    return (
        <div className="card">

            <DataTable
                value={data}
                lazy
                filterDisplay="row"
                dataKey={keyField}
                paginator
                first={lazyState.first}
                rows={10}
                totalRecords={totalRecords}
                onPage={onPage}
                onSort={onSort}
                sortField={lazyState.sortField}
                sortOrder={lazyState.sortOrder}
                onFilter={onFilter}
                filters={lazyState.filters}
                loading={loading}
                tableStyle={{ minWidth: '75rem' }}
                selection={selectedItems}
                onSelectionChange={onSelectionChange}
                selectAll={selectAll}
                onSelectAllChange={onSelectAllChange}
            >
                {columns.map((col, index) => (
                    <Column key={index} {...col} />
                ))}
            </DataTable>
        </div>
    );
};

export default GenericDataTable;
