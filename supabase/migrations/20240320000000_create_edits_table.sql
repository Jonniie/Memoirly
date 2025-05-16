-- Create edits table
CREATE TABLE edits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reel', 'collage')),
    media_items JSONB NOT NULL,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX edits_user_id_idx ON edits(user_id);

-- Create RLS policies
ALTER TABLE edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own edits"
    ON edits FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own edits"
    ON edits FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own edits"
    ON edits FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own edits"
    ON edits FOR DELETE
    USING (auth.uid()::text = user_id); 