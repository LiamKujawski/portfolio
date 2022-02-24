export class Member {
  constructor(location, memberSince, firstName, lastName) {
    // this.location = location.replace("Club Pilates ", "");
    this.location = location;
    this.memberSince = memberSince;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  getFullName() {
    return this.firstName + " " + this.lastName;
  }
}
