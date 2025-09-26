import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI, projectAPI } from '../services/api';

const Chat = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProject();
    checkConnection();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkConnection = async () => {
    try {
      await chatAPI.healthCheck();
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getById(projectId);
      setProject(response.data);
      
      if (response.data.chatSessions?.length > 0) {
        const lastSession = response.data.chatSessions[response.data.chatSessions.length - 1];
        setMessages(lastSession.messages || []);
      } else {
        setMessages([{
          role: 'assistant',
          content: `Hello! I'm your AI assistant. I can help you with:\n\n• Code explanations and debugging\n• Technology insights and best practices\n• Project planning and architecture\n• Learning and development guidance\n\nWhat would you like to discuss today?`,
          timestamp: new Date(),
          isWelcome: true
        }]);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/dashboard');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || loading) return;

    const userMessage = { 
      role: 'user', 
      content: trimmedMessage, 
      timestamp: new Date(),
      id: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(projectId, trimmedMessage);
      
      if (response.data.success) {
        const aiMessage = { 
          role: 'assistant', 
          content: response.data.response, 
          timestamp: new Date(),
          id: Date.now() + 1
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `I'm having trouble connecting right now. Please try again in a moment.`,
        timestamp: new Date(),
        isError: true,
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const quickActions = [
    { icon: "💡", text: "Explain Code", action: "Can you explain how this code works?" },
    { icon: "🔧", text: "Debug Help", action: "I need help debugging an issue" },
    { icon: "⚡", text: "Optimize", action: "How can I optimize this code?" },
    { icon: "📚", text: "Learn Tech", action: "Teach me about this technology" }
  ];

  const suggestedQuestions = [
    "What's the best way to structure a React application?",
    "How do I improve my code's performance?",
    "Explain microservices architecture",
    "What are modern web development best practices?"
  ];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card text-center p-8 animate-scale-in">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="spinner border-white"></div>
          </div>
          <div className="text-lg font-semibold text-gray-800">Loading conversation...</div>
          <div className="text-gray-600 text-sm mt-2">Preparing your AI assistant</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="glass-card rounded-2xl m-4 mt-6 animate-fade-in">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>←</span>
              <span>Dashboard</span>
            </button>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                AI
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-gray-600 text-sm">{isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white rounded-lg px-3 py-2 shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{user?.name}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="px-4 mb-4 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition-all duration-200 border border-gray-200 whitespace-nowrap text-sm font-medium"
              >
                <span>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`${message.role === 'user' ? 'chat-bubble-user' : message.isError ? 'bg-red-50 border border-red-200 text-red-800' : message.isWelcome ? 'bg-green-50 border border-green-200 text-green-800' : 'chat-bubble-ai'}`}>
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {formatMessage(message.content)}
                </div>
                <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : message.isError ? 'text-red-600' : message.isWelcome ? 'text-green-600' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="chat-bubble-ai">
                <div className="flex items-center space-x-3">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span className="text-gray-600 text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-3">
              <div className="text-gray-600 text-sm font-medium">Try asking:</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg transition-all duration-200 text-left text-sm border border-gray-200 hover:border-gray-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="glass-card rounded-2xl m-4 mb-6 animate-fade-in">
        <div className="p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message here..."
                className="enhanced-input w-full"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>Sending</span>
                </div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;