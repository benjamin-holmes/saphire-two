"use strict";
const con = require('electron').remote.getGlobal('console');
const fs = require('fs');
const Job = require('../assets/job.js');

class FileManager {
  constructor(jobFileLocation) {
    this.filename = jobFileLocation;
    this.jobList = [];
  }

  sortByDate() {
    console.log('TESTING LIST MANIPULATION');

    for(let job of this.jobList) {
      let dateList = job.date.split('-');
      let date = new Date(dateList[0], dateList[1], dateList[2]);
      console.log(`${job.date} => ${date}`);
    }

    this.jobList.sort((a,b) => {
      let dateArrA = a.date.split('-');
      let dateArrB = b.date.split('-');
      let dateA = new Date(dateArrA[0], dateArrA[1], dateArrA[2]);
      let dateB = new Date(dateArrB[0], dateArrB[1], dateArrB[2]);

      return dateB - dateA;
    });
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
    console.log();
    fs.writeFileSync(fd, JSON.stringify(this.jobList));
    fs.closeSync(fd);


    // fs.open(this.filename, 'w', (err, fd) => {
    //   if(err) { throw err }
    //
    //   // write to the file
    //   fs.writeFile(fd, JSON.stringify(this.jobList), 'utf8', (err) => {
    //     fs.close(fd, (err) => {
    //       if (err) { throw err }
    //       console.log('done write!');
    //     });
    //     if (err) { throw err }
    //   });
    //
    // });
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

    for (let job of jsonJobs) {
      addJob = new Job(job.id, job.location, job.date, job.startTime, job.endTime, job.notes);
      this.jobList.push(addJob);
    }
    // TODO: Remove for full version. Used for list manipulation tests
    this.sortByDate();
    console.log(this.jobList);
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
