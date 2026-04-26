import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PlaySquare, 
  Users, 
  Wallet, 
  ArrowDownToLine, 
  Network, 
  TrendingUp, 
  Award, 
  Layers,
  Send,
  Package,
  RefreshCw,
  History,
  LayoutList,
  ShieldCheck // Profile icon ke liye add kiya
} from 'lucide-react';

const UserSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  // 🚀 Organized Menu Items
  const menuItems = [
    // Main
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Task Center', path: '/tasks', icon: <PlaySquare size={20} /> },
    
    // Team & Network
    { name: 'Direct Team', path: '/direct-team', icon: <Users size={20} /> },
    { name: 'All Team', path: '/all-team', icon: <Layers size={20} /> },
    { name: 'Network Tree', path: '/network-tree', icon: <Network size={20} /> }, 
    
    // Business & Rank
    { name: 'Rank & Business', path: '/network-status', icon: <Award size={20} /> },
    { name: 'Binary History', path: '/binary-history', icon: <TrendingUp size={20} /> },
    { name: 'Package History', path: '/package-history', icon: <Package size={20} /> },    
    
    // Financials
    { name: 'Transfer Funds', path: '/transfer', icon: <Send size={20} /> },
    { name: 'Convert Funds', path: '/convert-history', icon: <RefreshCw size={20} /> },
    
    // Statements (Histories grouped together)
    { name: 'Deposit History', path: '/deposit-history', icon: <ArrowDownToLine size={20} /> },
    { name: 'Withdraw History', path: '/withdraw-history', icon: <Wallet size={20} /> },
    { name: 'Wallet History', path: '/wallet-history', icon: <History size={20} /> },
    { name: 'All Transactions', path: '/all-transactions', icon: <LayoutList size={20} /> },
  ];

  return (
    <>
      {/* 🟢 Mobile Overlay (Glassmorphism) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* 🟢 Sidebar Container */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out fixed lg:relative z-40 top-[65px] lg:top-0 h-[calc(100dvh-65px)] lg:h-[calc(100vh-65px)] 
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-64'} shadow-2xl lg:shadow-none overflow-hidden`}
      >
        
        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto py-5 pb-24 scrollbar-hide">
          <nav className="space-y-1.5 px-4 whitespace-nowrap">
            
            <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-1">Main Menu</p>
            
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              
              // 🟢 Divider Logic (Grouping sections neatly)
              const isNewSection = index === 2 || index === 5 || index === 8 || index === 10;

              return (
                <React.Fragment key={item.name}>
                  {isNewSection && <div className="h-px bg-slate-100 my-3 mx-2"></div>}
                  
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm tracking-wide group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                  >
                    <span className={`mr-3 shrink-0 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-blue-500'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
        
        {/* 🟢 Bottom Footer Section (Profile & Status) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto shrink-0 space-y-3">
          
          {/* Link to new UserProfile page */}
          <Link 
            to="/profile" 
            onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
            className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
              location.pathname === '/profile' 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold text-sm">
              <ShieldCheck size={18} className={location.pathname === '/profile' ? 'text-blue-600' : 'text-slate-400'} />
              Profile & Security
            </div>
          </Link>

          {/* System Status */}
          <div className="flex items-center justify-between px-2">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
             <div className="flex items-center gap-1.5 bg-emerald-100/50 px-2 py-1 rounded-md border border-emerald-200/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Online</span>
             </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default UserSidebar;