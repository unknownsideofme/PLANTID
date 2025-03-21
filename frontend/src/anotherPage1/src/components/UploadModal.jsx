import { useState } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import './UploadModal.css';

function UploadModal({ onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };
  
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(file, symptoms);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Upload Plant Image</h2>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="image-preview">
                <img src={previewUrl} alt="Plant preview" className="preview-image" />
                <button 
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                  }}
                  className="remove-button"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ) : (
              <>
                <FaUpload className="upload-icon" />
                <p>Drag and drop your plant image here</p>
                <p className="subtext">or</p>
                <label className="file-label">
                  Browse Files
                  <input type="file" accept="image/*" className="hidden-input" onChange={handleFileChange} />
                </label>
              </>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">Describe symptoms (optional):</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Yellowing leaves, brown spots, wilting, etc."
              className="text-area"
            />
          </div>
          
          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={!file} className="submit-button">
              Upload and Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;