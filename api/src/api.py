import time
from flask import Flask, request
from openai import AzureOpenAI
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import os
import json
from enum import Enum
from datetime import datetime

load_dotenv()

ILLINOIS_FARM_SIZE = 14.6 #acres
NORTH_DAKOTA_FARM_SIZE = 136.4 #acres
NORTH_DAKOTA_EQUIPMENT = [
    {
        "owner": "FARMER",
        "eqp_type": "Air Drill No-Till Planter",
        "speed(MPH)": 4.5,
        "soil_type": "silt loam",
        "width(ft)": 40,
        "total_cost_of_this_option": 47.5 * NORTH_DAKOTA_FARM_SIZE
    },
    {
        "owner": "FARMER",
        "for": "wheat/small grains",
        "eqp_type": "Air Seeder with Independent Disc Coulters (minimal tillage seeding)",
        "speed(MPH)": 5,
        "soil_type": "silt loam",
        "width(ft)": 50,
        "total_cost_of_this_option": 39 * NORTH_DAKOTA_FARM_SIZE
    },
    {
        "owner": "FARMER",
        "for": "light residue management",
        "eqp_type": "light vertical tillage tool",
        "speed(MPH)": 6,
        "soil_type": "silt loam",
        "width(ft)": 35,
        "total_cost_of_this_option": 42.5 * NORTH_DAKOTA_FARM_SIZE
    },
    {
        "owner": "CO-OP HIRED",
        "for": "strip-till service",
        "eqp_type": "Strip-Till Implement (8-row or 12-row unit)",
        "time_per_acre(hrs)": 0.2,
        "total_cost_of_this_option": 55 * NORTH_DAKOTA_FARM_SIZE
    },
    {
        "owner": "CO-OP HIRED",
        "for": "custom heavy discing service",
        "eqp_type": "Large Offset Disc Harrow (aggressive residue incorporation)",
        "time_per_acre(hrs)": 0.3,
        "total_cost_of_this_option": 50 * NORTH_DAKOTA_FARM_SIZE
    }
]
ILLINOIS_EQUIPMENT = [
    {
        "owner": "FARMER",
        "eqp_type": "16-row no-till planter",
        "speed(MPH)": 5,
        "soil_type": "silty clay loam",
        "width(ft)": 30,
        "total_cost_of_this_option": 55 * ILLINOIS_FARM_SIZE
    },
    {
        "owner": "FARMER",
        "for": "secondary tillage/seedbed prep",
        "eqp_type": "High-Speed Disk (e.g., Salford Halo or similar)",
        "speed(MPH)": 8,
        "soil_type": "silty clay loam",
        "width(ft)": 30,
        "total_cost_of_this_option": 50 * ILLINOIS_FARM_SIZE
    },
    {
        "owner": "FARMER",
        "for": "secondary tillage",
        "eqp_type": "large tandem disc harrow",
        "speed(MPH)": 6,
        "soil_type": "silty clay loam",
        "width(ft)": 35,
        "total_cost_of_this_option": 60 * ILLINOIS_FARM_SIZE
    },
    {
        "owner": "CO-OP HIRED",
        "for": "Commercial Deep Rip and Cover Crop Service",
        "eqp_type": "Deep Ripper with Cover Crop Seeder Attachment",
        "time_per_acre(hrs)": 0.4,
        "total_cost_of_this_option": 75 * ILLINOIS_FARM_SIZE
    },
    {
        "owner": "CO-OP HIRED",
        "for": "Custom Moldboard Plowing (less common now, but still used in some situations)",
        "eqp_type": "Large Moldboard Plow",
        "time_per_acre(hrs)": 0.5,
        "total_cost_of_this_option": 90 * ILLINOIS_FARM_SIZE
    }
]

