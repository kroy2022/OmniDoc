import './ViewReport.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation  } from 'react-router-dom';
import Navbar from './components/Navbar';

function ViewReport() {
    const location = useLocation();
    const data = location.state;
    const email = data.email;
    const name = data.name;
    const report = data.report;
    const [dob, setBirthday] = useState('');
    const [gender, setUserGender] = useState('');
    const [medicalHistory, setMedicalHistory] = useState<{"index": number,"item": string}[]>([]);


    useEffect(() => {
        const fd = new FormData();
        fd.append("email", email);
        axios.post('http://127.0.0.1:5000/get/profile', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(response => {
            console.log("VIEW REPORT REPSONSE: ", response);
            if (response.data.status == 200) {
                setUserGender(response.data.profile.Gender);
                setBirthday(response.data.profile.DOB);
                setMedicalHistory(response.data.profile.History);
            }
          })
          .catch(error => console.log(error))
    }, [])
    
    return (
        <div className='view-container'>
            <Navbar email={email} name={name} selectedSection='none'/>
            <div className='head-container'>
                <h1 className='report-title'>Preliminary Assessment Report</h1>
                <div className='header-info'>
                    <h3 className='h3-i'>Date Started: {report.Date}</h3>
                    <h3 className='h3-i'>Time: {report.Time}</h3>
                    <h3 className='h3-i'>Report ID: {report.Report_ID}</h3>
                </div>
            </div>
            <div className='line'></div>
            <div className='body-container'>
                <div className='body-section'>
                    <h1 className='h1'>Patient Information: </h1>
                    <h2 className='h2'>Name: {name}</h2>
                    <h2 className='h2'>DOB: {dob}</h2>
                    <h2 className='h2'>Email: {email}</h2>
                    <h2 className='h2'>Gender: {gender}</h2>
                </div>
                <div className='body-section'>
                    <h1 className='h1'>Complaint: </h1>
                    <h2 className='h2'>Symptoms: {report.Symptoms}</h2>
                    <h2 className='h2'>Onset: {report.Date}</h2>
                    <h2 className='h2'>Severity: {report.Severity}</h2>
                </div>
                <div className='body-section'>
                    <h1 className='h1'>Past Medical History: </h1>
                    {medicalHistory.map((medicalItem, index) => (
                        <h2 className='h2' key={index}>{medicalItem.item}</h2>
                    ))}
                </div>
                <div className='body-section'>
                    <h1 className='h1'>Recommendation</h1>
                    <h2 className='h2'>{report.Recommended_Action}</h2>
                </div>
            </div>
        </div>
    )
}

export default ViewReport