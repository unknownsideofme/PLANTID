import ReactMarkdown from 'react-markdown'
import { FaLeaf } from 'react-icons/fa'

function DiagnosisPanel({ selectedImage, latestDiagnosis }) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaLeaf className="mr-2 text-primary" />
        Plant Analysis
      </h2>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Selected Image</h3>
        {selectedImage ? (
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={selectedImage} 
              alt="Selected plant" 
              className="w-full h-48 object-cover"
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 text-center text-gray-500 h-48 flex items-center justify-center bg-gray-50">
            No image selected
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-medium mb-2">Latest Diagnosis</h3>
        {latestDiagnosis ? (
          <div className="border rounded-lg p-4 bg-secondary-light">
            <ReactMarkdown className="prose prose-sm max-w-none">
              {latestDiagnosis}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="border rounded-lg p-4 text-center text-gray-500 bg-gray-50">
            No diagnosis yet. Upload a plant image to get started.
          </div>
        )}
      </div>
    </div>
  )
}

export default DiagnosisPanel