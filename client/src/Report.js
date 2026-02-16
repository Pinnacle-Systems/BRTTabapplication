import React from 'react';
import GenericDataTable from '../src/Home';

// Dummy fetch function for user data
// const fetchUserData = async (lazyState) => {
//     const data = await UserService.getUsers({ lazyEvent: JSON.stringify(lazyState) });
//     return {
//         totalRecords: data.totalRecords,
//         items: data.users,
//     };
// };

const userColumns = [
    { selectionMode: 'multiple', headerStyle: { width: '3rem' } },
    { field: 'name', header: 'Name', sortable: true, filter: true, filterPlaceholder: 'Search' },
    {
        field: 'company.name', sortable: true, header: 'Company', filterField: 'company.name',
        body: (rowData) => (
            <div className="flex align-items-center gap-2">
                <img alt="company" src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${rowData.company.code}`} style={{ width: '24px' }} />
                <span>{rowData.company.name}</span>
            </div>
        ), filter: true, filterPlaceholder: 'Search'
    },
    { field: 'machine', sortable: true, filter: true, header: 'Machine', filterPlaceholder: 'Search' },
];

const Report = () => {
    return (
        <GenericDataTable columns={userColumns} keyField="id" />
    );
};

export default Report;
