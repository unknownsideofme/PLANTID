import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import DiagnosisPanel from './components/DiagnosisPanel';
import Header from './components/Header';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [latestDiagnosis, setLatestDiagnosis] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-message',
      sender: 'assistant',
      text: "Welcome to the Plant Disease Diagnosis chat! Upload a photo of your plant, and optionally describe the symptoms you've observed. I'll analyze it and provide a diagnosis.",
      timestamp: new Date(),
    },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  // Get base URLs from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/${sessionId}`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        addMessage('assistant', data.response);
        setLatestDiagnosis(data.response);
      } else {
        addMessage('assistant', `Error: ${data.error || 'Unknown error'}`);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [sessionId, WS_BASE_URL]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender,
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const handleImageUpload = async (file, symptoms) => {
    const formData = new FormData();
    formData.append('file', file);
    if (symptoms) {
      formData.append('symptoms', symptoms);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session_id);
        setSelectedImage(data.file_path);
        addMessage('user', `Uploaded an image${symptoms ? ` with symptoms: ${symptoms}` : ''}`);
        addMessage('assistant', data.response);
        setLatestDiagnosis(data.response);
      } else {
        addMessage('assistant', `Error uploading image: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      addMessage('assistant', 'Error uploading image. Please try again.');
    }
  };

  const sendMessage = async (message) => {
    if (!sessionId || !socket || socket.readyState !== WebSocket.OPEN) {
      addMessage('assistant', 'Connection lost. Please refresh the page and try again.');
      return;
    }

    addMessage('user', message);

    socket.send(
      JSON.stringify({
        type: 'chat',
        message,
      })
    );
  };

  return (
    <div className="app-container">
      <Header isConnected={isConnected} />

      <div className="main-content">
        <div className="chat-container">
          <ChatInterface messages={messages} onSendMessage={sendMessage} onImageUpload={handleImageUpload} />
        </div>

        <div className="diagnosis-container">
          <DiagnosisPanel selectedImage={selectedImage} latestDiagnosis={latestDiagnosis} />
        </div>
      </div>
    </div>
  );
}

export default App;
