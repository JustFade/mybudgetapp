import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Make sure this path to your main CSS file is correct
import App from './App'; // This imports your main App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);