import './MedicalReport.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

function Report() {
    const location = useLocation();
    console.log("DATA: ", location.state);
    const email = location.state.email;
    const name = location.state.name;
    const [isRecording, setIsRecording] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [medicalHistory, setMedicalHistory] = useState<{"index": number,"item": string}[]>([]);
    const navigate = useNavigate();
    const [reportID, setReportID] = useState('');

    useEffect(() => {
        console.log("medical report id: ", email);
        const fd = new FormData();
        fd.append("user_id", email);
        axios.post('http://127.0.0.1:5000/get/medical/history', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(response => {
            console.log("GET MEDICAL HISTORY RESPONSE: ", response.data);
            if (response.data.status == 200) {
                setMedicalHistory(response.data.history);
            }
          })
          .catch(error => console.log(error))
    }, [])

    const changeRecording = () => {
        setIsRecording(!isRecording);
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