# AI-Powered Task Manager

A modern, full-stack task management application that leverages AI to help users break down complex tasks into manageable sub-tasks. Built with Next.js, Express.js, PostgreSQL, and integrated with Groq AI for intelligent task assistance.

## 🚀 Features

### Core Functionality
- **User Management**: Secure JWT authentication with role-based access (User/Admin)
- **Task Management**: Complete CRUD operations for tasks with status tracking
- **AI-Powered Sub-tasks**: Intelligent task breakdown using Groq AI
- **Admin Dashboard**: Comprehensive user and task management for administrators

### Smart Features
- **AI Task Breakdown**: Click "Generate Sub-tasks" to automatically break down complex tasks
- **Status Tracking**: Visual task status management (To Do, In Progress, Done)
- **Hierarchical Tasks**: Support for main tasks and sub-tasks
- **Search & Filter**: Find tasks quickly with advanced filtering options
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI Integration**: Groq API for task breakdown
- **Containerization**: Docker & Docker Compose
- **State Management**: React Hooks, Custom hooks for data fetching

## 📋 Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **Docker & Docker Compose** (optional, for containerized deployment)
4. **Groq API Key** ([Sign up here](https://console.groq.com))

## 🚀 Quick Start

### Method 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-task-manager
   ```

2. **Start the entire application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - Database: localhost:5432

4. **Stop the application**
   ```bash
   docker-compose down
   ```

### Method 2: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-task-manager
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   **Server** - Update `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_task_manager"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   GROQ_API_KEY="your_groq_api_key"
   PORT=5000
   NODE_ENV=development
   ```
   
   **Client** - Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb ai_task_manager
   
   # Run Prisma setup
   cd server
   npx prisma generate
   npx prisma db push
   ```

6. **Start the application**
   
   **Server** (Terminal 1):
   ```bash
   cd server
   node src/server.js
   ```
   
   **Client** (Terminal 2):
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Method 3: Development with npm scripts

For active development with hot reload:
```bash
# Terminal 1 - Server with auto-restart
cd server
npm run dev

# Terminal 2 - Client with hot reload
cd client
npm run dev
```

## 👥 User Roles

### Regular User
- Create, edit, and delete their own tasks
- Generate AI-powered sub-tasks
- Track task progress with status updates
- Search and filter personal tasks

### Admin User
- All user capabilities
- View all users in the system
- Access any user's tasks
- Monitor system-wide task statistics
- User management capabilities

### Creating an Admin User
1. Register a normal user account
2. Connect to your PostgreSQL database
3. Update the user's role: `UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';`

## 🤖 AI Features

The application integrates with Groq AI to provide intelligent task assistance:

### Sub-task Generation
- Click "Generate Sub-tasks" when creating a new task
- AI analyzes your task title and description
- Provides 3-5 actionable sub-tasks
- Select which suggestions to create automatically

### How it works
1. User enters a task title and optional description
2. Frontend sends request to `/api/ai/generate-subtasks`
3. Backend calls Groq AI using the Llama model
4. Returns structured sub-tasks as actionable items
5. User can accept, reject, or modify suggestions before creation

## 📊 Database Schema

### Models (Prisma)

#### `User`
- `id`: String (CUID)
- `email`: String (unique)
- `password`: String (hashed)
- `fullName`: String
- `role`: Role (USER/ADMIN)
- `createdAt`, `updatedAt`: DateTime
- `tasks`: Task[] (relation)

#### `Task`
- `id`: String (CUID)
- `title`: String
- `description`: String (optional)
- `status`: TaskStatus (TODO/IN_PROGRESS/DONE)
- `userId`: String (foreign key)
- `parentId`: String (optional, for subtasks)
- `createdAt`, `updatedAt`: DateTime
- `user`: User (relation)
- `parent`: Task (optional, for subtasks)
- `subtasks`: Task[] (relation)

### Security
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization

## 🔒 Security Features

- **Authentication**: JWT tokens with secure password hashing
- **Authorization**: Role-based access control (User/Admin)
- **Data Security**: Prisma ORM with parameterized queries
- **API Security**: Express middleware for authentication and rate limiting
- **Input Validation**: express-validator for request validation
- **Security Headers**: Helmet.js for security headers

## 🧪 Development

### Project Structure
```
ai-task-manager/
├── client/          # Next.js frontend
│   ├── app/         # App router pages
│   ├── components/  # React components
│   ├── hooks/       # Custom hooks
│   └── lib/         # Utilities
└── server/          # Express.js backend
    ├── src/
    │   ├── routes/    # API routes
    │   ├── middleware/# Auth middleware
    │   └── server.js  # Main server file
    └── prisma/        # Database schema
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/all` - Get all tasks (Admin only)

### Users (Admin only)
- `GET /api/users` - Get all users with statistics
- `GET /api/users/:userId/tasks` - Get specific user's tasks

### AI
- `POST /api/ai/generate-subtasks` - Generate AI-powered subtasks

## 🚀 Deployment

### Docker Deployment (Recommended)

**Single Command Deployment:**
```bash
docker-compose up -d
```

This will:
- Build and start PostgreSQL database
- Build and start Express.js backend
- Build and start Next.js frontend
- Set up networking between services
- Persist database data in Docker volumes

**Production Environment Variables:**
Update `docker-compose.yml` with your production values:
```yaml
services:
  server:
    environment:
      DATABASE_URL: "postgresql://postgres:your_password@database:5432/ai_task_manager"
      JWT_SECRET: "your-production-jwt-secret"
      GROQ_API_KEY: "your_groq_api_key"
```

### Manual Deployment

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Setup production database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

3. **Start production servers**
   ```bash
   # Server
   cd server
   NODE_ENV=production node src/server.js
   
   # Client
   cd client
   npm run start
   ```

### Environment Configuration

For production, ensure these variables are properly configured:
- `DATABASE_URL` - Production PostgreSQL connection string
- `JWT_SECRET` - Strong, unique secret key
- `GROQ_API_KEY` - Your Groq API key
- `NODE_ENV=production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the React framework
- [Express.js](https://expressjs.com) for the backend framework
- [Prisma](https://prisma.io) for the database ORM
- [Groq](https://groq.com) for AI-powered task assistance
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [PostgreSQL](https://postgresql.org) for the robust database

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/api` endpoints
- Review the database schema in `backend/prisma/schema.prisma`

---

**Happy Task Managing! 🎯**