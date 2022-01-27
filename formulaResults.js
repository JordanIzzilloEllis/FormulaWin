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
    let initialInfo = createDriverArray(data);
    dispRaceInfo(data);
    dispDriverInfo(initialInfo);
    return initialInfo;
}) 

//This function takes the response from the API and creates an array of driver objects to store and access necessary information about the drivers.
function createDriverArray(apiData) {
    const apiPath = apiData.MRData.RaceTable.Races['0'];
    let driverArray = [];

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

        driverArray.push(Driver);
    }

    console.log('IDEAL EXAMPLE: ', driverArray);

    return driverArray
}

//This function displays the information on the righthand side of the webpage, using data from the API and track maps from the source folder.
function dispRaceInfo(apiData) {
    const apiPath = apiData.MRData.RaceTable.Races['0'];

    //Creating elements I can insert recent race info into, which is all covered under div 'raceInfo'. 
    //Round num & title
    const raceNameElement = document.createElement('div');
    const raceName = document.createTextNode(`Round ${apiPath['round']}: The ${apiPath['raceName']}`);
    raceNameElement.id = 'raceName'
    raceNameElement.appendChild(raceName);
    let selectElement = document.getElementById('raceInfo');
    selectElement.appendChild(raceNameElement)

    //Circuit
    const circuitElement = document.createElement('div');
    const circuit = document.createTextNode(`${apiPath.Circuit['circuitName']}`);
    circuitElement.id = 'circuitName'
    circuitElement.appendChild(circuit);
    selectElement.appendChild(circuitElement);

    //Date
    const dateElement = document.createElement('div');
    const date = document.createTextNode(`${apiPath['date']}`);
    dateElement.id = 'raceDate'
    dateElement.appendChild(date);
    selectElement.appendChild(dateElement);

    //Track Map
    const trackElement = document.createElement('div');
    var trackMapImage = new Image();
    trackMapImage.id = 'mapImage';
    trackElement.id = 'trackMap'
    trackMapImage.src = `Circuits/${apiPath.Circuit['circuitName'].trim()}.png`
    trackElement.append(trackMapImage);
    selectElement.appendChild(trackElement);
}

