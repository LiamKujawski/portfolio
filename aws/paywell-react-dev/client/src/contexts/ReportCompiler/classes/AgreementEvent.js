export class AgreementEvent {
  constructor(
    location,
    date,
    description,
    salesperson,
    secondarySalesperson,
    clientFirstName,
    clientLastName,
    membershipType,
    price,
    previousAgreementNumber,
    previousAgreements,
    notes
  ) {
    this.location = location;
    this.date = date;
    this.description = description;
    this.salespeople = {
      PrimarySalesperson: salesperson,
      SecondarySalesperson: secondarySalesperson,
    };
    this.clientFirstName = clientFirstName;
    this.clientLastName = clientLastName;
    this.membershipType = membershipType;
    this.price = price;
    this.previousAgreementNumber = previousAgreementNumber;
    this.previousAgreements = previousAgreements;
    this.notes = notes;

    this.addedToExcel = false;
  }

  getFullName() {
    return this.clientFirstName + " " + this.clientLastName;
  }

  getAgreementTime() {
    let hours = this.date.getHours();
    let minutes = this.date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
}
