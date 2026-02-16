import { useState } from 'react';
import { Headset, Bot, X, Send } from 'lucide-react';
import yourLogo from './logo.png';


const AiCallResponseButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello!  How can I help you today?", sender: 'ai' }
  ]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    setChatMessages(prev => [...prev, { id: Date.now(), text: message, sender: 'user' }]);
    setMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Thanks for your message!  Our Team Response back to you shortly.", 
        sender: 'ai' 
      }]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-80 h-96 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Headset className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                  <Bot className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold">Customer Support</h3>
                <p className="text-xs opacity-80">Online now</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'ai' 
                    ? 'bg-white border border-gray-200 rounded-bl-none mr-auto' 
                    : 'bg-blue-500 text-white rounded-br-none ml-auto'}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center space-x-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 h-12"
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={message.trim() === ''}
                className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative group">
        <div className="absolute -inset-1 bg-green-400/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform ${
            isOpen 
              ? 'bg-red-500 rotate-45' 
              : 'bg-gradient-to-br from-green-500 to-teal-500 hover:scale-110'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform" />
          ) : (
            <>
              <img src={yourLogo} alt="Logo" className="w-8 h-6" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <Bot className="w-3 h-3 text-green-600" />
              </div>
            </>
          )}
        </button>
        
       
        
      
      </div>
    </div>
  );
};

export default AiCallResponseButton;