//This function takes the information from the Driver Array I've made earlier, and displays it on the lefthand side of the page.
function dispDriverInfo(driverInfo, sortType) {
    //Looking at each driver object and writing HTML elements to the page for each driver on the grid.
    
    for (i=0; i < driverInfo.length; i++) {
        console.log(driverInfo[i])
        //this if statement skips drivers who retired in a race when the list is sorted by places gained or places lost.
        if (((sortType == 'PlacesG' || sortType == 'PlacesL') && (driverInfo[i].position === 'R'))){
            continue;
        }

        //This creates the button that will have basic race information for each driver in the race, and allow for drop-down content for further detail.
        var driverButton = document.createElement('button');
        driverButton.id = 'theList';
        driverButton.type = 'button';
        driverButton.classList.add('collapsible');

        /*-------------------------------------------DRIVER BUTTONS----------------------------------------------------*/ 
        let start = parseInt(driverInfo[i].startPosition);
        let finish = parseInt(driverInfo[i].position);
        let diff = finish - start;

        //POSITION FINISHED
        const place = document.createTextNode(`${driverInfo[i].position}`);
        const placeSpan = document.createElement('div'); 
        placeSpan.id = 'resultsDriverPlace';
        placeSpan.appendChild(place);
        driverButton.appendChild(placeSpan);

        //DRIVER NUMBER
        const number = document.createTextNode(`${driverInfo[i].number}`);
        const numBuffer = document.createElement('div');
        const numSpan = document.createElement('div');
        numBuffer.id = `driverNumStyle${i}` 
        numSpan.id = 'resultsDriverNum';
        numBuffer.appendChild(number);
        numSpan.appendChild(numBuffer);
        driverButton.appendChild(numSpan);

        //DRIVER CODE
        const code = document.createTextNode(`${driverInfo[i].code}`);
        const codeSpan = document.createElement('div');
        codeSpan.id = 'resultsDriverCode';
        codeSpan.appendChild(code);
        driverButton.append(codeSpan);

        //DRIVER NAME
        const driver = document.createTextNode(`${driverInfo[i].name}`);
        const nameSpan = document.createElement('div');
        nameSpan.id = 'resultsDriverName';
        nameSpan.append(driver);
        driverButton.append(nameSpan);
        
        //FASTEST LAP
        /*Finding the driver who was awarded the fastest lap of the race, adding this to the 'eachDriver' div. 
        The try-catch was made to stop an error that occured when drivers retired in the first lap, thus not having a lap-time.*/
        try {
            if (driverInfo[i].fastestLapRank == '1') {
            
                const fastestLap = document.createTextNode(`[FL]`);
                const fastestLapSpan = document.createElement('span');
                fastestLapSpan.id = 'resultsFastestLap';
                fastestLapSpan.appendChild(fastestLap);
                driverButton.append(fastestLapSpan);
    
            }
        } catch (TypeError) {
            console.log(`${driverInfo[i].name}: No lap recorded`);
        }  

        //POINTS GAINED
        let pointValue;
        if (sortType == 'PlacesG' || sortType == 'PlacesL') {
            if (driverInfo[i].status == 'Finished' || (driverInfo[i].status.includes('+'))) {
                if (diff < 0) {
                    pointValue = document.createTextNode(`+${Math.abs(diff)}`);
                } else if (diff == 0) {
                    pointValue = document.createTextNode(`${Math.abs(diff)}`);
                } else {
                    pointValue = document.createTextNode(`-${Math.abs(diff)}`);
                }
            } else {
                continue;
                pointValue = document.createTextNode('N/A')  
            }
        } else {
            pointValue = document.createTextNode(`+${driverInfo[i].points}`);
        }
        const pointsSpan = document.createElement('span');
        pointsSpan.id = 'resultsDriverPoints';
        pointsSpan.appendChild(pointValue);
        driverButton.append(pointsSpan);
        /*------------------------------------------------------------------------------------------------------------*/         

        /*---------------------------------------COLLAPSIBLE CONTENT--------------------------------------------------*/
        //This section contains code for the information that's displayed when a user clicks on a driver button created above.

        var extraContent = document.createElement('div');
        extraContent.classList.add('content');

        //DRIVER PORTRAIT 
        const imageElement = document.createElement('div')
        imageElement.id = 'collapseImage';
        var driverImage = new Image();
        driverImage.id = 'imageWithin';
        let filePathName = driverInfo[i].name.replace(/\s/g, '');
        driverImage.src = `DriverPictures/${filePathName}2.png`
        imageElement.appendChild(driverImage);
        extraContent.append(imageElement);

        //TEAM
        const teamElement = document.createElement('div');
        const teamSpanL = document.createElement('span');
        const teamSpanR = document.createElement('span');
        const teamL = document.createTextNode(`Team:`);
        const teamR = document.createTextNode(`${driverInfo[i].team}`);
        teamElement.id = 'collapseTeam';
        teamSpanL.id = 'collapseTeamLeft';
        teamSpanR.id = 'collapseTeamRight';
        teamSpanL.appendChild(teamL);
        teamSpanR.appendChild(teamR);
        teamElement.appendChild(teamSpanL);
        teamElement.appendChild(teamSpanR);
        extraContent.append(teamElement);

        //NATIONALITY
        const nationalityElement = document.createElement('div');
        const nationalitySpanL = document.createElement('span');
        const nationalitySpanR = document.createElement('span');
        const nationalityL = document.createTextNode(`Nationality:`);
        const nationalityR = document.createTextNode(`${driverInfo[i].nationality}`);
        nationalityElement.id = 'collapseNationality';
        nationalitySpanL.id = 'collapseNationalityLeft';
        nationalitySpanR.id = 'collapseNationalityRight';
        nationalitySpanL.appendChild(nationalityL);
        nationalitySpanR.appendChild(nationalityR);
        nationalityElement.appendChild(nationalitySpanL);
        nationalityElement.appendChild(nationalitySpanR);
        extraContent.append(nationalityElement);

        //STARTING POSITION
        const startPosElement = document.createElement('div');
        const startPosSpanL = document.createElement('span');
        const startPosSpanR = document.createElement('span');
        const startPosL = document.createTextNode(`Starting Position:`);
        const startPosR = document.createTextNode(`${driverInfo[i].startPosition}`);
        startPosElement.id = 'collapseStartPos';
        startPosSpanL.id = 'collapseStartPosLeft';
        startPosSpanR.id = 'collapseStartPosRight';
        startPosSpanL.appendChild(startPosL);
        startPosSpanR.appendChild(startPosR);
        startPosElement.appendChild(startPosSpanL);
        startPosElement.appendChild(startPosSpanR);
        extraContent.append(startPosElement);

        //PLACES CHANGED +/-
        const placesChangedElement = document.createElement('div');
        const placesChangedSpanL = document.createElement('span');
        const placesChangedSpanR = document.createElement('span');
        placesChangedElement.id = 'collapsePlacesChanged';
        placesChangedSpanL.id = 'collapsePlacesChangedLeft';
        placesChangedSpanR.id = 'collapsePlacesChangedRight';

        /*Based on the difference in start & finish position, this if-else block helps display '+', '-' or '' in the places changed section 
        of the dropdown content depending on if a driver gained, lost or maintained position in the race.*/
        if (driverInfo[i].status == 'Finished' || (driverInfo[i].status.includes('+'))) {
            if (diff < 0) {

                const placesChangedL = document.createTextNode(`Position Change:`);
                const placesChangedR = document.createTextNode(`+${Math.abs(diff)}`);
                placesChangedSpanL.appendChild(placesChangedL);
                placesChangedSpanR.appendChild(placesChangedR);
                placesChangedElement.appendChild(placesChangedSpanL);
                placesChangedElement.appendChild(placesChangedSpanR);

            } else if (diff == 0) {

                const placesChangedL = document.createTextNode(`Position Change:`);
                const placesChangedR = document.createTextNode(`${Math.abs(diff)}`);
                placesChangedSpanL.appendChild(placesChangedL);
                placesChangedSpanR.appendChild(placesChangedR);
                placesChangedElement.appendChild(placesChangedSpanL);
                placesChangedElement.appendChild(placesChangedSpanR);

            } else {
                const placesChangedL = document.createTextNode(`Position Change:`);
                const placesChangedR = document.createTextNode(`-${Math.abs(diff)}`);
                placesChangedSpanL.appendChild(placesChangedL);
                placesChangedSpanR.appendChild(placesChangedR);
                placesChangedElement.appendChild(placesChangedSpanL);
                placesChangedElement.appendChild(placesChangedSpanR);
            }
        } else {
            const placesChangedL = document.createTextNode(`Position Change:`);
                const placesChangedR = document.createTextNode(`N/A`);
                placesChangedSpanL.appendChild(placesChangedL);
                placesChangedSpanR.appendChild(placesChangedR);
                placesChangedElement.appendChild(placesChangedSpanL);
                placesChangedElement.appendChild(placesChangedSpanR);
        }
        extraContent.append(placesChangedElement)

        //LAPS COMPLETED
        const lapsCompElement = document.createElement('div');
        const lapsCompSpanL = document.createElement('span');
        const lapsCompSpanR = document.createElement('span');
        const lapsCompL = document.createTextNode(`Laps Completed:`);
        const lapsCompR = document.createTextNode(`${driverInfo[i].LapsComp}`);
        lapsCompElement.id = 'collapseLapsComp';
        lapsCompSpanL.id = 'collapseLapsCompLeft';
        lapsCompSpanR.id = 'collapseLapsCompRight';
        lapsCompSpanL.appendChild(lapsCompL);
        lapsCompSpanR.appendChild(lapsCompR);
        lapsCompElement.appendChild(lapsCompSpanL);
        lapsCompElement.appendChild(lapsCompSpanR);
        extraContent.append(lapsCompElement);

        //RACE STATUS
        const statusElement = document.createElement('div');
        const statusSpanL = document.createElement('span');
        const statusSpanR = document.createElement('span');
        statusElement.id = 'collapseStatus';
        statusSpanL.id = 'collapseStatusLeft';
        statusSpanR.id = 'collapseStatusRight';

        /*For the status information, if a driver DNF's (Did Not Finish) this if-else block helps to show the reason for their DNF, 
        otherwise displaying 'Finished' or '+1 Lap', '+2 Laps', ...etc */
        if ((driverInfo[i].status == 'Finished') || (driverInfo[i].status.includes('+'))) {
            const statusL = document.createTextNode(`Status:`);
            const statusR = document.createTextNode(`${driverInfo[i].status}`);
            statusSpanL.appendChild(statusL);
            statusSpanR.appendChild(statusR);
            statusElement.appendChild(statusSpanL);
            statusElement.appendChild(statusSpanR);
        } else {
            const statusL = document.createTextNode(`Status:`);
            const statusR = document.createTextNode(`DNF (${driverInfo[i].status})`);
            statusSpanL.appendChild(statusL);
            statusSpanR.appendChild(statusR);
            statusElement.appendChild(statusSpanL);
            statusElement.appendChild(statusSpanR);
        }
        extraContent.append(statusElement);

        /*------------------------------------------------------------------------------------------------------------*/ 
        
        //Appending the Driver Button & Dropdown content to the HTML container element 'drivers'.
        var selectElement = document.getElementById('drivers');
        selectElement.appendChild(driverButton);
        selectElement.appendChild(extraContent);

        //This function sets the colour of the drivers number to match their team. 
        function driverNumberColour(driverDetails, currentDriver){
            let driverTeam = driverDetails[currentDriver].team
            let teamColours = new Object();

            teamColours['Mercedes'] = {back:'#00d2be', text: '#FFFFFF'};
            teamColours['Red Bull'] = {back:'#0600ef', text: '#FFFFFF'};
            teamColours['Alpine F1 Team'] = {back:'#0090ff', text: '#FFFFFF'};
            teamColours['Aston Martin'] = {back:'#006f62', text: '#FFFFFF'};
            teamColours['Ferrari'] = {back:'#dc0000', text: '#FFFFFF'};
            teamColours['McLaren'] = {back:'#ff8700', text: '#FFFFFF'};
            teamColours['AlphaTauri'] = {back:'#2b4562', text: '#FFFFFF'};
            teamColours['Alfa Romeo'] = {back:'#900000', text: '#FFFFFF'};
            teamColours['Haas F1 Team'] = {back:'#FFFFFF', text: '#000000'};
            teamColours['Williams'] = {back:'#005aff', text: '#FFFFFF'};

            buttonSelect = document.getElementById(`driverNumStyle${currentDriver}`);
            buttonSelect.style.backgroundColor = teamColours[driverTeam].back;
            buttonSelect.style.color = teamColours[driverTeam].text;
        }
        driverNumberColour(driverInfo, i);
    }

    //Code for hiding the collapsible content and displaying it on-click.
    var collapse = document.getElementsByClassName('collapsible');
    for (j = 0; j < collapse.length; j++) {
        collapse[j].addEventListener("click", function() {
            this.classList.toggle("active");
            var colContent = this.nextElementSibling;
            if (colContent.style.display === "block") { 
                colContent.style.display = "none";
            } else {
                colContent.style.display = "block"; 
            }
        });
    }
}

