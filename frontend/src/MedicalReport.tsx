import './MedicalReport.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

function Report() {
    const [isRecording, setIsRecording] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const navigate = useNavigate();
    const [reportID, setReportID] = useState('');
    const changeRecording = () => {
        setIsRecording(!isRecording);
    }

    const viewReport = () => {
        navigate('view_report')
    }
    
    return (
        <div className='medical-report-container'>
            <Navbar name="" email="email" selectedSection='report' />
            <div className='center-container'>
                <div className='record-container'>
                    <h1 className='record-title'>Welcome to OmniDoc</h1>
                    <h3 className='record-description'>Press start to begin your screening</h3>
                    {isRecording ? 
                        <button className='record-btn stop' onClick={changeRecording}>Stop Recording</button>
                        : 
                        <button className='record-btn' onClick={changeRecording}>Start Recording</button>
                    }
                    {isRecording && (
                        <>
                            <div className="loading">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div> 
                            <h3 className='live-recording'>Recording in progress...</h3>
                        </>
                    )}
                </div>
                {isComplete && (<button className='view-report-btn'>View Report</button>)}
            </div>
        </div>    
    )
}

export default Report