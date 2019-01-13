"use strict";

const sqlite3 = require('sqlite3').verbose();
const Job = require('../assets/job.js');

class DatabaseManager {
  constructor(databasePath) {
    this.databasePath = databasePath;
    this.data = '';
  }

  /**
   * Placeholder
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
    console.log('separateByDate called');
    let newSort = [];
    let curList = [];

    if(data.length === 0) return newSort;
    if(data.length === 1) {
      curList.push(data[0]);
      newSort.push(curList);
      return newSort;
    }
    else {
      for (let i = 0; i < data.length; i++) {
        if (curList.length === 0) {
          console.log(`curList empty. Adding new item ${data[i].date}`);
          curList.push(data[i]);
        }
        else if (curList.length > 0) {
          if (curList[0].date === data[i].date) {
            console.log(`curList same data. Adding new item ${data[i].date}`);
            curList.push(data[i]);
          } else {
            console.log(`new date, new curList created. Adding new item ${data[i].date}`);
            newSort.push(curList);
            curList = [];
            curList.push(data[i]);
          }
        }
        if (i + 1 === data.length) {
          console.log('END');
          newSort.push(curList);
          return newSort;
        }
      }
    }
  }

  /**
   * Placeholder
   */
   createDatabase() {
     const sql = 'CREATE TABLE IF NOT EXISTS test(job_id INTEGER PRIMARY KEY, location TEXT NOT NULL, date TEXT NOT NULL, startTime TEXT NOT NULL, endTime TEXT NOT NULL, notes BLOB)';

     let db = new sqlite3.Database(this.databasePath);
     db.run(sql);
     db.close();

     console.log(`createDatabase called. Created as ${this.databasePath}`)
     return true;
   }

   /**
    * Placeholder
    */
    createJob(location, date, startTime, endTime, notes, done) {
      let args = [location, date, startTime, endTime, notes];
      let sql = `INSERT INTO test(location, date, startTime, endTime, notes) VALUES(?, ?, ?, ?, ?)`;
      let db = new sqlite3.Database(this.databasePath);

      db.run(sql, args, (err) => {
        if (err) {
          return console.log(err.message);
        }
        console.log(`New job added with rowid ${this.lastID}`);
        // run the callback
        done();
      });
      db.close();
    }

    /**
     * Placeholder
     */
     getJob(id, done) {
       let sql = `SELECT * FROM test WHERE job_id = ?`;
       let args = [id];
       let db = new sqlite3.Database(this.databasePath);

       console.log(`getJobByID called. Searching for id ${id}.`);

       db.get(sql, args, (err, row) => {
         if(err) {
           return false;
         }
         if(row){
           done(JSON.stringify(row));
           return true;
         } else {
           return false;
         }
       });
     }

     /**
      * Placeholder
      */
      getAllJobs(done) {
        let sql = 'SELECT * FROM test';
        let db = new sqlite3.Database(this.databasePath);
        let jobObjectList = [];

        db.all(sql, [], (err, rows) => {
          if (err) { throw err }
          // Sort and send to separateByDate
          this.sortByDate(rows);
          rows.forEach((job) => {
            let j = new Job(job.job_id, job.location, job.date, job.startTime, job.endTime, job.notes);
            jobObjectList.push(j);
          });
          // use callback
          done(JSON.stringify(this.separateByDate(jobObjectList)));
        });
      }

      /**
       * Placeholder
       */
      deleteJob(id, done) {
        console.log('deleteJob called.');
        let sql = 'DELETE FROM test WHERE job_id=?';
        let db = new sqlite3.Database(this.databasePath);
        let arg = [id];

        db.run(sql, arg, function (err){
          if (err) {
            return console.log(err.message);
          }
          // Run callback function
          done();
        });

      }
}

module.exports = DatabaseManager;