//This function takes the Array of driver objects and sorts it based on which option is selected in the 'Sort By' <select> element 
function sortDriverArray(theArray, sortType) {
    console.log('IM BEING SORTED',theArray)
    if (sortType === 'Finished') {
        //return theArray;
        let sorted = theArray.sort((a, b) => (a.position - b.position)); // ? 1 : -1
        console.log('im sorted', sorted)
        return sorted;
    } else if (sortType === 'PlacesG') {
        let sorted = theArray.sort((a, b) => (a.PlacesGL > b.PlacesGL) ? 1 : -1);
        console.log('SUPPOSEDLY FINISHED SORTING', sorted)
        return sorted;
    } else if (sortType === 'PlacesL') {
        let sorted = theArray.sort((a, b) => (a.PlacesGL < b.PlacesGL) ? 1 : -1);
        return sorted;
    } else if (sortType === 'Team') {
        let sorted = theArray.sort((a, b) => (a.team > b.team) ? 1 : -1);
        return sorted;
    } else {
        return theArray;
    }
}

//Function to remove HTML elements by Class, used to remove dropdown content when a different sort type is selected by the user.
function removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

let sortSelect = document.getElementById('sort');

/*This code listens for a change in the <select> elemement 'sort'. When a value is selected, each driver button & dropdown is removed then replaced by running createDriverArray,
 then sorting the response with sortDriverArray before displaying the driver list again in it's new order with dispDriverInfo.*/
