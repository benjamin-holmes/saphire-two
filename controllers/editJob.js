class EditJobController {
  constructor() {
    // Reference HTML elements
    this.editJobPopup = document.getElementById('edit-job-popup');
    this.editLocation = document.getElementById('edit-location');
    this.editStartTime = document.getElementById('edit-start-time');
    this.editEndTime = document.getElementById('edit-end-time');
    this.editTextArea = document.getElementById('edit-textarea');
    this.editAcceptButton = document.getElementById('edit-accept');
    this.editCancelButton = document.getElementById('edit-cancel');

    console.log(this.editLocation);
    this.editAcceptButton.addEventListener('click', () => this.acceptChanges());
    this.editCancelButton.addEventListener('click', () => editJobPopup.style.display = "none");
  }

  setJobInfo(elementId) {
    console.log(`EditJobController for ID: ${elementId}`);
    this.editLocation.value = elementId;

    this.getJobInfo();
    this.display();
  }

  getJobInfo() {
    console.log('Getting job information from database...');
  }

  display() {
    console.log('Display job info...');
    editJobPopup.style.display = "block";
  }

  acceptChanges() {
    console.log('Accept changes selected');
    editJobPopup.style.display = "none";
  }
}


module.exports = EditJobController;
