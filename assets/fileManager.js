"use strict";
const con = require('electron').remote.getGlobal('console');
const fs = require('fs');
const Job = require('../assets/job.js');

class FileManager {
  constructor(jobFileLocation) {
    this.filename = jobFileLocation;
    this.jobList = [];
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
    // create a JSON formatted string to go into the file
    this.jobList.push(job);

    fs.open(this.filename, 'w', (err, fd) => {
      if(err) { throw err }

      // write to the file
      fs.writeFile(fd, JSON.stringify(this.jobList), 'utf8', (err) => {
        fs.close(fd, (err) => {
          if (err) { throw err }
        });
        if (err) { throw err }
      });

    });
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
    jsonJobs = JSON.parse(data);

    // Clear the list before adding items
    this.jobList = [];

    for (let job of jsonJobs) {
      addJob = new Job(job.id, job.location, job.date, job.startTime, job.endTime, job.notes);
      this.jobList.push(addJob);
    }
    return this.jobList;
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
