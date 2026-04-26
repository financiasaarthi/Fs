import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, DollarSign, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

function MyTeam({ user }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // Naya URL aur naya parameter (userId)
        const res = await axios.post('http://localhost:5000/api/user/my-team', {
          userId: user.userId || user._id
        });
        setTeamMembers(res.data);
      } catch (err) {
        console.error("Failed to load team");
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.userId || user?._id) {
      fetchTeam();
    }
  }, [user]);

  // Calculations
  const totalTeamBusiness = teamMembers.reduce((sum, member) => sum + (member.currentPackage || 0), 0);
  const activeMembersCount = teamMembers.filter(member => member.isActive).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Network</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track your direct referrals.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 font-medium text-sm">Total Directs</p>
              <h3 className="text-3xl font-bold mt-1">{teamMembers.length}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 font-medium text-sm">Active Members</p>
              <h3 className="text-3xl font-bold mt-1">{activeMembersCount}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Activity size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-purple-100 font-medium text-sm">Total Team Business</p>
              <h3 className="text-3xl font-bold mt-1">${totalTeamBusiness.toFixed(2)}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <DollarSign size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Direct Referral List</h3>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading network data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b">Join Date</th>
                  <th className="p-4 font-semibold border-b">User Info</th>
                  <th className="p-4 font-semibold border-b text-center">Position</th>
                  <th className="p-4 font-semibold border-b text-center">Package</th>
                  <th className="p-4 font-semibold border-b text-center">Today's Task</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamMembers.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(member.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{member.name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{member.userId}</div>
                    </td>
                    
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        member.position === 'LEFT' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-orange-50 text-orange-600 border border-orange-200'
                      }`}>
                        {member.position}
                      </span>
                    </td>
                    
                    <td className="p-4 text-center">
                      {member.isActive ? (
                        <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                          ${member.currentPackage}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium text-sm bg-gray-100 px-3 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex justify-center">
                        {member.taskCompletedToday ? (
                          <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg text-sm font-medium border border-green-100">
                            <CheckCircle size={16} className="mr-1" /> Done
                          </div>
                        ) : (
                          <div className="flex items-center text-orange-500 bg-orange-50 px-2 py-1 rounded-lg text-sm font-medium border border-orange-100">
                            <Clock size={16} className="mr-1" /> Pending
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {teamMembers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Users size={48} className="text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-600">No members found</p>
                        <p className="text-sm">Share your User ID to start building your network!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTeam;