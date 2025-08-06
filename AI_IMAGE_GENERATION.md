# AI Image Generation Feature

## Overview
The drawing app now includes an AI-powered image generation feature that allows users to generate images through natural language prompts and drag them onto the collaborative canvas.

## Features

### 🤖 AI Chat Panel
- **Side Panel**: A dedicated AI chat interface appears on the right side of the drawing room
- **Toggle Button**: Users can show/hide the AI panel using the toggle button in the top-right corner
- **Real-time Chat**: Chat with the AI to generate images using natural language descriptions

### 🎨 Image Generation
- **Text-to-Image**: Describe any image you want using natural language
- **Placeholder Images**: Currently uses placeholder images from Picsum for demonstration
- **Real AI Integration**: Ready for integration with OpenAI DALL-E, Stable Diffusion, or other AI services

### 🖱️ Drag & Drop
- **Drag to Canvas**: Generated images can be dragged directly from the AI chat to the canvas
- **Collaborative**: All users in the room see the same generated images
- **Persistent**: Images are saved to the database and persist across sessions

## How to Use

1. **Open a Drawing Room**: Navigate to any drawing room
2. **Show AI Panel**: Click the "Show AI" button in the top-right corner if the panel is hidden
3. **Generate Image**: Type a description like "A cute cat playing with yarn" in the AI chat
4. **Wait for Generation**: The AI will generate an image (currently shows placeholder with 2-second delay)
5. **Drag to Canvas**: Click and drag the generated image from the chat to the canvas
6. **Collaborate**: All users in the room will see the same image

## Technical Implementation

### Frontend Components
- `AIChat.tsx`: AI chat interface component
- `CollaborativeCanvas.tsx`: Updated to support image elements and drag & drop
- `RoomContent.tsx`: Main room component with AI panel integration

### Backend Integration
- **WebSocket Messages**: New message types for AI image generation
- **Database Schema**: Updated to store image URLs and metadata
- **Placeholder Service**: Demo implementation using Picsum images

### Database Changes
```sql
-- Added to Drawing table:
- imageUrl: String (optional) - URL of generated image
- x, y, width, height: Float (optional) - Position and size for images
```

## Future Enhancements

### Real AI Integration
Replace the placeholder image service with:
- **OpenAI DALL-E**: High-quality AI image generation
- **Stable Diffusion**: Open-source alternative
- **Midjourney API**: Professional-grade images

### Advanced Features
- **Image Editing**: Resize, rotate, and modify placed images
- **Style Presets**: Choose different art styles for generation
- **Batch Generation**: Generate multiple variations
- **Image History**: Save and reuse previously generated images

## Configuration

### Environment Variables
Add these to your backend environment for real AI integration:
```env
OPENAI_API_KEY=your_openai_api_key
STABLE_DIFFUSION_API_KEY=your_stable_diffusion_key
```

### API Integration
Update the `generateAIImage` function in `apps/ws-backend/src/index.ts`:
```typescript
async function generateAIImage(prompt: string): Promise<string> {
  // Replace with actual AI service API call
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      n: 1,
      size: '512x512'
    })
  });
  
  const data = await response.json();
  return data.data[0].url;
}
```

## Troubleshooting

### Common Issues
1. **Images not loading**: Check if the image URLs are accessible
2. **Drag & drop not working**: Ensure the canvas has proper event handlers
3. **AI not responding**: Check WebSocket connection and backend logs

### Debug Mode
Enable debug logging by checking browser console and backend logs for detailed error messages. 