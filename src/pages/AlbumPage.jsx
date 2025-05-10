import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Folder, Plus, Image as ImageIcon } from "lucide-react";

import GalleryGrid from "../components/gallery/GalleryGrid";

// Mock data
const mockAlbums = [
  {
    id: "summer-2025",
    name: "Summer 2025",
    description: "Memories from Summer 2025",
    coverImage:
      "https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg?auto=compress&cs=tinysrgb&w=600",
    memoryCount: 15,
  },
  {
    id: "road-trip",
    name: "Road Trip",
    description: "Cross-country adventures",
    coverImage:
      "https://images.pexels.com/photos/3608967/pexels-photo-3608967.jpeg?auto=compress&cs=tinysrgb&w=600",
    memoryCount: 24,
  },
  {
    id: "beach-days",
    name: "Beach Days",
    description: "Sun, sand, and sea",
    coverImage:
      "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=600",
    memoryCount: 8,
  },
  {
    id: "bbq-parties",
    name: "BBQ Parties",
    description: "Food and friends",
    coverImage:
      "https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg?auto=compress&cs=tinysrgb&w=600",
    memoryCount: 12,
  },
];

// Same mock memories from the Dashboard
// const mockMemories = [
//   {
//     id: '1',
//     publicId: 'sample1',
//     url: 'https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg',
//     thumbnailUrl: 'https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg?auto=compress&cs=tinysrgb&w=600',
//     type: 'image' as const,
//     title: 'Beach Day',
//     createdAt: new Date('2025-06-15').toISOString(),
//     tags: ['beach', 'summer', 'friends'],
//     emotion: 'joyful',
//   },
//   {
//     id: '2',
//     publicId: 'sample2',
//     url: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg',
//     thumbnailUrl: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=600',
//     type: 'image' as const,
//     title: 'Mountain Hike',
//     createdAt: new Date('2025-07-05').toISOString(),
//     tags: ['hiking', 'mountains', 'nature'],
//     emotion: 'peaceful',
//   },
//   {
//     id: '3',
//     publicId: 'sample3',
//     url: 'https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg',
//     thumbnailUrl: 'https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg?auto=compress&cs=tinysrgb&w=600',
//     type: 'image' as const,
//     title: 'BBQ with Friends',
//     createdAt: new Date('2025-07-10').toISOString(),
//     tags: ['food', 'friends', 'bbq'],
//     emotion: 'happy',
//   },
// ];

const mockMemories = [];

export default function AlbumPage() {
  const { id } = useParams();
  const [albums] = useState(mockAlbums);
  const [memories] = useState(mockMemories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // If we have an album ID, show that album's memories
  // Otherwise, show the list of albums
  const showAlbumsList = !id;
  const selectedAlbum = id ? albums.find((album) => album.id === id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Folder size={24} className="mr-2 text-primary-600" />
          {selectedAlbum ? selectedAlbum.name : "Albums"}
        </h1>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus size={18} className="mr-1" />
          {selectedAlbum ? "Add Memories" : "Create Album"}
        </button>
      </div>

      {showAlbumsList ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album, index) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <a href={`/albums/${album.id}`} className="block group">
                <div className="card card-hover overflow-hidden">
                  <div className="aspect-w-3 aspect-h-2 bg-gray-200">
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <ImageIcon size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {album.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {album.memoryCount}{" "}
                      {album.memoryCount === 1 ? "memory" : "memories"}
                    </p>

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
          {selectedAlbum && memories.length > 0 ? (
            <GalleryGrid memories={memories} />
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No memories in this album
              </h3>
              <p className="text-gray-500 mb-6">
                Add your first memory to get started
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Add Memories
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Album/Add Memories Modal placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedAlbum ? "Add Memories to Album" : "Create New Album"}
              </h2>

              {/* Simplified placeholder form */}
              <div className="space-y-4">
                {!selectedAlbum && (
                  <>
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
                        rows={3}
                        className="input"
                        placeholder="Enter a description"
                      />
                    </div>
                  </>
                )}

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
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-primary"
                  >
                    {selectedAlbum ? "Add to Album" : "Create Album"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
