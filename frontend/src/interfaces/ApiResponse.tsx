/*
This file is for all bodies of an api response
(body of the response from the backend to the frontend)
*/

export interface LoginResponse {
    data: {
        status: number
    }
}

export interface LoadProfileResponse {
    data: {
        status: number,
        profile: {
            "Is_Doctor": boolean,
            "DOB": string,
            "Gender": string,
            "Alcohol": boolean,
            "Smoke": boolean,
            "History": [{
                "index": number,
                "item": string
            }]
        }
    }
}

export interface Report {
    Report_ID: string;
    User_ID: string;
    Date: string;
    Time: string;
    Recommended_Action: string;
    Severity: string;
    Symptoms: string;
  }
  
  export interface LoadDashboardResponse {
    data: {
      status: number;
      reports: Report[]; 
    };
  }