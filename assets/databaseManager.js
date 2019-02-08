"use strict";
const sqlite3 = require('sqlite3').verbose();
const Job = require('../assets/job.js');

class DatabaseManager {
  constructor(databasePath) {
    this.databasePath = databasePath;
    this.data = '';
  }

  /**
   * Sorts the list of jobs by date for use in a separator function.
   *
   * @params {List} an unordered list of jobs from the database
   * @return {List} return a list of jobs sorted by creation date
   */
   sortByDate(data) {
     data.sort((a,b) => {
       let dateArrA = a.date.split('-');
       let dateArrB = b.date.split('-');
       // TODO: Subtract one from date
       let dateA = new Date(dateArrA[0], dateArrA[1], dateArrA[2]);
       let dateB = new Date(dateArrB[0], dateArrB[1], dateArrB[2]);

       return dateB - dateA;
     });
     return data;
   }

 /**
  * Creates 2D Job List.
  *
  * Creates a two dimensional array of jobs. Each element of
  * the array is an array of jobs from one day. The sortByDay()
  * function is called before this. So jobs are pushed onto an
  * array until the next set is found.
  *
  * @return {List} 2D array of sorted jobs
  */
  separateByDate(data) {
    let separateDateList = [];
    while(data.length !== 0) {
      let singleDayList = data.filter(job => job.date === data[0].date);
      separateDateList.push(singleDayList);
      data = data.filter(job => job.date !== singleDayList[0].date);
    }
    return separateDateList;
  }

  /**
   * Function that will create a sqlite table if it does not already
   * exist in the given database.
   *
   * @return {Promise} sends error if error, othrwise returns a 1
   */
   createDatabase() {
     const sql = 'CREATE TABLE IF NOT EXISTS jobs(job_id INTEGER PRIMARY KEY, location TEXT NOT NULL, date TEXT NOT NULL, startTime TEXT NOT NULL, endTime TEXT NOT NULL, notes BLOB, editFlag INTEGER)';
     const db = new sqlite3.Database(this.databasePath);
     return new Promise((resolve, reject) => {
       db.run(sql, (err) => {
         if (err) reject(err)
         resolve(1);
       });
       db.close();
     });
   }

   /**
    * Placeholder
    */
    createJob(location, date, startTime, endTime, notes) {
      let args = [location, date, startTime, endTime, notes];
      let sql = `INSERT INTO jobs(location, date, startTime, endTime, notes) VALUES(?, ?, ?, ?, ?)`;
      let db = new sqlite3.Database(this.databasePath);

      return new Promise((resolve, reject) => {
        db.run(sql, args, (err) => {
          if (err) { reject(err) }
          resolve(1);
        });
        db.close();
      });
    }

    /**
     * Placeholder
     */
     getJob(id) {
       const sql = `SELECT * FROM jobs WHERE job_id = ?`;
       const args = [id];
       const db = new sqlite3.Database(this.databasePath);

       return new Promise((resolve, reject) => {
         db.get(sql, args, (err, row) => {
           if(err) { reject(err) }
           if(row){ resolve(JSON.stringify(row)) }
         });
       });
     }

     /**
      * Placeholder
      */
      getAllJobs() {
        const sql = 'SELECT * FROM jobs';
        const db = new sqlite3.Database(this.databasePath);
        const jobObjectList = [];

        return new Promise((resolve, reject) => {
          db.all(sql, [], (err, rows) => {
            if (err) { rejecet(err) }
            // Sort and send to separateByDate
            this.sortByDate(rows);
            rows.forEach( job => jobObjectList.push(new Job(job.job_id, job.location, job.date, job.startTime, job.endTime, job.notes)));
            resolve(JSON.stringify(this.separateByDate(jobObjectList)));
          });
        });

      }

      /**
       * Placeholder
       */
      deleteJob(id) {
        const sql = 'DELETE FROM jobs WHERE job_id=?';
        const db = new sqlite3.Database(this.databasePath);
        const arg = [id];

        return new Promise((resolve, reject) => {
          db.run(sql, arg, function (err){
            if (err) { reject(err) }
            resolve(1);
          });
        });
      }
}

module.exports = DatabaseManager;
