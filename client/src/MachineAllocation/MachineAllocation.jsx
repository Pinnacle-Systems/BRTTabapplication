import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@mui/material/Modal';
import { format } from 'date-fns';
import MachineModel from '../Machines/MachineModel';
import { useDeleteAllocationMutation, useGetAllocationQuery } from '../redux/machineservice';
import TablePagination from '@mui/material/TablePagination';
import XlModel from '../XlModel/Model';
import { toast } from 'react-toastify';

const MachineAllocationData = ({ setDocId }) => {
  const type = localStorage.getItem('statusType');
  const [doc, setDoc] = useState('');
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModel, setOpenModel] = useState(false);
  const [inwNo, setInwNo] = useState()
  const [allocated, setAllocated] = useState('Allocated')

  const { data: AllocationData, refetch } = useGetAllocationQuery({ params: { allocated } });
  console.log(allocated, 'all');
  const commaNumber = require('comma-number')
  const [deleteAllocation] = useDeleteAllocationMutation()
  const Allocation = useMemo(() => AllocationData?.data ? AllocationData?.data : [], [AllocationData])


  useEffect(() => {
    setData(Allocation);
  }, [Allocation,
  ])


  const handelClick = (rowData) => {
    setOpenModel(true);
    setDoc(rowData.DOCID);
    setInwNo(rowData.FABRICINWARDNO)
  };

  const onModalClose = () => {
    setOpenModel(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleAllocations = (event) => {
    const value = event.target.value;
    setAllocated(value);
  };
  useEffect(() => {
    if (allocated) {
      refetch();
    }
  }, [allocated, refetch]);
  const handleDelete = async (inwNo) => {
    if (!window.confirm("Are you sure you want to save the details?")) {

      return;
    }
    try {
      const response = await deleteAllocation({ inwNo }).unwrap();
      refetch();
      toast.success("Allocation Deleted Successfully");
      return response;
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className=' border border-gray-400 shadow-2xl rounded-lg overflow-x-scroll'>
      <div className="font-medium flex justify-between items-center">
        <h2 className='text-left lg:text-xl text-xl lg:font-bold bg-sky-500 text-white rounded-t p-2'>
          Machine Allocation
        </h2>
        <div className='flex gap-2'>
          <h2 className='lg:text-lg font-medium'>Status:</h2>
          <label htmlFor="Allocated" className="lg:text-[16px] text-[14px] flex items-center gap-1 bg-gray-200 rounded p-1">
            Allocated
            <input
              type="radio"
              id='Allocated'
              value="Allocated"
              checked={allocated == 'Allocated'}
              onChange={handleAllocations}
              className="appearance-none w-4 h-4 rounded-full border-2 border-yellow-500 checked:bg-yellow-500 checked:border-transparent focus:outline-none"
            />
          </label>
          <label htmlFor="NotAllocated" className="lg:text-[16px] text-[14px] flex items-center gap-1 bg-gray-200 rounded p-1">
            Not Allocated
            <input
              type="radio"
              id='NotAllocated'
              value="NotAllocated"
              checked={allocated == 'NotAllocated'}
              onChange={handleAllocations}
              className="appearance-none w-4 h-4 rounded-full border-2 border-yellow-500 checked:bg-yellow-500 checked:border-transparent focus:outline-none"
            />
          </label>
        </div>
      </div>
      <table className="min-w-full border-collapse shadow-xl rounded-lg">
        <thead>
          <tr className="bg-gray-800 text-sm text-white">
            <th className='p-2 border border-gray-600 font-medium text-[16px] w-2'>S/No</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Customer</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Inward No</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Inward Date</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Job No</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Job Date</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Fab Name</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Color</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Rolls</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px]'>Qty</th>
            <th className='p-2 border border-gray-600 font-medium text-[16px] w-3'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Allocation.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
            <tr key={index} className='border text-sm even:bg-gray-300 even:text-black odd:bg-white shadow-lg'>
              <td className="border text-left shadow-lg  text-[12px]">{index + 1}</td>
              <td className="border text-left shadow-lg  text-[12px]">{row.CUSTOMER}</td>
              <td className="border text-left shadow-lg  text-[12px]">{row.FABRICINWARDNO}</td>
              <td className="border text-left shadow-lg  text-[12px]">{row.INWDATE}</td>
              <td className="border text-left shadow-lg  text-[12px]">{row.DOCID || "Direct"}</td>
              <td className="border text-left shadow-lg  text-[12px]">{row.DOCDATE || "Direct"}</td>
              <td className="border text-left shadow-lg  text-[12px]">{row.FABRIC}</td>
              <td className="border text-left shadow-lg  text-[12px]">{row.COLOUR}</td>
              <td className="border shadow-lg  text-[12px] text-right">{commaNumber(row.RECROLL)}</td>
              <td className="border shadow-lg  text-[12px] text-right">{(row.RECQTY).toFixed(3)}</td>
              {allocated === 'NotAllocated' ? (
                <td className="border flex justify-center">
                  <button
                    className={`p-1 text-white font-semibold rounded shadow-lg ${allocated === 'NotAllocated' ? 'bg-green-500' : 'bg-gray-500'}`}
                    disabled={allocated === 'Allocated'}
                    onClick={() => handelClick(row)}
                  >
                    Allocate
                  </button>
                </td>
              ) : (
                <td className="border border-gray-300 p-1 text-right md:text-[14px] text-[12px]">
                  <button onClick={() => handleDelete(row.FABRICINWARDNO)} className={`p-1 text-white font-semibold rounded shadow-lg ${row.PENTRY !== 'COMPLETED' ? 'bg-red-500' : 'bg-gray-500'}`}
                    disabled={
                      row.PENTRY === 'COMPLETED'
                    }>Delete</button>
                </td>
              )}
            </tr>
          ))}
          {Array.from({ length: rowsPerPage - Allocation.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length }).map((_, index) =>
            <tr className='border even:bg-gray-300 odd:bg-white h-[2.20rem] shadow-lg' key={index}>
              {Array.from({ length: 11 }).map((_, index) =>
                <td key={index} className='border'> </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
      <TablePagination
        component="div"
        count={Allocation.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <XlModel isOpen={openModel} onClose={onModalClose}>
        <div>
          <MachineModel doc={doc} inwNo={inwNo} onClose={onModalClose} setOpenModel={setOpenModel} setDocId={setDocId} data={data} refetch={refetch} />
        </div>
      </XlModel>
    </div>
  );
};

export default MachineAllocationData;
