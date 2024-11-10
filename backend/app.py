from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect 
from create_pdf import make_pdf
from keys import OPENAI_KEY, SUPABASE_KEY, SUPABASE_URL
import os, time
from supabase import create_client, Client
from openai import OpenAI
from pathlib import Path
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
# import winsound
# from pydub import AudioSegment
# from pydub.playback import play
from pydub import AudioSegment
import simpleaudio as sa
import pygame
from create_vector_db import query_db
from create_pdf import make_pdf
from threading import Thread, Event

app = Flask(__name__)
CORS(app)
csrf = CSRFProtect(app)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_KEY)
llm = ChatOpenAI(temperature=0.7, api_key=OPENAI_KEY)
AudioSegment.converter = r"C:\ffmpeg\bin\ffmpeg.exe"
AudioSegment.ffmpeg = r"C:\ffmpeg\bin\ffmpeg.exe"
AudioSegment.ffprobe = r"C:\ffmpeg\bin\ffprobe.exe"

# Initialize prompt templates with input_variables
symptom_question_template = PromptTemplate(
    input_variables=[], 
    template="You are a nurse talking to a patient. Generate a question about asking about only what symptoms they are experiencing."
)

severity_question_template = PromptTemplate(
    input_variables=["question", "answer"],
    template="Previous question: {question}\nPrevious answer: {answer}\nGenerate a question about symptom severity, show sympathy for their illness by mentioning their symptoms."
)

date_question_template = PromptTemplate(
    input_variables=["question", "answer"],
    template="Previous question: {question}\nPrevious answer: {answer}\nGenerate a question about symptom date, show sympathy for their illness by taalking about what they are feeling."
)
question_flow = [symptom_question_template, severity_question_template, date_question_template]

@app.route("/next/question", methods=["POST"])
@csrf.exempt
def next_question():
    try:
        current_question_index = int(request.form.get("current_index"))

        user_answer = request.form.get("answer")
        last_question = request.form.get("question")
        report_id = request.form.get("report_id")
        user_id = request.form.get("user_id")

        if current_question_index < len(question_flow):
            template = question_flow[current_question_index]
            if current_question_index == 0:
                question = llm.predict(template.format())
            else:
                question = llm.predict(template.format(
                    question=last_question,
                    answer=user_answer
                ))            
            print("AI QUESTION: ", question)
            audio_path = text_to_speech(question)
            if audio_path:
                try:
                    play_audio(audio_path)
                except Exception as e:
                    print(f"Error playing audio with playsound: {e}")

            return jsonify({
                "status": 200,
                "current_index": current_question_index + 1,
                "question": question
            })
        else:
            question = "Thank you! We are creating your report! Feel better soon."
            audio_path = text_to_speech(question)
            if audio_path:
                try:
                    play_audio(audio_path)
                except Exception as e:
                    print(f"Error playing audio with playsound: {e}")
            
            symptom_col = supabase.table("Reports").select("Symptoms").eq("Report_ID", report_id).execute()
            symptoms = symptom_col.data[0]["Symptoms"]
            reccomended = query_db(symptoms)
            supabase.table('Reports').update({ 
                'Recommended_Action': reccomended 
            }).eq('Report_ID', report_id).execute()

            thread = Thread(target=send_email, args=(report_id, user_id))
            thread.start()

            return jsonify({
                "status": 201,
            })
        
    except Exception as e:
        print(str(e))
        return jsonify({
            "status": 500,
            "message": str(e)
        })



def send_email(report_id, user_id):
    report_info = supabase.table('Reports').select('*').eq('Report_ID', report_id).execute()
    print("THREAD REPORT INFO: ", report_info)
    report = report_info.data[0]

    person_info = supabase.table('Users').select('*').eq('User_ID', user_id).execute()
    print("THREAD PERSON INFO: ", person_info)
    person = person_info.data[0]

    medical_history = get_medical_history(user_id)
    print("M H: ", medical_history)
    make_pdf(person["Name"], report_id, person["DOB"], user_id, person["Gender"], report["Date"], report["Severity"], report["Symptoms"], medical_history, report["Recommended_Action"])


