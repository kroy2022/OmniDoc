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