import { stringEq } from "../../ReportCompilerContext";
export class PayWellStaff {
  constructor(type, locationsArray, namesArray) {
    this.type = type;
    for (let i = 0; i < locationsArray.length; i++) {
      // locationsArray[i] = locationsArray[i].replace("Club Pilates ", "");
      locationsArray[i] = locationsArray[i];
    }
    this.location = locationsArray;
    this.name = namesArray;

    this.hourly = {};
    this.groupRates = {};
    this.privateRates = {};
    this.introRates = {};
    this.privateThirtyRate = {};
    this.email = null;
  }

  addHourlyRate(studio, rate) {
    this.hourly[studio] = rate;
  }

  addGroupRates(studio, rates) {
    this.groupRates[studio] = rates;
  }

  addPrivateRates(studio, rates) {
    this.privateRates[studio] = rates;
  }

  addIntroRates(studio, rates) {
    this.introRates[studio] = rates;
  }

  addPrivateThirtyRate(studio, rate) {
    this.privateThirtyRate[studio] = rate;
  }

  isNamed(name) {
    let isNamedCheck = false;
    for (let i = 0; i < this.name.length; i++) {
      if (stringEq(this.name[i], name)) {
        isNamedCheck = true;
      }
    }
    return isNamedCheck;
  }

  isLocated(location) {
    let isLocatedCheck = false;
    for (let i = 0; i < this.location.length; i++) {
      if (stringEq(this.location[i], location)) {
        isLocatedCheck = true;
      }
    }
    return isLocatedCheck;
  }

  getNameString() {
    return this.name.join("/");
  }
}
