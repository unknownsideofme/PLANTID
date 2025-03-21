import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaLeaf } from 'react-icons/fa';
import './DiagnosisPanel.css';

function DiagnosisPanel({ selectedImage, latestDiagnosis }) {
  return (
    <div className="diagnosis-panel">
      <h2 className="title">
        <FaLeaf className="icon" />
        Plant Analysis
      </h2>
      
      <div className="image-section">
        <h3 className="subtitle">Selected Image</h3>
        {selectedImage ? (
          <div className="image-container">
            <img 
              src={selectedImage} 
              alt="Selected plant" 
              className="image"
            />
          </div>
        ) : (
          <div className="placeholder">No image selected</div>
        )}
      </div>
      
      <div className="diagnosis-section">
        <h3 className="subtitle">Latest Diagnosis</h3>
        {latestDiagnosis ? (
          <div className="diagnosis-container">
            <div className="markdown-content">
              <ReactMarkdown>{latestDiagnosis || ''}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="placeholder">No diagnosis yet. Upload a plant image to get started.</div>
        )}
      </div>
    </div>
  );
}

export default DiagnosisPanel;