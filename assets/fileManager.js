"use strict";
const con = require('electron').remote.getGlobal('console');
const fs = require('fs');
const Job = require('../assets/job.js');

class FileManager {
  constructor(jobFileLocation) {
    this.filename = jobFileLocation;
    this.jobList = [];
    this.dateList = [];
  }

  /*
   * Sorts the stored list in the object by most recent.
   */
  sortByDate() {
    this.jobList.sort((a,b) => {
      let dateArrA = a.date.split('-');
      let dateArrB = b.date.split('-');
      let dateA = new Date(dateArrA[0], dateArrA[1], dateArrA[2]);
      let dateB = new Date(dateArrB[0], dateArrB[1], dateArrB[2]);

      return dateB - dateA;
    });
  }

  separateByDate() {
    let curList = [];
    curList.push(this.jobList[0]);
    for (let j = 1; j < this.jobList.length; j++) {
      let curJob = this.jobList[j];
      if (curJob.date === curList[0].date) {
        curList.push(curJob);
        // Check to add list if last job inspected
        if (j + 1 === this.jobList.length) {
          this.dateList.push(curList);
        }
      } else {
        console.log('Creating new list');
        let newList = [];
        this.dateList.push(curList);
        newList.push(curJob);
        curList = newList;
        // Check to add list if last job inspected
        if (j + 1 === this.jobList.length) {
          this.dateList.push(curList);
        }
      }
    }
    console.log(this.dateList);
  }

  // Checks to see if the file to store job data
  // exists. It creates it if it is not
  dataFileCheck() {
    if (fs.existsSync(this.filename)) {
      console.log('File Exists');
    }
    else {
      console.log('Must create the file')
      fs.writeFile(this.filename, '', (err) => { if (err) throw err});
    }
  }

  writeJob(job) {
    let fd;
    // create a JSON formatted string to go into the file
    this.jobList.push(job);
    fd = fs.openSync(this.filename, 'r+');
    fs.writeFileSync(fd, JSON.stringify(this.jobList));
    fs.closeSync(fd);
  }

  reWriteJobList() {
    fs.writeFileSync(this.filename, JSON.stringify(this.jobList));
    console.log(JSON.stringify(this.jobList));
  }

  deleteJob(jobId) {
    console.log(`JobList before:\t${this.jobList.length}`);
    console.log(jobId);
    this.jobList = this.jobList.filter(job => parseInt(job.id) !== jobId);
    console.log(`JobList after:\t${this.jobList.length}`);
  }

  /*
   * Uses the synchronous calls from the fs package since the application depends on
   * the jobs in the list to be usable before anything else can happen. Jobs are stored
   * in JSON format.
   *
   * @params:
   * @return: jobList
   *
   */
  getJobs() {
    let jsonJobs, addJob;
    let fd = fs.openSync(this.filename, 'r');
    let data = fs.readFileSync(fd, 'utf8');

    // TODO: check for empty data
    jsonJobs = JSON.parse(data);

    // Clear the list before adding items
    this.jobList = [];
    this.dateList = [];

    for (let job of jsonJobs) {
      addJob = new Job(job.id, job.location, job.date, job.startTime, job.endTime, job.notes);
      this.jobList.push(addJob);
    }
    // TODO: Remove for full version. Used for list manipulation tests
    this.sortByDate();
    this.separateByDate();

    return this.dateList;
  }

  getJobList() {
    let jobList = [];
    for (let list of this.dateList) {
      for (let job of list) {
        jobList.push(job);
      }
    }
    return jobList;
  }

  /*
   * Returns the current size of the list of jobs
   *
   * @return: jobList.size
   *
   */
  listSize() {
    return this.jobList.length;
  }
}

module.exports = FileManager;
