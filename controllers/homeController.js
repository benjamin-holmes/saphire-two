"use strict";
// Accessing the console running on the single main thread
const con = require('electron').remote.getGlobal('console');
const DatabaseManager = require('../assets/databaseManager.js');
const Job = require('../assets/job.js');
const EditJobController = require('../controllers/editJob.js');


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
const cancelJobButton = document.getElementById('cancel-job');
const deleteJobButton = document.getElementById('delete-job-popup');
const reviewButton = document.getElementById('sync-job-link');
const newJobButton = document.getElementById('new-job-link');
const doneButton = document.getElementById('done');
const editIcon = document.getElementById('edit-icon');
const editJobPopup = document.getElementById('edit-job-popup');
const editAcceptButton = document.getElementById('edit-accept');

const databaseManager = new DatabaseManager('./jobs.db');
const editJobController = new EditJobController(databaseManager, this);

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
  const editHeading = document.createElement('th');
  const dateHeading = document.createElement('th');
  const locationHeading = document.createElement('th');
  const timeHeading = document.createElement('th');
  const timeDetails = document.createElement('p');

  locationHeading.appendChild(document.createTextNode('Location'));
  timeHeading.appendChild(document.createTextNode('Time'));
  tableTitle.appendChild(document.createTextNode(date));
  timeDetails.appendChild(document.createTextNode(`${timeSpentObj.hours} hours and
    ${timeSpentObj.mins} minutes of work done today.`));

  heading.appendChild(editHeading);
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
  const svgDelete = `<svg style="width:30px;height:30px" viewBox="0 0 24 24">
    <path fill="#000000" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M17,7H14.5L13.5,6H10.5L9.5,7H7V9H17V7M9,18H15A1,1 0 0,0 16,17V10H8V17A1,1 0 0,0 9,18Z" />
</svg>`;
  const svgEdit =  `<svg width="30" height="30" viewBox="0 0 24 24" id='edit-icon' data-id=${job.id}>
  <path data-id=${job.id}   fill="#000000" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12H20A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4V2M18.78,3C18.61,3 18.43,3.07 18.3,3.2L17.08,4.41L19.58,6.91L20.8,5.7C21.06,5.44 21.06,5 20.8,4.75L19.25,3.2C19.12,3.07 18.95,3 18.78,3M16.37,5.12L9,12.5V15H11.5L18.87,7.62L16.37,5.12Z" /></svg>`;
  let newJobRow, locationText, dateText, timeText, locationEl, dateEl, timeEl, editButtons;

  editButtons = document.createElement('td');
  newJobRow = document.createElement('tr');
  locationEl = document.createElement('td');
  timeEl = document.createElement('td');
  locationText = document.createTextNode(job.location);
  timeText = document.createTextNode(`${job.hours}hr(s) ${job.minutes}minute(s)`);

  editButtons.innerHTML = svgEdit + svgDelete;
  locationEl.appendChild(locationText);
  timeEl.appendChild(timeText);

  newJobRow.appendChild(editButtons);
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
async function createJob() {
  let location = newJobLocation.value;
  let date = newJobDate.value;
  let startTime = newJobStartTime.value;
  let endTime = newJobEndTime.value;
  let moreInfo = newJobMoreInfo.value;
  let newJobEl = document.createElement('div');

  // databaseManager.createJob(location, date, startTime, endTime, moreInfo)
  //   .then(() => databaseManager.getAllJobs())
  //   .then(jobs => populateList(jobs))
  //   .catch(err => console.log('Error', err));
  await databaseManager.createJob(location, date, startTime, endTime, moreInfo);
  const jobs = await databaseManager.getAllJobs();

  // clear inputs from the create job div
  clearNewJobInputs();
  clearTableArea();
  populateList(jobs);

  // Hide the new job div element
  newJobContainer.style.display = "none";
}

async function deleteJob(event){
  const jobId = parseInt(event.target.parentNode.getAttribute('data-id'));
  await databaseManager.deleteJob(jobId);
  const jobs = await databaseManager.getAllJobs();
  clearTableArea();
  populateList(jobs);
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

  // Refactor to own class like editJob
  if (e.target.parentElement.nodeName === 'TR') {
      let jobID = e.target.parentElement.getAttribute('data-id');
      databaseManager.getJob(jobID)
        .then((row) => {
          const job = JSON.parse(row);
          const jobObj = new Job(job.job_id, job.location, job.date, job.startTime, job.endTime, job.notes);
          popupLocation.innerText = jobObj.location;
          popupTime.innerText = `Time Spent: ${jobObj.hours} hr(s) and ${jobObj.minutes} min(s)`;
          popupDetails.innerText = jobObj.notes;
          popup.setAttribute('data-id', jobID);
          popup.style.display = "block"
        })
        .catch(err => console.log(err.message));

      // Handles closing button
      done.addEventListener('click', (e) => {
        popup.style.display = "none";
      });
  } else if(e.target.getAttribute('data-id')){
    // TODO implement and have other popups close if selected
    editJobController.setJobInfo(parseInt(e.target.getAttribute('data-id')));
  }
});

function syncJobs() {
  // TODO: Implement and use fetch!!
}

function updateTableArea() {
  clearTableArea();
  databaseManager.getAllJobs()
    .then(jobs => populateList(jobs))
    .catch(err => console.log(err.message));
}

// Button listeners
createJobButton.addEventListener('click', createJob);
cancelJobButton.addEventListener('click', () => newJobContainer.style.display = "none"); // Cancel button closes window
deleteJobButton.addEventListener('click', (e) => { deleteJob(e) });
reviewButton.addEventListener('click', syncJobs); // TODO fix to syn and implement

// Initial preparation
databaseManager.createDatabase();
updateTableArea();
newJobContainer.style.display = "none";
