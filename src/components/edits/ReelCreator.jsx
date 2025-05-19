import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  X,
  Loader2,
  Save,
  FolderOpen,
  Play,
  Pause,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/clerk-react";
import MediaSelector from "./MediaSelector";

export default function ReelCreator({ onComplete, onCancel, edit = null }) {
  const { user } = useUser();
  const [title, setTitle] = useState(edit?.title || "");
  const [selectedVideos, setSelectedVideos] = useState(edit?.videos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef({});

  const handleDelete = async () => {
    if (!edit) return;

    try {
      // Delete videos from storage
      for (const videoPath of edit.videos) {
        const { error: deleteError } = await supabase.storage
          .from("reels")
          .remove([videoPath]);

        if (deleteError) throw deleteError;
      }

      // Delete the edit record
      const { error: deleteEditError } = await supabase
        .from("edits")
        .delete()
        .eq("id", edit.id);

      if (deleteEditError) throw deleteEditError;

      onComplete({ deleted: true });
    } catch (err) {
      console.error("Error deleting reel:", err);
      setError("Failed to delete reel. Please try again.");
    }
  };

  const handleVideoSelect = useCallback(
    async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Limit to 5 videos for the reel
      if (selectedVideos.length + files.length > 5) {
        setError("You can only add up to 5 videos to a reel");
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const newVideos = await Promise.all(
          files.map(async (file) => {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("reels")
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const {
              data: { publicUrl },
            } = supabase.storage.from("reels").getPublicUrl(filePath);

            return {
              url: publicUrl,
              path: filePath,
              name: file.name,
            };
          })
        );

        setSelectedVideos((prev) => [...prev, ...newVideos]);
      } catch (err) {
        console.error("Error uploading videos:", err);
        setError("Failed to upload videos. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [user, selectedVideos]
  );

  const handleGallerySelect = useCallback((selectedMedia) => {
    const newVideos = selectedMedia.map((media) => ({
      url: media.url,
      path: media.public_id,
      name: media.caption || media.url.split("/").pop(),
    }));

    setSelectedVideos((prev) => {
      const combined = [...prev, ...newVideos];
      return combined.slice(0, 5); // Ensure we don't exceed 5 videos
    });
  }, []);

  const removeVideo = useCallback((index) => {
    setSelectedVideos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title for your reel");
      return;
    }

    if (selectedVideos.length === 0) {
      setError("Please add at least one video to your reel");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("edits")
        .insert({
          user_id: user.id,
          title: title.trim(),
          type: "reel",
          videos: selectedVideos.map((vid) => vid.path),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onComplete(data);
    } catch (err) {
      console.error("Error creating reel:", err);
      setError("Failed to create reel. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    Object.values(videoRefs.current).forEach((video) => {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {edit ? "Edit Reel" : "Create Video Reel"}
        </h2>
        <div className="flex items-center gap-2">
          {edit && (
            <button
              onClick={handleDelete}
              className="text-error-600 hover:text-error-700 flex items-center"
              disabled
            >
              <Trash2 className="w-5 h-5 mr-1" />
              Delete
            </button>
          )}
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reel Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter a title for your reel"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Videos (up to 5)
              </label>
              <div className="grid grid-cols-1 gap-4 mb-4">
                {selectedVideos.map((video, index) => (
                  <div key={index} className="relative aspect-video">
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={video.url}
                      className="w-full h-full object-cover rounded-lg"
                      loop
                      muted
                      disabled
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                      disabled
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {selectedVideos.length < 5 && (
                  <div className="flex flex-col gap-2">
                    <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-not-allowed bg-gray-100">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                        multiple
                        disabled
                      />
                      <div className="text-center">
                        <Video className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-2 block text-sm text-gray-600">
                          Upload Videos
                        </span>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMediaSelector(true)}
                      className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-not-allowed bg-gray-100"
                      disabled
                    >
                      <div className="text-center">
                        <FolderOpen className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-2 block text-sm text-gray-600">
                          Choose from Gallery
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && <div className="text-error-600 text-sm">{error}</div>}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                disabled
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Reel
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
            {selectedVideos.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={selectedVideos[0].url}
                    className="w-full h-full object-contain"
                    loop
                    muted
                    autoPlay={isPlaying}
                    disabled
                  />
                </div>
                <button
                  onClick={togglePlay}
                  className="w-full btn-primary flex items-center justify-center"
                  disabled
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Preview
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play Preview
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Add videos to preview your reel
              </div>
            )}
            <div className="text-center mt-6">
              <span className="text-primary-600 font-semibold text-lg">
                Coming soon
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMediaSelector && (
          <MediaSelector
            onSelect={handleGallerySelect}
            onClose={() => setShowMediaSelector(false)}
            maxSelection={5 - selectedVideos.length}
            type="video"
            disabled
          />
        )}
      </AnimatePresence>
    </div>
  );
}