def play_audio(file_path):
    try:
        pygame.mixer.init()
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():  # wait for audio to finish playing
            pygame.time.Clock().tick(10)
        pygame.mixer.quit()
    except Exception as e:
        print(f"Error playing audio with pygame: {e}")
    
@app.route("/upload/audio", methods=["POST"])
@csrf.exempt
def upload_audio():
    audio = request.files.get("audio")
    print("AUDIO: ", audio)
    try:
        if audio:
            filename = f"recording_{int(time.time())}.wav"
            downloads_path = os.path.join("C:\\Users\\kevin\\Downloads", filename)

            # Save the audio file to Downloads
            audio.save(downloads_path)

            print(f"Audio file saved at: {downloads_path}, Size: {os.path.getsize(downloads_path)} bytes")
            
            # Get the absolute path
            full_path = os.path.abspath(downloads_path)
            text = speech_to_text(full_path) 
            print("USER SAID: ", text)

            user_id = request.form.get("user_id")
            index = request.form.get("index")
            report_id = request.form.get("report_id")

            if index == "1":
                status = add_symptoms(text, user_id, report_id)
            elif index == "2":
                status = add_severity(text, report_id)
            else:
                status = add_date_started(text, report_id)

            if status == False:
                raise Exception

        return jsonify({
            "status": 200,
            "answer": text,
        })
    
    except Exception as e:
        print("upload audio error: ", str(e))
        return jsonify({
            "status": 500,
            "message": str(e)
        })
    
def add_symptoms(text, user_id, report_id):
    try:
        response = supabase.table('Reports').insert({
                'Report_ID': report_id,
                'User_ID': user_id,
                'Symptoms': text
            }).execute()
        
        if response.data:
            return True
        else:
            return False
        
    except Exception as e:
        print(f"Error updating report severity: {e}")
        return False

def add_severity(text, report_id):
    try:
        response = supabase.table('Reports').update({ 
            'Severity': text 
        }).eq('Report_ID', report_id).execute()
        
        # Verify the update was successful
        if response.data:
            return True  # or return response.data if you need the updated record
        else:
            print("No rows were updated")
            return False

    except Exception as e:
        print(f"Error updating report severity: {e}")
        return False
    
def add_date_started(text, report_id):
    try:
        response = supabase.table('Reports').update({ 
            'Date': text 
        }).eq('Report_ID', report_id).execute()
        
        if response.data:
            return True
        else:
            return False
        
    except Exception as e:
        print(f"Error updating report date started: {e}")
        return False

def speech_to_text(path):
    audio_file= open(path, "rb")

    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file
    )
    print(transcription.text)
    return transcription.text

def text_to_speech(question):
    print("\nIN TEXT TO SPEECH\n")
    try:
        # Set FFmpeg paths
        AudioSegment.converter = r"C:\ffmpeg\bin\ffmpeg.exe"
        AudioSegment.ffmpeg = r"C:\ffmpeg\bin\ffmpeg.exe"
        AudioSegment.ffprobe = r"C:\ffmpeg\bin\ffprobe.exe"

        # Get absolute path for output file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(current_dir, "output_audio.mp3")

        # Create the audio
        response = client.audio.speech.create(
            model="tts-1",
            voice="echo",
            input=question
        )

        # Write the file
        with open(output_path, "wb") as file:
            bytes_written = 0
            for chunk in response.iter_bytes():
                if chunk:
                    bytes_written += len(chunk)
                    file.write(chunk)
                    file.flush()
            
            print(f"Audio file written to: {output_path}")
            print(f"File exists: {os.path.exists(output_path)}")
            print(f"File size: {os.path.getsize(output_path)} bytes")

        # Verify file was created successfully
        if bytes_written == 0:
            print("Error: No data received from API")
            return False

        return output_path  # Return the absolute path

    except Exception as e:
        print(f"Error in text_to_speech: {e}")
        return False

