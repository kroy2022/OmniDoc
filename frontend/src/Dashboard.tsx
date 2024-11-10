import './Dashboard.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CryptoES from 'crypto-es';
import Navbar from './components/Navbar';
import axios from 'axios';
import { Report } from './interfaces/ApiResponse';

function Dashboard() {
    const { protectedEmail } = useParams<{protectedEmail: string}>();
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('kevin');
    const [reports, setReports] = useState<Report[]>([]);    
    const key = "doc"

    useEffect(() => {
        console.log("IN DASHBOARD", protectedEmail);
        if (protectedEmail) {
            console.log("ENCRYPT EMAIL: ", protectedEmail);
            let tempEmail = decrypt(protectedEmail)
            setEmail(tempEmail);
            console.log("DECRYPT EMAIL: ", email);
            const fd = new FormData();
            fd.append("user_id", tempEmail);
            axios.post('http://127.0.0.1:5000/dashboard', fd, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                }
              })
              .then(response => {
                console.log(response)
                if (response.data.status == 200) {
                    setReports(response.data.reports);
                }
              })
              .catch(error => console.log(error))
        }   
    }, [])

    function decrypt(encryptedEmail: string): string {
        const urlUnsafeEncrypted = encryptedEmail
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const decrypted = CryptoES.AES.decrypt(urlUnsafeEncrypted, key);
        return decrypted.toString(CryptoES.enc.Utf8);
    }

    const navigateToReport = (report: Report) => {
        navigate("/ViewReport", {
            state: {
                email: email,
                name: name,
                report: report
            }
        });
    }

    return (
        //Change background color to red yellow or green based on severity
        <div className='dashboard-container'>
            <Navbar name={name} email={email} selectedSection="dashboard"/>
            <h1 className='h'>Welcome {email}</h1>
            <div className='reports-container'>
                {reports && reports.map((report, index) => (
                    <div className='report' onClick={() => navigateToReport(report)}>
                        <div className='left'>
                            <h1 className='report-h'>Report ID: {report.Report_ID}</h1>
                            <div className='symptoms'>
                                <p className='report-p'>{report.Symptoms}</p>
                            </div>
                        </div>
                        <div className='right'>
                            <h1 className='report-h'>{report.Date}</h1>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard