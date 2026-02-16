import React, { useEffect, useState } from 'react'
import { formatDate } from '../Utils/commonFn';
import { format } from 'date-fns';
import UploadImg from '../Upload';
import { toast } from 'react-toastify';
import { useAddImageFileNameMutation, useAddProductionEntryMutation } from '../redux/productionEntry';
import { useDispatch } from 'react-redux';
import { push } from '../redux/features/opentabs';
const ProdEntryNGrid = ({ inwardNo, setInwardNo, proEntryRefetch, productionData: lData }) => {
    const type = localStorage.getItem('statusType');

    const labData = lData?.data ? lData?.data : [];
    const [picture, setPicture] = useState('');
    const [addData] = useAddProductionEntryMutation();
    const [addImg] = useAddImageFileNameMutation();
    const [productionDetails, setProductionDetails] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!labData) return;
        setProductionDetails(labData);
    }, [labData]);

    // const handleInputChange = (index, field, value) => {
    //     setProductionDetails(prevDetails => {
    //         const updatedDetails = [...prevDetails];
    //         updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    //         return updatedDetails;
    //     });
    // };
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
                    dispatch(push({ id: 1, name: 'Lab Approval' }));
                    setInwardNo('');

                    proEntryRefetch();
                }
            } catch (error) {
                console.error(error);
                toast.error('Error handling data');
            }

        }
    };

    return (
        <div className=''>
            <div className=' w-full flex p-2'>
                <h1 className='w-[50%] text-lg font-medium  block'>Inward Details</h1>

                <button onClick={handleSubmit} className='bg-orange-500 hover:bg-orange-700 text-white p-1 rounded text-xs'>Save</button></div>
            <div className='grid w-full gap-1 lg:grid-cols-3 grid-cols-1'>
                <div className='flex gap-5 w-[100%]' >   {labData.map((item, index) => (
                    <div key={index} className="flex flex-col gap-8 p-1 w-full border border-gray-200 rounded shadow-md">
                        <div className="grid grid-cols-2 gap-1">
                            <label className="block text-xs lg:text-sm font-medium">Compcode:</label>
                            <p className='text-xs lg:text-sm '>{item.CUSTOMER}</p>
                        </div>


                        <div className="grid grid-cols-2 gap-2">
                            <label className="block lg:text-[16px] text-[14px] font-medium">Inward No:</label>
                            <p className=' lg:text-[16px] text-[14px]'>{item.FINWARDNO}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="block text-xs lg:text-sm font-medium">Doc Date:</label>
                            <p className='text-xs lg:text-sm'>{formatDate(item.DOCDATE)}</p>
                        </div>
                    </div>
                ))}
                    {productionDetails.map((detail, detailIndex) => (
                        <div key={detailIndex} className='flex w-full flex-col gap-8  border border-gray-200 rounded shadow-md p-2'>
                            <div className="grid grid-cols-2 gap-[4px]">
                                <label className="block text-xs lg:text-sm font-medium">Job No:</label>
                                <p className="text-xs lg:text-sm">{detail.DOCID || "Direct"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-[4px]">
                                <label className="block text-xs lg:text-sm font-medium">Colour:</label>
                                <p className="text-xs lg:text-sm">{detail.COLOUR}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-[4px]">
                                <label className="block text-xs lg:text-sm font-medium">Received Qty:</label>
                                <p className="text-xs lg:text-sm">{detail.RECQTY.toFixed()}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-[4px]">
                                <label className="block text-xs lg:text-sm font-medium">Received Roll:</label>
                                <span className=' rounded   px-2'> {detail.ROLLS || ''}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="  border shadow-lg rounded-lg lg:w-[100%]">
                    <h1 className='text-lg font-medium  block'>Enter Details</h1>
                    <div className='flex'>
                        {productionDetails.map((detail, detailIndex) => (
                            <div key={detailIndex} className=''>
                                {/* <h2 className='text-lg font-medium '>Enter Details:</h2> */}
                                <div className='grid grid-cols-2 gap-4 p-2 rounded' >
                                    <div className="grid grid-cols-2 gap-[4px]">
                                        <label className="block text-xs lg:text-sm font-medium">Rolls:</label>
                                        <input
                                            type="number"
                                            value={detail.RECROLL || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'RECROLL', e.target.value)}
                                            className="border border-gray-300 rounded"
                                            required />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block text-xs lg:text-sm font-medium">Fab Qual:</label>
                                        <input
                                            type="number"
                                            value={detail.FABQUAL || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'FABQUAL', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center '>
                                        <label className="block  font-medium text-xs lg:text-sm">K DIA:</label>
                                        <input
                                            type="number"
                                            value={detail.KDIA || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'KDIA', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block  font-medium text-xs lg:text-sm">Req DIA:</label>
                                        <input
                                            type="number"
                                            value={detail.REQDIA || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'REQDIA', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block  font-medium text-xs lg:text-sm">Req GSM:</label>
                                        <input
                                            type="number"
                                            value={detail.REQGSM || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'REQGSM', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block  font-medium text-xs lg:text-sm">Over feed:</label>
                                        <input
                                            type="number"
                                            value={detail.OVERFEED || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'OVERFEED', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block  font-medium text-xs lg:text-sm">Load Shell:</label>
                                        <input
                                            type="number"
                                            value={detail.LOADSHELL || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'LOADSHELL', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block  font-medium text-xs lg:text-sm">MC Speed:</label>
                                        <input
                                            type="number"
                                            value={detail.MCSPEED || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'MCSPEED', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block  font-medium text-xs lg:text-sm">After Width:</label>
                                        <input
                                            type="number"
                                            value={detail.AFTERWIDTH || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'AFTERWIDTH', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 items-center'>
                                        <label className="block  font-medium text-xs lg:text-sm">After GSM:</label>
                                        <input
                                            type="number"
                                            value={detail.AFTERGSM || ''}
                                            onChange={(e) => handleInputChange(detailIndex, 'AFTERGSM', e.target.value)}
                                            className=" border border-gray-300 rounded"
                                        />
                                    </div>
                                </div>

                            </div>
                        ))}

                        <div className=" h-auto w-auto   border border-solid border-t-stone-100 pt-2 flex-flex-col justify-center items-center shadow-lg">
                            <h2 className='flex justify-center'>Add image:</h2>
                            <UploadImg picture={picture} setPicture={setPicture} />
                        </div></div>
                    <button className='bg-red-500 rounded text-white p-1 m-1' onClick={() => setInwardNo('')}>Back</button>
                </div>
            </div >
        </div >
    );
}

export default ProdEntryNGrid;