@app.route('/login', methods=["POST"])
@csrf.exempt
def login():
    try: 
        get_user = request.form.get("email")
        response = supabase.table("Users").select("User_ID").eq("User_ID", get_user).execute()
        if not get_user or not response.data:
            return jsonify({
                "status": 400,
                "error": "Username not found"
            })
        elif response.data:
            return jsonify({
                "status": 200,
                "message": "Welcome!"
            })
        
        print(response.data)

    # make_pdf("Kevin Roy", "253384sdf", "12/09/2003", "kevinroy2015@gmail.com", "Male", "Severe Headache", "3 days ago", "7/10", "coughing, can't sleep, can't breathe", "nothing", "take advil twice a day for 5 days")

    # response = requests.get("https://odphp.health.gov/myhealthfinder/api/v3/myhealthfinder.json?age=10&sex=male")
    # response = response.json()
        

    except Exception as e:
        return jsonify({
            "status": 500,
            "error": str(e)
        })


@app.route('/dashboard', methods=["POST"])
@csrf.exempt
def get_dashboard_info():
    user_id = request.form.get("user_id")
    try:
        report_info = supabase.table('Reports').select('*').eq('User_ID', user_id).execute()        
        reports = report_info.data
    
        # Create an empty list to hold the report objects
        report_objects = []
        
        # Loop through each report and create a dictionary (or object) for it
        for report in reports:
            report_object = {
                "Report_ID": report.get('Report_ID'),
                "User_ID": report.get('User_ID'),
                "Date": report.get('Date'),
                "Time": report.get('Time'),
                "Recommended_Action": report.get('Recommended_Action'),
                "Severity": report.get('Severity'),
                "Symptoms": report.get('Symptoms')
            }        
            # Append the report object to the list
            report_objects.append(report_object)

        return jsonify({
            "status": 200,
            "reports": report_objects
        })
    
    except Exception as e:
        print(str(e))
        return jsonify({
            "status": 500,
            "message": str(e)
        })


@app.route('/get/profile', methods=["POST"])
@csrf.exempt
def get_profile_info():
    user_id = request.form.get("email")

    try:
        profile_info_response = supabase.table("Users").select('"Is_Doctor", "DOB", "Gender", "Alcohol", "Smoke"').eq("User_ID", user_id).execute()
        profile_info = profile_info_response.data

        profile = profile_info[0]
        profile["History"] = get_medical_history(user_id)

        return jsonify({
            "status": 200,
            "profile": profile
        })
    except Exception as e:
        print(str(e))
        return jsonify({
            "status": 500,
            "message": str(e)
        })
    
@app.route('/update/medical/item', methods=["POST"])
@csrf.exempt
def update_medical_item():
    user_id = request.form.get("user_id")
    update_type = request.form.get("update_type")

    if update_type == "add":
        item = request.form.get("item")

        response = supabase.table('Medical_History').insert({
            'Medical_History_Item': item,
            'User_ID': user_id
        }).execute()

        print(response)

        print("RESPONSE: ", response.data)

        medical_history_id = response.data[0]["Medical_History_ID"]
        print("ID: ", medical_history_id)

        return jsonify({
            "status": 200,
            "id": medical_history_id
        })
    
    else:
        id = request.form.get("id")
        response = supabase.table('Medical_History').delete().eq("User_ID", user_id).eq("Medical_History_ID", id).execute()
        
        if response:
            print("valid")
            return jsonify({
                "status": 200
            })
        else:
            print("invalid")
            return jsonify({
                "status": 500,
            })

@app.route('/get/medical/history', methods=["POST"])
@csrf.exempt
def api_get_medical_history():
    user_id = request.form.get("user_id")
    history = get_medical_history(user_id)

    return jsonify({
        "status": 200,
        "history": history
    })


def get_medical_history(user_id):
    try:
        history_info_response = supabase.table("Medical_History").select('"Medical_History_ID", "Medical_History_Item"').eq("User_ID", user_id).execute()
        history_info = history_info_response.data
        history = []
        for item in history_info:
            history.append({
                "index": item["Medical_History_ID"],
                "item": item["Medical_History_Item"]
            })
        
        return history
    except Exception as e:
        print(str(e))
        return []
