"use strict";
// the Job object
class Job {
  constructor(id, location, date, startTime, endTime, notes) {
    this.id = id;
    this.location = location;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;
    this.notes = notes;
    this.hours = 0;
    this.minutes = 0;

    let startHour = parseInt(startTime.slice(0,2));
    let startMin = parseInt(startTime.slice(3));
    let endHour = parseInt(endTime.slice(0,2));
    let endMin = parseInt(endTime.slice(3));

    // calculate time spent on the job
    this.hours = endHour - startHour;
    if ( endMin < startMin ) {
      this.hours -= 1;
      this.minutes = 60 - (startMin - endMin);
    } else {
      this.minutes = endMin - startMin;
    }
  }
}

module.exports = Job;
