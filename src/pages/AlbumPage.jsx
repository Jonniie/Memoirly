import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Plus,
  Image as ImageIcon,
  Trash2,
  Loader2,
  X,
  Check,
  Edit2,
  MoreVertical,
  Share2,
  Grid,
  Calendar,
  Upload,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import GalleryGrid from "../components/gallery/GalleryGrid";
import { useAuth } from "@clerk/clerk-react";
import {
  createAlbum,
  getAlbums,
  updateAlbum,
  deleteAlbum,
  getUserMedia,
  saveMediaToSupabase,
  addMediaToAlbum,
  removeMediaFromAlbum,
  getAlbumMedia,
} from "../lib/supabaseHelpers";
import { uploadToCloudinary } from "../lib/cloudinary";
import TimelineView from "../components/gallery/TimelineView";

const mockMemories = [];

export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [memories, setMemories] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { userId, isLoaded } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [userMedia, setUserMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAlbumMenu, setShowAlbumMenu] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [rotatingCovers, setRotatingCovers] = useState({});
  const rotationTimersRef = useRef({});
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (id) {
      fetchAlbumMemories(id);
    }
  }, [id]);

  useEffect(() => {
    if (isAddMediaModalOpen) {
      fetchUserMedia();
    }
  }, [isAddMediaModalOpen]);

  useEffect(() => {
    // Only set up rotation if we're on the albums list page
    if (id || albums.length === 0) return;

    // Clear any existing timers when component unmounts or albums change
    return () => {
      Object.values(rotationTimersRef.current).forEach((timer) =>
        clearInterval(timer)
      );
      rotationTimersRef.current = {};
    };
  }, [id, albums]);

  const fetchAlbums = async () => {
    try {
      setIsLoading(true);
      if (!userId && isLoaded) throw new Error("User not authenticated");

      const data = await getAlbums(userId);
      setAlbums(data || []);

      // For each album, fetch its media to enable cover rotation
      if (data && data.length > 0) {
        data.forEach(async (album) => {
          try {
            const albumMedia = await getAlbumMedia(album.id);
            // Only set up rotation for albums with multiple images
            const imageMedia = albumMedia.filter(
              (media) => media.type === "image"
            );
            if (imageMedia.length > 1) {
              setupCoverRotation(album.id, imageMedia);
            }
          } catch (err) {
            console.error(`Error fetching media for album ${album.id}:`, err);
          }
        });
      }
    } catch (err) {
      console.error("Error fetching albums:", err);
      setError("Failed to load albums. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbumMemories = async (albumId) => {
    try {
      setIsLoading(true);
      const media = await getAlbumMedia(albumId);

      const transformedMemories = media.map((item) => ({
        id: item.id,
        publicId: item.public_id,
        url: item.url,
        thumbnailUrl: item.url,
        type: item.type,
        title: item.caption || item.url.split("/").pop(),
        note: item.note || "",
        createdAt: item.created_at,
        tags: item.tags || [],
        emotion: item.emotion || "neutral",
        location: item.location || "",
        favourite: item.favourite || false,
        isPublic: item.is_public || false,
      }));

      setMemories(transformedMemories);
    } catch (err) {
      console.error("Error fetching album memories:", err);
      setError("Failed to load album memories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlbum = async () => {
    try {
      setIsLoading(true);
      if (!userId) throw new Error("User not authenticated");

      const data = await createAlbum(
        userId,
        formData.title,
        formData.description
      );
      setAlbums((prev) => [data, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({ title: "", description: "" });
      navigate(`/albums/${data.id}`);
    } catch (err) {
      console.error("Error creating album:", err);
      setError("Failed to create album. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAlbum = async () => {
    try {
      setIsLoading(true);
      if (!selectedAlbum?.id) throw new Error("No album selected");

      await updateAlbum(selectedAlbum.id, formData.title, formData.description);
      setAlbums((prev) =>
        prev.map((album) =>
          album.id === selectedAlbum.id
            ? {
                ...album,
                title: formData.title,
                description: formData.description,
              }
            : album
        )
      );
      setIsEditModalOpen(false);
      setFormData({ title: "", description: "" });
    } catch (err) {
      console.error("Error updating album:", err);
      setError("Failed to update album. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAlbum = async () => {
    try {
      setIsDeleting(true);
      if (!selectedAlbum?.id) throw new Error("No album selected");

      await deleteAlbum(selectedAlbum.id);
      setAlbums((prev) =>
        prev.filter((album) => album.id !== selectedAlbum.id)
      );
      setShowDeleteConfirm(false);
      navigate("/albums");
    } catch (err) {
      console.error("Error deleting album:", err);
      setError("Failed to delete album. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (files) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Upload to Cloudinary
        const result = await uploadToCloudinary({
          file,
          onProgress: (progress) => {
            const totalProgress =
              ((index + progress / 100) / files.length) * 100;
            setUploadProgress(totalProgress);
          },
          tags: ["memories"],
        });

        // Check if media already exists in Supabase
        const { data: existingMedia, error: checkError } = await supabase
          .from("media")
          .select("*")
          .eq("url", result.secureUrl)
          .eq("user_id", userId)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error
          console.error("Error checking for existing media:", checkError);
          throw checkError;
        }

        // If media already exists, return it
        if (existingMedia) {
          return existingMedia;
        }

        // If media doesn't exist, create new entry
        const mediaData = {
          url: result.secureUrl,
          type: result.resourceType === "image" ? "image" : "video",
          user_id: userId,
          caption: file.name,
          public_id: result.publicId,
        };

        const savedMedia = await saveMediaToSupabase(mediaData);
        return savedMedia;
      });

      const uploadedMedia = await Promise.all(uploadPromises);

      // Filter out any null values and update the UI
      const validMedia = uploadedMedia.filter((media) => media !== null);
      setUserMedia((prev) => [...validMedia, ...prev]);
      setSelectedMedia(validMedia);
    } catch (err) {
      console.error("Error uploading files:", err);
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddSelectedMediaToAlbum = async () => {
    try {
      if (!id || !userId) throw new Error("Album ID or user not found");

      const addPromises = selectedMedia.map((media) =>
        addMediaToAlbum(id, media.id)
      );

      await Promise.all(addPromises);
      await fetchAlbumMemories(id);
      setIsAddMediaModalOpen(false);
      setSelectedMedia([]);
    } catch (err) {
      console.error("Error adding media to album:", err);
      setError("Failed to add media to album. Please try again.");
    }
  };

  const handleRemoveMediaFromAlbum = async (mediaId) => {
    try {
      if (!id || !userId) throw new Error("Album ID or user not found");

      await removeMediaFromAlbum(id, mediaId);
      await fetchAlbumMemories(id);
    } catch (err) {
      console.error("Error removing media from album:", err);
      setError("Failed to remove media from album. Please try again.");
    }
  };

  const fetchUserMedia = async () => {
    try {
      if (!userId) return;
      const media = await getUserMedia(userId);

      // Get current album media if we're in an album view
      let albumMedia = [];
      if (id) {
        albumMedia = await getAlbumMedia(id);
      }

      // Filter out media that's already in the album and remove duplicates
      const uniqueMedia = media.reduce((acc, current) => {
        // Skip if media is already in the album
        const isInAlbum = albumMedia.some(
          (albumMedia) => albumMedia.url === current.url
        );
        if (isInAlbum) return acc;

        // Skip if we already have this URL in our accumulator
        const isDuplicate = acc.some((item) => item.url === current.url);
        if (isDuplicate) return acc;

        acc.push(current);
        return acc;
      }, []);

      setUserMedia(uniqueMedia);
    } catch (err) {
      console.error("Error fetching user media:", err);
      setError("Failed to load your media. Please try again.");
    }
  };

  const currentAlbum = id ? albums.find((album) => album.id === id) : null;

  // Function to set up cover rotation for an album
  const setupCoverRotation = (albumId, mediaItems) => {
    if (mediaItems.length <= 1) return;

    // Initialize with the first image or current cover
    const album = albums.find((a) => a.id === albumId);
    const initialCover = album?.cover_image || mediaItems[0].url;

    // Set initial state
    setRotatingCovers((prev) => ({
      ...prev,
      [albumId]: {
        currentUrl: initialCover,
        mediaIndex: 0,
        mediaItems: mediaItems.map((item) => ({
          id: item.id,
          url: item.url,
        })),
      },
    }));

    // Set up interval to rotate covers every 5 seconds
    if (rotationTimersRef.current[albumId]) {
      clearInterval(rotationTimersRef.current[albumId]);
    }

    rotationTimersRef.current[albumId] = setInterval(() => {
      setRotatingCovers((prev) => {
        const albumData = prev[albumId];
        if (!albumData) return prev;

        const nextIndex =
          (albumData.mediaIndex + 1) % albumData.mediaItems.length;
        return {
          ...prev,
          [albumId]: {
            ...albumData,
            currentUrl: albumData.mediaItems[nextIndex].url,
            mediaIndex: nextIndex,
          },
        };
      });
    }, 5000);
  };

  // Add a function to handle pausing rotation on hover
  const handleAlbumMouseEnter = (albumId) => {
    if (rotationTimersRef.current[albumId]) {
      clearInterval(rotationTimersRef.current[albumId]);
    }
  };

  // Add a function to handle resuming rotation on mouse out
  const handleAlbumMouseLeave = (albumId) => {
    const albumData = rotatingCovers[albumId];
    if (!albumData || albumData.mediaItems.length <= 1) return;

    rotationTimersRef.current[albumId] = setInterval(() => {
      setRotatingCovers((prev) => {
        const albumData = prev[albumId];
        if (!albumData) return prev;

        const nextIndex =
          (albumData.mediaIndex + 1) % albumData.mediaItems.length;
        return {
          ...prev,
          [albumId]: {
            ...albumData,
            currentUrl: albumData.mediaItems[nextIndex].url,
            mediaIndex: nextIndex,
          },
        };
      });
    }, 5000);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Folder size={24} className="mr-2 text-primary-600" />
          {currentAlbum ? currentAlbum.title : "Albums"}
        </h1>

        <div className="flex items-center gap-2">
          {currentAlbum && (
            <>
              <div className="flex items-center gap-2 mr-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-primary-100 text-primary-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 rounded-md ${
                    viewMode === "timeline"
                      ? "bg-primary-100 text-primary-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Calendar size={20} />
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowAlbumMenu(!showAlbumMenu)}
                  className="btn-outline flex items-center"
                >
                  <MoreVertical size={18} className="mr-1" />
                  Options
                </button>

                {showAlbumMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setSelectedAlbum(currentAlbum);
                        setFormData({
                          title: currentAlbum.title,
                          description: currentAlbum.description || "",
                        });
                        setIsEditModalOpen(true);
                        setShowAlbumMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit Album
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlbum(currentAlbum);
                        setShowDeleteConfirm(true);
                        setShowAlbumMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Album
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <button
            onClick={() =>
              currentAlbum
                ? setIsAddMediaModalOpen(true)
                : setIsCreateModalOpen(true)
            }
            className="btn-primary flex items-center"
          >
            <Plus size={18} className="mr-1" />
            {currentAlbum ? "Add Media" : "Create Album"}
          </button>
        </div>
      </div>

      {!id ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onMouseEnter={() => handleAlbumMouseEnter(album.id)}
              onMouseLeave={() => handleAlbumMouseLeave(album.id)}
            >
              <a href={`/albums/${album.id}`} className="block group">
                <div className="card card-hover overflow-hidden">
                  <div className="aspect-w-3 aspect-h-2 bg-gray-200 relative">
                    {rotatingCovers[album.id]?.currentUrl ||
                    album.cover_image ? (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={
                              rotatingCovers[album.id]?.currentUrl ||
                              album.cover_image
                            }
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full "
                          >
                            <img
                              src={
                                rotatingCovers[album.id]?.currentUrl ||
                                album.cover_image
                              }
                              alt={album.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          </motion.div>
                        </AnimatePresence>
                        {/* Rotation indicators - only show if we have rotating covers */}
                        {rotatingCovers[album.id]?.mediaItems &&
                          rotatingCovers[album.id].mediaItems.length > 1 && (
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                              {rotatingCovers[album.id].mediaItems.map(
                                (item, idx) => (
                                  <div
                                    key={item.id}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      idx ===
                                      rotatingCovers[album.id].mediaIndex
                                        ? "bg-white"
                                        : "bg-white/40"
                                    } transition-all duration-300`}
                                  />
                                )
                              )}
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="flex h-32 md:h-64 items-center justify-center bg-gray-100">
                        <ImageIcon size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {album.title}
                    </h3>

                    {album.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        <div>
          {memories.length > 0 ? (
            viewMode === "grid" ? (
              <GalleryGrid
                memories={memories}
                onRemoveMedia={handleRemoveMediaFromAlbum}
                isAlbumView={true}
              />
            ) : (
              <TimelineView
                memories={memories}
                onMemoryClick={(id) => navigate(`/memory/${id}`)}
              />
            )
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No media in this album
              </h3>
              <p className="text-gray-500 mb-6">
                Add your first media to get started
              </p>
              <button
                onClick={() => setIsAddMediaModalOpen(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Add Media
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Album Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create New Album
                  </h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Album Name
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter album name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="input"
                      placeholder="Enter a description"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="btn-outline mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateAlbum}
                      className="btn-primary"
                      disabled={!formData.title.trim()}
                    >
                      Create Album
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Album Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit Album
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="edit-title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Album Name
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter album name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="input"
                      placeholder="Enter a description"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="btn-outline mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateAlbum}
                      className="btn-primary"
                      disabled={!formData.title.trim()}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Media Modal */}
      <AnimatePresence>
        {isAddMediaModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add Media to Album
                  </h2>
                  <button
                    onClick={() => {
                      setIsAddMediaModalOpen(false);
                      setSelectedMedia([]);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {/* Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Media
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add("border-primary-500");
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove("border-primary-500");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove("border-primary-500");
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        handleFileUpload(files);
                      }
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="media-upload"
                    />
                    <div className="space-y-4">
                      <div className="flex flex-col items-center">
                        <Upload size={48} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Drag and drop your files here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports images and videos
                        </p>
                      </div>
                      <label
                        htmlFor="media-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus size={16} className="mr-2" />
                            Choose Files
                          </>
                        )}
                      </label>
                    </div>
                    {isUploading && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Uploading... {Math.round(uploadProgress)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {userMedia.map((media) => (
                    <div
                      key={media.id}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
                        selectedMedia.some((m) => m.id === media.id)
                          ? "ring-2 ring-primary-600"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedMedia((prev) =>
                          prev.some((m) => m.id === media.id)
                            ? prev.filter((m) => m.id !== media.id)
                            : [...prev, media]
                        );
                      }}
                    >
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={media.caption || "Media"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {selectedMedia.some((m) => m.id === media.id) && (
                        <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1">
                            <Check size={20} className="text-primary-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {selectedMedia.length} items selected
                  </span>
                  <div className="space-x-3">
                    <button
                      onClick={() => {
                        setIsAddMediaModalOpen(false);
                        setSelectedMedia([]);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSelectedMediaToAlbum}
                      className="btn-primary"
                      disabled={selectedMedia.length === 0}
                    >
                      Add to Album
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Album?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this album? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-outline"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAlbum}
                  className="btn-error flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
