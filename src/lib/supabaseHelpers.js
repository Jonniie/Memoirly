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

export const updateMedia = async (mediaId, updates) => {
  const { data, error } = await supabase
    .from("media")
    .update(updates)
    .eq("id", mediaId);
  if (error) throw error;
  return data;
};

export const deleteMedia = async (mediaId) => {
  const { data, error } = await supabase
    .from("media")
    .delete()
    .eq("id", mediaId);
  if (error) throw error;
  return data;
};
