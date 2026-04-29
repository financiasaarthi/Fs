import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, CheckCircle, Timer, Package, ArrowRight, Loader2, Play } from 'lucide-react';
// 🟢 Context Hook
import { useAuth } from '../../context/AuthContext'; 
// 🟢 Success Modal Import
import SuccessModal from "../../components/SuccessModal";

function TaskCenter() {
  const { user, updateUser, token } = useAuth();
  
  const [activePlayingPackage, setActivePlayingPackage] = useState(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); 
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false); 
  const [isClaiming, setIsClaiming] = useState(false);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [localProgress, setLocalProgress] = useState({});

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  // 📦 Package Configuration
  const packagesConfig = {
    10: { name: 'Starter Plan', maxTasks: 2 },
    30: { name: 'Basic Plan', maxTasks: 6 },
    50: { name: 'Pro Plan', maxTasks: 10 },
    100: { name: 'Premium Plan', maxTasks: 20 },
    500: { name: 'VIP Plan', maxTasks: 50 }
  };

  const activePackages = user?.activePackages?.length > 0 
    ? [...user.activePackages].sort((a, b) => a - b) 
    : (user?.currentPackage ? [user.currentPackage] : []);

  // 🔥 EXACT REAL-TIME SYNC: Ab Task History check karke exact wahi bar bharega jispe click hua hai
  useEffect(() => {
    const syncProgress = async () => {
      if (!user) return;

      let prog = {};
      const sortedPackages = [...activePackages].sort((a, b) => a - b);
      sortedPackages.forEach(p => prog[p] = 0);

      try {
        // Task History API se aaj ka exact data nikalte hain
        const res = await axios.get(`/api/user/task-history/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const logs = res.data.history || [];
        const todayStr = new Date().toDateString();
        let historyCount = 0;

        logs.forEach(log => {
          if (new Date(log.createdAt).toDateString() === todayStr) {
            historyCount++;
            // Backend se aaye hue "$30 Package" me se '30' nikal kar count badhaenge
            const match = log.packageName?.match(/\$(\d+)/);
            if (match && match[1]) {
              const price = Number(match[1]);
              if (prog[price] !== undefined) prog[price]++;
            }
          }
        });

        // Agar DB me zyada videos hain (history update se purane videos), toh unhe bachi hui jagah me daal do
        let missing = (user.dailyVideosWatched || 0) - historyCount;
        if (missing > 0) {
          sortedPackages.forEach(pkgPrice => {
            const maxForPkg = packagesConfig[pkgPrice]?.maxTasks || 0;
            const spaceLeft = maxForPkg - prog[pkgPrice];
            if (spaceLeft > 0 && missing > 0) {
              const toAdd = Math.min(spaceLeft, missing);
              prog[pkgPrice] += toAdd;
              missing -= toAdd;
            }
          });
        }

        setLocalProgress(prog);
      } catch (err) {
        console.error("Failed to sync progress from history", err);
        // FALLBACK: Agar API fail hui toh purana Sequential system chalega
        let totalDBWatched = user.dailyVideosWatched || 0;
        sortedPackages.forEach(pkgPrice => {
          const maxForPkg = packagesConfig[pkgPrice]?.maxTasks || 0;
          if (totalDBWatched >= maxForPkg) {
            prog[pkgPrice] = maxForPkg;
            totalDBWatched -= maxForPkg;
          } else {
            prog[pkgPrice] = totalDBWatched;
            totalDBWatched = 0;
          }
        });
        setLocalProgress(prog);
      }
    };

    syncProgress();
  }, [user?.dailyVideosWatched, user?.userId, token]); 


  const fetchRandomVideo = async () => {
    try {
      setIsLoadingVideo(true);
      const res = await axios.get('/api/videos/random');
      setCurrentVideo(res.data);
    } catch (err) {
      console.error("Video load error", err);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  useEffect(() => {
    fetchRandomVideo();
  }, []);

  // ⏱️ TIMER LOGIC
  useEffect(() => {
    let timer;
    if (isVideoPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    if (timeLeft === 0 && isVideoPlaying) {
      setIsVideoFinished(true);
      setIsVideoPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isVideoPlaying, timeLeft]);

  const handleOpenTask = (pkgPrice) => {
    if (!currentVideo) return;
    setActivePlayingPackage(pkgPrice);
    
    setIsVideoPlaying(false); 
    setHasStartedPlaying(false); 
    setIsVideoFinished(false);
    setTimeLeft(currentVideo.duration || 15);
  };

  const startActualVideo = () => {
    setHasStartedPlaying(true); 
    setIsVideoPlaying(true); 
  };

  // 💰 CLAIM REWARD 
  const handleClaimReward = async () => {
    if (!user?.userId) return;
    setIsClaiming(true); 
    try {
      const res = await axios.post('/api/user/claim-task', {
        userId: user.userId,
        packageAmount: activePlayingPackage // 🟢 Backend ko exactly ye bhej rahe hain ki kispe click kiya tha
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.user) {
        updateUser(res.data.user); // 🟢 Ye update auto-progress refresh kar dega
      }
      
      setRewardData({
        amount: 0.10,
        packageName: packagesConfig[activePlayingPackage]?.name,
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      });
      setIsSuccessOpen(true);

      setIsVideoFinished(false);
      setHasStartedPlaying(false);
      setActivePlayingPackage(null); 
      fetchRandomVideo(); 
      
    } catch (err) {
      alert(err.response?.data?.message || "Task failed");
    } finally {
      setIsClaiming(false);
    }
  };

  // 🎬 YouTube & Shorts logic Fix
  const isYouTube = currentVideo?.url?.includes("youtube.com") || currentVideo?.url?.includes("youtu.be");
  const isShorts = currentVideo?.url?.includes("/shorts/");

  const getYouTubeEmbed = (url) => {
    if (!url) return "";
    let embedUrl = url;
    
    if (url.includes("watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (url.includes("/shorts/")) {
      embedUrl = url.replace("/shorts/", "/embed/");
    } else if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    
    return embedUrl;
  };
  
  const finalUrl = isYouTube 
    ? `${getYouTubeEmbed(currentVideo?.url)}${getYouTubeEmbed(currentVideo?.url).includes('?') ? '&' : '?'}autoplay=1&mute=1&playsinline=1` 
    : currentVideo?.url;
  
  const shareUrl = currentVideo?.url || window.location.origin;
  const rawShareMessage = currentVideo?.shareMessage || "Check out this amazing video I found while completing my tasks!";
  const encodedMessage = encodeURIComponent(rawShareMessage);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleInstagramShare = () => {
    const textToShare = `${rawShareMessage}\n\n${shareUrl}`;
    navigator.clipboard.writeText(textToShare);
    alert("✅ Message & Link Copied!\nOpen Instagram and paste it to share with your friends.");
  };

  const renderVideoArea = () => (
    <div className="mt-6 animate-in fade-in duration-500">
      
      {isVideoPlaying && hasStartedPlaying && !isVideoFinished && (
        <div className="mb-4 bg-red-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center shadow-lg font-black tracking-[0.2em] animate-pulse border-2 border-red-500/50 w-max mx-auto">
          <Timer className="mr-3" size={24} /> 
          TIME LEFT: 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </div>
      )}

      <div className={`relative w-full ${isShorts ? 'aspect-[9/16] max-w-sm mx-auto' : 'aspect-video min-h-[250px] md:min-h-[350px]'} bg-black rounded-[2rem] overflow-hidden shadow-2xl border-[4px] border-gray-900 flex items-center justify-center group`}>
        
        {!hasStartedPlaying && !isVideoFinished && (
          <div 
            onClick={startActualVideo} 
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80 cursor-pointer hover:bg-gray-900/70 transition-all backdrop-blur-sm"
          >
            <div className="bg-red-600 text-white rounded-[2rem] py-4 px-8 shadow-xl group-hover:scale-110 transition-transform flex items-center justify-center border-4 border-red-500/30">
              <Play fill="currentColor" size={48} />
            </div>
            <p className="text-white mt-6 font-black tracking-widest uppercase text-xs md:text-sm animate-pulse text-center px-4">
              Click Here To Play Video & Start Timer
            </p>
          </div>
        )}

        {hasStartedPlaying && (
          isYouTube ? (
            <iframe src={finalUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          ) : (
            <video src={finalUrl} controls autoPlay playsInline className="w-full h-full object-contain" />
          )
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-full text-center mb-1">Share To Earn More Referrals</p>
        
        <a 
          href={`https://api.whatsapp.com/send?text=${encodedMessage}%20${encodedUrl}`} 
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.88-.653-1.473-1.46-1.646-1.757-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          WhatsApp
        </a>
        
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} 
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#0e5fc9] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </a>

        <a 
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`} 
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-[#229ED9] hover:bg-[#1b84b5] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zM5.277 11.666c3.843-1.674 6.405-2.78 7.686-3.318 3.65-1.536 4.41-1.8 4.904-1.808.109-.002.35.025.5.15.126.104.164.246.182.344.017.098.037.315.02.483-.19 1.89-1.01 6.425-1.433 8.52-.18.89-.5.856-.99.856-.492 0-.612-.22-.962-.44-1.028-.646-1.587-1.03-2.573-1.68-.684-.45-1.285-.826-1.353-.895-.443-.45.02-.922.383-1.293.096-.098 1.767-1.62 1.8-1.758.004-.017.008-.08-.03-.11-.038-.032-.09-.02-.128-.01-.055.012-1.93 1.252-4.108 2.723-.5.337-.893.428-1.185.418-.328-.01-1.11-.23-1.66-.41-.678-.22-1.14-.337-1.096-.713.023-.194.3-.396.824-.607z"/></svg>
          Telegram
        </a>

        <button 
          onClick={handleInstagramShare}
          className="flex items-center gap-2 bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          Instagram
        </button>

      </div>

      {isVideoFinished && (
        <div className="mt-8 text-center animate-in zoom-in duration-300 p-8 bg-gradient-to-b from-green-50 to-white rounded-[2rem] border-2 border-green-200 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400/20 blur-3xl rounded-full"></div>
          <h4 className="text-2xl font-black text-green-700 mb-6 uppercase tracking-tight relative z-10">Task Reward Ready! 🎊</h4>
          <button 
            onClick={handleClaimReward}
            disabled={isClaiming}
            className="bg-green-600 hover:bg-green-700 text-white font-black py-4 px-12 rounded-2xl shadow-lg transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center mx-auto gap-3 disabled:bg-green-400 active:scale-95 relative z-10"
          >
            {isClaiming ? <><Loader2 className="animate-spin" size={20} /> SYNCING...</> : "CLAIM $0.1 REWARD 💰"}
          </button>
        </div>
      )}
    </div>
  );

  if (activePackages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 text-center animate-in fade-in">
        <Package size={80} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">No Active Packages</h2>
        <p className="text-gray-400 font-bold mt-2 text-xs uppercase tracking-widest">Buy a package to unlock daily earning tasks.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 px-2 md:px-0 py-6">
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 border-l-4 border-l-indigo-600 flex items-center gap-4">
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
             <PlayCircle size={32} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 uppercase tracking-tight">Task Center</h2>
            <p className="text-gray-400 text-[10px] sm:text-xs font-black mt-1 uppercase tracking-widest">Watch Ads & Earn Daily Returns</p>
          </div>
        </div>

        {activePackages.map((pkgPrice, index) => {
          const config = packagesConfig[pkgPrice];
          const max = config?.maxTasks || 0;
          const watched = localProgress[pkgPrice] || 0;
          const isCompleted = watched >= max;

          return (
            <div key={index} className={`bg-white rounded-[2.5rem] shadow-xl border-2 ${isCompleted ? 'border-green-200 shadow-green-100/50' : 'border-indigo-50 shadow-indigo-100/30'} overflow-hidden relative transition-all duration-300`}>
              <div className={`p-4 md:p-6 flex flex-col md:flex-row justify-between items-center border-b ${isCompleted ? 'bg-green-50/80 border-green-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
                <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                  <div className={`p-3.5 rounded-2xl shadow-inner border ${isCompleted ? 'bg-green-100 text-green-600 border-green-200' : 'bg-indigo-100 text-indigo-600 border-indigo-200'}`}>
                    <Package size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">${pkgPrice} {config?.name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`}>
                      {isCompleted ? 'Daily Target Hit' : 'Tasks Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex justify-between md:flex-col items-center md:items-end bg-white py-3 px-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] md:mb-1">Progress</p>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-3xl font-black ${isCompleted ? 'text-green-500' : 'text-indigo-600'}`}>{watched}</span>
                    <span className="text-lg font-black text-gray-300">/ {max}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-8 bg-gray-50/30">
                {isCompleted ? (
                  <div className="flex flex-col items-center justify-center gap-3 text-green-600 font-black py-8 bg-green-50 rounded-[2rem] border border-dashed border-green-200 shadow-sm">
                    <CheckCircle size={36} className="text-green-500 mb-2" />
                    <span className="uppercase text-sm tracking-[0.2em] text-center">Section Completed<br/><span className="text-[10px] text-green-500">Come back tomorrow</span></span>
                  </div>
                ) : (
                  <div>
                    {activePlayingPackage === pkgPrice ? (
                      renderVideoArea()
                    ) : (
                      <div className="text-center py-6">
                        <button 
                          onClick={() => handleOpenTask(pkgPrice)} 
                          disabled={isLoadingVideo || activePlayingPackage !== null}
                          className={`font-black py-5 px-10 rounded-[2rem] shadow-xl transition-all flex items-center justify-center mx-auto text-xs gap-3 uppercase tracking-[0.2em] w-full md:w-auto
                            ${activePlayingPackage !== null 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] transform active:scale-95'}`}
                        >
                          <PlayCircle size={24} />
                          {isLoadingVideo ? "Syncing Server..." : `START WATCHING AD`}
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SuccessModal
        isOpen={isSuccessOpen}
        title="Reward Unlocked!"
        message="Great job! Your ad task is complete."
        btnText="CONTINUE EARNING"
        type="reward" 
        onConfirm={() => setIsSuccessOpen(false)}
      >
        {rewardData && (
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 space-y-3 text-center shadow-inner">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Added to Wallet</p>
            <p className="text-5xl font-black text-amber-500 mb-2">+${rewardData.amount.toFixed(2)}</p>
            <div className="flex justify-between items-center border-t border-amber-200/50 pt-3 mt-3">
              <span className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest">{rewardData.packageName}</span>
              <span className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest">{rewardData.date}</span>
            </div>
          </div>
        )}
      </SuccessModal>
    </>
  );
}

export default TaskCenter;