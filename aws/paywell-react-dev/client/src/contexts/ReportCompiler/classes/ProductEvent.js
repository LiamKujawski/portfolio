export class ProductEvent {
  constructor(
    location,
    dateObject,
    name,
    salesPerson,
    clientFirstName,
    clientLastName,
    price,
    notes
  ) {
    this.location = location;
    this.date = dateObject;
    this.name = name;
    this.salesPerson = salesPerson;
    this.clientFirstName = clientFirstName;
    this.clientLastName = clientLastName;
    this.price = price;
    this.notes = notes;
  }

  getClientName() {
    return this.clientFirstName + " " + this.clientLastName;
  }
}
