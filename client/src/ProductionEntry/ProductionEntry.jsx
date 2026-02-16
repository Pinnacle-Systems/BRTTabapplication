import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import UploadImg from '../Upload';
import { formatDate } from '../Utils/commonFn';
import { toast } from 'react-toastify';
import { useAddImageFileNameMutation, useAddProductionEntryMutation } from '../redux/productionEntry';
import { useDispatch } from 'react-redux';
import { push } from '../redux/features/opentabs';

const ProductionEntryData = ({ inwardNo, setInwardNo, proEntryRefetch, productionData: lData }) => {
    const type = localStorage.getItem('statusType');

    const labData = lData?.data ? lData?.data : [];
    console.log(labData, 'lab');

    const [picture, setPicture] = useState('');
    const [addData] = useAddProductionEntryMutation();
    const [addImg] = useAddImageFileNameMutation();
    const [productionDetails, setProductionDetails] = useState([]);
    const dispatch = useDispatch();



    useEffect(() => {
        if (!labData) return;
        setProductionDetails(labData);
    }, [labData]);

    const handleInputChange = (index, field, value) => {
        setProductionDetails(prevDetails => {
            const updatedDetails = [...prevDetails];
            console.log(updatedDetails[0].ROLLS, 'update');

            if (field === 'RECROLL' && value > updatedDetails[index].ROLLS) {
                toast.error(`Rec Roll cannot be more than ${updatedDetails[index].ROLLS}`);
                return prevDetails;
            }
            updatedDetails[index] = { ...updatedDetails[index], [field]: value };
            return updatedDetails;
        });
    };


    const handleSubmit = async () => {
        if (productionDetails) {
            try {
                const formData = new FormData();
                if (picture) {
                    formData.append("image", picture);
                }
                let returnData = await addData({ proDet: productionDetails }).unwrap();
                if (picture) {
                    await addImg({ body: formData, id: inwardNo }).unwrap();
                }

                if (returnData.statusCode === 0) {
                    toast.success('Data Added Successfully');
                    proEntryRefetch();
                    setInwardNo('');
                    // dispatch(push({ id: 4, name: 'Production Entry' }));
                }
            } catch (error) {
                console.error(error);
                toast.error('Error handling data');
            }

        }
    };

    return (
        <div className='pt-1 border border-gray-400 shadow-2xl rounded-lg w-full px-2'>
            <div className='flex justify-between'>
                <h2 className="text-left text-2xl font-bold px-2">Production Entry</h2>
                <button onClick={handleSubmit} className='bg-orange-500 hover:bg-orange-700 text-white p-1 rounded text-xs'>Save</button>
            </div>
            <div className=''>
                <span className='text-lg font-medium px-2'>Inward Details</span>
                {labData.map((item, index) => (
                    <div className='flex w-full'>
                        <div key={index} className="w-full h-full flex flex-col justify-center  ">
                            <div className="m-2 flex justify-center gap-3 w-full md:w-[100%]  p-1 text-center items-center">
                                <label className="block text-[16px] font-medium">CUSTOMER :</label>
                                <p className='md:text-[14px] text-[12px] font-medium'>{item.CUSTOMER
                                }</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 w-full md:w-[100%] border border-gray-200 p-2">

                                <div className="m-2 flex justify-between w-full md:w-[90%]  border p-1">
                                    <label className="block text-sm font-medium">GRN No:</label>
                                    <p className='md:text-[14px] text-[12px]'>{item.FINWARDNO
                                    }</p>
                                </div>

                                <div className="m-2 flex justify-between w-full md:w-[90%]  border p-1">
                                    <label className="block text-sm font-medium">Job No:</label>
                                    <p className='md:text-[14px] text-[12px]'>{item.DOCID || "Direct"}</p>
                                </div>
                                <div className="m-2 flex justify-between w-full md:w-[90%]  border p-1">
                                    <label className="block text-sm font-medium">Allocated Date:</label>
                                    <p className='md:text-[14px] text-[12px]'>{formatDate(item.DOCDATE)}</p>
                                </div>
                                <div className="m-2 flex justify-between w-full md:w-[90%]  border p-1">
                                    <label className="block text-sm font-medium">Fabric:</label>
                                    <p className='md:text-[14px] text-[12px]'>{item.FABRIC}</p>
                                </div>
                                <div className="m-2 flex justify-between w-full md:w-[90%]  border p-1">
                                    <label className="block text-sm font-medium">Colour:</label>
                                    <p className='md:text-[14px] text-[12px]'>{item.COLOUR}</p>
                                </div>
                            </div>
                        </div>
                        <div className=" px-2 h-full w-[50%] flex items-center justify-center">
                            <UploadImg picture={picture} setPicture={setPicture} />
                        </div>
                    </div>
                ))}
                <table className="min-w-full border-collapse shadow-xl rounded-lg ">
                    <thead>
                        <tr className="bg-gray-800 text-sm text-white">
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>S.No</th>

                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Rec Qty</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Rec Rolls</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Rolls</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Fab Quality</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>k Dia</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Req/Dia</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Req/GSM</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Over Feed</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>Load Shell</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>M/C Speed</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>After Width</th>
                            <th className='p-2 border border-gray-600 font-medium md:text-[14px] text-[12px]'>After GSM</th>
                        </tr>
                    </thead>
                    <tbody className='w-full overflow-x-scroll'>
                        {productionDetails.map((detail, detailIndex) => (
                            <tr key={detailIndex} className='border text-sm even:bg-gray-300 even:text-black odd:bg-white shadow-lg w-full overflow-x-scroll'>
                                <td>{detailIndex + 1}</td>



                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">{(detail.RECQTY).toFixed(3)}</td>

                                <td className="border text-right shadow-lg p-2 md:text-[14px] text-[12px]">
                                    {detail.ROLLS || ''}
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.RECROLL || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'RECROLL', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.FABQUAL || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'FABQUAL', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.KDIA || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'KDIA', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.REQDIA || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'REQDIA', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.REQGSM || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'REQGSM', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.OVERFEED || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'OVERFEED', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.LOADSHELL || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'LOADSHELL', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.MCSPEED || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'MCSPEED', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.AFTERWIDTH || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'AFTERWIDTH', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                                <td className="border text-left shadow-lg p-2 md:text-[14px] text-[12px]">
                                    <input
                                        type="text"
                                        value={detail.AFTERGSM || ''}
                                        onChange={(e) => handleInputChange(detailIndex, 'AFTERGSM', e.target.value)}
                                        className="w-full border border-gray-300 outline-none p-1"
                                        required />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button className='bg-red-500 rounded text-white p-1 m-1' onClick={() => setInwardNo('')}>Back</button>
        </div>
    );
};

export default ProductionEntryData;
