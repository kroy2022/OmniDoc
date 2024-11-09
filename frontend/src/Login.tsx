import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import MedicineImage from './assets/landing-img.svg';
import axios from 'axios';
import { LoginResponse } from './interfaces/ApiResponse';
import CryptoES from 'crypto-es';

function Login() {
  const navigate = useNavigate();
  const key = "doc";
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function encrypt(email: string): string {
    const encrypted = CryptoES.AES.encrypt(email, key);
    const url = encrypted.toString();
    const urlSafeEncrypted = url
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); 
    return urlSafeEncrypted;
  }

  const validateLogin = () => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("password", password);
    axios.post('http://127.0.0.1:5000/login', fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    .then(response => handleLoginResponse(response))
    .catch(error => console.log(error))
  }

  const handleLoginResponse = (response: LoginResponse) => {
    console.log(response);
    if (response.data.status == 200) {
      const encryptedEmail = encrypt(email);
      navigate(`/dashboard/${encryptedEmail}`)
    }
  }

  return (
    <div className='login-container'>
      <div className='left-side-container'>
        <h1 className='login-h'>Login</h1>
        <div className='login-div'>
          <div className='google-section'>
            <button className='google-btn'>Continue with google</button>
          </div>
          
          <div className='input-section'>
            <input className='input-login' value={email} placeholder="Enter your email" onChange={(event) => setEmail(event.target.value)} />
            <input className='input-password' value={password} placeholder="Enter your password" onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div className='btn-section'>
            <button className='login-btn' onClick={() => validateLogin()}>Login</button>
          </div>
        </div>
      </div>
      <div className='right-side-container'>
        <img src={MedicineImage} className='medicine-img' />
      </div>
    </div>
  )
}

export default Login
