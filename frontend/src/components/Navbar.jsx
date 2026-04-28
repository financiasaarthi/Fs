import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { user, logout } = useAuth(); 

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  // 🟢 LOGIC: Check karo ki kya hum admin panel me hain
  const isAdminRoute = location.pathname.startsWith('/admin') || user?.role === 'admin';

  return (
    <header className="h-[65px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 shadow-sm">
      
      {/* LEFT SIDE: Logo & Toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Sidebar Toggle (Admin/User dono ko chahiye) */}
        <button onClick={toggleSidebar} className="text-gray-600 lg:hidden hover:text-blue-600 transition-colors">
          <Menu size={24} />
        </button>
        
        {/* Logo */}
        <Link to={isAdminRoute ? "/admin" : "/dashboard"} className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
          Financial <span className="text-blue-600">Saarthi</span>
        </Link>
      </div>

      {/* RIGHT SIDE: Profile & Logout */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        
        {/* 🟢 Sirf tab dikhega jab user ho AUR admin route NAHI ho */}
        {user && !isAdminRoute && (
          <div className="flex items-center gap-3">
            {/* User Info (PC me dikhega) */}
            <Link to="/" className="hidden sm:block text-right hover:opacity-80 transition-opacity">
              <p className="text-sm font-bold text-gray-900">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500 font-medium tracking-tighter uppercase">ID: {user.userId}</p>
            </Link>
            
            {/* Clickable Profile Icon */}
            <Link 
              to="/profile" 
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shadow-sm hover:bg-blue-100 transition-colors"
              title="Go to Profile"
            >
              <User size={18} className="sm:w-5 sm:h-5" />
            </Link>
            
            {/* Divider Line (Sirf PC me) */}
            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
          </div>
        )}
        
        {/* 🟢 FIX: Logout Button bhi sirf User ko dikhega, Admin ko nahi */}
        {!isAdminRoute && (
          <button 
            onClick={handleLogout}
            className="flex items-center text-sm font-bold text-gray-500 hover:text-red-600 transition group ml-2"
            title="Sign Out"
          >
            <LogOut size={20} className="sm:mr-1.5 group-hover:translate-x-0.5 transition-transform" /> 
            <span className="hidden sm:inline font-black uppercase tracking-tight text-[12px]">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;