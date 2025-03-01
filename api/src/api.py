import time
from flask import Flask, request
from openai import AzureOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

ILLINOIS_COORDINATES = ["40 51 59 N, 88 40 14 W", "40 51 59 N, 88 40 05 W", "40 51 50 N, 88 40 14 W", "40 51 50 N, 88 40 05 W"]
NORTH_DAKOTA_COORDINATES = ["46 52 08 N, 91 17 04 W", "46 52 07 N, 97 16 27 W", "46 52 30 N, 97 16 27 W", "46 52 30 N, 97 17 04 W"]
NORTH_DAKOTA_EQUIPMENT = [
    {
        "owner": "FARMER",
        "eqp_type": "Air Drill No-Till Planter",
        "speed(MPH)": 4.5,
        "soil_type": "silt loam",
        "width(ft)": 40,
        "operating_cost($/acre)": 47.5
    },
    {
        "owner": "FARMER",
        "for": "wheat/small grains",
        "eqp_type": "Air Seeder with Independent Disc Coulters (minimal tillage seeding)",
        "speed(MPH)": 5,
        "soil_type": "silt loam",
        "width(ft)": 50,
        "operating_cost($/acre)": 39
    },
    {
        "owner": "FARMER",
        "for": "light residue management",
        "eqp_type": "light vertical tillage tool",
        "speed(MPH)": 6,
        "soil_type": "silt loam",
        "width(ft)": 35,
        "operating_cost($/acre)": 42.5
    },
    {
        "owner": "CO-OP HIRED",
        "for": "strip-till service",
        "eqp_type": "Strip-Till Implement (8-row or 12-row unit)",
        "time_per_acre(hrs)": 0.2,
        "cost($/acre)": 55
    },
    {
        "owner": "CO-OP HIRED",
        "for": "custom heavy discing service",
        "eqp_type": "Large Offset Disc Harrow (aggressive residue incorporation)",
        "time_per_acre(hrs)": 0.3,
        "cost($/acre)": 50
    }
]
ILLINOIS_EQUIPMENT = [
    {
        "owner": "FARMER",
        "eqp_type": "16-row no-till planter",
        "speed(MPH)": 5,
        "soil_type": "silty clay loam",
        "width(ft)": 30,
        "operating_cost($/acre)": 55
    },
    {
        "owner": "FARMER",
        "for": "secondary tillage/seedbed prep",
        "eqp_type": "High-Speed Disk (e.g., Salford Halo or similar)",
        "speed(MPH)": 8,
        "soil_type": "silty clay loam",
        "width(ft)": 30,
        "operating_cost($/acre)": 50
    },
    {
        "owner": "FARMER",
        "for": "secondary tillage",
        "eqp_type": "large tandem disc harrow",
        "speed(MPH)": 6,
        "soil_type": "silty clay loam",
        "width(ft)": 35,
        "operating_cost($/acre)": 60
    },
    {
        "owner": "CO-OP HIRED",
        "for": "Commercial Deep Rip and Cover Crop Service",
        "eqp_type": "Deep Ripper with Cover Crop Seeder Attachment",
        "time_per_acre(hrs)": 0.4,
        "cost($/acre)": 75
    },
    {
        "owner": "CO-OP HIRED",
        "for": "Custom Moldboard Plowing (less common now, but still used in some situations)",
        "eqp_type": "Large Moldboard Plow",
        "time_per_acre(hrs)": 0.5,
        "cost($/acre)": 90
    }
]

client = AzureOpenAI(
    api_key=os.getenv("API_KEY"),
    api_version="2024-10-21",
    azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT')
)

endpoints = {
    "gpt_40": "gpt-4o-2",
    "gpt_o1_mini": "o1-mini"
}


app = Flask(__name__)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/user_chatbot_request')
def chatbot_reponse():
    farmNumber = request.args.get('farmNum', type = int)
    chatbot_text = request.args.get('text', type = str)
    image = request.args.get('image', default='NO_IMAGE', type=str)
    
    ILLINOIS_FARM_NUMBER = 1
    NORTH_DAKOTA_FARM_NUMBER = 2

    farmContext = {}

    if farmNumber == ILLINOIS_FARM_NUMBER:
        farmContext['coordinates'] = ILLINOIS_COORDINATES
        farmContext['available_equipment'] = ILLINOIS_EQUIPMENT
    elif farmNumber == NORTH_DAKOTA_FARM_NUMBER:
        farmContext['coordinates'] = NORTH_DAKOTA_COORDINATES
        farmContext['available_equipment'] = NORTH_DAKOTA_EQUIPMENT

    chatbot_system_content = "You are an AI chatbot that analyzes farm and environmental conditions to suggest optimal tillage dates, methods, and cost comparisons to a farmer. Create clear, data-driven insights that empower the farmer to make smart, sustainable decisions!"
    
    if farmContext != {}:
        chatbot_system_content += "Here is some context about the farm the user owns: " + str(farmContext)

    chatbot_user_content = [
        {
         'type': 'text',
         'text': chatbot_text
        }
    ]
    if (image != 'NO_IMAGE'):
        chatbot_user_content.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image}"
                }
            }
        )

    data = {
        "messages": [
            {"role": "system", "content": chatbot_system_content},
            {"role": "user", "content": chatbot_user_content}
        ]
    }

    response = client.chat.completions.create(
        model=endpoints["gpt_40"],
        messages=data["messages"]
    )
    return response.choices[0].message.content