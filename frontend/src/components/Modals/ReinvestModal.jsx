import React, { useState } from 'react';
import axios from 'axios';

function ReinvestModal({ user, setUser, onClose }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReinvest = async () => {
    if (!amount || amount < 10) return alert("Minimum Re-invest is $10");
    
    setIsLoading(true);
    try {
      const response = await axios.post('/api/users/reinvest', {
        userId: user._id,
        amount: Number(amount)
      });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert(response.data.message);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Re-invest failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Re-invest Balance</h3>
        <p>Wallet Balance: <strong>${user?.walletBalance?.toFixed(2)}</strong></p>
        <p style={{ fontSize: '0.8rem', color: '#e74c3c' }}>Minimum Re-invest: $10</p>
        <input 
          type="number" value={amount} onChange={(e) => setAmount(e.target.value)} 
          placeholder="Enter amount (Min $10)" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} 
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px' }}>Cancel</button>
          <button onClick={handleReinvest} disabled={isLoading} style={{ flex: 1, padding: '10px', backgroundColor: '#f39c12', color: 'white' }}>
            {isLoading ? 'Processing...' : 'Re-invest'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReinvestModal;