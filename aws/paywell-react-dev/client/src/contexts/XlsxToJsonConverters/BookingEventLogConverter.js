import { BookingEvent, ClassAttributes, EventAttributes, } from "../ReportCompiler/classes/BookingEvent";
import { createDateFromString } from "../GeneralFunctions/CreateDateFromString";

export function bookingFileConverter(json, studioNumber) {
    console.log(json);
    const belArrayFromInp = [];
    let bookingEventI = 0;
    let bookingClassNameI = 0;
    let bookingLocationI = 0;
    let bookingInstructorI = 0;
    let bookingDateI = 0;
    let bookingTimeI = 0;
    let bookingCSI = 0;
    let bookingLastNameI = 0;
    let bookingFirstNameI = 0;
    let bookingLoggedByI = 0;
    let bookingSessionLength = 0;
    let bookingLoggedDateTimeI = 0;
    let currentBelPayPeriod = [];
    let correctFileType = false;
  
    for (let i = 0; i < json.length; i++) {
      /* Case if row is not blank and is not part of the header/title information*/
      if (json[i][0].includes("Booking Events Log")) {
        //currentBelPayPeriod = findPayPeriodDates(json[i][0]);
      }
      if (json[i][0].includes("Booking Event") || json[i][1].includes("Log Date")) {
        for (let u = 0; u < json[i].length; u++) {
          if (json[i][u].includes("Booking Event")) {
            bookingEventI = u;
          } else if (json[i][u].includes("Booking Detail")) {
            bookingClassNameI = u;
          } else if (json[i][u].includes("Booking Location")) {
            bookingLocationI = u;
          } else if (json[i][u].includes("Booking With")) {
            bookingInstructorI = u;
          } else if (json[i][u].includes("Booking Date")) {
            bookingDateI = u;
          } else if (json[i][u].includes("Booking Start")) {
            bookingTimeI = u;
          } else if (json[i][u].includes("Current Status")) {
            bookingCSI = u;
          } else if (json[i][u].includes("Last Name")) {
            bookingLastNameI = u;
          } else if (json[i][u].includes("First Name")) {
            bookingFirstNameI = u;
          } else if (json[i][u].includes("Booking Made By")) {
            bookingLoggedByI = u;
          } else if (json[i][u].includes("Session Mins")) {
            bookingSessionLength = u;
          } else if (json[i][u].includes("Log Date")) {
            bookingLoggedDateTimeI = u;
          }
        }
        correctFileType = true;
      } else if (json[i][0] !== null && json[i][1] !== null && json[i][2] !== null && json[i][0] !== "Booking Event" && !json[i][0].includes("Club Pilates")) {
        try {
          const belDate = createDateFromString(json[i][bookingDateI], json[i][bookingTimeI]);
  
          const startDate = currentBelPayPeriod[0];
          const endDate = currentBelPayPeriod[1];
  
          if (parseInt(json[i][bookingSessionLength]) === 30) {
            json[i][bookingClassNameI] = json[i][bookingClassNameI] + " (30 min)";
          }
  
          const classAttributes = new ClassAttributes(json[i][bookingInstructorI], json[i][bookingClassNameI], json[i][bookingLocationI], belDate);
  
          let loggedDate = "0";
          let loggedTime = "00:00";
          if (json[i][bookingLoggedDateTimeI].length > 0) {
            loggedDate = json[i][bookingLoggedDateTimeI].substring(0, json[i][bookingLoggedDateTimeI].indexOf(" "));
            loggedDate = loggedDate.substring(0, loggedDate.length - 2) + "20" + loggedDate.substring(loggedDate.length - 2, loggedDate.length);
            loggedTime = json[i][bookingLoggedDateTimeI].substring(json[i][bookingLoggedDateTimeI].indexOf(" ") + 1, json[i][bookingLoggedDateTimeI].length);
          }
  
          const loggedDateObject = createDateFromString(loggedDate, loggedTime);
  
          let loggedBy = json[i][bookingLoggedByI];
          if (json[i][bookingLoggedByI].length === 0) {
            loggedBy = null;
          }
  
          const eventAttributes = new EventAttributes(json[i][bookingEventI], json[i][bookingCSI], json[i][bookingFirstNameI], json[i][bookingLastNameI], loggedBy, loggedDateObject);
  
          if (json[i][0] !== "New Booking Made" && belDate.getTime() > startDate.getTime() && belDate.getTime() < endDate.getTime()) {
            const bookingEvent = new BookingEvent(classAttributes, eventAttributes, true);
            belArrayFromInp.push(bookingEvent);
          }
        } catch (e) {}
      }
    }
    //inputFilesArrays["bel" + studioNumber] = belArrayFromInp;

    console.log("NEW WAY ORGANIZED...", belArrayFromInp);
  
    return correctFileType;
  }