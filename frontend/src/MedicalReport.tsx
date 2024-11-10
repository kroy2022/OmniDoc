import './MedicalReport.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

function Report() {
    const location = useLocation();
    const email = location.state.email;
    const name = location.state.name;
    const [isRecording, setIsRecording] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [medicalHistory, setMedicalHistory] = useState<{"index": number,"item": string}[]>([]);
    const navigate = useNavigate();
    const [reportID, setReportID] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [startScreening, setStartScreening] = useState<boolean>(true);
    const [speechIsComplete, setSpeechIsComplete] = useState<boolean>(false);
    const [prevQuestion, setPrevQuestion] = useState<string>('');
    const [prevAnswer, setPrevAnswer] = useState<string>('');

    function generateRandomString(length: number) {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    useEffect(() => {
        let id = generateRandomString(10);
        setReportID(id);
        const fd = new FormData();
        fd.append("user_id", email);
        axios.post('http://127.0.0.1:5000/get/medical/history', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(response => {
            if (response.data.status == 200) {
                setMedicalHistory(response.data.history);
            }
          })
          .catch(error => console.log(error))
    }, [])

    const startRecording = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                mediaRecorderRef.current = new MediaRecorder(stream);
                
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data); // event.data is of type Blob
                };
                
                mediaRecorderRef.current.onstop = handleRecordingStop;

                mediaRecorderRef.current.start();
                setIsRecording(true);
            })
            .catch((error) => console.error('Microphone access denied:', error));
    };

    const stopRecording = () => {
        setSpeechIsComplete(false);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Handle the audio blob when recording stops
    const handleRecordingStop = () => {
        console.log("HANDLE RECORDING STOP")
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = []; // Clear chunks for future recordings

        // Call upload function to send blob to backend
        uploadAudio(audioBlob);
    };

    // Upload audio to backend for transcription
    const uploadAudio = (audioBlob: Blob) => {
        console.log("BLOB: ", audioBlob);
        const fd = new FormData();
        fd.append('audio', audioBlob, 'recording.wav');
        fd.append('user_id', email);
        fd.append('index', currentIndex.toString());
        fd.append('report_id', reportID);
        axios.post('http://127.0.0.1:5000/upload/audio', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(response => {
            if (response.data.status == 200) {
                setPrevAnswer(response.data.text);
                handleNextQuestion();
            }
          })
          .catch(error => console.log(error))
    }

    const handleStartScreening = () => {
        setStartScreening(false);
        handleNextQuestion();
    }

    const handleNextQuestion = () => {
        const fd = new FormData();
        fd.append("current_index", currentIndex.toString());
        fd.append("question", prevQuestion);
        fd.append("answer", prevAnswer);
        fd.append("report_id", reportID);
        fd.append("user_id", email);
        axios.post('http://127.0.0.1:5000/next/question', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(response => {
            if (response.data.status == 200) {
                setSpeechIsComplete(true);
                setCurrentIndex(response.data.current_index);
                setPrevQuestion(response.data.question);
            } else if (response.data.status == 201) {
                setIsComplete(true);
            }
          })
          .catch(error => console.log(error))
    }

    return (
        <div className='medical-report-container'>
            <Navbar name="kevin" email="kevinroy2015@gmail.com" selectedSection='report' />
            <div className='center-container'>
                <div className='record-container'>
                    <h1 className='record-title'>Welcome to OmniDoc</h1>
                    <h3 className='record-description'>Press start to begin your screening</h3>
                    {startScreening && (
                        <button className='record-btn' onClick={handleStartScreening}>
                            Start Screening
                        </button>
                    )}

                    {!isComplete && speechIsComplete && !isRecording && !startScreening && (
                        <button className='record-btn' onClick={startRecording}>
                            Start Recording
                        </button>
                    )}

                    {!isComplete && speechIsComplete && isRecording && !startScreening && (
                        <button className='record-btn stop' onClick={stopRecording}>
                            Stop Recording
                        </button>
                    )}
                    {!startScreening && isRecording && (
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
                {isComplete && (<h1 className='view-report-btn'>Check dashboard for your report!</h1>)}
            </div>
        </div>    
    )
}

export default Report