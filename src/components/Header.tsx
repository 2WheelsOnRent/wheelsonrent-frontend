import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status from both Redux and localStorage
  useEffect(() => {
    const loginStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(isAuthenticated || loginStatus === 'true');
  }, [isAuthenticated]);

  // Listen for storage changes (when user logs out in another tab or from Profile page)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn') {
        setIsLoggedIn(e.newValue === 'true');
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      setIsLoggedIn(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-logout', handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  const handleVehiclesClick = (e: React.MouseEvent) => {
    // Only scroll if we're on the homepage
    if (location.pathname === '/') {
      e.preventDefault();
      const featuredSection = document.getElementById('featured-vehicles');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    // If not on homepage, let the Link navigate normally to /vehicles
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl tracking-tight text-black">
                2wheels<span className="text-blue-500">onrent</span>
              </h1>
            </Link>
          </div>

          {/* Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link to="/" className="text-black hover:text-blue-500 transition-colors">
              Home
            </Link>
            <Link 
              to="/vehicles" 
              onClick={handleVehiclesClick}
              className="text-black hover:text-blue-500 transition-colors"
            >
              Vehicles
            </Link>
            <Link to="/contact" className="text-black hover:text-blue-500 transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Login/Profile Button */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {isLoggedIn ? (
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}