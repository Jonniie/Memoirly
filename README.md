# Memoirly: Your Digital Memory Collection

![Memoirly Logo](public/logo.png)

A modern web application for creating, organizing, and sharing your memories through photos and videos, built with React and JavaScript.

## 📱 Overview

Memoirly is a feature-rich web application that helps you preserve and share your experiences. With powerful media management, timeline organization, and beautiful UI, it's the perfect companion for documenting your life's moments.

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React"> <img src="https://img.shields.io/badge/JavaScript-3178C6.svg?style=flat&logo=Javascript&logoColor=white" alt="JavaScript"> <img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite"> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=flat&logo=Tailwind-CSS&logoColor=white" alt="Tailwind CSS"> <img src="https://img.shields.io/badge/Supabase-3ECF8E.svg?style=flat&logo=Supabase&logoColor=white" alt="Supabase"> <img src="https://img.shields.io/badge/Cloudinary-3448C5.svg?style=flat&logo=Cloudinary&logoColor=white" alt="Cloudinary"> <img src="https://img.shields.io/badge/Clerk-000000.svg?style=flat&logo=Clerk&logoColor=white" alt="Clerk"> <img src="https://img.shields.io/badge/TensorFlow-FF6F00.svg?style=flat&logo=TensorFlow&logoColor=white" alt="TensorFlow"> <img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">

## 🎯 Key Features

### 📸 Media Management

- Photo and video upload with drag-and-drop support
- Automatic media organization by date
- Smart album creation and management
- Batch upload and processing
- Media preview and quick editing

### 🎥 Memory Reels (Coming soon)

- Create beautiful video reels from your clips
- Custom transitions and effects
- Background music integration
- Video trimming and editing
- Export in multiple formats

### 🤖 AI-Powered Features

- Intelligent photo tagging using TensorFlow
- Automatic content tagging and categorization (Coming soon)
- Smart search and filtering (Coming soon)
- Face recognition and grouping (Coming soon)
- Scene and object detection (Coming soon)

### 📱 User Experience

- Responsive design for all devices
- Smooth animations with Framer Motion
- Intuitive navigation
- Protected routes for authenticated users
- Public sharing capabilities

### 🔐 Security & Privacy

- Secure authentication with Clerk
- Private and public sharing options
- Protected routes for authenticated content
- Secure media storage

### 💾 Data Management

- Cloud storage with Supabase
- Automatic backup and sync
- Cross-device access
- Version history
- Data export options

## 🛠️ Technical Stack

### Frontend

- **Framework**: React + JavaScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Authentication**: Clerk
- **AI/ML**: TensorFlow.js
- **UI Components**:
  - Framer Motion for animations
  - Custom UI components
  - Responsive layouts

### Backend Services

- **Authentication**: Clerk
- **Database**: Supabase
- **Media Storage**: Cloudinary
- **AI Processing**: TensorFlow.js

## 📊 Database Schema

Our Supabase database is designed to efficiently store and manage user data, media, and relationships. Here's a visual representation of our database schema:

![Supabase Schema](public/supabase%20schema.png)



### Key Tables

- **users**: Stores user profiles and authentication data
- **memories**: Contains all uploaded media and associated metadata
- **albums**: Manages collections of memories
- **shares**: Manages sharing permissions and public access

## 🏗️ Project Structure

```
src/
├── api/           # API integration
├── components/    # Reusable UI components
│   ├── auth/     # Authentication components
│   ├── edits/    # Video editing components
│   ├── gallery/  # Media gallery components
│   ├── layout/   # Layout components
│   ├── search/   # Search functionality
│   └── upload/   # File upload components
├── pages/        # Page components
│   ├── HomePage
│   ├── Dashboard
│   ├── MemoryDetail
│   ├── AlbumPage
│   ├── TimelinePage
│   ├── MemoryReelPage
│   └── more...
├── lib/          # Utility functions and hooks
├── App.jsx       # Main application component
└── main.jsx      # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Cloudinary account
- Clerk account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Jonniie/Memoirly.git
   cd Memoirly
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   VITE_CLOUDINARY_UPLOAD=your_cloudinary_preset_value
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   ```

#### Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is created, go to Project Settings > API
3. Copy the "Project URL" for `VITE_SUPABASE_URL`
4. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`

#### Cloudinary Credentials

1. Sign up for a [Cloudinary](https://cloudinary.com) account
2. Go to your Dashboard
3. Copy your "Cloud name" for `VITE_CLOUDINARY_CLOUD_NAME` and Cloud Preset Value for `VITE_CLOUDINARY_UPLOAD`

#### Clerk Authentication

1. Create an account at [Clerk](https://clerk.com)
2. Create a new application
3. Go to API Keys in your dashboard
4. Copy the "Publishable Key" for `VITE_CLERK_PUBLISHABLE_KEY`

5. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🧪 Features in Development

- AI-powered photo organization
- Advanced video editing capabilities
- Social sharing integration
- Mobile app companion
- Offline mode support
- Advanced analytics
- Custom themes and templates
- Collaborative albums

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Clerk for authentication
- Supabase for database services
- Cloudinary for media management
- The open-source community for various tools and libraries




