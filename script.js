const launch = document.getElementById('launch');
const abort = document.getElementById('abort');
const boost = document.getElementById('boost');

const altitude_Text = document.getElementById('altitude')
const speed_Text = document.getElementById('speed')
const fuel_Text = document.getElementById('fuel')

const mission_log = document.getElementById('log')

let launch_state = "idle"
let fuel;
let speed;
let altitude;

let interval = null;

async function getData(url) {
    let response = await fetch(url);
    let data = await response.json()
    return data
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

function message(params) {
    const log = document.createElement('p')
    log.innerHTML = `${params}`
    mission_log.appendChild(log)
    
}

async function updateData() {

    const data = await getData('/api/data/telemetry')
    fuel = data.fuel
    speed = data.speed
    altitude = data.altitude
    if (fuel <= 0 && launch_state == "launched") {
        message('Fuel Ended 0%')
        launch_state = "idle"
        fuel_Text.innerHTML = `0`
        speed_Text.innerHTML = `0`
        altitude_Text.innerHTML = `0`
    } 
    fuel_Text.innerHTML = `Fuel: ${fuel}%`
    speed_Text.innerHTML = `Speed: ${speed} km`
    altitude_Text.innerHTML = `Altitude ${altitude} km`
}

launch.addEventListener('click', async () => {
    if (launch_state == 'idle') {
         const data = await getData('/api/data/telemetry')
        fuel = data.fuel
        if (fuel <= 0) {
            message('Not Enough Fuel To Launch!')
            return
        }
        for (let i = 0; i < 3; i++) {
            message(`Launching in ${i}`)
            await sleep(1000)
        }
        
        if (!interval) {

            interval = setInterval(updateData, 1000)

        }
        

        message(`[SYSTEM] launched Fuel: ${fuel}% Speed: ${speed} km Altitude: ${altitude} km`)
        
        launch_state = "launched"


        fetch('/api/launch', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                start: true
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })


    } else if (launch_state == "launched") {
        launch_state = "idle"
        fuel_Text.innerHTML = `0`
        speed_Text.innerHTML = `0`
        altitude_Text.innerHTML = `0`
    }
});

boost.addEventListener('click', () => {
    if (launch_state == "launched") {
        fetch('/api/launch', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                start: true,
                boost: true
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })

    }
})