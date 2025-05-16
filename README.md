# Summer Memories

A modern web application for creating and sharing summer memories with photo and video support, built with React and TypeScript.

## 🚀 Features

- 📸 Photo and video upload and management
- 🎥 Video compilation using ffmpeg.wasm
- 📍 Location tagging with Mapbox integration
- 🔐 Secure authentication with Clerk
- 💾 Data persistence with Supabase
- ☁️ Media storage with Cloudinary
- 📱 Responsive design with Tailwind CSS
- 🎨 Beautiful UI with Framer Motion animations

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Clerk
- **Database**: Supabase
- **Media Storage**: Cloudinary
- **Video Processing**: ffmpeg.wasm
- **Maps**: Mapbox
- **UI Components**:
  - react-beautiful-dnd for drag and drop
  - react-masonry-css for grid layouts
  - react-dropzone for file uploads
  - lucide-react for icons

## 🏗️ Architecture

```
User
↓
React Frontend
↳ Clerk (Authentication)
↳ Supabase (Database)
↳ Cloudinary (Media Storage & CDN)
↳ ffmpeg.wasm (Video Processing)
↳ Mapbox (Geolocation Services)

Core Components
↳ useSupabaseMedia() → Supabase Integration
↳ useCloudinaryUpload() → Cloudinary Integration
↳ MemoryReelCompiler → Video Processing
↳ JournalEditor → Content Management
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
├── pages/         # Page components
├── lib/           # Utility functions and hooks
├── App.jsx        # Main application component
└── main.jsx       # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
