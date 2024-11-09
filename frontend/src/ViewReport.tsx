import './ViewReport.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

function ViewReport() {
    const location = useLocation();
    const data = location.state;
    const email = data.email;
    const name = data.name;
    const [medicalHistory, setMedicalHistory] = useState([]);
    const tempHistory = [
        {
            "index": 1,
            "item": "Asthma"
        },
        {
            "index": 2,
            "item": "Tendonitis"
        }
    ]

    return (
        <div className='view-container'>
            <Navbar email={email} name={name} selectedSection='none'/>
            <div className='head-container'>
                <h1 className='report-title'>Preliminary Assessment Report</h1>
                <div className='header-info'>
                    <h3 className='h3-i'>Date: 2024-10-29</h3>
                    <h3 className='h3-i'>Time: 21:50 Central Daylight Time</h3>
                    <h3 className='h3-i'>Report ID: 253384sdf</h3>
                </div>
            </div>
            <div className='line'></div>
            <div className='body-container'>
                <div className='body-section'>
                    <h1 className='h1'>Patient Information: </h1>
                    <h2 className='h2'>Name: Kevin Roy</h2>
                    <h2 className='h2'>DOB: 12/09/2003</h2>
                    <h2 className='h2'>Email: kevinroy2015@gmail.com</h2>
                    <h2 className='h2'>Gender: Male</h2>
                </div>
                <div className='body-section'>
                    <h1 className='h1'>Complaint: </h1>
                    <h2 className='h2'>Symptoms: coughing, can't sleep, can't breathe</h2>
                    <h2 className='h2'>Onset: 3 days ago</h2>
                    <h2 className='h2'>Severity: 7/10</h2>
                </div>
                <div className='body-section'>
                    <h1 className='h1'>Past Medical History: </h1>
                    {tempHistory.map((medicalItem, index) => (
                        <h2 className='h2' key={index}>{medicalItem.item}</h2>
                    ))}
                </div>
                <div className='body-section'>
                    <h1 className='h1'>Recommendation</h1>
                    <h2 className='h2'>take advil twice a day for 5 days</h2>
                </div>
            </div>
        </div>
    )
}

export default ViewReport