import React, { useState, useEffect } from 'react';
import { useAddApprovalEntryMutation, useGetAfterQuery, useGetLabItemQuery, useGetLAbQuery, usePatchLabMutation } from '../redux/labservice';
import DoneIcon from '@mui/icons-material/Done';
import TablePagination from '@mui/material/TablePagination';
import Modal from '../Model/Model';
import XlModel from '../XlModel/Model';
import { push } from '../redux/features/opentabs';
import { toast } from 'react-toastify';
import { useSendWhatsAppMessageMutation } from '../redux/whatsAppService';
import { ImCheckmark } from "react-icons/im"
import { useDispatch } from 'react-redux';
import { ImCancelCircle } from "react-icons/im";
import { MdDelete } from "react-icons/md";
export default function LabreportSts() {
  const storedUsername = localStorage.getItem('userName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [poNo, setPoNo] = useState('');
  const [openModel, setOpenModel] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [jobNo, setJob] = useState('')
  const [type, setType] = useState('BEFORE');
  const [approved, setApproved] = useState('APPPROVE');
  const [inwNo, setInwNo] = useState('')

  const { data: labData, refetch: labentry } = useGetLAbQuery({ params: { poNo: poNo ? poNo : '', type, inwNo } });
  const { data: afterProData, refetch: afterLab } = useGetAfterQuery({ params: { poNo: poNo ? poNo : '', type, inwNo: inwNo, } });
  const { data: labEntryItem, refetch: itemwise } = useGetLabItemQuery({ params: { inwNo: inwNo, type: type, poNo: poNo ? poNo : '' } })
  const Labreport = labData?.data ? labData?.data : [];
  const afterProd = afterProData?.data ? afterProData?.data : [];
  const labItems = labEntryItem?.data ? labEntryItem?.data : [];

  console.log(labItems, 'items');

  const dispatch = useDispatch();
  const [patchLab] = usePatchLabMutation();
  const [sendDta] = useSendWhatsAppMessageMutation()
  const [addAllocationDet] = useAddApprovalEntryMutation()


  const date = new Date()
  const time = date.getHours()
  const minutes = date.getMinutes()
  const dt = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const today = `${dt}-${month}-${year} ${time}:${minutes}`



  const [addData] = useAddApprovalEntryMutation()


  const handleApprove = async (afterItem, newStatus) => {

    const aprovalStsData = { doc: afterItem.DOCID, user: storedUsername, type: type, apStatus: newStatus, remarks: remarks };

    try {

      await patchLab(aprovalStsData).unwrap();

      if (newStatus !== 'REJECTED') {
        // dispatch(push({ id: 3, name: 'Allocation' }));
        onModalClose();
      } else {
        onModalClose();
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    }

    try {
      const message = `We are delighted to have you among us. On behalf of all the members and the management, we would like to extend our warmest welcome and good wishes!`;
      const phoneNumber = '6381552516';

      console.log("Sending message with the following details:", {
        type,
        GRNNO: poNo.FABRICINWARDNO,
        JOBNO: poNo.JOBNO,
        aprovalStsData,
        message,
      });

      // Store data before sending the message
      await addData(aprovalStsData).unwrap();

      await addAllocationDet(aprovalStsData).unwrap();


      // Send the WhatsApp message
      const response = await sendDta({ phoneNumber, message }).unwrap();
      console.log("WhatsApp message sent successfully:", response);

      // Destructure the response object
      const { phone, details, id, status } = response.response;

      console.log(status, 'stssss');
      // Check the status and display appropriate toast messages
      if (status === 'success') {
        toast.success(`Data Approved Successfully. Message Sent to ${phoneNumber}`);
        console.log(`Phone: ${phone}, Details: ${details}, ID: ${id}, Status: ${status}`);
      } else {
        toast.error('Failed to send message');
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error('Error handling data');
    }

    labentry();
    itemwise()
  };




  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  localStorage.setItem('statusType', type);
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'image') {
      setImageFile(files[0]);
    } else if (name === 'video') {
      setVideoFile(files[0]);
    }
  };
  console.log(poNo, 'poNo');
  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };

  const handelClick = (poNo) => {
    setOpenModel(true);
    setPoNo(poNo.DOCID);
    setInwNo(poNo.FABRICINWARDNO)
  };
  console.log(inwNo, 'poNo');
  const onModalClose = () => {
    setOpenModel(false);
    setPoNo('');
    setRemarks('');
    setImageFile(null);
    setVideoFile(null);
  };

  const handleOptionChange = (event) => {
    setType(event.target.value);
    labentry()
  };

  const handleApprovals = (event) => {
    setApproved(event.target.value);
  };

  const getFilteredData = () => {
    if (type === 'BEFORE') {
      if (approved === 'ALL') return Labreport;
      if (approved === 'APPROVED') return Labreport.filter(row => row.BAPPSTATUS === 'APPROVED');
      if (approved === 'APPPROVE') return Labreport.filter(row => row.BAPPSTATUS !== 'APPROVED' && row.BAPPSTATUS !== 'REJECTED');
      if (approved === 'REJECTED') return Labreport.filter(row => row.BAPPSTATUS === 'REJECTED');
      return Labreport;
    } else {
      if (approved === 'ALL') return Labreport;
      if (approved === 'APPROVED') return Labreport.filter(row => row.AAPPSTATUS === 'APPROVED');
      if (approved === 'APPPROVE') return Labreport.filter(row => row.AAPPSTATUS !== 'APPROVED' && row.AAPPSTATUS !== 'REJECTED');
      if (approved === 'REJECTED') return Labreport.filter(row => row.AAPPSTATUS === 'REJECTED');
      return Labreport;
    }
  };

  const filteredData = getFilteredData();




  return (
    <div className=" border border-gray-400 shadow-2xl rounded-lg overflow-x-scroll  ">
      <XlModel isOpen={openModel} onClose={onModalClose}>

        <div className="p-2  border border-gray-300 rounded-lg shadow-lg ">
          <header className="flex justify-between  items-center lg:mb-3"></header>
          {labItems.map((item, index) => (
            <div>

              <div className="mb-3">
                <h2 className="text-center lg:font-bold font-medium underline mb-2 text-xs lg:text-[16px] bg-gray-300 p-1">INWARD DETAILS</h2>
                <div>
                  <div className="text-center text-[12px]">
                    <span className="lg:font-semibold font:medium">CUSTOMER :</span>
                    <span className='lg:font-semibold font:medium'>{item.CUSTOMER}</span>
                  </div>
                  <div className="grid grid-cols-3 lg:gap-2 gap-2 lg:mb-3 border border-gray-300 rounded-lg lg:p-3 text-xs lg:text-[14px]  p-2">

                    <div className="flex justify-between w-[70%]">
                      <span className="lg:font-semibold font:medium">GRNo. :</span>
                      <span>{item.FABRICINWARDNO}</span>
                    </div>
                    <div className="flex justify-between w-[50%]">
                      <span className="lg:font-semibold font:medium">Party DC No:</span>
                      <span>{item.PARTYDCNO}</span>
                    </div>
                    <div className="flex justify-between w-[50%] ">
                      <span className="lg:font-semibold font:medium">Date:</span>
                      <span>{item.DOCDATE}</span>
                    </div>
                    <div className="flex justify-between w-[70%] ">
                      <span className="lg:font-semibold font:medium">Job No.:</span>
                      <span>{item.DOCID}</span>
                    </div>
                    <div className="flex justify-between w-[70%] ">
                      <span className="lg:font-semibold font:medium">Prod No.:</span>
                      <span>{item.PRONUM}</span>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-center lg:font-bold font-medium underline mb-2 text-xs lg:text-[16px] bg-gray-300 p-1 ">FABRIC DETAILS</h2>
              <div className="grid grid-cols-3 lg:gap-8 gap-2 lg:mb-2 border border-gray-300 rounded-lg lg:p-2 p-2 text-xs lg:text-[16px]">
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Received Roll :</span>
                  <span>{item.RECROLL}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Colour :</span>
                  <span>{item.COLOUR
                  }</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Received Weight :</span>
                  <span>{item.RECQTY.toFixed(3) || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Over Feed :</span>
                  <span>{item.
                    OVERFEED || 0
                  }</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Fabric Quality :</span>
                  <span>{item.
                    FABQUAL || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Load Shell :</span>
                  <span>{item.
                    LOADSHELL || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Knitting Dia :</span>
                  <span>{item.KDIA || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">M/C Speed :</span>
                  <span>{item.MCSPEED || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Req Dia :</span>
                  <span>{item.REQDIA || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">After Width :</span>
                  <span>{item.
                    AFTERWITH || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">Req GSM :</span>
                  <span>{item.REQGSM || 0}</span>
                </div>
                <div className="flex justify-between w-[85%] ">
                  <span className="lg:font-semibold font:medium">After GSM :</span>
                  <span>{item.AFTERGSM || 0}</span>
                </div>
              </div>
              <div className="mb-2 rounded">
                <h2 className="text-center lg:font-bold font-medium underline mb-2 text-xs lg:text-[16px] bg-gray-300 p-1 ">COMPACTING LAB REPORT</h2>
                <div className='flex'>
                  {afterProd.map((afterItem, index) => (
                    <table className="min-w-full border border-gray-300 rounded">
                      <thead>
                        <tr>
                          <th rowSpan={2} className="p-2 w-[8rem] text-xs lg:text-[14px] lg:font-bold font-medium">BEFORE</th>
                          <th className="border border-gray-300 p-1 text-xs lg:text-[14px] lg:font-bold font-medium">K/Dia</th>
                          <th className="border border-gray-300 p-1 text-xs lg:text-[14px] lg:font-bold font-medium">B/Dia</th>
                          <th className="border border-gray-300 p-1 text-xs lg:text-[14px] lg:font-bold font-medium">A/Dia</th>
                          <th className="border border-gray-300 p-1 text-xs lg:text-[14px] lg:font-bold font-medium">Length</th>
                          <th className="border border-gray-300 p-1 text-xs lg:text-[14px] lg:font-bold font-medium">Width</th>
                          <th className="border border-gray-300 p-1 text-xs lg:text-[14px] lg:font-bold font-medium">B/GSM</th>
                          <th className="border border-gray-300 p-1 text-xs lg:text-[14px] lg:font-bold font-medium">A/GSM</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr key={index}>
                          <td className=" p-1"></td>
                          <td className="border border-gray-300 p-1 text-right text-xs lg:text-[14px] ">{afterItem.

                            kdia
                            || 0}</td>
                          <td className="border border-gray-300 p-1 text-right text-xs lg:text-[14px] ">{afterItem.

                            bADia
                            || 0}</td>
                          <td className="border border-gray-300 p-1 text-right text-xs lg:text-[14px] ">{afterItem.
                            bADia

                            || 0}</td>
                          <td className="border border-gray-300 p-1 text-right text-xs lg:text-[14px] ">{afterItem.
                            length
                            || 0}</td>
                          <td className="border border-gray-300 p-1 text-right text-xs lg:text-[14px] ">{afterItem.
                            bWidth
                            || 0}</td>
                          <td className="border border-gray-300 p-1 text-right text-xs lg:text-[14px] ">{afterItem.bGsm || 0}</td>
                          <td className="border border-gray-300 p-1 text-right text-xs lg:text-[14px] ">{afterItem.
                            aGsm
                            || 0}</td>

                        </tr>
                      </tbody>
                    </table>
                  ))}
                </div>
                <div>
                  {type === 'AFTER' ? <div className='mt-3'>  <table className="min-w-full border border-gray-300 rounded mb-3">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="p-2 w-[8rem] text-xs lg:text-[14px] lg:font-bold font-medium ">AFTER</th>
                        <th className="border border-gray-300 p-1 text-xs lg:text-[14px] text-[12px] lg:font-bold font-medium">K/Dia</th>
                        <th className="border border-gray-300 p-1 text-xs lg:text-[14px] text-[12px] lg:font-bold font-medium">B/Dia</th>
                        <th className="border border-gray-300 p-1 text-xs lg:text-[14px] text-[12px] lg:font-bold font-medium">A/Dia</th>
                        <th className="border border-gray-300 p-1 text-xs lg:text-[14px] text-[12px] lg:font-bold font-medium">Length</th>
                        <th className="border border-gray-300 p-1 text-xs lg:text-[14px] text-[12px] lg:font-bold font-medium">Width</th>
                        <th className="border border-gray-300 p-1 text-xs lg:text-[14px] text-[12px] lg:font-bold font-medium">B/GSM</th>
                        <th className="border border-gray-300 p-1 text-xs lg:text-[14px] text-[12px] lg:font-bold font-medium">A/GSM</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className=" p-1"></td>
                        <td className="border border-gray-300 p-1 text-right  text-xs lg:text-[14px] ">{item.KDIA1 || 0}</td>
                        <td className="border border-gray-300 p-1 text-right  text-xs lg:text-[14px] ">{item.BDIA || 0}</td>
                        <td className="border border-gray-300 p-1 text-right  text-xs lg:text-[14px] ">{item.ADIA || 0}</td>
                        <td className="border border-gray-300 p-1 text-right  text-xs lg:text-[14px] ">{item.FLENGTH || 0}</td>
                        <td className="border border-gray-300 p-1 text-right  text-xs lg:text-[14px] ">{item.WIDTH || 0}</td>
                        <td className="border border-gray-300 p-1 text-right  text-xs lg:text-[14px] ">{item.BGSM || 0}</td>
                        <td className="border border-gray-300 p-1 text-right  text-xs lg:text-[14px] ">{item.AGSM || 0}</td>
                      </tr>
                    </tbody>
                  </table></div> : ''}
                </div>

              </div>


            </div>))}

          <div>
            < div >

              {Labreport.map((afterItem) => (
                <div className="p-2 flex flex-col lg:p-2  w-full border border-gray-300 rounded-lg shadow-lg bg-white">
                  <footer className="grid grid-cols-3 lg:gap-8 gap-2">
                    <div>
                      <span className="lg:font-semibold font:medium text-xs lg:text-[14px] ">Date:</span>
                      {type == "BEFORE" ? <input type="text" value={type === 'BEFORE' && afterItem.BAPPSTATUSDATE === null ? today : afterItem.BAPPSTATUSDATE} className="border border-gray-300 rounded-lg  w-full text-xs lg:text-[14px] h-7" disabled /> : <input type="text" value={type === 'AFTER' && afterItem.AAPPSTATUSDATE === null ? today : afterItem.AAPPSTATUSDATE} className="border border-gray-300 rounded-lg  w-full text-xs lg:text-[14px] h-7" disabled />}
                    </div>
                    <div>
                      <span className="lg:font-semibold font:medium text-xs lg:text-[14px] ">Approved By:</span>
                      <input type="text" value={storedUsername} className="border border-gray-300 rounded-lg h-7 w-full text-xs lg:text-[14px] " />
                    </div>
                    <div>
                      <span className="lg:font-semibold font:medium text-xs lg:text-[14px] ">Remarks:</span>
                      <textarea
                        className="w-full text-xs lg:text-[14px]   border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 overflow-y-scroll h-7"
                        placeholder="Enter remarks"
                        value={remarks}
                        onChange={handleRemarksChange}
                      />
                    </div>
                  </footer>
                  {(type === 'BEFORE' && afterItem.BAPPSTATUS !== 'APPROVED') || (type === 'AFTER' && afterItem.AAPPSTATUS !== 'APPROVED') ? (
                    <div className='flex'>
                      <button
                        className={`lg:w-auto w-24 text-white focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg lg:px-2 lg:py-2 text-center text-xs lg:text-[14px] bg-green-500`}
                        onClick={() => handleApprove(afterItem, 'APPROVED')}

                      >
                        Approve
                      </button>
                      <button
                        className={`w-24 lg:w-auto text-white focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg lg:px-2 lg:py-2 py-1 text-center text-xs lg:text-[14px] ${afterItem.BAPPSTATUS === 'REJECTED' || afterItem.AAPPSTATUS === 'REJECTED' ? 'bg-gray-500' : 'bg-red-500'}`}
                        onClick={() => handleApprove(afterItem, 'REJECTED')} disabled={afterItem.BAPPSTATUS === 'REJECTED' || afterItem.AAPPSTATUS === 'REJECTED'}
                      >
                        Reject
                      </button>


                    </div>
                  ) : null}
                  {type === 'BEFORE' ?
                    <div className="flex flex-col lg:flex-row lg:gap-2 gap-1">
                      {(!afterItem.ALLOMACHINE && afterItem.BAPPSTATUS === 'APPROVED') ? (
                        <button
                          className=" text-white focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg lg:px-2 lg:py-2 py-1 text-center text-xs lg:text-[14px] bg-blue-500"
                          onClick={() => handleApprove(afterItem, 'REVERT')}>
                          <MdDelete />
                        </button>
                      ) : null}

                    </div>
                    : ""
                    //  <div>    {(afterItem.AAPPSTATUS === 'APPROVED') ? (
                    //   <button
                    //     className="w-[20%] text-white focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg lg:px-2 lg:py-2 py-1 text-center text-xs lg:text-[14px] bg-blue-500"
                    //     onClick={() => handleApprove(afterItem, 'REVERT')}
                    //   >
                    //     Delete Approval
                    //   </button>
                    // ) : null}</div>
                  }


                </div>
              ))}


            </div>
          </div>
        </div>

      </XlModel >
      <div className='flex justify-between'>
        <h2 className="text-left lg:text-xl text-xl lg:font-bold font-medium p-1  bg-sky-500 text-white rounded-t">Lab Report</h2>

        <div className='flex items-center gap-4 justify-center'>

          <div className=' flex  gap-2 rounded items-center'>
            <h2 className='lg:text-lg font-medium'>Status:</h2>
            <div className='flex items-center gap-2'>
              <label className=" lg:text-[16px] text-[14px] flex items-center gap-1  bg-gray-200 rounded p-1">
                After
                <input
                  type="radio"
                  id='AFTER'
                  value="AFTER"
                  checked={type === "AFTER"}
                  onChange={handleOptionChange}
                  className="appearance-none w-4 h-4 rounded-full border-2 border-red-500 checked:bg-red-500 checked:border-transparent focus:outline-none" />
              </label>
              <label className=" lg:text-[16px] text-[14px] flex items-center gap-1  bg-gray-200 rounded p-1">
                Before
                <input
                  type="radio"
                  id='BEFORE'
                  value="BEFORE"
                  checked={type === "BEFORE"}
                  onChange={handleOptionChange}
                  className="appearance-none w-4 h-4 rounded-full border-2 border-sky-500 checked:bg-sky-500 checked:border-transparent focus:outline-none" />
              </label>
            </div>
          </div>

          <div className=' flex p-1 gap-2 rounded items-center'>
            <h2 className='lg:text-lg font-medium'>Approval Status:</h2>
            <div className='flex items-center gap-2'>
              <label htmlFor="all" className=" lg:text-[16px] text-[14px] flex items-center gap-1 bg-gray-200 rounded p-1">
                All
                <input
                  type="radio"
                  id='ALL'
                  value="ALL"
                  checked={approved === "ALL"}
                  onChange={handleApprovals}
                  className="appearance-none w-4 h-4 rounded-full border-2 border-yellow-500 checked:bg-yellow-500 checked:border-transparent focus:outline-none" />
              </label>
              <label htmlFor="approved" className=" lg:text-[16px] text-[14px] flex items-center gap-1 bg-gray-200 rounded p-1">
                Approved
                <input
                  type="radio"
                  id='APPROVED'
                  value="APPROVED"
                  checked={approved === "APPROVED"}
                  onChange={handleApprovals}
                  className="appearance-none w-4 h-4 rounded-full border-2 border-gray-500 checked:bg-gray-500 checked:border-transparent focus:outline-none " />
              </label>
              <label htmlFor="to-be-approved" className=" bg-gray-200 rounded p-1 lg:text-[16px] text-[14px] flex items-center gap-1">
                To Be Approved
                <input
                  type="radio"
                  id='APPPROVE'
                  value="APPPROVE"
                  checked={approved === "APPPROVE"}
                  onChange={handleApprovals}
                  className="appearance-none w-4 h-4 rounded-full border-2 border-green-500 checked:bg-green-500 checked:border-transparent focus:outline-none" />
              </label>
              <label htmlFor="rejected" className=" lg:text-[16px] text-[14px] flex items-center gap-1 bg-gray-200 p-1 rounded">
                Rejected
                <input
                  type="radio"
                  id='REJECTED'
                  value="REJECTED"
                  checked={approved === "REJECTED"}
                  onChange={handleApprovals}
                  className="appearance-none w-4 h-4 rounded-full border-2 border-orange-500 checked:bg-orange-500 checked:border-transparent focus:outline-none" />
              </label>
            </div>
          </div>

        </div>

      </div>

      <table className="min-w-full border-collapse shadow-xl rounded-lg">
        <thead>
          <tr className="bg-gray-800 text-sm text-white">
            <th className="p-2 w-2 border border-gray-600 font-medium lg:text-[16px]">S/No</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px]">Customer</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px]">Inward No</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px
            ]">Inward Date</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px]">Job No</th>
            <th className="p-1 border border-gray-600 font-medium lg:text-[16px]">Job Date</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px]">Fab Name</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px">Colour</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px
            ]">Dia</th>
            <th className="p-1 border border-gray-600 font-medium lg:text-[16px]">Rolls</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px] w-[8%]">Received Qty</th>
            <th className="p-2 border border-gray-600 font-medium lg:text-[16px]">Approval</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
            <tr key={index} className="border text-sm even:bg-gray-300 even:text-black odd:bg-white shadow-lg" >
              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{index + 1}</td>
              <td className="max-w-44 text-left text-xs lg:text-[12px] truncate " title={row.CUSTOMER}>
                {row.CUSTOMER}
              </td>

              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{row.FABRICINWARDNO}</td>
              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{
                row.INWDATE}</td>
              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{row.DOCID}</td>
              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{row.DOCDATE}</td>
              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{row.FABRIC
              }</td>
              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{row.COLOUR}</td>
              <td className="border text-left shadow-lg text-xs lg:text-[12px] ">{
                row.FABDIA
              }</td>
              <td className="border text-right shadow-lg text-xs lg:text-[12px] ">{row.RECROLL}</td>
              <td className="border text-right shadow-lg text-xs lg:text-[12px] ">{row.RECQTY.toFixed(3)}</td>
              <td className="border flex justify-center">
                <div className='flex'>
                  {type === 'BEFORE' ? <div className='flex'>
                    <button
                      data-modal-target="extralarge-modal" j
                      data-modal-toggle="extralarge-modal"
                      className={`flex  w-full lg:w-auto  focus:ring-2 focus:outline-none font-medium rounded-lg text-lg px-2 py-1.5 text-center ${row.BAPPSTATUS === 'APPROVED' || row.AAPPSTATUS === 'APPROVED' ? "text-gray-400 " : "text-green-600"}`}
                      type="button"
                      onClick={() => handelClick(row)}>
                      {row.BAPPSTATUS === 'APPROVED' ? <ImCheckmark /> : <ImCheckmark />}

                    </button>
                    {type === 'BEFORE' ?
                      <div className="flex flex-col lg:flex-row lg:gap-2 gap-1">
                        {(!row.ALLOMACHINE && row.BAPPSTATUS === 'APPROVED') ? (
                          <button
                            className=" text-white focus:ring-2 focus:outline-none focus:ring-red-300 font-medium rounded-lg lg:px-2 lg:py-2 py-1 text-center text-xs lg:text-[12px] bg-blue-500"
                            onClick={() => handleApprove(row, 'REVERT')}>
                            <MdDelete />
                          </button>
                        ) : null}

                      </div>
                      : ""}

                  </div> :
                    <div className='flex'>
                      <button data-modal-target="extralarge-modal"
                        data-modal-toggle="extralarge-modal"
                        className={`flex w-full lg:w-auto  focus:ring-2 focus:outline-none font-medium rounded-lg text-lg px-2 py-1.5 text-center ${row.AAPPSTATUS === 'APPROVED' ? "text-gray-400 " : "text-green-600"}`}
                        type="button"
                        onClick={() => handelClick(row, 'REVERT')}
                      >
                        {row.AAPPSTATUS === 'APPROVED' ? <ImCheckmark /> : <ImCheckmark />}
                      </button>

                    </div>
                  }

                </div>
              </td>
            </tr>
          ))}
          {Array.from({ length: rowsPerPage - filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length }).map((_, index) => (
            <tr className="border even:bg-gray-300 odd:bg-white h-[2.20rem] shadow-lg" key={index}>
              {Array.from({ length: 12 }).map((_, index) => (
                <td key={index} className="border"> </td>
              ))}
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
    </div >
  );
}
