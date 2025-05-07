🧭 Level 1: System Context Diagram
Purpose: Illustrates how Memoirly interacts with users and external systems.

Elements:

Users:

Authenticated User: Individuals who upload, organize, and view their media.

Guest User: Visitors exploring public content (if applicable).

External Systems:

Clerk: Manages user authentication and identity.

Cloudinary: Handles media storage, optimization, and delivery.

Supabase: Provides database services for storing metadata and journaling information.

Memoirly System:

Central platform facilitating media uploads, organization, journaling, and memory reel creation.

Interactions:

Users interact with Memoirly through a web interface.

Memoirly communicates with Clerk for authentication processes.

Media files are uploaded to and served from Cloudinary.

Metadata and user-generated content are stored and retrieved from Supabase.

🧱 Level 2: Container Diagram
Purpose: Breaks down Memoirly into its main technical components.

Containers:

Web Application (React + TailwindCSS):

Provides the user interface for all functionalities.

Communicates with backend services via APIs.

Authentication Service (Clerk):

Handles user sign-up, login, and session management.

Integrates seamlessly with the web application.

Media Storage (Cloudinary):

Stores and optimizes user-uploaded photos and videos.

Delivers media content efficiently to users.

Database Service (Supabase):

Stores structured data such as albums, tags, and journal entries.

Offers real-time capabilities and RESTful APIs.

Video Processing Module (ffmpeg.wasm):

Enables in-browser video compilation for memory reels.

Processes selected media into cohesive video narratives.

Interactions:

The web application interacts with Clerk for authentication.

Upon media upload, files are sent to Cloudinary, and corresponding metadata is stored in Supabase.

Users can create memory reels using the ffmpeg.wasm module within the web application.

🧩 Level 3: Component Diagram (Web Application)
Purpose: Details the internal structure of the web application.

Components:

Authentication Components:

SignUpForm, LoginForm, UserProfile: Interfaces for user authentication and profile management.

Media Components:

MediaUploader: Handles file selection and upload processes.

GalleryView: Displays user media in organized layouts.

AlbumManager: Allows creation and management of media albums.

Journaling Components:

JournalEditor: Enables users to add and edit journal entries for media.

EmotionTagger: Allows tagging of media with emotional indicators.

Memory Reel Components:

ReelCreator: Interface for selecting media and initiating reel creation.

VideoCompiler: Integrates with ffmpeg.wasm to process and compile videos.

Utility Components:

MapView: Displays geotagged media on an interactive map.

TimelineView: Presents media in a chronological timeline format.

Interactions:

Components communicate via shared state management (e.g., Redux or Context API).

API calls are made to Supabase for data retrieval and storage.

Media files are uploaded to Cloudinary, and processed videos are handled within the browser.

🧪 Level 4: Code Diagram
Purpose: Represents the code structure within components.

Elements:

Modules and Functions:

useAuth: Custom hook for authentication state.

useMedia: Hook for managing media-related operations.

apiClient: Abstraction over API calls to Supabase and Cloudinary.

State Management:

Centralized store managing application state (e.g., albums, user info).

Routing:

Defines routes for different views like gallery, albums, and memory reels.

Interactions:

Hooks and modules are imported into components as needed.

State changes trigger re-renders and API interactions.
