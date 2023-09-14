import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import AdForm from './form/form.js';
import Result from './result/result.js';
import './App.css';
import { useState } from 'react';

function App() {
    const [data, setData] = useState(null);
    const updateParentState = (data) => {
        setData(data);
    }
    return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<AdForm setParentState={updateParentState}/>}/>
            {data ? <Route path="/result" element={<Result formData={data}/>}/> : null}
          </Routes>
        </Router>
        {/* {data ? <Result data={data}/> : <AdForm setParentState={updateParentState}/>} */}
      </div>
  );
}

export default App;
