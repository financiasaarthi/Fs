import React, { useState } from 'react';
import axios from 'axios';

function Auth({ setUser }) {
  const [isLoginView, setIsLoginView] = useState(true); // Toggle between Login and Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return setError("Username and Password are required");
    
    setIsLoading(true);
    setError('');

    // ✅ Yahan humne naye routes set kiye hain
    const url = isLoginView ? '/api/login' : '/api/register';

    try {
      const res = await axios.post(url, { username, password });
      
      // ✅ BROWSER MEIN DATA SAVE KARO (Refresh problem fixed)
      localStorage.setItem('roi_user', JSON.stringify(res.data.user));
      
      // Update global state
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Connection failed to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        
        {/* Toggle Tabs (Login / Sign Up) */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #eee' }}>
          <button 
            type="button"
            onClick={() => { setIsLoginView(true); setError(''); }}
            style={{ flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: isLoginView ? '#3498db' : '#7f8c8d', borderBottom: isLoginView ? '3px solid #3498db' : 'none' }}>
            Login
          </button>
          <button 
            type="button"
            onClick={() => { setIsLoginView(false); setError(''); }}
            style={{ flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: !isLoginView ? '#3498db' : '#7f8c8d', borderBottom: !isLoginView ? '3px solid #3498db' : 'none' }}>
            Sign Up
          </button>
        </div>

        <h2 className="text-center" style={{ marginBottom: '1rem', color: '#2c3e50' }}>
          {isLoginView ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Choose a username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLoginView ? 'Login securely' : 'Register Now')}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Auth;