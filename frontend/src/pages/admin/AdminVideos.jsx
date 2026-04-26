import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Video, PlusCircle, Trash2, Link as LinkIcon, PlayCircle } from 'lucide-react';

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchVideos = async () => {
    try {
      const res = await api.get('/videos/admin/all');
      setVideos(res.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/videos/admin/add', { title, url });
      setMessage('✅ Video added successfully!');
      setTitle('');
      setUrl('');
      fetchVideos(); // List refresh karein
    } catch (error) {
      setMessage('❌ Failed to add video.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await api.delete(`/videos/admin/videos/${id}`);
      fetchVideos(); // List refresh karein
    } catch (error) {
      alert("Error deleting video");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Video className="text-blue-600" /> Video Management
        </h1>
        <p className="text-sm text-gray-500">Add YouTube links for user daily tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD VIDEO FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <PlusCircle size={20} /> Add New Video
          </h3>
          {message && <p className="mb-4 text-sm font-bold text-green-600 bg-green-50 p-2 rounded">{message}</p>}
          
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Video Title</label>
              <input 
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Financial Freedom 101"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">YouTube URL</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-9 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Save Video'}
            </button>
          </form>
        </div>

        {/* VIDEOS LIST */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <PlayCircle size={20} /> Active Videos ({videos.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-3 font-bold">Title</th>
                  <th className="p-3 font-bold">URL</th>
                  <th className="p-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {videos.length === 0 ? (
                  <tr><td colSpan="3" className="text-center p-4 text-gray-500">No videos added yet.</td></tr>
                ) : (
                  videos.map((vid) => (
                    <tr key={vid._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{vid.title}</td>
                      <td className="p-3 text-sm text-blue-500 truncate max-w-[200px]">
                        <a href={vid.url} target="_blank" rel="noreferrer">{vid.url}</a>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleDelete(vid._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideos;