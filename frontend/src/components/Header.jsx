import { FaLeaf } from 'react-icons/fa'

function Header({ isConnected }) {
  return (
    <header className="bg-primary text-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaLeaf className="text-2xl" />
          <h1 className="text-2xl font-bold">Plant Disease Diagnosis</h1>
        </div>
        
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </header>
  )
}

export default Header