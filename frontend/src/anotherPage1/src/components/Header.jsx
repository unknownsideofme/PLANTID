import React from 'react';
// import { FaLeaf } from 'react-icons/fa';
import './Header.css';
import mainLogo from "./logo.png";





function Header({ isConnected }) {
  return (
    <header className="header">
      <div className="container">
        <div className="title-section">
          {/* <FaLeaf className="icon" /> */}
          <div><img src={mainLogo} alt="logo-img" />
          </div>
          <h1 className="title">Plant Disease Diagnosis</h1>
        </div>
        
        <div className="status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;