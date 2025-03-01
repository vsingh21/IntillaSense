import time
from flask import Flask

ILLINOIS_COORDINATES = ["40 51 59 N, 88 40 14 W", "40 51 59 N, 88 40 05 W", "40 51 50 N, 88 40 14 W", "40 51 50 N, 88 40 05 W"]
NORTH_DAKOTA_COORDINATES = ["46 52 08 N, 91 17 04 W", "46 52 07 N, 97 16 27 W", "46 52 30 N, 97 16 27 W", "46 52 30 N, 97 17 04 W"]

app = Flask(__name__)

@app.route('/time')
def get_current_time():
    return {'time': time.time()}