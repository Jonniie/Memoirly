import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';

// Mock data for timeline
const mockTimelineData = [
  {
    month: 'June 2025',
    date: new Date('2025-06-01'),
    memories: [
      {
        id: '1',
        publicId: 'sample1',
        url: 'https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg',
        thumbnailUrl: 'https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'image' as const,
        title: 'Beach Day',
        createdAt: new Date('2025-06-15').toISOString(),
      },
    ],
  },
  {
    month: 'July 2025',
    date: new Date('2025-07-01'),
    memories: [
      {
        id: '2',
        publicId: 'sample2',
        url: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg',
        thumbnailUrl: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'image' as const,
        title: 'Mountain Hike',
        createdAt: new Date('2025-07-05').toISOString(),
      },
      {
        id: '3',
        publicId: 'sample3',
        url: 'https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg',
        thumbnailUrl: 'https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'image' as const,
        title: 'BBQ with Friends',
        createdAt: new Date('2025-07-10').toISOString(),
      },
      {
        id: '4',
        publicId: 'sample4',
        url: 'https://images.pexels.com/photos/315938/pexels-photo-315938.jpeg',
        thumbnailUrl: 'https://images.pexels.com/photos/315938/pexels-photo-315938.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'image' as const,
        title: 'Sunset at the Lake',
        createdAt: new Date('2025-07-15').toISOString(),
      },
    ],
  },
  {
    month: 'August 2025',
    date: new Date('2025-08-01'),
    memories: [
      {
        id: '5',
        publicId: 'sample5',
        url: 'https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg',
        thumbnailUrl: 'https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'image' as const,
        title: 'City Lights',
        createdAt: new Date('2025-08-20').toISOString(),
      },
      {
        id: '6',
        publicId: 'sample6',
        url: 'https://images.pexels.com/photos/69817/pexels-photo-69817.jpeg',
        thumbnailUrl: 'https://images.pexels.com/photos/69817/pexels-photo-69817.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'image' as const,
        title: 'Dog at the Park',
        createdAt: new Date('2025-08-25').toISOString(),
      },
    ],
  },
];

export default function TimelinePage() {
  const [timelineData] = useState(mockTimelineData);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar size={24} className="mr-2 text-primary-600" />
          Timeline
        </h1>
      </div>
      
      <div className="relative pl-8 sm:pl-12 pb-10">
        {/* Timeline vertical line */}
        <div className="absolute left-0 sm:left-6 top-0 bottom-0 w-1 bg-primary-200 rounded-full" />
        
        {timelineData.map((timelineItem, index) => (
          <motion.div
            key={timelineItem.month}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="mb-12 relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-3 sm:-left-8 top-0 w-6 h-6 bg-primary-500 rounded-full border-4 border-white shadow-sm" />
            
            {/* Month heading */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{timelineItem.month}</h2>
            </div>
            
            {/* Memories for this month */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {timelineItem.memories.map((memory) => (
                  <Link 
                    to={`/memory/${memory.id}`} 
                    key={memory.id}
                    className="block group"
                  >
                    <div className="card card-hover overflow-hidden">
                      <div className="relative aspect-w-3 aspect-h-2">
                        <img
                          src={memory.thumbnailUrl}
                          alt={memory.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {memory.title}
                          </h3>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-500" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(memory.createdAt), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}