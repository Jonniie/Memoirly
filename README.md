# Summer Memories: Your Digital Memory Collection

![Summer Memories Logo](public/logo.png)

A modern web application for creating, organizing, and sharing your summer memories through photos and videos, built with React and Javascript.

## 📱 Overview

Summer Memories is a feature-rich web application that helps you preserve and share your summer experiences. With powerful media management, location tagging, and beautiful UI, it's the perfect companion for documenting your adventures.

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/JavaScript-3178C6.svg?style=flat&logo=Javascript&logoColor=white" alt="JaveScript">
<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white" alt="Vite">
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=flat&logo=Tailwind-CSS&logoColor=white" alt="Tailwind CSS">
<img src="https://img.shields.io/badge/Supabase-3ECF8E.svg?style=flat&logo=Supabase&logoColor=white" alt="Supabase">
<img src="https://img.shields.io/badge/Cloudinary-3448C5.svg?style=flat&logo=Cloudinary&logoColor=white" alt="Cloudinary">
<img src="https://img.shields.io/badge/Clerk-000000.svg?style=flat&logo=Clerk&logoColor=white" alt="Clerk">
<!-- <img src="https://img.shields.io/badge/Mapbox-000000.svg?style=flat&logo=Mapbox&logoColor=white" alt="Mapbox">
<img src="https://img.shields.io/badge/FFmpeg-000000.svg?style=flat&logo=FFmpeg&logoColor=white" alt="FFmpeg"> -->
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">

<!-- Images -->
<br>

## 🏆 **Challenge Statements Addressed**

**Summer Memories** focuses on providing a seamless and engaging way to capture, organize, and share summer memories through media management and video compilation features. It integrates location-based services to enhance the user experience by allowing for media organization based on location and tagging.

### **Media Management Challenge** 📸 (Primary Focus)

- **Photo and video upload** with drag-and-drop support
- **Automatic media organization** by date and location
- **Smart album creation** and management
- **Batch upload and processing**
- **Media preview** and quick editing

### **Video Compilation Challenge** 🎥 (Supporting Feature)

- Create beautiful **video reels** from your clips
- **Custom transitions and effects**
- **Background music integration**
- **Video trimming and editing**
- Export in **multiple formats**

### **Geolocation Challenge** 🌍 (Supporting Feature)

- **Real-time geolocation tagging** to automatically categorize and organize photos
- **Location-based photo sorting** based on user-provided coordinates
- **Map integration** for visualizing memories shared in different locations
- **Location-based media filtering** to create albums or share experiences by region

## 🎯 Key Features

### 📸 Media Management

- Photo and video upload with drag-and-drop support
- Automatic media organization by date and location
- Smart album creation and management
- Batch upload and processing
- Media preview and quick editing

### 🎥 Video Compilation

- Create beautiful video reels from your clips
- Custom transitions and effects
- Background music integration
- Video trimming and editing
- Export in multiple formats

### 🔐 Security & Privacy

- Secure authentication with Clerk
- Private and public sharing options
- End-to-end encryption for sensitive data
- Granular privacy controls
- Row Level Security enabled for all user data
- Secure media storage

### 💾 Data Management

- Cloud storage with Supabase
- Automatic backup and sync
- Cross-device access
- Version history
- Data export options

## 🛠️ Technical Stack

### Frontend

- **Framework**: React + JS
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**:
  - react-beautiful-dnd for drag and drop
  - react-masonry-css for grid layouts
  - react-dropzone for file uploads
  - lucide-react for icons
  - Framer Motion for animations

### Backend Services

- **Authentication**: Clerk
- **Database**: Supabase
- **Media Storage**: Cloudinary
<!-- - **Video Processing**: ffmpeg.wasm
- **Maps**: Mapbox -->

## 🏗️ Architecture

```
User
↓
React Frontend
↳ Clerk (Authentication)
  - User management
  - Session handling
  - OAuth integration
↳ Supabase (Database)
  - User data storage
  - Media metadata
  - Album management
↳ Cloudinary (Media Storage & CDN)
  - Image optimization
  - Video processing
  - CDN delivery
↳ ffmpeg.wasm (Video Processing)
  - Video compilation
  - Format conversion
  - Effects processing
↳ Mapbox (Geolocation Services)
  - Location tracking
  - Map visualization
  - Geocoding

Core Components
↳ useSupabaseMedia() → Supabase Integration
  - Media CRUD operations
  - Real-time updates
↳ useCloudinaryUpload() → Cloudinary Integration
  - Upload management
  - Transformations
↳ MemoryReelCompiler → Video Processing
  - Timeline management
  - Effect application
↳ JournalEditor → Content Management
  - Rich text editing
  - Media embedding
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Cloudinary account
- Clerk account
- Mapbox account

### Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd summer-memories
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
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── common/    # Shared components
│   ├── forms/     # Form components
│   └── layout/    # Layout components
├── pages/         # Page components
│   ├── auth/      # Authentication pages
│   ├── dashboard/ # Dashboard pages
│   └── media/     # Media management pages
├── lib/           # Utility functions and hooks
│   ├── api/       # API integration
│   ├── hooks/     # Custom hooks
│   └── utils/     # Helper functions
├── App.jsx        # Main application component
└── main.jsx       # Application entry point
```

## 🧪 Features in Development

- AI-powered photo organization
- Advanced video editing capabilities
- Social sharing integration
- Mobile app companion
- Offline mode support
- Advanced analytics
- Custom themes and templates
- Collaborative albums

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Clerk for authentication
- Supabase for database services
- Cloudinary for media management
- Mapbox for location services
- The open-source community for various tools and libraries

## 📞 Contact

Project Link: [repository-url]

## 📚 Documentation

For detailed documentation, please visit our [documentation site](docs/).
