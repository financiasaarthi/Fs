import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 🟢 Pages switch karne ke liye
import { AuthProvider } from './context/AuthContext' // 🟢 User login data ke liye
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* App ko AuthProvider ke andar daal diya taaki har page ko user ka data mil sake */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)