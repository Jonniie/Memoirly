import { motion } from 'framer-motion';
import { Camera, Sun } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute -top-6 -right-6"
          >
            <Sun size={28} className="text-accent-500" />
          </motion.div>
          <Camera size={64} className="text-primary-600" />
        </div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-semibold text-primary-800 mb-4"
        >
          Summer Memories
        </motion.h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 150 }}
          transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 rounded-full"
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-4 text-sm text-gray-600"
        >
          Loading your memories...
        </motion.p>
      </motion.div>
    </div>
  );
}