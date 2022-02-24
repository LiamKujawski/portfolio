export class SessionPayrollClassEvent {
  constructor(
    customer,
    price,
    location,
    className,
    dateObject,
    instructor,
    classPackage
  ) {
    this.customer = customer;
    this.price = price;
    this.location = location;
    this.className = className;
    this.date = dateObject;
    this.instructor = instructor;
    this.classPackage = classPackage;
  }
}
