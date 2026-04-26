import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      setMessage("Error loading user data.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      setMessage("User deleted successfully.");
      fetchUsers(); 
    } catch (err) {
      setMessage("Failed to delete user.");
    }
  };

  // ---> UPDATED LOGIC: Calculate Global Active Deposits from Slots <---
  const totalDeposits = users.reduce((sum, user) => {
    let userActiveTotal = 0;
    if (user.activeSlots && user.activeSlots.length > 0) {
        userActiveTotal = user.activeSlots.reduce((slotSum, slot) => {
            return slot.status === 'Active' ? slotSum + slot.amount : slotSum;
        }, 0);
    }
    return sum + userActiveTotal;
  }, 0);
  
  const totalUsers = users.length;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Admin Control Panel</h2>
      
      {message && <div className="alert alert-info">{message}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '2rem', display: 'flex', gap: '20px' }}>
        <div className="card text-center" style={{ flex: 1 }}>
          <h3 style={{ color: '#7f8c8d' }}>Total Platform Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>{totalUsers}</p>
        </div>
        <div className="card text-center" style={{ flex: 1 }}>
          <h3 style={{ color: '#7f8c8d' }}>Total Active Deposits</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71' }}>${totalDeposits.toFixed(2)}</p>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <h3 className="card-title">User Management</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px' }}>Username</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Active Deposit</th>
              <th style={{ padding: '12px' }}>Wallet Balance</th>
              <th style={{ padding: '12px' }}>Task Progress</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              // ---> UPDATED LOGIC: Har user ka Active amount Slots se nikalo <---
              let userActiveDeposit = 0;
              if (u.activeSlots && u.activeSlots.length > 0) {
                  userActiveDeposit = u.activeSlots.reduce((sum, slot) => slot.status === 'Active' ? sum + slot.amount : sum, 0);
              }

              return (
                <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.username}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: u.role === 'admin' ? '#ffeaa7' : '#e0f7fa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#2ecc71', fontWeight: 'bold' }}>${userActiveDeposit.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${u.walletBalance?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '12px' }}>{u.taskCompletedToday ? 'Completed' : `${u.dailyVideosWatched}/5`}</td>
                  <td style={{ padding: '12px' }}>
                    {u.role !== 'admin' && (
                      <button className="btn btn-danger" onClick={() => handleDeleteUser(u._id)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;