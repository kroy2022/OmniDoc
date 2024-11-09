import './Profile.css';
import { useState, useEffect, SetStateAction } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

function Profile() {    
    const location = useLocation();
    const email = location.state.email;
    const name = location.state.name;
    const [medicalHistory, setMedicalHistory] = useState(["Cold", "Flu", "Etc"]);
    const [userGender, setUserGender] = useState<string>("Male");
    const [birthday, setBirthday] = useState<string>('2000-01-01');
    const [medicalHistoryItem, setMedicalHistoryItem] = useState<string>('');
    const [alcoholIsChecked, setAlcoholIsChecked] = useState<boolean>(false);
    const [smokingIsChecked, setSmokingIsChecked] = useState<boolean>(false);

    useEffect(() => {
        //load info from database and fill forms
        
    }, [])

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key == "Enter") {
            addMedicalHistoryItem();        
        }
    }

    const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedGender = event.target.nextElementSibling?.getAttribute('data-txt');
        console.log(selectedGender);
        setUserGender(selectedGender || "");
    };

    const handleMedicalHistoryItemAddition = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMedicalHistoryItem(event.target.value);
    }

    const addMedicalHistoryItem = () => {
        //add item to db
        let tempHistory = [...medicalHistory, medicalHistoryItem];
        console.log("TEMP HISTORY: ", tempHistory);
        setMedicalHistory(tempHistory);
        setMedicalHistoryItem('');
    }

    //add db index to remove from db
    const removeItem = (index: number, dbIndex: number = 0) => {
        const temp = medicalHistory.filter((_, i) => i !== index);
        setMedicalHistory(temp);
    } 

    const handleAlcoholChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAlcoholIsChecked(event.target.checked);
    }

    const handleSmokingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSmokingIsChecked(event.target.checked);
    }

    return (
        <div className='profile-container'>
            <Navbar name={name} email={email} selectedSection="profile"/>
            <div className='profile-content'>
                <h1 className='profile-h'>{name} Overview</h1>
                <div className='content'>
                    <div className='section'>
                        <h3 className='profile-desc'>Biological Gender</h3>
                        <div className="select">
                            <div className="selected">
                                {userGender}
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="arrow">
                                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                                </svg>
                            </div>
                            <div className="options">
                                <div title="option-1">
                                    <input id="option-1" name="option" type="radio" onChange={handleGenderChange} />
                                    <label className="option" htmlFor="option-1" data-txt="Male" />
                                </div>
                                <div title="option-2">
                                    <input id="option-2" name="option" type="radio" onChange={handleGenderChange} />
                                    <label className="option" htmlFor="option-2" data-txt="Female" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='section'>
                        <h3 className='profile-desc'>Birthdate</h3>
                        <input type='date' placeholder='Enter your birthday' className='birthday' value={birthday} onChange={(event) => setBirthday(event.target.value)}/>
                    </div>
                    <div className='section'>
                        <h3 className='profile-desc'>Medical History</h3>
                        {medicalHistory.map((item, index) => (
                            <div className='point'>
                                <h3 className='p' onClick={() => removeItem(index)}>- {item}</h3>
                            </div>
                        ))}
                        <input className='input' placeholder='Add medical history' value={medicalHistoryItem} onChange={handleMedicalHistoryItemAddition} onKeyDown={handleKeyPress}/>
                        {medicalHistoryItem != "" && (<button className='btn' onClick={addMedicalHistoryItem}>Add</button>)}
                    </div>
                    <div className='section'>
                        <h3 className='profile-desc'>Do you drink alcohol?</h3>
                        <input type="checkbox" id="checkboxInput" checked={alcoholIsChecked} onChange={handleAlcoholChange}/>
                        <label htmlFor="checkboxInput" className="toggleSwitch">
                        </label>
                    </div>
                    <div className='section'>
                        <h3 className='profile-desc'>Do you smoke?</h3>
                        <input type="checkbox" id="checkboxInput-2" checked={smokingIsChecked} onChange={handleSmokingChange}/>
                        <label htmlFor="checkboxInput-2" className="toggleSwitch">
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile