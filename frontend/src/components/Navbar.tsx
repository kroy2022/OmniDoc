import { useNavigate } from 'react-router-dom';
import { NavbarProps } from '../@types/NavbarType';
import { ProfileData } from '../@types/NavigationType';
import CryptoES from 'crypto-es';
import './Navbar.css';

function Navbar({name, email, selectedSection}: NavbarProps) {
    const navigate = useNavigate();
    const key = "doc";
 
    function encrypt(email: string): string {
        const encrypted = CryptoES.AES.encrypt(email, key);
        const url = encrypted.toString();
        const urlSafeEncrypted = url
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); 
        return urlSafeEncrypted;
    }

    const handleNavigation = (url: string, urlInformation: ProfileData | null = null) => {
        if (url.includes("dashboard")) {
            const encryptedEmail = encrypt(url);
            url = `/dashboard/${encryptedEmail}`;
        }
        console.log(urlInformation);
        navigate(url, {
            state: urlInformation
        })
    }

    return (
        <div className='navbar'>
            <div className='left-side'>
                <img src="http://www.w3.org/2000/svg"/>
            </div>
            <div className='right-side'>
                <button
                    className={`navbar-btn ${selectedSection === "dashboard" ? "active-btn" : ""}`}
                    onClick={() => handleNavigation("/dashboard")}
                >
                    Dashboard
                </button>
                <button
                    className={`navbar-btn ${selectedSection === "report" ? "active-btn" : ""}`}
                    onClick={() => handleNavigation("/medical/report", { name: name, email: email })}
                >
                    Create Report
                </button>
                <button
                    className={`navbar-btn ${selectedSection === "profile" ? "active-btn" : ""}`}
                    onClick={() => handleNavigation("/profile", { name: name, email: email })}
                >
                    Profile
                </button>
            </div>
        </div>
    )
}

export default Navbar