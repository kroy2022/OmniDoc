import './Dashboard.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CryptoES from 'crypto-es';
import Navbar from './components/Navbar';

function Dashboard() {
    const { protectedEmail } = useParams<{protectedEmail: string}>();
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('kevin');
    const [reports, setReports] = useState([
        {
            "report_id": "abs435",
            "date": "12/24/2023",
            "index": 0,
            "symptoms": ["headache", "cough", "swelling"]
        },
        {
            "report_id": "def789",
            "date": "01/15/2024",
            "index": 1,
            "symptoms": ["fever", "chills", "fatigue"]
        },
        {
            "report_id": "ghi101",
            "date": "02/10/2024",
            "index": 2,
            "symptoms": ["sore throat", "runny nose", "sneezing"]
        },
        {
            "report_id": "jkl112",
            "date": "03/22/2024",
            "index": 3,
            "symptoms": ["muscle pain", "shortness of breath", "dizziness"]
        },
        {
            "report_id": "mno134",
            "date": "04/08/2024",
            "index": 4,
            "symptoms": ["nausea", "vomiting", "diarrhea"]
        }
    ]);    
    const key = "doc"

    useEffect(() => {
        console.log("IN DASHBOARD", protectedEmail);
        if (protectedEmail) {
            console.log("ENCRYPT EMAIL: ", protectedEmail);
            setEmail(decrypt(protectedEmail));
            console.log("DECRYPT EMAIL: ", email);
            const fd = new FormData();
            fd.append("email", email);
        }   
    }, [])

    function decrypt(encryptedEmail: string): string {
        const urlUnsafeEncrypted = encryptedEmail
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const decrypted = CryptoES.AES.decrypt(urlUnsafeEncrypted, key);
        return decrypted.toString(CryptoES.enc.Utf8);
    }

    const navigateToReport = () => {
        navigate("/ViewReport", {
            state: {
                email: email,
                name: name,
            }
        });
    }

    return (
        //Change background color to red yellow or green based on severity
        <div className='dashboard-container'>
            <Navbar name={name} email={email} selectedSection="dashboard"/>
            <h1 className='h'>Welcome {email}</h1>
            <div className='reports-container'>
                {reports.map((report, index) => (
                    <div className='report' onClick={() => navigateToReport()}>
                        <div className='left'>
                            <h1 className='report-h'>Report ID: {report.report_id}</h1>
                            <div className='symptoms'>
                                {report.symptoms.map((symptom, index) => (
                                    <p className='report-p'>{symptom}</p>
                                ))}
                            </div>
                        </div>
                        <div className='right'>
                            <h1 className='report-h'>{report.date}</h1>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard