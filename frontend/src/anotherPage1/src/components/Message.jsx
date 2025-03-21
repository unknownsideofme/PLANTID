import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FaUser, FaRobot } from 'react-icons/fa';
import './Message.css';

function Message({ message }) {
  const { sender, text, timestamp } = message;
  const isUser = sender === 'user';
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`message-container ${isUser ? 'user-message' : 'bot-message'}`}>
      {!isUser && (
        <div className="avatar bot-avatar">
          <FaRobot className="icon" />
        </div>
      )}
      
      <div className={`message-box ${isUser ? 'user-box' : 'bot-box'}`}>
        {isUser ? (
          <p>{text}</p>
        ) : (
          <div className="markdown">
            <ReactMarkdown>{text || ''}</ReactMarkdown>
          </div>
        )}
        <div className="timestamp">
          {formatTime(timestamp)}
        </div>
      </div>
      
      {isUser && (
        <div className="avatar user-avatar">
          <FaUser className="icon" />
        </div>
      )}
    </div>
  );
}

export default Message;