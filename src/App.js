// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatbotPage from './Pages/chatbotPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => (
  <div className="App">
    <Router>
      <Routes>
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/" element={<Navigate to="/chatbot" />} />
      </Routes>
    </Router>
  </div>
);

export default App;
