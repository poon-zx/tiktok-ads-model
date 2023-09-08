import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        {data ? <Result data={data}/> : <AdForm setParentState={updateParentState}/>}
      </div>
  );
}

export default App;
