import { useState, useRef, useEffect } from 'react'
import { FaCamera, FaPaperPlane } from 'react-icons/fa'
import Message from './Message'
import UploadModal from './UploadModal'

function ChatInterface({ messages, onSendMessage, onImageUpload }) {
  const [input, setInput] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const messagesEndRef = useRef(null)
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    onSendMessage(input)
    setInput('')
  }
  
  const handleUploadClick = () => {
    setShowUploadModal(true)
  }
  
  const handleCloseModal = () => {
    setShowUploadModal(false)
  }
  
  const handleUploadSubmit = (file, symptoms) => {
    onImageUpload(file, symptoms)
    setShowUploadModal(false)
  }
  
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <Message 
            key={`message-${message.id || index}-${message.timestamp?.getTime() || index}`} 
            message={message} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="flex space-x-2">
          <button 
            type="button" 
            onClick={handleUploadClick}
            className="p-2 bg-secondary hover:bg-secondary-dark rounded-full"
            title="Upload image"
          >
            <FaCamera />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="p-2 bg-primary hover:bg-primary-dark text-white rounded-full disabled:opacity-50"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
      
      {showUploadModal && (
        <UploadModal 
          key="upload-modal"
          onClose={handleCloseModal} 
          onSubmit={handleUploadSubmit} 
        />
      )}
    </div>
  )
}

export default ChatInterface    