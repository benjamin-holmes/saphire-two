class EditJobController {
  constructor(databaseManager) {
    // Reference HTML elements
    this.editJobPopup = document.getElementById('edit-job-popup');
    this.editLocation = document.getElementById('edit-location');
    this.editDate = document.getElementById('edit-date');
    this.editStartTime = document.getElementById('edit-time-start');
    this.editEndTime = document.getElementById('edit-time-end');
    this.editTextArea = document.getElementById('edit-textarea');
    this.editAcceptButton = document.getElementById('edit-accept');
    this.editCancelButton = document.getElementById('edit-cancel');
    this.databaseManager = databaseManager;

    this.editAcceptButton.addEventListener('click', () => this.acceptChanges());
    this.editCancelButton.addEventListener('click', () => editJobPopup.style.display = "none");
  }

  async setJobInfo(elementId) {
    const jobInfo = await this.getJobInfo(elementId);
    this.display(jobInfo);
  }

  async getJobInfo(elementId) {
    return await this.databaseManager.getJob(elementId);
  }

  display(jobInfo) {
    const job = JSON.parse(jobInfo);

    // For debug
    console.log('Parsed JSON Job',job);

    this.editLocation.value = job.location;
    this.editDate.value = job.date;
    this.editStartTime.value = job.startTime;
    this.editEndTime.value = job.endTime;
    this.editTextArea.value = job.notes;
    editJobPopup.style.display = "block";
  }

  acceptChanges() {
    console.log('Accept changes selected');
    editJobPopup.style.display = "none";
  }
}


module.exports = EditJobController;
