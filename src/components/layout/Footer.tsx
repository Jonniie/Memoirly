import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <Link to="/" className="text-primary-600 font-semibold">
              Summer Memories
            </Link>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600">
                Gallery
              </Link>
              <Link to="/albums" className="text-sm text-gray-600 hover:text-primary-600">
                Albums
              </Link>
              <Link to="/timeline" className="text-sm text-gray-600 hover:text-primary-600">
                Timeline
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>Made with</span>
            <Heart size={14} className="text-error-500 fill-error-500" />
            <span>&copy; {currentYear} Summer Memories</span>
          </div>
        </div>
      </div>
    </footer>
  );
}