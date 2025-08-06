'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CollaborativeCanvas from '../../components/CollaborativeCanvas';
import AIChat from '../../components/AIChat';
import { useSocket } from '../../hooks/useSocket';

interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'hand' | 'image';
  points: number[];
  color: string;
  strokeWidth: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  imageUrl?: string;
}

interface Drawing {
  id: number;
  roomId: number;
  points: number[];
  color: string;
  strokeWidth: number;
  shapeType: string;
  userId: string;
  userName: string;
  createdAt: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  imageUrl?: string;
}

export default function RoomContent({ slug }: { slug: string }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [showAIChat, setShowAIChat] = useState(true);
  const { socket, loading } = useSocket();

  useEffect(() => {
    async function fetchRoomId() {
      try {
        const response = await axios.get(`http://localhost:3001/room/${slug}`);
        setRoomId(response.data.roomId);
      } catch (error) {
        console.error('Error fetching room ID:', error);
      }
    }
    fetchRoomId();
  }, [slug]);

  useEffect(() => {
    async function fetchDrawings() {
      if (!roomId) return;
      
      try {
        const response = await axios.get(`http://localhost:3001/drawings/${roomId}`);
        const fetchedDrawings = response.data.drawings;
        setDrawings(fetchedDrawings);
        
        // Convert drawings to drawing elements format for the canvas
        const elements: DrawingElement[] = fetchedDrawings.map((drawing: Drawing) => ({
          id: drawing.id.toString(),
          type: drawing.shapeType as 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'hand' | 'image',
          points: drawing.points,
          color: drawing.color,
          strokeWidth: drawing.strokeWidth,
          x: drawing.x,
          y: drawing.y,
          width: drawing.width,
          height: drawing.height,
          radius: drawing.radius,
          imageUrl: drawing.imageUrl
        }));
        setDrawingElements(elements);
      } catch (error) {
        console.error('Error fetching drawings:', error);
      }
    }

    fetchDrawings();
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !socket || loading) return;

    // Join the room - using the correct message type expected by backend
    socket.send(JSON.stringify({
      type: 'join_room',
      roomId: parseInt(roomId)
    }));

    // Handle incoming draw events
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'draw') {
          // Add new drawing to state
          const newDrawing = data.drawing;
          console.log('Adding new drawing:', newDrawing);
          setDrawings(prev => [...prev, newDrawing]);
          
          // Convert to drawing element
          const newElement: DrawingElement = {
            id: newDrawing.id.toString(),
            type: newDrawing.shapeType as 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'hand' | 'image',
            points: newDrawing.points,
            color: newDrawing.color,
            strokeWidth: newDrawing.strokeWidth,
            x: newDrawing.x,
            y: newDrawing.y,
            width: newDrawing.width,
            height: newDrawing.height,
            radius: newDrawing.radius,
            imageUrl: newDrawing.imageUrl
          };
          console.log('Adding new element to canvas:', newElement);
          
          // Replace temporary element with real one, or add if no temp element exists
          setDrawingElements(prev => {
            // Remove any temporary elements (they start with 'temp-')
            const withoutTemp = prev.filter(el => !el.id.startsWith('temp-'));
            // Check if this drawing already exists (to avoid duplicates)
            const exists = withoutTemp.some(el => el.id === newElement.id);
            if (!exists) {
              return [...withoutTemp, newElement];
            }
            return withoutTemp;
          });
        } else if (data.type === 'delete_drawing') {
          // Remove drawing from state
          console.log('Deleting drawing:', data.drawingId);
          setDrawings(prev => prev.filter(d => d.id !== data.drawingId));
          setDrawingElements(prev => prev.filter(e => e.id !== data.drawingId.toString()));
        } else if (data.type === 'clear_room') {
          // Clear all drawings from state
          console.log('Clearing room');
          setDrawings([]);
          setDrawingElements([]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
      // Leave the room - using the correct message type expected by backend
      socket.send(JSON.stringify({
        type: 'leave_room',
        room: parseInt(roomId)
      }));
    };
  }, [roomId, socket, loading]);

  const handleNewElement = (element: DrawingElement) => {
    if (!roomId || !socket) return;
    
    console.log('Sending new element to WebSocket:', element);
    
    // Add to local state immediately for instant feedback
    const tempId = `temp-${Date.now()}`;
    const tempElement = { ...element, id: tempId };
    setDrawingElements(prev => [...prev, tempElement]);
    
    // Send drawing to WebSocket server
    socket.send(JSON.stringify({
      type: 'draw',
      roomId: parseInt(roomId),
      points: element.points,
      color: element.color,
      strokeWidth: element.strokeWidth,
      shapeType: element.type,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      radius: element.radius,
      imageUrl: element.imageUrl
    }));
  };

  const handleClearCanvas = async () => {
    if (!roomId) return;
    
    try {
      // Delete all drawings for this room from the database
      const response = await axios.delete(`http://localhost:3001/drawings/clear/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Clear local state
      setDrawingElements([]);
      setDrawings([]);
      
      // Notify other users through WebSocket
      if (socket) {
        socket.send(JSON.stringify({
          type: 'clear_room',
          roomId: parseInt(roomId)
        }));
      }
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  };

  if (!roomId) return <div>Loading room...</div>;

  const handleImageGenerated = (imageUrl: string) => {
    // This will be handled by the AI chat component
    console.log('Image generated:', imageUrl);
  };

  return (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex'
    }}>
      <div style={{ flex: 1 }}>
        <CollaborativeCanvas 
          lines={drawingElements} 
          onNewElement={handleNewElement} 
          onClearCanvas={handleClearCanvas}
        />
      </div>
      {showAIChat && (
        <AIChat 
          roomId={roomId} 
          onImageGenerated={handleImageGenerated}
        />
      )}
      <button
        onClick={() => setShowAIChat(!showAIChat)}
        style={{
          position: 'fixed',
          top: '20px',
          right: showAIChat ? '340px' : '20px',
          zIndex: 1000,
          padding: '8px 12px',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.3s ease'
        }}
      >
        {showAIChat ? '🤖' : '🤖'}
        {showAIChat ? 'Hide AI' : 'Show AI'}
      </button>
    </div>
  );
}
