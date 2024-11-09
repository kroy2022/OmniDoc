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