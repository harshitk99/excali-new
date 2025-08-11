# SYNCART - Collaborative Drawing App

SYNCART is a real-time collaborative drawing platform that allows multiple users to create, share, and collaborate on digital artwork simultaneously. Built with modern web technologies, SYNCART provides an intuitive drawing experience with powerful collaboration features.

## Features

### 🎨 Drawing Tools
- **Multiple Drawing Tools**: Line, rectangle, circle, arrow, and text tools
- **Color Palette**: Extensive color selection with custom color picker
- **Stroke Width Control**: Adjustable line thickness from 1-20px
- **Image Support**: Drag and drop images directly onto the canvas
- **Zoom & Pan**: Navigate large canvases with smooth zoom and pan controls

### 👥 Collaboration
- **Real-Time Sync**: See other users' drawings appear instantly
- **Multi-User Support**: Multiple users can draw simultaneously
- **Room-Based System**: Create and join drawing rooms
- **Live Cursors**: See where other users are drawing in real-time
- **User Presence**: Know who's currently in the room

### 🛠️ Advanced Features
- **Undo/Redo**: Track and reverse drawing actions
- **Drawing Library**: Access pre-made templates and shapes
- **Export Options**: Save your collaborative artwork
- **Responsive Design**: Works seamlessly on desktop and tablet
- **Dark/Light Theme**: Toggle between themes for comfortable drawing

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Drawing Engine**: Konva.js for high-performance canvas rendering
- **Real-Time Communication**: WebSocket for live collaboration
- **Backend**: Node.js with Express
- **Database**: Prisma with PostgreSQL
- **Styling**: Tailwind CSS
- **Build Tool**: Turborepo for monorepo management

## Getting Started

### Prerequisites
- Node.js 18 or higher
- pnpm package manager
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd draw-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the database:
```bash
cd packages/db
pnpm prisma generate
pnpm prisma db push
```

4. Start the development servers:
```bash
pnpm dev
```

This will start:
- Web app on http://localhost:3000
- HTTP backend on http://localhost:3001
- WebSocket backend on http://localhost:3002

## Project Structure

```
draw-app/
├── apps/
│   ├── web/                 # Next.js frontend application
│   ├── http-backend/        # REST API server
│   └── ws-backend/          # WebSocket server for real-time features
├── packages/
│   ├── common/              # Shared TypeScript types
│   ├── ui/                  # Reusable UI components
│   ├── db/                  # Database schema and client
│   └── backend-common/      # Shared backend utilities
```

## Usage

1. **Create an Account**: Sign up to start creating collaborative drawings
2. **Create a Room**: Generate a new drawing room or join an existing one
3. **Invite Collaborators**: Share the room link with others
4. **Start Drawing**: Use the toolbar to select tools and start creating
5. **Collaborate**: See real-time updates as others draw

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@syncart.com or join our Discord community.
