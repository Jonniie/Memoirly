import { Cloudinary } from "@cloudinary/url-gen";

// Create a Cloudinary instance with configuration
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
  },
  url: {
    secure: true, // Force HTTPS
  },
});

/**
 * Upload a file to Cloudinary
 */
export const uploadToCloudinary = async ({
  file,
  onProgress,
  folder = "summer-memories",
  tags = [],
}) => {
  // Create a FormData instance
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ""
  );

  if (folder) {
    formData.append("folder", folder);
  }

  if (tags.length > 0) {
    formData.append("tags", tags.join(","));
  }

  // Set up the upload URL
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  // Use XHR for upload progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          publicId: response.public_id,
          url: response.url,
          secureUrl: response.secure_url,
          format: response.format,
          width: response.width,
          height: response.height,
          resourceType: response.resource_type,
        });
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed"));
    };

    xhr.send(formData);
  });
};

/**
 * Generate a Cloudinary URL with transformations
 */
export const getOptimizedUrl = (publicId, options) => {
  if (!publicId) return "";

  let image = cld.image(publicId);

  if (options?.width || options?.height) {
    const transformation = options.crop || "fill";

    if (options.width && options.height) {
      image = image.resize(
        `${transformation}:${options.width}:${options.height}`
      );
    } else if (options.width) {
      image = image.resize(`${transformation}:${options.width}`);
    } else if (options.height) {
      image = image.resize(`${transformation}::${options.height}`);
    }
  }

  return image.toURL();
};
