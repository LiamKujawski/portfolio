import { stringEq } from "../../ReportCompilerContext";
export class CatchAllClassLogic {
  constructor(
    day,
    sequence,
    time,
    type,
    className,
    instructor,
    studio,
    payAmount,
    attendeeAmount,
    rate
  ) {
    this.day = day;
    this.sequence = sequence;
    this.time = time;
    this.type = type;
    this.className = className;
    this.instructor = instructor;
    this.studio = studio;
    this.payAmount = payAmount;
    this.attendeeAmount = attendeeAmount;
    this.rate = rate;

    this.overridePay = false;
    this.checkOverridePay();
    this.fillInBlankLogic();
  }

  checkOverridePay() {
    if (stringEq(this.day.toUpperCase(), this.day)) {
      this.overridePay = true;
    } else {
      this.overridePay = false;
    }
  }

  fillInBlankLogic() {
    if (this.day === "") {
      this.day = "Any";
    }
    if (this.sequence === "") {
      this.sequence = "All";
    }
    if (this.time === "" || this.time === "0:00") {
      this.time = "Any";
    }
    if (this.type === "") {
      this.type = "Any";
    }
    if (this.className === "") {
      this.className = "Any";
    }
    if (this.instructor === "") {
      this.instructor = "Any";
    }
    if (this.studio === "") {
      this.studio = "Any";
    }
    if (this.payAmount === "") {
      this.studio = "Any";
    }
    if (this.attendeeAmount === "") {
      this.attendeeAmount = "Any";
    }
    if (this.rate === "") {
      this.rate = 0;
    }
  }
}