#1999-2023
ILLINOIS_CROP_HISORY = ['corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'corn', 'soybeans', 'idle', 'soybeans', 'corn', 'soybeans', 'corn']

NORTH_DAKOTA_CROP_HISTORY = ['spring wheat', 'spring wheat & barley', 'soybeans', 'soybeans', 'soybeans & sugarbeets', 'soybeans', 'soybeans', 'spring wheat & barley', 'spring wheat', 'soybeans', 'soybeans', 'soybeans', 'soybeans & spring wheat', 'soybeans', 'soybeans & corn', 'soybeans', 'corn', 'soybeans', 'soybeans', 'spring wheat', 'soybeans', 'soybeans', 'corn', 'soybeans', 'corn']

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


class TillageOption(BaseModel):
    equipment: str
    total_cost_of_this_option: float


class RainfallTrend(Enum):
    INCREASING = 1
    STEADY = 2
    DECREASING = 3

class FieldSpecificRecommendations(BaseModel):
    soil_type: str
    rainfall_trend: RainfallTrend
    previously_planted_crop: str


class TillageDates(BaseModel):
    optimal_spring_tillage_date: str
    optimal_fall_tillage_date: str
    reason_for_tillage_dates: str

class TillageRecommendation(BaseModel):
    benefits: list[str]
    field_specific_factors: FieldSpecificRecommendations
    primary_option: TillageOption
    alternative_option_1: TillageOption
    alternative_option_2: TillageOption
    summary_info_blurb: str
    response_to_user_question: str
    tillage_dates: TillageDates

@app.route('/user_chatbot_request', methods=['GET', 'POST'])
def chatbot_response():
    if request.method == 'POST':
        data = request.get_json()
        farmNumber = data.get('farmNum', None)
        chatbot_text = data.get('text', '')
        image = data.get('image', 'NO_IMAGE')
    else:  # GET request
        farmNumber = request.args.get('farmNum', type=int)
        chatbot_text = request.args.get('text', type=str)
        image = request.args.get('image', default='NO_IMAGE', type=str)
    
    ILLINOIS_FARM_NUMBER = 1
    NORTH_DAKOTA_FARM_NUMBER = 2

    farmContext = {}

    txt_file_name = ""

    if farmNumber == ILLINOIS_FARM_NUMBER:
        farmContext['farm_size(acres)'] = ILLINOIS_FARM_SIZE
        farmContext['available_equipment'] = ILLINOIS_EQUIPMENT
        farmContext['crops_planted(1999-2023)'] = ILLINOIS_CROP_HISORY
        farmContext['farm_location'] = "Illinois, near 40.51.59 N 88.40.14W"
        txt_file_name = "src/ILLINOIS_WEATHER_SOIL.txt"
    elif farmNumber == NORTH_DAKOTA_FARM_NUMBER:
        farmContext['farm_size(acres)'] = NORTH_DAKOTA_FARM_SIZE
        farmContext['available_equipment'] = NORTH_DAKOTA_EQUIPMENT
        farmContext['crops_planted(1999-2023)'] = NORTH_DAKOTA_CROP_HISTORY
        farmContext['farm_location'] = "North Dakota, near 46.52.08 N 97.17.04 W"
        txt_file_name = "src/NORTH_DAKOTA_WEATHER_SOIL.txt"

    content = ""
    with open(txt_file_name, "r") as file:
        content = file.read()
    print(content)
    
    farmContext["historical_weather_and_soil_data"] = content

    chatbot_system_content = "You are an AI chatbot that analyzes the given farm and environmental conditions to suggest optimal tillage dates, methods, and cost comparisons to the farmer, whom you are talking to. Create clear, data-driven insights that empower the farmer to make smart, sustainable tillage decisions. You may only pick from the options available to the farmer. Remember that the current date is " + datetime.today().strftime('%Y-%m-%d')
    
    if farmContext != {}:
        chatbot_system_content += "Here is some context about the farm the user owns, including the size of the farm and the equipment and services available: " + str(farmContext)

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

    response = client.beta.chat.completions.parse(
        model=endpoints["gpt_40"],
        messages=data["messages"],
        response_format=TillageRecommendation
    )

    return json.loads(response.choices[0].message.content)