import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import {
  Plus,
  FolderPlus,
  Image as ImageIcon,
  Trash2,
  Edit2,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Albums() {
  const { user } = useUser();
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = (useState < string) | (null > null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = (useState < Album) | (null > null);
  const [newAlbum, setNewAlbum] = useState({
    name: "",
    description: "",
  });

  // Fetch albums
  useEffect(() => {
    const fetchAlbums = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        const response = await fetch(`/api/albums?userId=${user.id}`);
        const data = await response.json();
        setAlbums(data);
      } catch (err) {
        console.error("Error fetching albums:", err);
        setError("Failed to load albums. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, [user]);

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAlbum,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create album");

      const createdAlbum = await response.json();
      setAlbums((prev) => [createdAlbum, ...prev]);
      setIsCreateModalOpen(false);
      setNewAlbum({ name: "", description: "" });
    } catch (err) {
      console.error("Error creating album:", err);
      setError("Failed to create album. Please try again.");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/albums/${selectedAlbum.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete album");

      setAlbums((prev) =>
        prev.filter((album) => album.id !== selectedAlbum.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedAlbum(null);
    } catch (err) {
      console.error("Error deleting album:", err);
      setError("Failed to delete album. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Albums</h1>
          <p className="text-gray-600">Organize your memories into albums</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <FolderPlus size={18} className="mr-1" />
          Create Album
        </button>
      </div>

      {/* Albums Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading your albums...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : albums.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {albums.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{album.name}</h3>
                {album.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {album.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {album.memoryCount} memories
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAlbum(album);
                        // TODO: Implement edit functionality
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlbum(album);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1 text-gray-500 hover:text-error-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-white rounded-lg border border-gray-200"
        >
          <FolderPlus size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No albums yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first album to organize your memories
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary inline-flex items-center"
          >
            <FolderPlus size={18} className="mr-1" />
            Create Album
          </button>
        </motion.div>
      )}

      {/* Create Album Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Album
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateAlbum}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Album Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newAlbum.name}
                      onChange={(e) =>
                        setNewAlbum((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      value={newAlbum.description}
                      onChange={(e) =>
                        setNewAlbum((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Create Album
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAlbum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Delete Album
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedAlbum.name}"? This
                action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedAlbum(null);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button onClick={handleDeleteAlbum} className="btn-error">
                  Delete Album
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