sortSelect.addEventListener("change", function() {
    if (sortSelect.value == 'PlacesG') {
        apiResponse.then(data => {
            let targetList = document.getElementById('drivers');
            let listElementCount = targetList.getElementsByTagName('button').length;

            for (i=0; i < listElementCount; i++) {
                let results = document.getElementById('theList');
                removeElementsByClass('content');
                results.remove();
            }
            
            initialInfo = createDriverArray(data);
            let newArray = sortDriverArray(initialInfo, 'PlacesG');
            dispDriverInfo(newArray, 'PlacesG');
        })
    } else if (sortSelect.value == 'PlacesL') {
        apiResponse.then(data => {
            let targetList = document.getElementById('drivers');
            let listElementCount = targetList.getElementsByTagName('button').length;

            for (i=0; i < listElementCount; i++) {
                let results = document.getElementById("theList");
                removeElementsByClass('content');
                results.remove();
            }

            initialInfo = createDriverArray(data);
            let newArray = sortDriverArray(initialInfo, 'PlacesL');
            dispDriverInfo(newArray, 'PlacesL');
        })
    } else if (sortSelect.value == 'Team') {
        apiResponse.then(data => {
            let targetList = document.getElementById('drivers');
            let listElementCount = targetList.getElementsByTagName('button').length;

            for (i=0; i < listElementCount; i++) {
                let results = document.getElementById("theList");
                removeElementsByClass('content');
                results.remove();
            }

            initialInfo = createDriverArray(data);
            let newArray = sortDriverArray(initialInfo, 'Team');
            dispDriverInfo(newArray, 'Team');
        })
    } else if (sortSelect.value == 'Finished') {
        apiResponse.then(data => {
            let targetList = document.getElementById('drivers');
            let listElementCount = targetList.getElementsByTagName('button').length;

            for (i=0; i < listElementCount; i++) {
                let results = document.getElementById("theList");
                removeElementsByClass('content');
                results.remove();
            }

            initialInfo = createDriverArray(data);
            let newArray = sortDriverArray(initialInfo, 'Finished');
            dispDriverInfo(newArray, 'Finished');
        })
    }
}, false) 
    
console.log('Run Success!')










