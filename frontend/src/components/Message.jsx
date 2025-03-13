import ReactMarkdown from 'react-markdown'
import { FaUser, FaRobot } from 'react-icons/fa'

function Message({ message }) {
  const { sender, text, timestamp } = message
  const isUser = sender === 'user'
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-2">
          <FaRobot className="text-gray-600" />
        </div>
      )}
      
      <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
        isUser ? 'bg-primary text-white' : 'bg-gray-100'
      }`}>
        {isUser ? (
          <p>{text}</p>
        ) : (
          <div className="markdown">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
        <div className={`text-xs mt-1 ${isUser ? 'text-primary-light' : 'text-gray-500'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light flex items-center justify-center ml-2">
          <FaUser className="text-white" />
        </div>
      )}
    </div>
  )
}

export default Message