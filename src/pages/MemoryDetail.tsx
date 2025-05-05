import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Tag, 
  MapPin, 
  Edit, 
  Trash2, 
  Heart, 
  Download, 
  Share2, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data for now
const mockMemory = {
  id: '1',
  publicId: 'sample1',
  url: 'https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg',
  thumbnailUrl: 'https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg?auto=compress&cs=tinysrgb&w=1200',
  type: 'image' as const,
  title: 'Beach Day',
  description: 'Spent the afternoon at the beach with friends. The weather was perfect and the waves were just right for swimming. We had a picnic and played volleyball until sunset.',
  createdAt: new Date('2025-06-15').toISOString(),
  tags: ['beach', 'summer', 'friends'],
  emotion: 'joyful',
  location: 'Malibu Beach, CA',
};

export default function MemoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memory] = useState(mockMemory);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMemory, setEditedMemory] = useState(memory);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleEdit = () => {
    setIsEditMode(true);
  };
  
  const handleSave = () => {
    // In a real app, we would save to a database here
    setIsEditMode(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedMemory(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setEditedMemory(prev => ({ ...prev, tags: tagsArray }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Go back button */}
      <button
        onClick={handleGoBack}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        <span>Back to Gallery</span>
      </button>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="lg:flex">
          {/* Media Section */}
          <div className="lg:w-7/12 bg-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {memory.type === 'image' ? (
                <img 
                  src={memory.url} 
                  alt={memory.title} 
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '80vh' }}
                />
              ) : (
                <video
                  src={memory.url}
                  controls
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '80vh' }}
                />
              )}
            </motion.div>
          </div>
          
          {/* Details Section */}
          <div className="lg:w-5/12 p-6">
            {isEditMode ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editedMemory.title}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editedMemory.description}
                    onChange={handleChange}
                    rows={4}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="emotion" className="block text-sm font-medium text-gray-700 mb-1">
                    Emotion
                  </label>
                  <input
                    type="text"
                    id="emotion"
                    name="emotion"
                    value={editedMemory.emotion}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={editedMemory.location}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={editedMemory.tags.join(', ')}
                    onChange={handleTagsChange}
                    className="input"
                  />
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="btn-outline mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="btn-primary flex items-center"
                  >
                    <Save size={16} className="mr-1" />
                    Save Changes
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {memory.title}
                  </h1>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEdit}
                      className="text-gray-500 hover:text-primary-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="text-gray-500 hover:text-error-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm space-x-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>{format(new Date(memory.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                  
                  {memory.location && (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      <span>{memory.location}</span>
                    </div>
                  )}
                </div>
                
                {memory.emotion && (
                  <div className="inline-block">
                    <span className="badge-accent">{memory.emotion}</span>
                  </div>
                )}
                
                {memory.description && (
                  <p className="text-gray-700 mt-4">
                    {memory.description}
                  </p>
                )}
                
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2 pt-2">
                    <Tag size={16} className="text-gray-500" />
                    {memory.tags.map((tag) => (
                      <span key={tag} className="badge-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
                  <button className="btn-ghost flex items-center">
                    <Heart size={18} className="mr-1" />
                    Favorite
                  </button>
                  
                  <div className="flex space-x-2">
                    <button className="btn-outline flex items-center">
                      <Download size={18} className="mr-1" />
                      Download
                    </button>
                    <button className="btn-outline flex items-center">
                      <Share2 size={18} className="mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}