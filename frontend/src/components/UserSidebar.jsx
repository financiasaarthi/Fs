import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, PlaySquare, Users, Wallet, ArrowDownToLine, 
  Network, TrendingUp, Award, Layers, Send, Package, 
  RefreshCw, History, LayoutList, ShieldCheck, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const UserSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth();
  
  // 🟢 FIX 1: Sidebar ko track karne ke liye ref banaya
  const sidebarRef = useRef(null);

  // 🟢 FIX 2: "Click Outside" logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Agar sidebar khula hai, aur click sidebar ke ANDAR nahi hua hai, toh band kar do
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar();
      }
    };

    // Screen par kahin bhi click hone par check karega
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);

  // 🚀 Menu Items Array
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Task Center', path: '/tasks', icon: <PlaySquare size={20} /> },
    { name: 'Direct Team', path: '/direct-team', icon: <Users size={20} /> },
    { name: 'All Team', path: '/all-team', icon: <Layers size={20} /> },
    { name: 'Network Tree', path: '/network-tree', icon: <Network size={20} /> }, 
    { name: 'Rank & Business', path: '/network-status', icon: <Award size={20} /> },
    { name: 'Binary History', path: '/binary-history', icon: <TrendingUp size={20} /> },
    { name: 'Package History', path: '/package-history', icon: <Package size={20} /> },    
    { name: 'Transfer Funds', path: '/transfer', icon: <Send size={20} /> },
    { name: 'Convert Funds', path: '/convert-history', icon: <RefreshCw size={20} /> },
    { name: 'Deposit History', path: '/deposit-history', icon: <ArrowDownToLine size={20} /> },
    { name: 'Withdraw History', path: '/withdraw-history', icon: <Wallet size={20} /> },
    { name: 'Wallet History', path: '/wallet-history', icon: <History size={20} /> },
    { name: 'All Transactions', path: '/all-transactions', icon: <LayoutList size={20} /> },
  ];

  return (
    <>
      {/* 🟢 3. FULL SCREEN OVERLAY (Mobile) */}
      {/* Ye z-[990] par hai, jisse piche ka sab kuch block aur blur ho jayega. Ispe click karte hi sidebar band hoga. */}
      {isOpen && (
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-slate-900/60 backdrop-blur-sm z-[990] lg:hidden transition-all duration-300 cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      {/* 🟢 4. SIDEBAR CONTAINER (Ref attached here) */}
      {/* z-[999] lagaya hai taaki ye hamesha Navbar aur Overlay ke upar rahe */}
      <aside 
        ref={sidebarRef}
        className={`bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out fixed lg:relative z-[999] lg:z-10 top-0 lg:top-0 h-[100dvh] lg:h-[calc(100vh-65px)] 
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-64'} shadow-2xl lg:shadow-none overflow-hidden`}
      >
        
        {/* Mobile Close Button (Header) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          <span className="font-black text-indigo-600 tracking-widest uppercase">Menu</span>
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-red-500 bg-slate-50 p-1.5 rounded-lg active:scale-90 transition-transform">
             <LogOut size={18} className="rotate-180" />
          </button>
        </div>

        {/* 🟢 Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto py-5 pb-10 custom-scroll">
          <nav className="space-y-1.5 px-4 whitespace-nowrap">
            
            <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-1">Main Menu</p>
            
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isNewSection = index === 2 || index === 5 || index === 8 || index === 10;

              return (
                <React.Fragment key={item.name}>
                  {isNewSection && <div className="h-px bg-slate-100 my-3 mx-2"></div>}
                  
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Click karte hi sidebar band ho jayega (Mobile par)
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm tracking-wide group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <span className={`mr-3 shrink-0 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-indigo-500'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
        
        {/* 🟢 BOTTOM FOOTER (Profile & LOGOUT) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto shrink-0 space-y-3">
          
          <Link 
            to="/profile" 
            onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
            className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
              location.pathname === '/profile' 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold text-sm">
              <ShieldCheck size={18} className={location.pathname === '/profile' ? 'text-indigo-600' : 'text-slate-400'} />
              Profile & Security
            </div>
          </Link>

          {/* 🔴 SECURE LOGOUT BUTTON */}
          <button 
            onClick={() => {
                logout(); // Logout API call
                if (window.innerWidth < 1024) toggleSidebar();
            }}
            className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all font-black text-sm shadow-sm group active:scale-95 cursor-pointer"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            SECURE LOGOUT
          </button>

          {/* System Status */}
          <div className="flex items-center justify-between px-2 pt-1">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Server Status</p>
             <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
             </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default UserSidebar;