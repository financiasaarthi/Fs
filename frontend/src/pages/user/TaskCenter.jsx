import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, CheckCircle, Timer, Package, ArrowRight, Play } from 'lucide-react';

function TaskCenter({ user, setUser }) {
  const [activePlayingPackage, setActivePlayingPackage] = useState(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); 
  const [isClaiming, setIsClaiming] = useState(false);

  const [currentVideo, setCurrentVideo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  
  const [localProgress, setLocalProgress] = useState({});

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

  // 🔥 SMART SYNC: Separate Counting Logic
  useEffect(() => {
    const totalDBWatched = user?.dailyVideosWatched || 0;
    let storedProgress = JSON.parse(localStorage.getItem(`pkgProgress_${user?._id}`)) || {};
    
    // Agar agle din DB reset hokar 0 ho gaya, toh local storage bhi 0 kar do
    if (totalDBWatched === 0) {
      storedProgress = {};
      activePackages.forEach(pkg => storedProgress[pkg] = 0);
      localStorage.setItem(`pkgProgress_${user?._id}`, JSON.stringify(storedProgress));
      setLocalProgress(storedProgress);
    } else {
      setLocalProgress(storedProgress);
    }
  }, [user?.dailyVideosWatched, user?._id]);

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

  // 🔥 TIMER LOGIC
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
    setIsVideoFinished(false);
    setTimeLeft(15);
  };

  const startVideoAndTimer = () => {
    setIsVideoPlaying(true); 
  };

  // 💰 CLAIM REWARD (Independent Package Counting)
  const handleClaimReward = async () => {
    setIsClaiming(true); 
    try {
      const res = await axios.post('/api/user/claim-task', {
        userId: user.userId 
      });
      
      alert(res.data.message || "Task Completed Successfully! 💰");
      
      if (setUser && res.data.user) {
        setUser(res.data.user); 
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      // 🟢 NAYA FIX: Jis package ka ad dekha hai, bas usi ka count badhao
      setLocalProgress(prev => {
        const newProgress = { ...prev };
        newProgress[activePlayingPackage] = (newProgress[activePlayingPackage] || 0) + 1;
        localStorage.setItem(`pkgProgress_${user._id}`, JSON.stringify(newProgress));
        return newProgress;
      });
      
      setIsVideoFinished(false);
      setActivePlayingPackage(null); 
      fetchRandomVideo(); 
      
    } catch (err) {
      alert(err.response?.data?.message || "Task failed");
    } finally {
      setIsClaiming(false);
    }
  };

  const isYouTube = currentVideo?.url?.includes("youtube.com") || currentVideo?.url?.includes("youtu.be");
  const getYouTubeEmbed = (url) => {
    if (!url) return "";
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be")) {
      const id = url.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };
  // 🟢 AutoPlay lagaya hai taaki click karte hi chal jaye
  const finalUrl = isYouTube ? `${getYouTubeEmbed(currentVideo?.url)}?autoplay=1&mute=0` : currentVideo?.url;

  // Render Video Player Area
  const renderVideoArea = () => (
    <div className="mt-6 animate-fadeIn">
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border-2 border-gray-800 flex items-center justify-center group">
        
        {!isVideoPlaying && !isVideoFinished ? (
          // 🟢 FAKE YOUTUBE PLAYER OVERLAY (Looks like video thumbnail)
          <div 
            onClick={startVideoAndTimer}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80 cursor-pointer hover:bg-gray-900/60 transition-all"
          >
            <div className="bg-red-600 text-white rounded-2xl py-3 px-6 shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center">
              <Play fill="currentColor" size={40} />
            </div>
            <p className="text-white mt-4 font-bold tracking-wide">Click to Play & Start Timer</p>
          </div>
        ) : (
          // 🟢 ACTUAL VIDEO PLAYER
          isYouTube ? (
            <iframe src={finalUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          ) : (
            <video src={finalUrl} controls autoPlay className="w-full h-full object-contain" />
          )
        )}

        {/* ⏱ TIMER OVERLAY (Floating on Video) */}
        {isVideoPlaying && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg font-black tracking-widest z-20 animate-pulse">
            <Timer className="mr-2" size={18} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
        )}
      </div>

      {/* Claim Button */}
      {isVideoFinished && (
        <div className="mt-6 text-center animate-fadeIn py-6 bg-green-50 rounded-2xl border-2 border-green-200 shadow-sm">
          <h4 className="text-xl font-bold text-green-700 mb-4">Task Completed Successfully! 🎊</h4>
          <button 
            onClick={handleClaimReward}
            disabled={isClaiming}
            className="bg-green-600 hover:bg-green-700 text-white font-black py-4 px-12 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center mx-auto gap-2 disabled:bg-green-400"
          >
            {isClaiming ? "Processing Reward..." : "Claim $0.1 Reward 💰"}
          </button>
        </div>
      )}
    </div>
  );

  if (activePackages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">No Active Packages</h2>
        <p className="text-gray-500 mt-2">Please buy a package to start earning from daily tasks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 md:px-0">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-2xl font-black text-gray-800">My Task Center</h2>
        <p className="text-gray-500 text-sm font-medium mt-1">Select a package to complete its specific tasks.</p>
      </div>

      {activePackages.map((pkgPrice, index) => {
        const config = packagesConfig[pkgPrice];
        const max = config?.maxTasks || 0;
        const watched = localProgress[pkgPrice] || 0;
        const isCompleted = watched >= max;

        return (
          <div key={index} className={`bg-white rounded-2xl shadow-sm border-2 ${isCompleted ? 'border-green-200' : 'border-blue-100'} overflow-hidden relative`}>
            
            <div className={`p-4 md:p-6 flex flex-col md:flex-row justify-between items-center border-b ${isCompleted ? 'bg-green-50 border-green-100' : 'bg-blue-50/30 border-blue-50'}`}>
              <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Package size={28} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-gray-800">${pkgPrice} {config?.name}</h3>
                  <p className={`text-sm font-bold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    {isCompleted ? 'All Tasks Completed' : 'Tasks Pending'}
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-auto flex justify-between md:flex-col items-center md:items-end bg-white py-2 px-4 md:px-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider md:mb-1">Progress</p>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-2xl font-black ${isCompleted ? 'text-green-500' : 'text-blue-600'}`}>{watched}</span>
                  <span className="text-lg font-bold text-gray-400">/ {max}</span>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {isCompleted ? (
                <div className="flex items-center justify-center gap-3 text-green-600 font-bold py-4 bg-green-50/50 rounded-xl">
                  <CheckCircle size={24} />
                  <span>Great job! Section completed for today.</span>
                </div>
              ) : (
                <div>
                  {activePlayingPackage === pkgPrice ? (
                    renderVideoArea()
                  ) : (
                    <div className="text-center py-4">
                      <button 
                        onClick={() => handleOpenTask(pkgPrice)} 
                        disabled={isLoadingVideo || activePlayingPackage !== null}
                        className={`font-bold py-4 px-8 rounded-xl shadow-md transition-all flex items-center justify-center mx-auto text-sm md:text-[15px] gap-2 w-full md:w-auto
                          ${activePlayingPackage !== null 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-900 hover:bg-black text-white hover:scale-105 transform'}`}
                      >
                        <PlayCircle size={20} />
                        {isLoadingVideo ? "Loading Video..." : `Open Task Player`}
                        <ArrowRight size={16} />
                      </button>
                      {activePlayingPackage !== null && activePlayingPackage !== pkgPrice && (
                        <p className="text-xs text-red-500 font-bold mt-4 bg-red-50 py-2 rounded-lg">Finish the task in the open section first.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        );
      })}
    </div>
  );
}

export default TaskCenter;