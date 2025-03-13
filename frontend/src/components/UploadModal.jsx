import { useState } from 'react'
import { FaUpload, FaTimes } from 'react-icons/fa'

function UploadModal({ onClose, onSubmit }) {
  const [file, setFile] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [dragActive, setDragActive] = useState(false)
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    handleFile(selectedFile)
  }
  
  const handleFile = (selectedFile) => {
    if (!selectedFile) return
    
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(selectedFile)
  }
  
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return
    onSubmit(file, symptoms)
  }
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload Plant Image</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center mb-4 ${
              dragActive ? 'border-primary bg-primary-light bg-opacity-10' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Plant preview" 
                  className="max-h-48 mx-auto rounded"
                />
                <button 
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreviewUrl('')
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ) : (
              <>
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="mb-2">Drag and drop your plant image here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded cursor-pointer">
                  Browse Files
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Describe symptoms (optional):
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Yellowing leaves, brown spots, wilting, etc."
              className="w-full border border-gray-300 rounded p-2 h-24"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file}
              className="py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded disabled:opacity-50"
            >
              Upload and Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal