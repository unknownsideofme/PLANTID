import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

import mainLogo from "./logo.png";

const App = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const resultRef = useRef(null);

  const tips = [
    "Take clear, well-lit photos of affected areas for better diagnosis.",
    "Include both healthy and affected parts in your photo for comparison.",
    "Be specific about when symptoms first appeared in your description.",
    "Mention any recent changes in watering, light, or fertilization.",
    "Note the age of the plant and its normal growing conditions."
  ];

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, [tips.length]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSymptomsChange = (e) => {
    setSymptoms(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !symptoms) {
      const missingItems = [];
      if (!file) missingItems.push("an image");
      if (!symptoms) missingItems.push("symptoms");
      
      const errorElement = document.createElement("div");
      errorElement.className = "toast-error";
      errorElement.textContent = `Please provide ${missingItems.join(" and ")}.`;
      document.body.appendChild(errorElement);
      
      setTimeout(() => {
        errorElement.classList.add("show");
        setTimeout(() => {
          errorElement.classList.remove("show");
          setTimeout(() => {
            document.body.removeChild(errorElement);
          }, 300);
        }, 3000);
      }, 10);
      
      return;
    }
    
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("symptoms", symptoms);

    try {
      // Simulate a loading delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // This is where the actual fetch would happen
      const response = await fetch("http://4.240.108.215//api/diagnose-plant-disease/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Mock response for demonstration
      
      setResult(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setFile(null);
    setPreviewUrl(null);
    setSymptoms("");
    formRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container1">
      <div className="overlay"></div>
      <div className="content-wrapper">
        {/* <header className="site-header">
          <div className="logo-container">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">PlantDoctor</span>
          </div>
          <nav className="header-nav">
            <button className="nav-button">
              <span className="nav-icon">📚</span>
              Plant Library
            </button>
            <button className="nav-button">
              <span className="nav-icon">📋</span>
              History
            </button>
          </nav>
        </header> */}

        <div className="navbar1">
                      <div className="logo1">
                        <img src={mainLogo} alt="logo-img" /> 
                      </div>
                      
      
                    </div>


      
        <motion.div
          className="card main-card"
          initial={{ opacity: 0, scale: 0.9, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          ref={formRef}
        >
          <header className="card-header">
            <h1 className="card-title">Plant Disease Diagnosis</h1>
            <p className="card-subtitle">Upload a photo and describe symptoms to identify plant diseases</p>
            
            <div className="tips-carousel">
              <div className="tip-icon">💡</div>
              <div className="tips-container">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTip}
                    className="tip"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {tips[activeTip]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="diagnosis-form">
            <div className="form-columns">
              <div className="form-column">
                <div className="form-group file-upload-group">
                  <label htmlFor="file">
                    <span>Plant Image</span>
                    <span className="label-note">Drag & drop or click to select</span>
                  </label>
                  <div 
                    className={`file-upload-area ${previewUrl ? 'has-preview' : ''} ${isDragging ? 'dragging' : ''}`}
                    onClick={handleSelectFileClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {previewUrl ? (
                      <div className="image-preview-container">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="image-preview"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullscreen(true);
                          }}
                        />
                        <div className="preview-tools">
                          <button 
                            type="button" 
                            className="preview-tool-button enlarge-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFullscreen(true);
                            }}
                          >
                            <span>🔍</span>
                          </button>
                          <button 
                            type="button" 
                            className="preview-tool-button remove-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setPreviewUrl(null);
                            }}
                          >
                            <span>❌</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span className="upload-text">Click or drag to upload</span>
                        <span className="upload-formats">JPEG, PNG or GIF</span>
                      </div>
                    )}
                    <input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden-file-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="symptoms">
                    <span>Describe Symptoms</span>
                    <span className="label-note">Be as detailed as possible</span>
                  </label>
                  <textarea
                    id="symptoms"
                    placeholder="What's happening with your plant? (e.g., yellow leaves, brown spots, wilting, when did it start...)"
                    value={symptoms}
                    onChange={handleSymptomsChange}
                    rows="5"
                  ></textarea>
                  <div className="textarea-helper">
                    <div className="textarea-counter">
                      {symptoms.length} characters
                    </div>
                    <div className="textarea-suggestion">
                      {symptoms.length < 30 ? "Add more details for better diagnosis" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-button ${loading ? 'loading' : ''}`} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-animation">
                    <div className="loading-circle"></div>
                    <div className="loading-circle"></div>
                    <div className="loading-circle"></div>
                  </div>
                  <span>Analyzing Plant Health...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🔍</span>
                  <span>Get Diagnosis</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              className="card result-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              ref={resultRef}
            >
              {result.error ? (
                <div className="error-container">
                  <div className="error-icon">⚠️</div>
                  <h3 className="error-title">Diagnosis Failed</h3>
                  <p className="error-text">{result.error}</p>
                  <button 
                    className="try-again-button" 
                    onClick={resetForm}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="result-header">
                    <h2 className="result-title">Diagnosis Results</h2>
                    {result.confidence_score && (
                      <div className="confidence-meter">
                        <div className="confidence-label">Confidence:</div>
                        <div className="confidence-bar-container">
                          <div 
                            className="confidence-bar" 
                            style={{ width: `${result.confidence_score}%` }}
                          ></div>
                        </div>
                        <div className="confidence-percentage">{result.confidence_score}%</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="results-summary">
                    <div className="summary-image">
                      {previewUrl && <img src={previewUrl} alt="Plant" />}
                    </div>
                    <div className="summary-content">
                      <h3>Quick Summary</h3>
                      <p>
                        Your plant appears to be suffering from 
                        <strong> {result.possible_diagnosis[0]}</strong>.
                        This is {result.additional_info?.progression || 'treatable'} with the right approach.
                      </p>
                      {result.additional_info?.time_to_recovery && (
                        <p>Expected recovery time: {result.additional_info.time_to_recovery}</p>
                      )}
                      <div className="tags-container">
                        {result.additional_info?.organic_options && <span className="tag organic-tag">Organic Solutions Available</span>}
                        <span className="tag action-tag">Action Required</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="results-tabs">
                    <div className="tabs-container" role="tablist">
                      <button className="tab active" role="tab">Diagnosis</button>
                    </div>
                    
                    <div className="tab-content">
                      <div className="results-grid">
                        <div className="result-section diagnosis-section">
                          <div className="section-header">
                            <span className="section-icon">🔍</span>
                            <h3>Possible Diagnosis</h3>
                          </div>
                          <ul className="result-list">
                            {result.possible_diagnosis &&
                              result.possible_diagnosis.map((d, index) => (
                                <li key={index}>
                                  <div className={`diagnosis-item ${index === 0 ? 'primary' : 'secondary'}`}>
                                    {d}
                                    {index === 0 && <span className="primary-badge">Most Likely</span>}
                                  </div>
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div className="result-section causes-section">
                          <div className="section-header">
                            <span className="section-icon">⚠️</span>
                            <h3>Causes</h3>
                          </div>
                          <ul className="result-list cause-list">
                            {result.causes &&
                              result.causes.map((c, index) => (
                                <li key={index}>{c}</li>
                              ))}
                          </ul>
                        </div>
                        <div className="result-section remedies-section">
                          <div className="section-header">
                            <span className="section-icon">💊</span>
                            <h3>Remedies & Solutions</h3>
                          </div>
                          <ul className="result-list numbered-list">
                            {result.remedies_or_cure &&
                              result.remedies_or_cure.map((r, index) => (
                                <li key={index} className="remedy-item">
                                  <div className="remedy-number">{index + 1}</div>
                                  <div className="remedy-text">{r}</div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="result-actions">
                    <button 
                      className="save-diagnosis-button"
                      type="button"
                    >
                      <span className="action-icon">💾</span>
                      Save Results
                    </button>
                    <button 
                      className="share-diagnosis-button"
                      type="button"
                    >
                      <span className="action-icon">🔗</span>
                      Share
                    </button>
                    <button 
                      className="new-diagnosis-button" 
                      onClick={resetForm}
                      type="button"
                    >
                      <span className="action-icon">🔄</span>
                      New Diagnosis
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-col">
              <h4>Plantid</h4>
              <p>Your personal assistant for plant health and care.</p>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#plant-diseases">Common Plant Diseases</a></li>
                <li><a href="#houseplants">Houseplant Care</a></li>
                <li><a href="#garden">Garden Solutions</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>Questions or feedback? <a href="mailto:info@plantdoctor.example">Email us</a></p>
            </div>
          </div>
          <div className="footer-disclaimer">
            For educational purposes only. Always consult with a professional for serious plant issues.
          </div>
        </footer>
      </div>
      
      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {showFullscreen && previewUrl && (
          <motion.div 
            className="fullscreen-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullscreen(false)}
          >
            <motion.div 
              className="fullscreen-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="close-fullscreen"
                onClick={() => setShowFullscreen(false)}
              >
                ✕
              </button>
              <img src={previewUrl} alt="Plant" className="fullscreen-image" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
