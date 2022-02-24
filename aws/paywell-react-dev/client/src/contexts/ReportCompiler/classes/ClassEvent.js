export class ClassEvent {
  constructor(name, instructor, location, date) {
    this.type = "Class";
    this.name = name;
    this.instructor = instructor;
    this.location = location;
    this.date = date;
    this.attendeeCount = 0;
    this.pay = null;
    this.comment = [];
    this.attendeeList = [];

    this.addedToExcel = false;
  }

  commentsToString() {
    let commentStr = "";
    for (let i = 0; i < this.comment.length; i++) {
      if (this.comment[i].length > 0) {
        commentStr = commentStr + " / " + this.comment[i];
      }
    }
    if (commentStr.length === 0) {
      return "";
    }
    return commentStr.substring(3);
  }
}

export class ClassAttendee {
  constructor(name, loggedBy, loggedTime, bookingEventType, bookingStatus) {
    this.name = name;
    this.loggedBy = loggedBy;
    this.loggedTime = loggedTime;
    this.bookingEventType = bookingEventType;
    this.bookingStatus = bookingStatus;

    this.signedUpAfterIntro = null;

    this.completed = false;
  }

  setSignedUpAfterIntro(outcome) {
    this.signedUpAfterIntro = outcome;
  }

  toString() {
    return (
      "Name: " +
      this.name +
      "\nLogged By: " +
      this.loggedBy +
      "\nLogged Time: " +
      this.loggedTime
    );
  }
}
