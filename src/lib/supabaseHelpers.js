// src/lib/supabaseHelpers.js
import { supabase } from "./supabase";

///// ─── ALBUM HELPERS ────────────────────────────

export const createAlbum = async (userId, title, description = null) => {
  const { data, error } = await supabase
    .from("albums")
    .insert([
      {
        user_id: userId,
        title: title,
        description: description,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAlbums = async (userId) => {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const updateAlbum = async (albumId, newTitle) => {
  const { data, error } = await supabase
    .from("albums")
    .update({ title: newTitle })
    .eq("id", albumId);
  if (error) throw error;
  return data;
};

export const deleteAlbum = async (albumId) => {
  const { data, error } = await supabase
    .from("albums")
    .delete()
    .eq("id", albumId);
  if (error) throw error;
  return data;
};

///// ─── MEDIA HELPERS ─────────────────────────────

export const uploadMedia = async (mediaPayload) => {
  const { data, error } = await supabase.from("media").insert([mediaPayload]);
  if (error) throw error;
  return data;
};

export const getMediaByUser = async (userId) => {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const getMediaByAlbum = async (albumId) => {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("album_id", albumId);
  if (error) throw error;
  return data;
};

/**
 * Save media data to Supabase
 * @param {Object} mediaData - The media data to save
 * @param {string} mediaData.url - The URL of the media
 * @param {string} mediaData.type - The type of media (image/video)
 * @param {string} mediaData.caption - Optional caption for the media
 * @param {string} mediaData.emotion - Optional emotion associated with the media
 * @param {string} mediaData.album_id - Optional album ID
 * @param {string} mediaData.user_id - The user ID
 * @returns {Promise<Object>} The saved media data
 */
export const saveMediaToSupabase = async (mediaData) => {
  // First check if the media already exists
  const { data: existingMedia, error: checkError } = await supabase
    .from("media")
    .select("*")
    .eq("url", mediaData.url)
    .eq("user_id", mediaData.user_id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error checking for existing media:", checkError);
    throw checkError;
  }

  // If media already exists, return it with a duplicate flag
  if (existingMedia) {
    console.log("Media already exists, returning existing record");
    return { ...existingMedia, isDuplicate: true };
  }

  // If media doesn't exist, create new entry
  const { data, error } = await supabase
    .from("media")
    .insert([
      {
        url: mediaData.url,
        type: mediaData.type,
        caption: mediaData.caption || null,
        note: mediaData.note || null,
        emotion: mediaData.emotion || null,
        album_id: mediaData.album_id || null,
        user_id: mediaData.user_id,
        tags: mediaData.tags || [],
        favourite: false,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error saving media to Supabase:", error);
    throw error;
  }

  return { ...data, isDuplicate: false };
};

/**
 * Get all media for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of media items
 */
export const getUserMedia = async (userId) => {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user media:", error);
    throw error;
  }

  return data;
};

/**
 * Update media data
 * @param {string} mediaId - The ID of the media to update
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} The updated media data
 */
export const updateMedia = async (mediaId, updates) => {
  const { data, error } = await supabase
    .from("media")
    .update(updates)
    .eq("id", mediaId)
    .select()
    .single();

  if (error) {
    console.error("Error updating media:", error);
    throw error;
  }

  return data;
};

/**
 * Delete media
 * @param {string} mediaId - The ID of the media to delete
 * @returns {Promise<void>}
 */
export const deleteMedia = async (mediaId) => {
  const { error } = await supabase.from("media").delete().eq("id", mediaId);

  if (error) {
    console.error("Error deleting media:", error);
    throw error;
  }
};

/**
 * Add media to an album
 * @param {string} albumId - The ID of the album
 * @param {string} mediaId - The ID of the media to add
 * @returns {Promise<Object>} The created album-media relationship
 */
export const addMediaToAlbum = async (albumId, mediaId) => {
  const { data, error } = await supabase
    .from("album_media")
    .insert([
      {
        album_id: albumId,
        media_id: mediaId,
        added_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding media to album:", error);
    throw error;
  }

  return data;
};

/**
 * Remove media from an album
 * @param {string} albumId - The ID of the album
 * @param {string} mediaId - The ID of the media to remove
 * @returns {Promise<void>}
 */
export const removeMediaFromAlbum = async (albumId, mediaId) => {
  const { error } = await supabase
    .from("album_media")
    .delete()
    .eq("album_id", albumId)
    .eq("media_id", mediaId);

  if (error) {
    console.error("Error removing media from album:", error);
    throw error;
  }
};

/**
 * Get all media in an album
 * @param {string} albumId - The ID of the album
 * @returns {Promise<Array>} Array of media items in the album
 */
export const getAlbumMedia = async (albumId) => {
  const { data, error } = await supabase
    .from("album_media")
    .select(
      `
      media_id,
      media:media_id (
        id,
        url,
        type,
        caption,
        note,
        emotion,
        tags,
        favourite,
        created_at
      )
    `
    )
    .eq("album_id", albumId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching album media:", error);
    throw error;
  }

  return data.map((item) => item.media);
};

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFileToStorage = async (file, userId) => {
  try {
    // Create a unique file name using timestamp and random string
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `media/${fileName}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadFileToStorage:", error);
    throw error;
  }
};
