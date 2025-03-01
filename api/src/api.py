import time
from flask import Flask

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

app = Flask(__name__)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}