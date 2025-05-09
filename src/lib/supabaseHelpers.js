// src/lib/supabaseHelpers.js
import { supabase } from "./supabase";

///// ─── ALBUM HELPERS ────────────────────────────

export const createAlbum = async (userId, title) => {
  const { data, error } = await supabase.from("albums").insert([
    {
      user_id: userId,
      title: title,
      created_at: new Date().toISOString(),
    },
  ]);
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
