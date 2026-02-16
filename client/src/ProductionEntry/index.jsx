import React, { useState } from 'react';


import ProductionEntryData from './ProductionEntry';
import ProductionReportData from './ProductionReport'
import ProdEntryNGrid from './ProdEntryForm';
import { useGetProductionDetQuery } from '../redux/productionEntry'
import Loader from '../Loader/Loader';

const ProductionEntry = () => {
    const type = localStorage.getItem('statusType')
    const [inwardNo, setInwardNo] = useState('');
    const [completed, setCompleted] = useState('Pending')

    const { data: productionData, refetch: proEntryRefetch } = useGetProductionDetQuery({ params: { inwardNo: inwardNo, completed: completed } })
    return (
        <div className='p-2'>
            {!inwardNo ? (
                <ProductionReportData setInwardNo={setInwardNo} inwardNo={inwardNo} productionData={productionData} completed={completed} setCompleted={setCompleted} />
            ) : (
                <>
                    <div className='hidden lg:block'>
                        <ProductionEntryData inwardNo={inwardNo} type={type} setInwardNo={setInwardNo} proEntryRefetch={proEntryRefetch} productionData={productionData} />
                    </div>
                    <div className='block lg:hidden'>
                        <ProdEntryNGrid inwardNo={inwardNo} type={type} setInwardNo={setInwardNo} proEntryRefetch={proEntryRefetch} productionData={productionData} />
                    </div>
                </>
            )}

        </div>
    );
}

export default ProductionEntry;
