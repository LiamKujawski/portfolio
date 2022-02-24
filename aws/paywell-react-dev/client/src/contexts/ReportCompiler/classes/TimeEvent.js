export class TimeEvent {
  constructor(staffName, location, hoursWorked, payRate, description, payTotal) {
    this.description = description;
    this.staffName = staffName;
    this.location = location;
    this.hoursWorked = hoursWorked;
    this.payRate = payRate;

    this.payTotal = payTotal

    this.addedToExcel = false;
  }
}
