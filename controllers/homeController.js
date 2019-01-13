"use strict";
// Accessing the console running on the single main thread
const con = require('electron').remote.getGlobal('console');
const DatabaseManager = require('../assets/databaseManager.js');
const Job = require('../assets/job.js');


const tableArea = document.getElementById('table-area');
const popup = document.getElementById('popup');
const newJobContainer = document.getElementById("new-job-container");
const newJobLocation = document.getElementById('new-job-location');
const navbar = document.getElementById('navbar');
const newJobDate = document.getElementById('new-job-date');
const newJobStartTime = document.getElementById('new-job-start-time');
const newJobEndTime = document.getElementById('new-job-end-time');
const newJobMoreInfo = document.getElementById('new-job-more-info');
const jobTableBody = document.getElementById('job-table-body');
const createJobButton = document.getElementById('create-job');
const deleteJobButton = document.getElementById('delete-job-popup');
const reviewButton = document.getElementById('sync-job-link');
const newJobButton = document.getElementById('new-job-link');
const doneButton = document.getElementById('done');

// TODO: Remove when done testing.
let databaseManager = new DatabaseManager('./data/jobs.db');
databaseManager.createDatabase();
// databaseManager.createJob('Location One', '2018-01-11', '11:45', '18:20', 'Notes here');

function clearNewJobInputs() {
  let inputs = newJobContainer.querySelectorAll('input');
  for (let input of inputs){ input.value = '' };
  // clear out the text area
  newJobMoreInfo.value = '';
}

/*
 * Goes through each child of the table area and clears
 * them to allow the updated tables to be displayed.
 */
function clearTableArea() {
  while(tableArea.firstChild) {
    tableArea.removeChild(tableArea.firstChild);
  }
}

function createJobTable(date, timeSpentObj){
  const tableContainer = document.createElement('div');
  const tableTitle = document.createElement('h2');
  const newTable = document.createElement('table');
  const heading = document.createElement('thead');
  const dateHeading = document.createElement('th');
  const locationHeading = document.createElement('th');
  const timeHeading = document.createElement('th');
  const timeDetails = document.createElement('p');

  locationHeading.appendChild(document.createTextNode('Location'));
  timeHeading.appendChild(document.createTextNode('Time'));
  tableTitle.appendChild(document.createTextNode(date));
  timeDetails.appendChild(document.createTextNode(`${timeSpentObj.hours} hours and
    ${timeSpentObj.mins} minutes of work done today.`));

  heading.appendChild(locationHeading);
  heading.appendChild(timeHeading);
  newTable.appendChild(heading);
  tableContainer.appendChild(tableTitle);
  tableContainer.appendChild(timeDetails);
  tableContainer.appendChild(newTable);
  tableContainer.setAttribute('class', 'table-container');

  tableArea.append(tableContainer);

  return newTable;
}

function addJobToTable(job, table){
  let newJobRow, locationText, dateText, timeText, locationEl, dateEl, timeEl;

  newJobRow = document.createElement('tr');
  locationEl = document.createElement('td');
  timeEl = document.createElement('td');
  locationText = document.createTextNode(job.location);
  timeText = document.createTextNode(`${job.hours}hr(s) ${job.minutes}minute(s)`);
  console.log(job);

  locationEl.appendChild(locationText);
  timeEl.appendChild(timeText);

  newJobRow.appendChild(locationEl);
  newJobRow.appendChild(timeEl);

  newJobRow.setAttribute('data-id', job.id);
  table.appendChild(newJobRow);
}

function calculateTimeSpent(jobList) {
  let hours = 0;
  let mins = 0;
  for (let job of jobList) {
    hours += parseInt(job.hours);
    mins += parseInt(job.minutes);
  }
  // deal with minutes totalling more than 60
  if (mins > 59) {
    hours += Math.floor(mins/60);
    mins = mins % 60;
  }
  return {
    hours: hours,
    mins: mins
  }
}

// Add all Jobs to the list from the data file
function populateList(jobList) {
  jobList = JSON.parse(jobList);
  for (let j in jobList){
    let totalTimeDay = calculateTimeSpent(jobList[j]);
    let newTable = createJobTable(jobList[j][0].date, totalTimeDay);
    for (let job of jobList[j]){
      addJobToTable(job, newTable);
    }
  }
}

// Create a new job object and add it to the list
function createJob() {
  let location = newJobLocation.value;
  let date = newJobDate.value;
  let startTime = newJobStartTime.value;
  let endTime = newJobEndTime.value;
  let moreInfo = newJobMoreInfo.value;
  let newJobEl = document.createElement('div');

  databaseManager.createJob(location, date, startTime, endTime, moreInfo, () => {
    // repopulate the list
    databaseManager.getAllJobs((jobs) => {
      populateList(jobs);
    });
  });

  // Hide the new job div element
  newJobContainer.style.display = "none";

  // clear inputs from the create job div
  clearNewJobInputs();
  clearTableArea();
}

function deleteJob(event){
  let jobId = parseInt(event.target.parentNode.getAttribute('data-id'));
  databaseManager.deleteJob(jobId, () => {
    clearTableArea();
    databaseManager.getAllJobs((jobs) => {
      populateList(jobs);
    });
  });
  popup.style.display = "none";
}

// Toggle the new job container
newJobButton.addEventListener('click', (e) => {
    if ( newJobContainer.style.display === "none" ) { newJobContainer.style.display = "block" }
    else { newJobContainer.style.display = "none"}
});

// Handling click events on each job. Will have to show details on the job
// as well as ways to udpate the jobs.
// TODO: cleanup code!
tableArea.addEventListener('click', (e) => {
  // popup elements to edit
  let popupLocation = document.getElementById('popup-location');
  let popupTime = document.getElementById('popup-time');
  let popupDetails = document.getElementById('popup-details');

  if (e.target.parentElement.nodeName === 'TR') {
      console.log(e.target.parentElement.getAttribute('data-id'));
      let jobID = e.target.parentElement.getAttribute('data-id');
      databaseManager.getJob(jobID, (row) => {
        let job = JSON.parse(row);
        let jobObj = new Job(job.job_id, job.location, job.date, job.startTime, job.endTime, job.notes);
        popupLocation.innerText = jobObj.location;
        popupTime.innerText = `Time Spent: ${jobObj.hours} hr(s) and ${jobObj.minutes} min(s)`;
        popupDetails.innerText = jobObj.notes;
        popup.setAttribute('data-id', jobID);
        popup.style.display = "block";
      });

      // Handles closing button
      done.addEventListener('click', (e) => {
        popup.style.display = "none";
      });
  }
});

function syncJobs() {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://10.0.0.185/api/getall', true);
  xhr.setRequestHeader("Content-Type", "text/plain");
  xhr.onreadystatechange = () => {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log('Done!');
    }
  }
  xhr.send(JSON.stringify(fileManager.getJobList()));
}

// Handles shrinking and adding opacity to the nav bar
window.addEventListener('scroll', (e) => {
  let tableTop = tableArea.getBoundingClientRect();
  if (tableTop.top < -10) {
    navbar.style.padding = '10px';
    navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
  } else {
    navbar.style.padding = '35px';
    navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  }
});

// Handle a new job being created
createJobButton.addEventListener('click', createJob);

// Handle a job being deleted
deleteJobButton.addEventListener('click', (e) => { deleteJob(e) });

// Temp listener for review.
// TODO: change to sync
reviewButton.addEventListener('click', syncJobs);

// basic initial preparation
databaseManager.getAllJobs((jobs) => {
  populateList(jobs);
});

newJobContainer.style.display = "none";
