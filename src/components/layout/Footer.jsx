import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 sm:text-center text-left flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex gap-2 flex-col md:flex-row md:items-center md:space-x-4">
            <Link to="/" className="text-primary-600 font-semibold">
              Memoirly
            </Link>
          </div>

          <div className="flex items-center space-x-1 text-sm ">
            <span>&copy; {currentYear} Memoirly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
