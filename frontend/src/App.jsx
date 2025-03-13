import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import DiagnosisPanel from './components/DiagnosisPanel'
import Header from './components/Header'

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [latestDiagnosis, setLatestDiagnosis] = useState(null)
  const [messages, setMessages] = useState([
    {
      id: 'welcome-message',
      sender: 'assistant',
      text: 'Welcome to the Plant Disease Diagnosis chat! Upload a photo of your plant, and optionally describe the symptoms you\'ve observed. I\'ll analyze it and provide a diagnosis.',
      timestamp: new Date()
    }
  ])
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState(null)
  
  // Initialize WebSocket connection when sessionId changes
  useEffect(() => {
    if (!sessionId) return
    
    const ws = new WebSocket(`ws://${window.location.host}/ws/${sessionId}`)
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.success) {
        addMessage('assistant', data.response)
        setLatestDiagnosis(data.response)
      } else {
        addMessage('assistant', `Error: ${data.error || 'Unknown error'}`)
      }
    }
    
    ws.onclose = () => {
      setIsConnected(false)
      console.log('WebSocket disconnected')
    }
    
    setSocket(ws)
    
    return () => {
      ws.close()
    }
  }, [sessionId])
  
  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Guaranteed unique ID
      sender,
      text,
      timestamp: new Date()
    }])
  }
  
  const handleImageUpload = async (file, symptoms) => {
    const formData = new FormData()
    formData.append('file', file)
    if (symptoms) {
      formData.append('symptoms', symptoms)
    }
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSessionId(data.session_id)
        setSelectedImage(data.file_path)
        addMessage('user', `Uploaded an image${symptoms ? ` with symptoms: ${symptoms}` : ''}`)
        addMessage('assistant', data.response)
        setLatestDiagnosis(data.response)
      } else {
        addMessage('assistant', `Error uploading image: ${data.error}`)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      addMessage('assistant', 'Error uploading image. Please try again.')
    }
  }
  
  const sendMessage = async (message) => {
    if (!sessionId || !socket || socket.readyState !== WebSocket.OPEN) {
      addMessage('assistant', 'Connection lost. Please refresh the page and try again.')
      return
    }
    
    addMessage('user', message)
    
    socket.send(JSON.stringify({
      type: 'chat',
      message
    }))
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header isConnected={isConnected} />
      
      <div className="flex flex-col md:flex-row flex-1">
        <div className="flex-1 p-4">
          <ChatInterface 
            messages={messages} 
            onSendMessage={sendMessage} 
            onImageUpload={handleImageUpload}
          />
        </div>
        
        <div className="w-full md:w-96 bg-white border-l border-gray-200 p-4">
          <DiagnosisPanel 
            selectedImage={selectedImage} 
            latestDiagnosis={latestDiagnosis} 
          />
        </div>
      </div>
    </div>
  )
}

export default App