"use strict";
// Accessing the console running on the single main thread
const con = require('electron').remote.getGlobal('console');
const JobFileManager = require('../assets/fileManager.js');
const Job = require('../assets/job.js');

con.log('Home Controller Active');

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
const newJobButton = document.getElementById('new-job-link');
const doneButton = document.getElementById('done');

let fileManager = new JobFileManager('./jobs.json');

// Add all Jobs to the list from the data file
function populateList(jobList) {
  let newJobRow, locationText, dateText, timeText, locationEl, dateEl, timeEl;

  for (let job of jobList) {
    newJobRow = document.createElement('tr');
    locationEl = document.createElement('td');
    dateEl = document.createElement('td');
    timeEl = document.createElement('td');

    locationText = document.createTextNode(job.location);
    dateText = document.createTextNode(job.date);
    timeText = document.createTextNode(`${job.hours}hrs ${job.minutes}minute(s)`);

    locationEl.appendChild(locationText);
    dateEl.appendChild(dateText);
    timeEl.appendChild(timeText);

    newJobRow.appendChild(dateEl);
    newJobRow.appendChild(locationEl);
    newJobRow.appendChild(timeEl);

    newJobRow.setAttribute('data-id', job.id);

    jobTableBody.appendChild(newJobRow);
  }

}

// Create a new job object and add it to the list
function createJob() {
  let newJobRow, locationText, dateText, timeText, locationEl, dateEl, timeEl;
  let location = newJobLocation.value;
  let date = newJobDate.value;
  let startTime = newJobStartTime.value;
  let endTime = newJobEndTime.value;
  let moreInfo = newJobMoreInfo.value;
  let newJobEl = document.createElement('div');

  let j = new Job(fileManager.listSize() + 1, location, date, startTime, endTime, moreInfo);
  fileManager.writeJob(j);
  // Create new row and the element containers inside
  newJobRow = document.createElement('tr');
  locationEl = document.createElement('td');
  dateEl = document.createElement('td');
  timeEl = document.createElement('td');


  // Text nodes to add
  locationText = document.createTextNode(location);
  dateText = document.createTextNode(date);
  timeText = document.createTextNode(`${j.hours}hrs ${j.minutes}minute(s)`);

  locationEl.appendChild(locationText);
  dateEl.appendChild(dateText);
  timeEl.appendChild(timeText);

  newJobRow.appendChild(dateEl);
  newJobRow.appendChild(locationEl);
  newJobRow.appendChild(timeEl);

  newJobRow.setAttribute('data-id', fileManager.listSize());

  jobTableBody.append(newJobRow);

  // Hide the new job div element
  newJobContainer.style.display = "none";
}

// Toggle the new job container
newJobButton.addEventListener('click', (e) => {
    if ( newJobContainer.style.display === "none" ) { newJobContainer.style.display = "block" }
    else { newJobContainer.style.display = "none"}
});

// Handling click events on each job. Will have to show details on the job
// as well as ways to udpate the jobs.
// TODO: Finish implementing!
jobTableBody.addEventListener('click', (e) => {
  // popup elements to edit
  let popupLocation = document.getElementById('popup-location');
  let popupTime = document.getElementById('popup-time');
  let popupDetails = document.getElementById('popup-details');

  // get the selected item using the data-id attrib
  let itemNum = e.path[1].getAttribute('data-id');

  // TODO: This causes items to be appended to the array inside of the fileManager class
  // which is leading to rewrites of already existing jobs. Fix!
  let list = fileManager.getJobs();
  let job = list[parseInt(itemNum)-1];
  console.log(parseInt(itemNum));

  popupLocation.innerText = job.location;
  popupTime.innerText = `Time Spent: ${job.hours} hr(s) and ${job.minutes} min(s)`;
  popupDetails.innerText = job.notes;

  popup.style.display = "block";

  // Handles closing button
  done.addEventListener('click', (e) => {
    popup.style.display = "none";
  });
});

// Handles shrinking and adding opacity to the nav bar
window.addEventListener('scroll', (e) => {
  let tableTop = jobTableBody.getBoundingClientRect();
  if (tableTop.top < 0) {
    navbar.style.padding = '10px';
    navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.35)';
  } else {
    navbar.style.padding = '35px';
    navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  }
});

// Handle a new job being created
createJobButton.addEventListener('click', createJob);

// basic initial preparation
fileManager.dataFileCheck();
populateList(fileManager.getJobs());
newJobContainer.style.display = "none";
