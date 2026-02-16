import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const SingleCustpmer = ({ data }) => {
    console.log(data);
    const [products, setProducts] = useState([]);
    useEffect(() => {
        if (Array.isArray(data)) {
            setProducts(data);
        } else {
            console.error('Provided data is not an array:', data);
        }
    }, [data]);

    return (
        <div>
            SingleCustpmer
            <div className="Data" style={{backgroundColor:'white',width:'80%',overflow:'auto',height:'60vh',position:'relative',left:"20PX"}}>
                <DataTable value={products} tableStyle={{ minWidth: '50rem' }}>
                    <Column field="COMPCODE1" header="Company"></Column>
                    <Column field="ADIA" header="Company"></Column>
                    <Column field="AFTERGSM" header="Company"></Column>
                    <Column field="AGSM" header="Company"></Column>
                    <Column field="BDIA" header="Company"></Column>
                    <Column field="BGSM" header="Company"></Column>
                    <Column field="COLORNAME" header="Company"></Column>
                    <Column field="DOCDATE" header="Company"></Column>
                    <Column field="DOCID" header="DOC"></Column>
                    <Column field="FABNAME" header="FAB"></Column>
                </DataTable>
            </div>
        </div>
    );
}

export default SingleCustpmer;
