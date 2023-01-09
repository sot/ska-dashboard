// import React, { useState } from 'react';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import PackageDashboard from './package_dashboard'
import Layout from './layout'


import './App.css';


function App() {

  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PackageDashboard />} />
          <Route path="*" element={<PackageDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>

    </div>
  );
}

export default App;
