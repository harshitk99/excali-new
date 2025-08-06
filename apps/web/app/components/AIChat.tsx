'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

interface AIChatProps {
  roomId: string;
  onImageGenerated: (imageUrl: string) => void;
}

export default function AIChat({ roomId, onImageGenerated }: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'ai_message') {
          const newMessage: AIMessage = {
            id: Date.now().toString(),
            type: 'ai',
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            imageUrl: data.imageUrl
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          if (data.imageUrl) {
            onImageGenerated(data.imageUrl);
          }
        } else if (data.type === 'ai_generating') {
          setMessages(prev => [...prev, {
            id: 'generating',
            type: 'ai',
            content: 'Generating image...',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isGenerating: true
          }]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, onImageGenerated]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !socket || isGenerating) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Send message to WebSocket for AI processing
    socket.send(JSON.stringify({
      type: 'ai_generate_image',
      roomId: parseInt(roomId),
      prompt: inputValue
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={{
      width: '320px',
      height: '100%',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #e1e5e9',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#f8fafc'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🤖 AI Image Generator
        </h3>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          Describe an image and drag it to the canvas
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
            <div>Ask me to generate any image!</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Try: "A cute cat playing with yarn"
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: message.type === 'user' ? '#6366f1' : '#f3f4f6',
              color: message.type === 'user' ? '#ffffff' : '#374151',
              fontSize: '14px',
              wordBreak: 'break-word'
            }}>
              {message.content}
            </div>
            
            {message.imageUrl && (
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, message.imageUrl!)}
                style={{
                  maxWidth: '80%',
                  cursor: 'grab',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e1e5e9';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={message.imageUrl}
                  alt="Generated image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
                <div style={{
                  padding: '4px 8px',
                  backgroundColor: '#f8fafc',
                  fontSize: '10px',
                  color: '#6b7280',
                  textAlign: 'center',
                  borderTop: '1px solid #e1e5e9'
                }}>
                  Drag to canvas
                </div>
              </div>
            )}
            
            {message.isGenerating && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e1e5e9',
                  borderTop: '2px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Generating...
              </div>
            )}
            
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
              marginTop: '2px'
            }}>
              {message.timestamp}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e1e5e9',
        backgroundColor: '#f8fafc'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the image you want..."
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            style={{
              padding: '8px 12px',
              backgroundColor: isGenerating ? '#9ca3af' : '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isGenerating ? (
              <>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Generating
              </>
            ) : (
              <>
                🎨
                Generate
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 