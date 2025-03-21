import { useState, useRef, useEffect } from 'react'
import { FaCamera, FaPaperPlane } from 'react-icons/fa'
import Message from './Message'
import UploadModal from './UploadModal'
import './ChatInterface.css'

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
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message, index) => (
          <Message 
            key={`message-${message.id || index}-${message.timestamp?.getTime() || index}`} 
            message={message} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input-container">
        <form onSubmit={handleSend} className="message-form">
          <button 
            type="button" 
            onClick={handleUploadClick}
            className="upload-button"
            title="Upload image"
          >
            <FaCamera />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
          />
          
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="send-button"
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