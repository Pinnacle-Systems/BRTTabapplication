import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Signup from './Login/Signup';
import ActiveTabList from './ActiveTab';
import DrawerAppBar from './Dashboard';
import { Toaster } from 'react-hot-toast';
import BranchFinYearSelection from "./Login/BranchFinyearSelection";
import { useIdleLogout } from './Utils/helper';
import secureLocalStorage from 'react-secure-storage';
import { useState } from 'react';
import NavbarHeader from './NavbarHeader';
const ProtectedRoute = ({ children }) => {
  const storedUsername = localStorage.getItem('userName');
  const navigate = useNavigate();


  const handleNavigation = (e) => {
    const storedUsername = localStorage.getItem('userName');
    if (!storedUsername) {
      e.preventDefault();
      window.history.pushState(null, null, '/');
      navigate('/');
    }
  };

  useEffect(() => {
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return storedUsername ? children : <Navigate to="/" />;
};

const App = () => {



  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const handleLogout = () => {
    secureLocalStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';

  };


  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem("sessionId"));
  }, []);

  useIdleLogout(handleLogout, isLoggedIn);

  function autoLogout(parmam) {
    console.log('dummy function to satisfy diff checker', parmam);
    setIsLoggedIn(parmam)
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup autoLogout={autoLogout} />} />
        <Route
          path="/dashboard"

          element={
            <>
              <Toaster position="top-right" reverseOrder={false} />
              {/* <div>
                <div className="w-screen h-[20%]">
                  <DrawerAppBar onLogout={handleLogout} />
                </div>
                <div className="overflow-auto w-full h-full">
                  <ActiveTabList />
                </div>
              </div> */}
              <NavbarHeader/>
              </>
          }
        />
        <Route path="/branch-finyear" element={<BranchFinYearSelection />} />
      </Routes>
    </Router>
  );
};

export default App;
