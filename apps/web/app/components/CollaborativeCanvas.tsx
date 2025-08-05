//allow users to draw
//all drawing will be here
import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Circle, Image as KonvaImage } from "react-konva";
import Konva from "konva";

export type LinePoints = number[];

interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'hand';
  points: LinePoints;
  color: string;
  strokeWidth: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
}

interface CollaborativeCanvasProps {
  lines: DrawingElement[];                     // All drawing elements to render
  onNewElement: (element: DrawingElement) => void;  // Called when a drawing is completed
  onClearCanvas?: () => void;              // Called when canvas is cleared
  images?: { src: string; x: number; y: number; id: string }[];  // (Optional) Placed images
  onDropImage?: (img: { src: string; x: number; y: number }) => void; // (Optional) When image is dropped
}

const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({ 
  lines, 
  onNewElement, 
  onClearCanvas,
  images = [], 
  onDropImage 
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [previewElement, setPreviewElement] = useState<DrawingElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'hand' | 'line' | 'rectangle' | 'circle' | 'arrow' | 'text'>('select');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const stageRef = useRef<any>(null);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
    '#FFC0CB', '#A52A2A', '#808080', '#FFFFFF'
  ];

  const tools = [
    { id: 'select', icon: '👆', label: 'Select', hotkey: '1' },
    { id: 'hand', icon: '✋', label: 'Hand', hotkey: '2' },
    { id: 'line', icon: '✏️', label: 'Line', hotkey: '3' },
    { id: 'rectangle', icon: '⬜', label: 'Rectangle', hotkey: '4' },
    { id: 'circle', icon: '⭕', label: 'Circle', hotkey: '5' },
    { id: 'arrow', icon: '➡️', label: 'Arrow', hotkey: '6' },
    { id: 'text', icon: 'A', label: 'Text', hotkey: '7' }
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '7') {
        const toolIndex = parseInt(e.key) - 1;
        if (toolIndex < tools.length && tools[toolIndex]) {
          setSelectedTool(tools[toolIndex].id as any);
        }
      }
      
      // Spacebar for hand tool
      if (e.code === 'Space' && !e.repeat) {
        setSelectedTool('hand');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSelectedTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool === 'select') return;
    
    if (selectedTool === 'hand') {
      setIsPanning(true);
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setPanStart({ x: pos.x - stagePosition.x, y: pos.y - stagePosition.y });
      }
      return;
    }
    
    setIsDrawing(true);
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      console.log('Mouse down at:', pos, 'with tool:', selectedTool);
      setStartPoint(pos);
      if (selectedTool === 'line' || selectedTool === 'arrow') {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: selectedTool,
          points: [pos.x, pos.y],
          color: selectedColor,
          strokeWidth: strokeWidth
        };
        setCurrentElement(newElement);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool === 'hand' && isPanning && panStart) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        setStagePosition({
          x: pos.x - panStart.x,
          y: pos.y - panStart.y
        });
      }
      return;
    }

    if (!isDrawing || !startPoint || selectedTool === 'select' || !isDrawingTool(selectedTool)) return;
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (point) {
      if ((selectedTool === 'line' || selectedTool === 'arrow') && currentElement) {
        setCurrentElement({
          ...currentElement,
          points: [...currentElement.points, point.x, point.y]
        });
      } else if ((selectedTool === 'rectangle' || selectedTool === 'circle') && startPoint) {
        // Create preview for shapes
        const preview: DrawingElement = {
          id: 'preview',
          type: selectedTool,
          points: [],
          color: selectedColor,
          strokeWidth: strokeWidth,
          x: Math.min(startPoint.x, point.x),
          y: Math.min(startPoint.y, point.y),
          width: Math.abs(point.x - startPoint.x),
          height: Math.abs(point.y - startPoint.y),
          radius: selectedTool === 'circle' ? Math.min(Math.abs(point.x - startPoint.x), Math.abs(point.y - startPoint.y)) / 2 : undefined
        };
        setPreviewElement(preview);
      }
    }
  };

  const isDrawingTool = (tool: string): tool is 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' => {
    return ['line', 'rectangle', 'circle', 'arrow', 'text'].includes(tool);
  };

  const handleMouseUp = () => {
    if (selectedTool === 'hand') {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (!isDrawing || !startPoint || selectedTool === 'select' || !isDrawingTool(selectedTool)) return;
    
    const stage = stageRef.current;
    const point = stage?.getPointerPosition();
    
    if (point && (selectedTool === 'rectangle' || selectedTool === 'circle')) {
      // Only create shape if it has a minimum size
      const width = Math.abs(point.x - startPoint.x);
      const height = Math.abs(point.y - startPoint.y);
      
      if (width > 5 && height > 5) {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: selectedTool,
          points: [],
          color: selectedColor,
          strokeWidth: strokeWidth,
          x: Math.min(startPoint.x, point.x),
          y: Math.min(startPoint.y, point.y),
          width: width,
          height: height,
          radius: selectedTool === 'circle' ? Math.min(width, height) / 2 : undefined
        };
        console.log('Creating shape:', newElement);
        onNewElement(newElement);
      }
    } else if (currentElement && (selectedTool === 'line' || selectedTool === 'arrow') && currentElement.points.length >= 4) {
      // For lines and arrows, we need at least 2 points (4 coordinates)
      console.log('Creating line/arrow:', currentElement);
      onNewElement(currentElement);
    }
    
    setIsDrawing(false);
    setCurrentElement(null);
    setPreviewElement(null);
    setStartPoint(null);
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom between 25% and 400%
    const clampedScale = Math.max(0.25, Math.min(4, newScale));
    
    setZoom(Math.round(clampedScale * 100));

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  const handleClearCanvas = () => {
    if (onClearCanvas) {
      onClearCanvas();
    }
  };

  const handleZoomIn = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = Math.min(4, oldScale * 1.25);
    setZoom(Math.round(newScale * 100));

    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  const handleZoomOut = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = Math.max(0.25, oldScale / 1.25);
    setZoom(Math.round(newScale * 100));

    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleLibrary = () => {
    setShowLibraryModal(true);
  };

  const renderElement = (element: DrawingElement) => {
    switch (element.type) {
      case 'line':
        return (
          <Line
            key={element.id}
            points={element.points}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        );
      case 'arrow':
        return (
          <Line
            key={element.id}
            points={element.points}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            tension={0}
            lineCap="round"
            lineJoin="round"
          />
        );
      case 'rectangle':
        return (
          <Rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
          />
        );
      case 'circle':
        return (
          <Circle
            key={element.id}
            x={(element.x || 0) + (element.width || 0) / 2}
            y={(element.y || 0) + (element.height || 0) / 2}
            radius={Math.min((element.width || 0) / 2, (element.height || 0) / 2)}
            stroke={element.color}
            strokeWidth={element.strokeWidth}
            fill="transparent"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: '#fafafa'
    }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e5e9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* Left side - Menu */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            ☰
          </button>
        </div>

        {/* Center - Main Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#f1f3f4',
          padding: '4px',
          borderRadius: '8px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: selectedTool === tool.id ? '#6366f1' : 'transparent',
                color: selectedTool === tool.id ? '#ffffff' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                minWidth: '48px',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              title={`${tool.label} (${tool.hotkey})`}
            >
              <span style={{ fontSize: '18px', marginBottom: '2px' }}>{tool.icon}</span>
              <span style={{ 
                fontSize: '10px', 
                opacity: 0.7,
                position: 'absolute',
                top: '2px',
                right: '4px'
              }}>
                {tool.hotkey}
              </span>
            </button>
          ))}
        </div>

        {/* Right side - Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleShare}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Share
          </button>
          <button 
            onClick={handleLibrary}
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📚 Library
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        backgroundColor: '#fafafa',
        overflow: 'hidden'
      }}>
        {/* Color and Width Panel */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9',
          zIndex: 10
        }}>
          {/* Color Picker */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Color</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #6366f1' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Width</div>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              style={{ 
                width: '100%',
                marginBottom: '4px'
              }}
            />
            <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
              {strokeWidth}px
            </div>
          </div>
        </div>

        {/* Canvas */}
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight - 120}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onWheel={handleWheel}
          x={stagePosition.x}
          y={stagePosition.y}
          style={{ 
            background: "#ffffff",
            cursor: selectedTool === 'select' ? 'default' : 
                   selectedTool === 'hand' ? 'grab' : 
                   isPanning ? 'grabbing' : 'crosshair'
          }}
        >
          <Layer>
            {lines.map(renderElement)}
            {currentElement && renderElement(currentElement)}
            {previewElement && renderElement(previewElement)}
          </Layer>
        </Stage>

        {/* Canvas Hint */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#9ca3af',
          fontSize: '14px',
          pointerEvents: 'none',
          opacity: lines.length === 0 ? 0.6 : 0
        }}>
          To move canvas, hold mouse wheel or spacebar while dragging, or use the hand tool
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e1e5e9',
        boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* Left - Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f3f4',
            borderRadius: '6px',
            padding: '4px',
            gap: '4px'
          }}>
            <button
              onClick={handleZoomOut}
              style={{
                padding: '6px 8px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              -
            </button>
            <span style={{ 
              padding: '6px 8px', 
              fontSize: '14px', 
              color: '#374151',
              minWidth: '50px',
              textAlign: 'center'
            }}>
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              style={{
                padding: '6px 8px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              +
            </button>
          </div>

          {/* Undo/Redo */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={{
              padding: '6px 8px',
              backgroundColor: '#f1f3f4',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              ↶
            </button>
            <button style={{
              padding: '6px 8px',
              backgroundColor: '#f1f3f4',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              ↷
            </button>
          </div>
        </div>

        {/* Center - Scroll to Content */}
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#f1f3f4',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}>
          Scroll back to content
        </button>

        {/* Right - Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleClearCanvas}
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Clear Canvas"
          >
            ✓
          </button>
          <button style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#f1f3f4',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ?
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#374151' }}>
              Share Drawing
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
              Share this collaborative drawing room with others
            </p>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={window.location.href}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f3f4',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowShareModal(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibraryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#374151' }}>
              Drawing Library
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '14px' }}>
              Browse and use pre-made drawing templates
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {['Flowchart', 'Mind Map', 'Wireframe', 'Diagram', 'Sketch', 'Icon Set'].map((template) => (
                <div
                  key={template}
                  style={{
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f9fafb'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#6366f1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e1e5e9';
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                  <div style={{ fontSize: '12px', color: '#374151' }}>{template}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLibraryModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCanvas;
