#  Chatbot Platform - Full Stack Application

A modern chatbot platform built with React and Node.js, featuring AI-powered conversations, user authentication, and project management.

## Features

- **User Authentication** - Secure registration and login system
- **Project Management** - Create and organize multiple chatbot projects
- **AI Chat Interface** - Intelligent conversations with custom AI engine
- **File Upload** - Support for documents and images
- **Responsive Design** - Works perfectly on desktop and mobile
- **REST API** - Well-structured backend API

## Technology Stack

### Frontend
- React 18 with Hooks
- Vite Build Tool
- Tailwind CSS for styling
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB database
- JWT authentication
- Mongoose ODM

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB installed locally

### Step-by-Step Setup

1. **Clone and setup:**
```bash
git clone https://github.com/yourusername/chatbot-platform.git
cd chatbot-platform

# Backend setup
cd backend
npm install

# Frontend setup
cd ../client
npm install
Environment setup:
Create backend/.env file:

text
MONGODB_URI=mongodb://localhost:27017/chatbot-platform
JWT_SECRET=your_secret_key_here
PORT=5000
Run the application:

bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
Access application:
Open http://localhost:3000 in your browser

Usage
For Testers:

*******Registration*******

Open http://localhost:3000

Click "Create an account"

Fill in details and register

*******Project Creation******

After login, click "New Project"

Enter project name and description

Save the project

*******AI Chat Testing********

Click on any project

Use the chat interface

Try these sample questions:

"Hello, how are you?"

"What technologies were used?"

"Can you help with coding?"

********Demo Access*********
Live URL: https://your-demo.netlify.app

Test credentials: test@example.com / demo123

********API Endpoints*******
POST /api/auth/register - User registration

POST /api/auth/login - User login

GET /api/projects - Get user projects

POST /api/projects - Create new project

POST /api/chat/:id - Send message to AI

Project Structure
text
chatbot-platform/
├── backend/
│   ├── models/ (User, Project models)
│   ├── routes/ (API routes)
│   └── server.js (Main server)
├── client/
│   ├── src/
│   │   ├── components/ (React components)
│   │   ├── pages/ (Login, Dashboard, Chat)
│   │   └── contexts/ (Auth context)
│   └── public/
└── README.md
Key Features Demonstrated
Full-stack development skills

Database design and management

API design and implementation

User authentication system

Responsive UI/UX design

Error handling and validation

Deployment
The application is deployment-ready for platforms like:

Backend: Render, Heroku

Frontend: Netlify, Vercel

Database: MongoDB Atlas




*******Contact*******

Developer: Subramanian Senguttuvan

Email: senguttuvansuba3@gmail.com

GitHub: https://github.com/yourusername