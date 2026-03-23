from flask import *
import threading
import time

app = Flask(__name__)

launch_state = False
altitude = 0
fuel = 100
speed = 0

burn = 1


def wait_for_launch():
    global launch_state, altitude, fuel, speed, burn
    while True:
        if not launch_state:
            time.sleep(0.1)
            continue
        if launch_state == True:
            if fuel >= 60:
                if burn == 1:
                    speed = round(fuel * 0.25)
                elif burn == 2:
                    speed = round(fuel * 0.50)
                altitude = altitude + 100 + speed

                fuel -= burn
                time.sleep(1)
            
            else:
                speed = round(fuel * 0.10)
                altitude = altitude + 100 + speed
                fuel -= burn
                time.sleep(1)
            if fuel <= 0:
                fuel = 0
                speed = 0
                launch_state = False
            if fuel < 30:
                burn = 1
                
threading.Thread(target=wait_for_launch, daemon=True).start()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/data/telemetry')
def api_telemetry():
    return jsonify({'fuel': fuel, 'altitude': altitude, 'speed': speed})

@app.route('/api/launch', methods=['POST'])
def launch_Receiver():
    global launch_state, burn
    data = request.get_json()
    if data.get('start'):
        launch_state = True
        if data.boost and data.boost == True:
            burn = 2
        return jsonify({"message": "Launch triggered!"})
    return jsonify({"error": "Invalid"}), 400
    
if __name__ == "__main__":
    app.run(debug=True)



