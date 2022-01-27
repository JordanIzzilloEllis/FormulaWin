import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(express.static('public'));
app.use(cors());

app.listen(port, () => console.log('listening at 4000'))

//The API I'll be using that has Formula 1 race data.
let theUrl = 'http://ergast.com/api/f1/current/last/results.json';
let testUrl = 'https://ergast.com/api/f1/2021/14/results.json' 

//Fetching the information from the API.
let apiResponse;
apiResponse = fetch(theUrl)
    .then(response => {
        return response.json();
    })
    .then(data => {
        let stringData = JSON.stringify(data);
        let parsedData = JSON.parse(stringData);
        return parsedData;
    })

//The initial run of the script, displaying information about the race and the drivers results.
apiResponse.then(data => {
    let driverInfo = createDriverArray(data);
    let raceInfo = createRaceDataArray(data);

    let allData = {
        driverData: driverInfo,
        raceData: raceInfo
    }

    console.log(driverInfo)

    app.get('/requiredInfo', (req, res) => {
        res.json(allData);
    })

    return allData;
}) 

//This function takes the response from the API and creates an array of driver objects to store and access necessary information about the drivers.
function createDriverArray(apiData) {
    const apiPath = apiData.MRData.RaceTable.Races['0'];
    let driverArray = [];
    let i;
    for (i=0; i < apiPath.Results.length; i++) {
        
        if ((apiPath.Results[i]['positionText'] == 'W')){
            continue;
        }
        
        let Driver = new Object();

        Driver['position'] = apiPath.Results[i]['positionText'];
        Driver['number'] = apiPath.Results[i]['number'];
        Driver['code'] = apiPath.Results[i].Driver['code'];
        Driver['name'] = `${apiPath.Results[i].Driver['givenName']} ${apiPath.Results[i].Driver['familyName']}`;
        Driver['fastestLapRank'] = apiPath.Results[i].FastestLap['rank'];
        Driver['points'] = apiPath.Results[i]['points'];
        Driver['team'] = apiPath.Results[i].Constructor['name'];
        Driver['nationality'] = apiPath.Results[i].Driver['nationality'];
        Driver['startPosition'] = apiPath.Results[i]['grid'];

        let start = parseInt(apiPath.Results[i]['grid']);
        let finish = parseInt(apiPath.Results[i]['position']);
        let diff = finish - start;
        Driver['PlacesGL'] = diff;

        Driver['LapsComp'] = apiPath.Results[i]['laps'];
        Driver['status'] = apiPath.Results[i]['status']

        try {
            if (apiPath.Results[i].FastestLap['rank'] == '1') {
            
                Driver['FastestLap'] = 'yes'
    
            } else {

                Driver['FastestLap'] = 'no'

            }
        } catch (TypeError) {
            console.log(`${driverInfo[i].name}: No lap recorded`);
        }

        driverArray.push(Driver);
    }

    return driverArray
}

function createRaceDataArray(apiData){
    const apiPath = apiData.MRData.RaceTable.Races['0'];
    let raceArray = [];
    let Race = new Object();

    Race['name'] = apiPath['raceName'];
    Race['round'] = apiPath['round'];
    Race['circuit'] = apiPath.Circuit['circuitName'];
    Race['date'] = apiPath['date'];

    raceArray.push(Race);

    return raceArray;
}


