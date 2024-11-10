from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect 
from create_pdf import make_pdf
import requests, json
from keys import SUPABASE_KEY, SUPABASE_URL
import os
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)
csrf = CSRFProtect(app)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.route('/login', methods=["POST"])
@csrf.exempt
def login():
    try: 
        get_user = request.form.get("email")
        print("recieved mail", get_user)
        response = supabase.table("Users").select("User_ID").eq("User_ID", get_user).execute()
        print("response", response)
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
    return {}


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
        print(user_id)
        history_info_response = supabase.table("Medical_History").select('"Medical_History_ID", "Medical_History_Item"').eq("User_ID", user_id).execute()
        history_info = history_info_response.data
        print("HISTORY INFO: ", history_info_response)
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

