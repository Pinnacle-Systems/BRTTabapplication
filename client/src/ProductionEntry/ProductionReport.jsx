import React, { useState } from 'react';
import { TablePagination } from '@mui/material';
import moment from 'moment';

const ProductionReportData = ({ setInwardNo, productionData, completed, setCompleted }) => {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState({
        customer: '',
        inwardNo: '',
        jobNo: '',
        jobDate: '',
        allocatedDate: ''
    });

    const proData = productionData?.data ? productionData?.data : [];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleOptionChange = (event) => {
        setCompleted(event.target.value);
    };

    const handleSearchChange = (event) => {
        const { name, value } = event.target;
        setSearchTerm({
            ...searchTerm,
            [name]: value
        });
    };

    const filteredData = proData.filter((item) => {
        return (
            (item.CUSTOMER?.toLowerCase().includes(searchTerm.customer.toLowerCase()) || !searchTerm.customer) &&
            (item.FINWARDNO?.toLowerCase().includes(searchTerm.inwardNo.toLowerCase()) || !searchTerm.inwardNo) &&
            (item.DOCID?.toLowerCase().includes(searchTerm.jobNo.toLowerCase()) || !searchTerm.jobNo) &&
            (moment(item.JOBDATE).format('YYYY-MM-DD').includes(searchTerm.jobDate) || !searchTerm.jobDate) &&
            (moment(item.DOCDATE).format('YYYY-MM-DD').includes(searchTerm.allocatedDate) || !searchTerm.allocatedDate)
        );
    });

    return (
        <div className="border border-gray-400 shadow-2xl rounded-lg overflow-x-scroll">
            <div className="text-left lg:font-bold font-medium flex justify-between items-center">
                <h2 className='bg-sky-500 text-white rounded-t p-1 lg:text-lg'>Production Entry</h2>
                <div className=' flex  gap-2 rounded items-center'>
                    <h2 className='lg:text-lg font-medium'>Production Status:</h2>
                    <div className='flex items-center gap-2'>
                        <label className="lg:text-[16px] text-[12px] flex items-center gap-1 bg-gray-200 rounded p-1">
                            Completed
                            <input
                                type="radio"
                                id='Completed'
                                value="Completed"
                                checked={completed === "Completed"}
                                onChange={handleOptionChange}
                                className="appearance-none w-4 h-4 rounded-full border-2 border-red-500 checked:bg-red-500 checked:border-transparent focus:outline-none" />
                        </label>
                        <label className="lg:text-[16px] text-[12px] flex items-center gap-1 bg-gray-200 rounded p-1">
                            Pending
                            <input
                                type="radio"
                                id='Pending'
                                value="Pending"
                                checked={completed === "Pending"}
                                onChange={handleOptionChange}
                                className="appearance-none w-4 h-4 rounded-full border-2 border-sky-500 checked:bg-sky-500 checked:border-transparent focus:outline-none" />
                        </label>
                    </div>
                </div>
            </div>



            <table className="min-w-full border border-gray-300 rounded-lg mb-3">
                <thead>
                    <tr className='bg-gray-800 text-sm text-white w-full'>
                        <th className="border border-gray-300 p-2 md:text-[14px] ">S.No</th>
                        <th className="border border-gray-300 p-2 md:text-[14px] w-[14.75rem] truncate"><div>Customer</div>
                            <input
                                type="text"
                                name="customer"
                                value={searchTerm.customer}
                                onChange={handleSearchChange}
                                placeholder="Search Customer"
                                className="p-1 h-5 border border-gray-300 rounded font-medium text-black"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 md:text-[14px] "><div>Inward No</div>

                            <input
                                type="text"
                                name="inwardNo"
                                value={searchTerm.inwardNo}
                                onChange={handleSearchChange}
                                placeholder="Search Inward No"
                                className="p-1 h-5 border border-gray-300 rounded font-medium text-black"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 md:text-[14px] "><div>Job No</div>

                            <input
                                type="text"
                                name="jobNo"
                                value={searchTerm.jobNo}
                                onChange={handleSearchChange}
                                placeholder="Search Job No"
                                className="p-1 h-5 border border-gray-300 rounded font-medium text-black"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 md:text-[14px] "><div>Job Date</div>
                            <input
                                type="date"
                                name="jobDate"
                                value={searchTerm.jobDate}
                                onChange={handleSearchChange}
                                placeholder="Search Job Date"
                                className="p-1 h-5 border border-gray-300 rounded font-medium text-black"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 md:text-[14px] "><div>Allocated date</div>

                            <input
                                type="date"
                                name="allocatedDate"
                                value={searchTerm.allocatedDate}
                                onChange={handleSearchChange}
                                placeholder="Search Allocated Date"
                                className="p-1 h-5 border border-gray-300 rounded font-medium text-black"
                            />
                        </th>
                        <th className="border border-gray-300 p-2 md:text-[14px] ">Machine Name</th>
                        <th className="border border-gray-300 p-2 md:text-[14px] ">Priority</th>
                        <th className="border border-gray-300 p-2 md:text-[14px] ">Fabric</th>
                        <th className="border border-gray-300 p-2 md:text-[14px] ">Colour</th>
                        <th className="border border-gray-300 p-2 md:text-[14px] ">ROLLS</th>
                        <th className="border border-gray-300 p-2 md:text-[14px] ">QTY</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                        <tr key={index + 1} className='even:bg-gray-300 even:text-black odd:bg-white w-full'>
                            <td className="border border-gray-300 p-2 text-left font-normal md:text-[12px]  text-[12px]">{page * rowsPerPage + index + 1}</td>
                            <td className=" border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px] w-[14.75rem] truncate overflow-hidden" title={item.CUSTOMER}>{item.CUSTOMER || 0}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">
                                {item.PENTRY === null ? <a href="#" onClick={() => setInwardNo(item.FINWARDNO)} className="text-blue-500 underline">{item.FINWARDNO || 0}</a> :
                                    item.FINWARDNO}
                            </td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.DOCID || 'Direct'}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{`${item.JOBDATE || 'Direct'}`}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.DOCDATE || 'Direct'}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.MACHINENAME || 0}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.PRIORITY || 0}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.FABRIC || 0}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.COLOUR || 0}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.TROLLS || 0}</td>
                            <td className="border border-gray-300 p-1 text-left font-normal md:text-[12px]  text-[12px]">{item.QTY || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
};

export default ProductionReportData;
