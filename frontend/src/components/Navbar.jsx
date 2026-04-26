import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, setUser, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🟢 Path check
  const isAdmin = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    localStorage.clear();
    if (!isAdmin) setUser(null);
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  return (
    <header className="h-[65px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 shadow-sm">
      
      {/* LEFT SIDE: Logo & Toggle */}
      <div className="flex items-center gap-4">
        
        {/* ✅ FIXED: Ab ye button Admin aur User dono ke liye dikhega */}
        <button onClick={toggleSidebar} className="text-gray-600 lg:hidden hover:text-blue-600 transition-colors">
          <Menu size={24} />
        </button>
        
        <span className="text-2xl font-black text-gray-800 tracking-tight">
          Fin<span className="text-blue-600">Saarthi</span>
          {isAdmin && (
            <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-black uppercase tracking-widest border border-red-200">
              Admin
            </span>
          )}
        </span>
      </div>

      {/* RIGHT SIDE: Profile & Logout */}
      <div className="flex items-center space-x-5">
        
        {/* User Info (Sirf User ke liye, Admin ke liye hide rahega) */}
        {user && !isAdmin && (
          <>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500 font-medium tracking-tighter uppercase">ID: {user.userId}</p>
            </div>
            
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shadow-sm">
              <User size={20} />
            </div>
            
            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
          </>
        )}
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-red-600 transition group"
        >
          <LogOut size={18} className="mr-1.5 group-hover:translate-x-0.5 transition-transform" /> 
          <span className="font-black uppercase tracking-tight text-[12px]">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;