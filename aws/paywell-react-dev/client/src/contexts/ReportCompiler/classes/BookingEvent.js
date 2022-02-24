export class BookingEvent {
  constructor(classAttributes, eventAttributes, valid) {
    this.classInstructor = classAttributes.instructor;
    this.className = classAttributes.className;
    this.classLocation = classAttributes.location;
    this.classDate = classAttributes.date;

    this.eventType = eventAttributes.type;
    this.eventStatus = eventAttributes.status;
    this.eventClientFirstName = eventAttributes.firstName;
    this.eventClientLastName = eventAttributes.lastName;
    this.eventLoggedBy = eventAttributes.loggedBy;
    this.eventLogDate = eventAttributes.loggedTime;

    this.valid = valid;
  }

  getMemberName() {
    return this.eventClientFirstName + " " + this.eventClientLastName;
  }

  getClassTime() {
    let hours = this.classDate.getHours();
    let minutes = this.classDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
}

export class ClassAttributes {
  constructor(instructor, className, location, dateObject) {
    this.instructor = instructor;
    this.className = className;
    // this.location = location.replace("Club Pilates ", "");
    this.location = location
    this.date = dateObject;
  }
}

export class EventAttributes {
  constructor(type, status, firstName, lastName, loggedBy, loggedTime) {
    this.type = type;
    this.status = status;
    this.firstName = firstName;
    this.lastName = lastName;
    this.loggedBy = loggedBy;
    this.loggedTime = loggedTime;
  }
}
