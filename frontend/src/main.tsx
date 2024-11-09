import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './Login.tsx';
import Dashboard from './Dashboard.tsx';
import MedicalReport from './MedicalReport.tsx';
import Profile from './Profile.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/:protectedEmail?" element={<Dashboard />}/>
        <Route path="/medical/report" element={<MedicalReport />}/>
        <Route path="/profile" element={<Profile />}/>
      </Routes>
    </Router>
  </StrictMode>,
)
