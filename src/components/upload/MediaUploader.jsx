import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  Camera,
  UploadCloud,
  X,
  FileImage,
  FileVideo,
  Tag,
  AlignLeft,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { uploadMedia, saveMediaToSupabase } from "../../lib/supabaseHelpers";
import { cn, formatFileSize, isImageFile, isVideoFile } from "../../lib/utils";
import { uploadToCloudinary } from "../../lib/cloudinary";

export default function MediaUploader({
  onUploadComplete,
  maxFiles = 10,
  className,
  albumId = null,
}) {
  const { user } = useUser();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [note, setNote] = useState("");

  const uploads = [];

  const onDrop = useCallback(
    (acceptedFiles) => {
      setError(null);

      // Validate file types
      const validFiles = acceptedFiles.filter(
        (file) => isImageFile(file) || isVideoFile(file)
      );

      if (validFiles.length !== acceptedFiles.length) {
        setError("Only image and video files are accepted.");
      }

      // Check for duplicates
      const newFiles = validFiles.filter((newFile) => {
        return !files.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        );
      });

      if (newFiles.length !== validFiles.length) {
        setError("Some files were skipped because they are duplicates.");
      }

      // Check if adding the new files would exceed the maximum
      if (files.length + newFiles.length > maxFiles) {
        setError(`You can upload a maximum of ${maxFiles} files.`);
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
    maxSize: 50 * 1024 * 1024, // 50MB max file size
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;

    // Split by comma and process each tag
    const newTags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && !tags.includes(tag));

    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const uploadedMedia = [];
    const duplicateFiles = [];

    try {
      // Upload files sequentially to show progress for each
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = `file-${i}`;

        // Update progress for this file
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        // Upload to Cloudinary
        const result = await uploadToCloudinary({
          file,
          onProgress: (progress) => {
            setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
          },
          tags: ["memories", ...tags],
        });

        // Save to Supabase
        const mediaData = await saveMediaToSupabase({
          url: result.secureUrl,
          type: result.resourceType === "image" ? "image" : "video",
          caption: file.name,
          note: note.trim(),
          user_id: user.id,
          album_id: albumId,
          tags: tags,
        });

        if (mediaData.isDuplicate) {
          duplicateFiles.push(file.name);
          continue; // Skip adding to uploadedMedia array
        }

        // Add to uploaded media array
        uploadedMedia.push({
          id: mediaData.id,
          publicId: result.publicId,
          url: result.secureUrl,
          thumbnailUrl: result.thumbnailUrl,
          type: result.resourceType === "image" ? "image" : "video",
          width: result.width,
          height: result.height,
          originalFilename: file.name,
          caption: mediaData.caption,
          note: mediaData.note,
          emotion: mediaData.emotion,
          created_at: mediaData.created_at,
          favourite: mediaData.favourite,
          tags: mediaData.tags,
        });
      }

      // Show warning if there were duplicate files
      if (duplicateFiles.length > 0) {
        setError(
          `Some files were skipped because they already exist: ${duplicateFiles.join(
            ", "
          )}`
        );
      }

      // Only notify parent if we have new media
      if (uploadedMedia.length > 0) {
        onUploadComplete(uploadedMedia);
      }

      // Reset state
      setFiles([]);
      setUploadProgress({});
      setTags([]);
      setNote("");
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-primary-400 bg-white",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} disabled={isUploading} />

        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-3 bg-primary-100 rounded-full mb-3"
          >
            {isDragActive ? (
              <Camera size={32} className="text-primary-600" />
            ) : (
              <UploadCloud size={32} className="text-primary-600" />
            )}
          </motion.div>

          <p className="text-lg font-medium text-gray-700 mb-1">
            {isDragActive ? "Drop files here" : "Drag and drop your media here"}
          </p>

          <p className="text-sm text-gray-500 mb-3">
            or{" "}
            <span className="text-primary-600 font-medium">browse files</span>
          </p>

          <p className="text-xs text-gray-400">
            Supports images and videos up to 50MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-50 text-error-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Preview Area */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">
            Selected Files ({files.length})
          </h3>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Note
            </label>
            <div className="flex gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for your memories..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[100px] resize-y"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags (separated by commas)..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                disabled={isUploading}
              />
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={isUploading}
              >
                <Tag size={16} />
                Add
              </button>
            </form>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-900"
                      disabled={isUploading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, index) => {
              const fileId = `file-${index}`;
              const progress = uploadProgress[fileId] || 0;
              const isImage = isImageFile(file);
              const isVideo = isVideoFile(file);

              return (
                <li
                  key={index}
                  className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-3 flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {isImage ? (
                        <FileImage size={32} className="text-secondary-500" />
                      ) : isVideo ? (
                        <FileVideo size={32} className="text-accent-500" />
                      ) : (
                        <FileImage size={32} className="text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>

                      {isUploading && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary-500 h-full transition-all duration-300 ease-in-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {progress}%
                          </p>
                        </div>
                      )}
                    </div>

                    {!isUploading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-gray-400 hover:text-error-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className={cn(
                "btn-primary",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
