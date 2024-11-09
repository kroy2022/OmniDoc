import './Profile.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import { LoadProfileResponse } from './interfaces/ApiResponse';

function Profile() {    
    const location = useLocation();
    const email = location.state.email;
    const name = location.state.name;
    const [medicalHistory, setMedicalHistory] = useState<{"index": number,"item": string}[]>([]);
    const [userGender, setUserGender] = useState<string>("Male");
    const [birthday, setBirthday] = useState<string>('2000-01-01');
    const [medicalHistoryItem, setMedicalHistoryItem] = useState<string>('');
    const [alcoholIsChecked, setAlcoholIsChecked] = useState<boolean>(false);
    const [smokingIsChecked, setSmokingIsChecked] = useState<boolean>(false);

    useEffect(() => {
        //load info from database and fill forms
        const fd = new FormData();
        console.log(email);
        fd.append("email", email);
        axios.post('http://127.0.0.1:5000/get/profile', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(response => loadProfileData(response))
          .catch(error => console.log(error))
    }, [])

    const loadProfileData = (response: LoadProfileResponse) => {
        console.log("LOAD PROFILE RESPONSE: ", response);
        if (response.data.status == 200) {
            setUserGender(response.data.profile.Gender);
            setBirthday(response.data.profile.DOB);
            setAlcoholIsChecked(response.data.profile.Alcohol);
            setSmokingIsChecked(response.data.profile.Smoke);
            setMedicalHistory(response.data.profile.History);
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key == "Enter") {
            addMedicalHistoryItem();        
        }
    }

    const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedGender = event.target.nextElementSibling?.getAttribute('data-txt');
        setUserGender(selectedGender || "");
    };

    const handleMedicalHistoryItemAddition = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMedicalHistoryItem(event.target.value);
    }

    const addMedicalHistoryItem = () => {
        const fd = new FormData();
        fd.append("user_id", email);
        fd.append("update_type", "add");
        fd.append("item", medicalHistoryItem);
        axios.post('http://127.0.0.1:5000/update/medical/item', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          })
          .then((response) => {
            console.log("add item", response);
            if (response.data.status == 200) {
                let tempHistory = [...medicalHistory, {"item": medicalHistoryItem, "index": response.data.id}];
                console.log("TEMP HISTORY: ", tempHistory);
                setMedicalHistory(tempHistory);
                setMedicalHistoryItem('');
            }
          })
          .catch(error => console.log(error))
    }

    //add db index to remove from db
    const removeItem = (index: number, dbIndex: number = 0) => {
        const fd = new FormData();
        fd.append("user_id", email);
        fd.append("update_type", "delete");
        fd.append("id", dbIndex.toString());
        axios.post('http://127.0.0.1:5000/update/medical/item', fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
            })
            .then((response) => {
                console.log("delete item response: ", response);
                if (response.data.status == 200) {
                    const temp = medicalHistory.filter((_, i) => i !== index);
                    setMedicalHistory(temp);
                }
            })
            .catch(error => console.log(error))
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
                        {medicalHistory && medicalHistory.map((medicalItem, index) => (
                            <div className='point'>
                                <h3 className='p' onClick={() => removeItem(index, medicalItem.index)}>- {medicalItem.item}</h3>
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