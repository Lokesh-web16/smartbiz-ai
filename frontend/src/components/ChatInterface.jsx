import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import aiService from '../services/aiService';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';

const ChatInterface = ({ currentUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: currentUser 
        ? `Hello ${currentUser.name}! 👋 I'm SmartBiz AI. Ask me about any business idea, and I'll provide detailed analysis including market potential, investment requirements, and success probability.`
        : "Hello! I'm SmartBiz AI. Ask me about any business idea, and I'll provide detailed analysis including market potential, investment requirements, and success probability.",
      isBot: true,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when user logs in
  useEffect(() => {
    if (currentUser && currentUser.chatHistory) {
      const formattedMessages = currentUser.chatHistory.map((chat, index) => [
        {
          id: index * 2 + 2,
          text: chat.userMessage,
          isBot: false,
        },
        {
          id: index * 2 + 3,
          text: chat.aiResponse,
          isBot: true,
        }
      ]).flat();
      
      setMessages(prev => [prev[0], ...formattedMessages]);
    }
  }, [currentUser]);

  // Save chat to Firestore
  const saveChatToFirestore = async (userMessage, aiResponse) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const newChat = {
        userMessage,
        aiResponse,
        timestamp: new Date()
      };
      
      await updateDoc(userRef, {
        chatHistory: arrayUnion(newChat)
      });
      
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  // Voice functions
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser.');
      return;
    }

    // Clean the text (remove markdown symbols)
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await aiService.analyzeBusiness(inputText);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.analysis,
        isBot: true,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save chat to Firestore
      if (currentUser) {
        await saveChatToFirestore(inputText, response.analysis);
      }
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I'm having trouble analyzing right now. Please try again shortly.",
        isBot: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message too
      if (currentUser) {
        await saveChatToFirestore(inputText, errorMessage.text);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "Opening a coffee shop in Bangalore",
    "Starting a tech startup with 5L investment", 
    "Restaurant business in Mumbai",
    "E-commerce store for fashion",
    "Mobile app development company"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header - REMOVED LOGOUT BUTTON FROM HERE */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>SmartBiz AI Analyst</h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                {currentUser ? `Welcome back, ${currentUser.name}!` : 'Get detailed business analysis and insights'}
              </p>
            </div>
          </div>
          
          {/* LOGOUT BUTTON REMOVED FROM HERE - Only one logout button in UserAuth */}
        </div>
      </div>

      {/* Quick Questions */}
      <div style={{ 
        padding: '15px', 
        background: '#f8f9fa', 
        borderBottom: '1px solid #e9ecef' 
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6c757d' }}>Try asking:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInputText(question)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#e7f1ff';
                e.target.style.borderColor = '#0d6efd';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{ 
              display: 'flex', 
              justifyContent: message.isBot ? 'flex-start' : 'flex-end' 
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start',
              gap: '8px',
              maxWidth: '80%',
              flexDirection: message.isBot ? 'row' : 'row-reverse'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: message.isBot 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#6c757d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {message.isBot ? (
                  <Bot size={16} color="white" />
                ) : (
                  <User size={16} color="white" />
                )}
              </div>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                background: message.isBot ? '#e7f1ff' : '#f8f9fa',
                border: `1px solid ${message.isBot ? '#cfe2ff' : '#e9ecef'}`,
                maxWidth: '100%'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.5',
                  color: '#212529'
                }}>
                  <ReactMarkdown>
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                background: '#e7f1ff',
                border: '1px solid #cfe2ff'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#0d6efd',
                    animation: 'bounce 1.4s infinite ease-in-out'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#0d6efd',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: '0.1s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#0d6efd',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: '0.2s'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '20px', 
        borderTop: '1px solid #e9ecef',
        background: 'white'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          {/* Voice Input Button */}
          <button
            onClick={startListening}
            disabled={isListening}
            style={{
              padding: '12px',
              background: isListening ? '#ff4444' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isListening ? 0.7 : 1
            }}
            title="Speak your question"
          >
            <Mic size={16} />
          </button>

          <div style={{ flex: 1 }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type or speak your business question..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #dee2e6',
                borderRadius: '12px',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: '14px',
                minHeight: '60px',
                outline: 'none'
              }}
              rows="2"
            />
          </div>

          {/* Text-to-Speech Button */}
          <button
            onClick={() => {
              const lastBotMessage = messages.filter(msg => msg.isBot).pop();
              if (lastBotMessage) {
                speakText(lastBotMessage.text);
              }
            }}
            disabled={isSpeaking || !messages.some(msg => msg.isBot)}
            style={{
              padding: '12px',
              background: isSpeaking ? '#4CAF50' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (isSpeaking || !messages.some(msg => msg.isBot)) ? 0.7 : 1
            }}
            title="Read last response aloud"
          >
            <Volume2 size={16} />
          </button>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              style={{
                padding: '12px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Stop speaking"
            >
              Stop
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              opacity: (!inputText.trim() || isLoading) ? 0.6 : 1
            }}
          >
            <Send size={16} />
            Send
          </button>
        </div>
        
        {/* Voice Status */}
        {(isListening || isSpeaking) && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '8px',
            fontSize: '12px',
            color: '#6c757d'
          }}>
            {isListening && '🎤 Listening... Speak now'}
            {isSpeaking && '🔊 Reading response... Click stop to cancel'}
          </div>
        )}
        
        <p style={{ 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#6c757d',
          margin: '8px 0 0 0'
        }}>
          {currentUser ? 'Your chat history is automatically saved!' : 'Sign in to save your chat history'}
        </p>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default ChatInterface;