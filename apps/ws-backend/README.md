# WebSocket Backend

This is the WebSocket server for the collaborative drawing application, handling real-time communication and AI image generation.

## Features

- Real-time drawing synchronization
- AI image generation using OpenAI DALL-E
- Room-based communication
- User authentication via JWT

## Setup

### 1. Environment Variables

Create a `.env` file in the `apps/ws-backend` directory with the following variables:

```env
# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/draw_app"

# JWT Secret (should match the one in backend-common)
JWT_SECRET=your_jwt_secret_here
```

### 2. Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated key
5. Paste it in your `.env` file as `OPENAI_API_KEY`

### 3. Running the Server

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Or build and run in production
pnpm build
pnpm start
```

## AI Image Generation

The server includes AI image generation functionality using OpenAI's DALL-E model. When a user sends a prompt through the AI chat:

1. The server receives an `ai_generate_image` message
2. It calls the OpenAI API with the user's prompt
3. The generated image URL is saved to the database
4. The image is broadcast to all users in the room

### Fallback Mode

If no `OPENAI_API_KEY` is configured, the server will use placeholder images from Picsum for demonstration purposes.

## API Endpoints

The WebSocket server handles the following message types:

- `join_room` - Join a drawing room
- `leave_room` - Leave a drawing room
- `draw` - Send drawing data
- `clear_canvas` - Clear the canvas
- `ai_generate_image` - Generate an AI image from a prompt

## Security

- All connections require valid JWT tokens
- API keys are stored in environment variables
- Input validation is performed on all messages 