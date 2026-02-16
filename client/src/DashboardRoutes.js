import * as React from 'react';
import { Route, Routes } from 'react-router-dom';



import GenericDataTable from './Home';
import CustomerDataTable from './ListData/Customer';
import UserDataTable from './Users/Users';
import OutlinedCard from './Users/Users';
import LabreportSts from './FabricInward/FabricInwardStatus';

function DashboardRoutes() {

  return (
    <Routes>

      <Route path="LabReport" element={<LabreportSts />} />
      <Route path="User" element={<OutlinedCard />} />
      <Route path='Allocation' element={<CustomerDataTable />} />
    </Routes>
  );
}

export default DashboardRoutes;
