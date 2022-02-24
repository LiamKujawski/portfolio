import React, { useContext } from "react";
import axios from "axios";
import XLSX from "xlsx";
import { AgreementEvent } from "./ReportCompiler/classes/AgreementEvent";
import {BookingEvent, ClassAttributes, EventAttributes} from "./ReportCompiler/classes/BookingEvent";
import { CatchAllClassLogic } from "./ReportCompiler/classes/CatchAllClassLogic";
import { CellReference } from "./ReportCompiler/classes/CellReference";
import { ClassEvent, ClassAttendee } from "./ReportCompiler/classes/ClassEvent";
import { ClassTypeRequirements } from "./ReportCompiler/classes/ClassTypeRequirements";
import { CommissionDetailReferenceBox } from "./ReportCompiler/classes/CommissionDetailReferenceBox";
import { DetailReferenceBox } from "./ReportCompiler/classes/DetailReferenceBox";
import { Member } from "./ReportCompiler/classes/Member";
import { PayWellStaff } from "./ReportCompiler/classes/PayWellStaff";
import { ProductEvent } from "./ReportCompiler/classes/ProductEvent";
import { SessionPayrollClassEvent } from "./ReportCompiler/classes/SessionPayrollClassEvent";
import { TimeEvent } from "./ReportCompiler/classes/TimeEvent";
import { updateCurrentlySelectedStudios } from "./StudioScrapeStatusContext";

//import {payWellFileConverter} from "./XlsxToJsonConverters/PayWellFileConverter";
//import {bookingFileConverter} from "./XlsxToJsonConverters/BookingEventLogConverter";

// Global Variables
const blankExcelRow = ["", "", "", "", "", "", "", "", "", "", "", "", ""];
const maxStudioCapactiy = 6;

const weekDictionary = {Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0, 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 0: "Sunday"};
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COUNTINDEX = 4;
const PAYINDEX = 5;

const inputFilesArrays = {input1Pay: [], input1Questions: [], BEL: [], MEM: [], TIME: [], PAY: [], AGREE: [], SALE: []};
const studiosInformation = {studiosArray: [], instructorsArray: [], staffArray: [], classes: []};
const payrollInformation = {numberOfStudios: 0, belPayPeriods: [], studiosInInput: []};

export function getStudiosFromInputFile() {
  return payrollInformation.studiosInInput;
}

export function getReportsNeededFromInput() {
  const questions = inputFilesArrays.input1Questions;
 
  let reportsNeeded = ['bel', 'mem'];
  let fullNameReportsNeeded = ["Booking Events Log", "Active Members Log"];
  if(questions.includeTimeClock){
    reportsNeeded.push('time');
    fullNameReportsNeeded.push("Time Clock Payroll");
  }
  if(questions.payOnPrivateClassRate){
    reportsNeeded.push('pay');
    fullNameReportsNeeded.push("Session Payroll Detail");
  }
  if(questions.includeAgreements){
    reportsNeeded.push('agree');
    fullNameReportsNeeded.push("Agreements Log");
  }
  if(questions.includeSalesFile){
    if(questions.useGrossSalesDetail){
      reportsNeeded.push('gross');
      fullNameReportsNeeded.push("Gross Sales Detail");

    }else{
      reportsNeeded.push('sale');
      fullNameReportsNeeded.push("Product Sales Log");
    }
  }


  return { reportsNeeded,  fullNameReportsNeeded};
}

let payOnClassSize = false;
let introPayOnSignUps = false;
let pastButNotLoggedPay = false;
let noShowPay = false;
let cancelledWithinRulesPay = false;
let cancelledByAdminPay = false;
let cancelledOutsidePolicyPay = false;
let includeTimeClock = false;
let basePayRate = 0;
let outputByStudio = false;
let memberWorkshopPay = false;
let ptaPay = "Group";
let payMaxOnFullClasses = false;
let payOnPrivateClassRate = false;
const certainClassTimes = [];
let overtimeTimeClockInputs = false;
let includeAgreements = false;
let introComPercent = 0;
let introComPay = [];
let introInstructorBonus = 0;
let nonIntroComPercent = 0;
let nonIntroComPay = [];
let payComUpgrades = false;
let includeSalesFile = false;
let productComPercent = 0;
let productSalesPay = [];
let organizeStaffLastName = true;
let includeCommissionTabs = true;
let noCommissionForStaffBoughtProducts = false;
let annualCommission = 1;
let singleClassCommissionPay = false;
let singleClassPrevNewAgreement = false;
let privateTrainingCommission = false;
let toeSocksPay = true;
let noProductSalesCommissionBelow = 0;
let diffCommissionPayCol = -1;
let annualsAlwaysNew = false;
let timePeriodPostIntro = 24;
let internalSpecialEvent = "None";
let studioTourEvent = "None";
let virtualClassOpenEvent = "None";
let virtualPrivateEvent = "None";
let defaultPrivatePayForFreeCredits = 45;
let outdoorClass = "None";
let productSaleCommentForNoCommission = "Nothing Yet";
let useGrossSalesDetail = false;
const salariedEmployeeInputs = [];
let reimbursementTimeClockInputs = false;
let includeCostPerClassMetric = false;
let groupClassCapacity = 12;
const specificClassRequirements = [];
let rescheduledClassStatuses = [];
let summaryTabCommissionForIndividualTabs = false;
const excelFileNames = [];

// Global Functions
export function stringEq(str1, str2) {
  return str1.includes(str2) && str2.includes(str1);
}

export function removeFilesArray(fileType, studioNumber){
  // fileType should be 'bel', 'mem', 'time', 'pay', 'agree', 'sale' or 'any'
  // studioNumber should be 1-6
  const inputFiles = inputFilesArrays;
  if (fileType == 'all'){
    inputFiles['bel' + studioNumber] = [];
    inputFiles['mem' + studioNumber] = [];
    inputFiles['time' + studioNumber] = [];
    inputFiles['pay' + studioNumber] = [];
    inputFiles['agree' + studioNumber] = [];
    inputFiles['sale' + studioNumber] = [];
  } else {
    inputFiles[fileType + studioNumber] = [];
  }
  console.log(inputFilesArrays)
}
export function removeReport(reportType, studioIndex) {
  removeFilesArray(reportType, studioIndex)
}
export function removeStudio(studioIndex) {
  removeFilesArray("all", studioIndex)
}

export function isStaff(name) {
  const staffArray = studiosInformation.staffArray;
  let staff = false;
  for (let i = 0; i < staffArray.length; i++) {
    if (staffArray[i].isNamed(name)) {
      staff = true;
    }
  }
  return staff;
}

export function sortArrayLastName(a, b) {
  const splitA = a.name[0].split(" ");
  const splitB = b.name[0].split(" ");
  const lastA = splitA[splitA.length - 1];
  const lastB = splitB[splitB.length - 1];

  if (lastA < lastB) return -1;
  if (lastA > lastB) return 1;
  return 0;
}

export function createDateFromString(dateString, timeString) {
  if (dateString !== "0") {
    const dateArr = dateString.split("/");

    if (timeString === null) {
      timeString = "00:00";
    }
    let hourConv = parseInt(timeString.substring(0, timeString.indexOf(":")));
    if (timeString.includes("PM") && hourConv !== 12) {
      hourConv += 12;
    }
    const minConv = parseInt(timeString.substring(timeString.indexOf(":") + 1, timeString.indexOf(":") + 4));
    const date = new Date(dateArr[2], dateArr[0] - 1, dateArr[1], hourConv, minConv);
    return date;
  }
  return new Date(0);
}

export function staffWorkedAtStudio(studio, staff) {
  const organizedTable = studiosInformation.classes;
  const timeTable = inputFilesArrays.TIME;
  const agreementsTable = inputFilesArrays.AGREE;
  let staffWorks = false;

  for (let i = 0; i < organizedTable.length; i++) {
    if (stringEq(organizedTable[i].location, studio) && staff.name.includes(organizedTable[i].instructor)) {
      staffWorks = true;
    }
  }

  try {
    for (let j = 0; j < timeTable.length; j++) {
      if (stringEq(timeTable[j].location, studio) && staff.name.includes(timeTable[j].staffName)) {
        staffWorks = true;
      }
    }
  } catch (e) {}
  try {
    for (let x = 0; x < agreementsTable.length; x++) {
      if (stringEq(agreementsTable[x].location, studio) && (staff.name.includes(agreementsTable[x].salespeople.PrimarySalesperson) || staff.name.includes(agreementsTable[x].salespeople.SecondarySalesperson))) {
        staffWorks = true;
      }
    }
  } catch (e) {}
  return staffWorks;
}

export function findFileTypeFromName(file) {
  if (file.name.includes("Booking Events Log")) {
    return "bel";
  } else if (file.name.includes("MembersExport") || file.name.includes("Active Members") || file.name.includes("MemberList")) {
    return "mem";
  } else if (file.name.includes("Time Clock")) {
    return "time";
  } else if (file.name.includes("Session Payroll")) {
    return "pay";
  } else if (file.name.includes("Agreements Log")) {
    return "agree";
  } else if (file.name.includes("Product Sales") || (file.name.includes("Gross Sales Detail") && useGrossSalesDetail)) {
    return "sale";
  }
  return null;
}

export async function getStudioAndReportTypeForFile(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  let json = XLSX.utils.sheet_to_json(worksheet, {header: 1, raw: false, defval: ""});
  let fileType1 = findFileTypeFromJson(json[0]);
  let studio = findStudioFromJson(json[0]);
  return {fileType: fileType1, studio: studio};
}

export function findFileTypeFromJson(firstRow) {
  if (firstRow[0].includes("Booking Events")) {
    return "bel";
  } else if (firstRow[0].includes("Member")) {
    return "mem";
  } else if (firstRow[0].includes("Time Clock")) {
    return "time";
  } else if (firstRow[0].includes("Agreements")) {
    return "agree";
  } else if (firstRow[0].includes("Bookings")) {
    return "pay";
  } else if (firstRow[0].includes("Products") || firstRow[0].includes("Gross")) {
    return "sale";
  } else if (firstRow.includes("Location")) {
    return "input";
  }
  return null;
}

export function findStudioFromJson(firstRow) {
  if (firstRow.includes("Location")) {
    return null;
  }
  return firstRow[0].substring(firstRow[0].indexOf("-") + 2, firstRow[0].indexOf("(") - 1);
}
// Crossover between frontend html and backend logic ______
export function compileEventArrays() {
  for (let i = 1; i <= maxStudioCapactiy; i++) {
    if (inputFilesArrays["bel" + i] !== null && inputFilesArrays["bel" + i] !== undefined) {
      inputFilesArrays["BEL"] = inputFilesArrays["BEL"].concat(inputFilesArrays["bel" + i]);
    }
    if (inputFilesArrays["mem" + i] !== null && inputFilesArrays["mem" + i] !== undefined) {
      inputFilesArrays["MEM"] = inputFilesArrays["MEM"].concat(inputFilesArrays["mem" + i]);
    }
    if (inputFilesArrays["time" + i] !== null && inputFilesArrays["time" + i] !== undefined) {
      inputFilesArrays["TIME"] = inputFilesArrays["TIME"].concat(inputFilesArrays["time" + i]);
    }
    if (inputFilesArrays["pay" + i] !== null && inputFilesArrays["pay" + i] !== undefined) {
      inputFilesArrays["PAY"] = inputFilesArrays["PAY"].concat(inputFilesArrays["pay" + i]);
    }
    if (inputFilesArrays["agree" + i] !== null && inputFilesArrays["agree" + i] !== undefined) {
      inputFilesArrays["AGREE"] = inputFilesArrays["AGREE"].concat(inputFilesArrays["agree" + i]);
    }
    if (inputFilesArrays["sale" + i] !== null && inputFilesArrays["sale" + i] !== undefined) {
      inputFilesArrays["SALE"] = inputFilesArrays["SALE"].concat(inputFilesArrays["sale" + i]);
    }
  }
  console.log(inputFilesArrays);
}

export function checkForClassesWithNoBookings() {
  const bookingEvents = inputFilesArrays.BEL;
  const payTable = inputFilesArrays.PAY;

  for (let i = 0; i < payTable.length; i++) {
    if (payTable[i] !== null) {
      let classAccountedFor = true;
      if (payTable[i].customer.includes("0 Class Attendees") && !payTable[i].customer.includes("10")) {
        classAccountedFor = false;
        for (let z = 0; z < bookingEvents.length; z++) {
          if (payTable[i].date.getTime() === bookingEvents[z].classDate.getTime() && stringEq(payTable[i].instructor, bookingEvents[z].classInstructor)) {
            classAccountedFor = true;
          }
        }
      }

      if (!classAccountedFor) {
        const classAttributes = new ClassAttributes(payTable[i].instructor, payTable[i].className, payTable[i].location, payTable[i].date);
        const eventAttributes = new EventAttributes("No Bookings", "None", "N/A", "N/A", "N/A", new Date());

        const bookingEventUnattended = new BookingEvent(classAttributes, eventAttributes, false);
        inputFilesArrays.BEL.push(bookingEventUnattended);
      }
      classAccountedFor = false;
    }
  }
}

export function createStudioArray() {
  const belTable = inputFilesArrays.BEL;
  const studiosArray = [];

  for (let i = 0; i < belTable.length; i++) {
    if (!studiosArray.includes(belTable[i].classLocation)) {
      studiosArray.push(belTable[i].classLocation);
    }
  }
  sortArrayAlphabetically(studiosArray);
  return studiosArray;
}

export function sortArrayAlphabetically(array) {
  array.sort(function (a, b) {
    const valueA = a[0].toUpperCase();
    const valueB = b[0].toUpperCase();
    if (valueA < valueB) {
      return -1;
    } else if (valueA > valueB) {
      return 1;
    }
    return 0;
  });
}

// Add Files Into PayWell ______ use this when implementing the manual file uploads in react
export async function fileUpdate(file, fileId, fileClass) {
  const fileN = file.name;
  deleteDuplicateFileIDs(fileId);
  checkDuplicateFileNames(fileN);

  if (fileN.includes("%")) {
    alert("File name must not include '%' symbol\n Please rename and try again");
    await sendFileToUploadsFolder(file, fileId, fileClass);
  } else if (!fileN.includes(".xls")) {
    alert("File type must be .xlsx or .xls");
  } else {
    await sendFileToUploadsFolder(file, fileId, fileClass);
  }
}

export function deleteDuplicateFileIDs(checkID) {
  for (let i = 0; i < excelFileNames.length; i++) {
    if (excelFileNames[i][1] === checkID) {
      excelFileNames.splice(i, 1);
    }
  }
}

export function checkDuplicateFileNames(checkName) {
  for (let i = 0; i < excelFileNames.length; i++) {
    if (excelFileNames[i][0] === checkName) {
      alert("File '" + checkName + "' already added\n (Ignore if this was on purpose)");
    }
  }
}

export function sendFileToUploadsFolder(file, fileId, fileClass) {
  console.log(file);
  const endPoint = "/api/upload";
  const formData = new FormData();
  formData.append("file", file);
  console.log(formData);
  return fetch(endPoint, {method: "POST", body: formData}).then(function () {
      console.log("Fetch Success");
      // grabDataPrototype(fileId, file, fileClass);
      return true;
    })
    .catch(function () {
      console.log("Fetch Error: " + console.er);
      return false;
    });
}

export function convertJSON(fileId, json, json3) {
  const studioNumber = findStudioNumberFromInputId(fileId);
  let correctFileType = false;

  try {
    if (fileId.includes("input")) {
      correctFileType = payWellFileConverter(json);
    } else if (fileId.includes("bel")) {
      correctFileType = bookingFileConverter(json, studioNumber);
    } else if (fileId.includes("mem")) {
      correctFileType = memberFileConverter(json, studioNumber);
    } else if (fileId.includes("time")) {
      correctFileType = timeFileConverter(json, studioNumber);
    } else if (fileId.includes("pay")) {
      correctFileType = sessionFileConverter(json, studioNumber);
    } else if (fileId.includes("agree")) {
      correctFileType = agreementsFileConverter(json, studioNumber);
    } else if (fileId.includes("sale")) {
      if (useGrossSalesDetail) {
        correctFileType = productFileConverterGrossSales(json, studioNumber);
      } else {
        correctFileType = productFileConverter(json3, studioNumber);
      }
    }
  } catch (err) {
    console.log("ERROR", err);
    correctFileType = false;
  }
  return correctFileType;
}

export function findStudioNumberFromInputId(fileId) {
  const number = fileId.match(/\d/g);
  if (number === null) {
    return 0;
  } else {
    return number;
  }
}

export function makeIncorrectFilesNull(fileId) {
  const dictionaryId = fileId.replace("file", "");
  inputFilesArrays[dictionaryId] = null;
}

//ClubReady Input File Converters
export function payWellFileConverter(json) {
  const staffPayArrayFromInp = [];
  let question = false;

  let correctFileType = false;

  let hourlyIndex = 0;
  let groupIndex = 0;
  let privateIndex = 0;
  let introIndex = 0;
  let privateThirtyIndex = 0;
  let emailIndex = -1;

  for (let i = 0; i < json.length; i++) {
    if (i === 0) {
      if (!(json[i].includes("Location") && (json[i].includes("Instructor") || json[i].includes("Staff")))) {
        i = json.length;
        correctFileType = false;
      }
    }
    if (!question) {
      if (json[i][0].includes("Location") || json[i][1].includes("Instructor") || json[i][1].includes("Staff")) {
        for (let q = 0; q < json[i].length; q++) {
          if (json[i][q].includes("Hour") || json[i][q].includes("Time") || json[i][q].includes("Hourly")) {
            hourlyIndex = q;
          } else if (json[i][q].includes("Group") || json[i][q].includes("Group Class")) {
            groupIndex = q;
          } else if ( json[i][q].includes("Private") || json[i][q].includes("Private Class") ) {
            privateIndex = q;
          } else if ( json[i][q].includes("Intro") || json[i][q].includes("Intro Class")) {
            introIndex = q;
          } else if ( json[i][q].includes("30") || json[i][q].includes("30 min") ) {
            privateThirtyIndex = q;
          } else if (json[i][q].includes('Email')) {
            emailIndex = q;
          }
        }
        correctFileType = true;
      } else if ( json[i][0] !== "Location" && json[i][0] !== "Questions" && json[i][0] !== null && json[i][0] !== "") {
        let studios = [json[i][0]];
        if (json[i][0].includes("--")) {
          studios = json[i][0].split("--");
        }

        // for (let f = 0; f < studios.length; f++) {
        //   studios[f] = studios[f].replace("Club Pilates ", "");
        // }

        let names = [json[i][1]];
        if (json[i][1].includes("--")) {
          names = json[i][1].split("--");
        }

        const hourlyRate = json[i].slice(hourlyIndex, hourlyIndex + 1);
        const groupRates = json[i].slice(groupIndex + 1, privateIndex);
        const privateRates = json[i].slice(privateIndex + 1, introIndex);
        const introRates = json[i].slice(introIndex + 1);
        let privateThirtyRate = -1;
        if (privateThirtyIndex !== 0) {
          privateThirtyRate = json[i].slice( privateThirtyIndex, privateThirtyIndex + 1);
        }
        let email = [''];
          if(emailIndex >= 0){
            email = json[i].slice(emailIndex, emailIndex+1);
          }

        let type = "Non-Instructor";
        let hasPayRates = false;
        for (let y = 0; y < groupRates.length; y++) {
          if (!isNaN(parseFloat(groupRates[y]))) {
            hasPayRates = true;
          }
        }
        for (let z = 0; z < privateRates.length; z++) {
          if (!isNaN(parseFloat(privateRates[z]))) {
            hasPayRates = true;
          }
        }
        for (let a = 0; a < introRates.length; a++) {
          if (!isNaN(parseFloat(introRates[a]))) {
            hasPayRates = true;
          }
        }

        if (hasPayRates) {
          type = "Instructor";
        }

        let staffAdded = false;
        let staffReferenceIndex = -1;

        for (let b = 0; b < staffPayArrayFromInp.length; b++) {
          for (let c = 0; c < names.length; c++) {
            if (staffPayArrayFromInp[b].isNamed(names[c])) {
              staffAdded = true;
              staffReferenceIndex = b;
            }
          }

          if (staffAdded) {
            for (let p = 0; p < names.length; p++) {
              if (!staffPayArrayFromInp[b].isNamed(names[p])) {
                staffPayArrayFromInp[b].name.push(names[p]);
              }
            }
          }
        }

        if (staffAdded) {
          for (let s = 0; s < studios.length; s++) {
            if ( !staffPayArrayFromInp[staffReferenceIndex].location.includes(studios[s])) {
              staffPayArrayFromInp[staffReferenceIndex].location.push(studios[s]);
            }
            staffPayArrayFromInp[staffReferenceIndex].addHourlyRate(studios[s], hourlyRate);
            staffPayArrayFromInp[staffReferenceIndex].addGroupRates(studios[s], groupRates);
            staffPayArrayFromInp[staffReferenceIndex].addPrivateRates(studios[s], privateRates);
            staffPayArrayFromInp[staffReferenceIndex].addIntroRates(studios[s], introRates);
            staffPayArrayFromInp[staffReferenceIndex].addPrivateThirtyRate(studios[s], privateThirtyRate);
          }
        } else {
          const paywellStaff = new PayWellStaff(type, studios, names);
          for (let d = 0; d < studios.length; d++) {
            paywellStaff.addHourlyRate(studios[d], hourlyRate);
            paywellStaff.addGroupRates(studios[d], groupRates);
            paywellStaff.addPrivateRates(studios[d], privateRates);
            paywellStaff.addIntroRates(studios[d], introRates);
            paywellStaff.addPrivateThirtyRate(studios[d], privateThirtyRate);
          }
          paywellStaff.email = email[0];
          staffPayArrayFromInp.push(paywellStaff);
        }

        correctFileType = true;
        staffAdded = false;
        staffReferenceIndex = -1;
      } else if (json[i][0].includes("Questions")) {
        question = true;
      }
    } else if (json[i][0].includes("(1)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        payOnClassSize = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        payOnClassSize = false;
      }
    } else if (json[i][0].includes("(2)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        introPayOnSignUps = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        introPayOnSignUps = false;
      }
    } else if (json[i][0].includes("(3)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        pastButNotLoggedPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        pastButNotLoggedPay = false;
      }
    } else if (json[i][0].includes("(4)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        noShowPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        noShowPay = false;
      }
    } else if (json[i][0].includes("(5)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        cancelledWithinRulesPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        cancelledWithinRulesPay = false;
      }
    } else if (json[i][0].includes("(6)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        cancelledByAdminPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        cancelledByAdminPay = false;
      }
    } else if (json[i][0].includes("(7)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        cancelledOutsidePolicyPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        cancelledOutsidePolicyPay = false;
      }
    } else if (json[i][0].includes("(8)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        includeTimeClock = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        includeTimeClock = false;
      }
    } else if (json[i][0].includes("(9)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        basePayRate = parseFloat(json[i][1]);
      } else {
        basePayRate = json[i][1];
      }
    } else if (json[i][0].includes("(10)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        outputByStudio = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        outputByStudio = false;
      }
    } else if (json[i][0].includes("(11)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        memberWorkshopPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        memberWorkshopPay = false;
      }
    } else if (json[i][0].includes("(12)")) {
      if ( json[i][1].includes("Group") || json[i][1].includes("Private") || json[i][1].includes("Intro") || json[i][1].includes("None")) {
        ptaPay = json[i][1];
      } else {
        ptaPay = "None";
      }
    } else if (json[i][0].includes("(13)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        payMaxOnFullClasses = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        payMaxOnFullClasses = false;
      }
    } else if (json[i][0].includes("(14)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        payOnPrivateClassRate = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        payOnPrivateClassRate = false;
      }
    } else if (json[i][0].includes("(15)")) {
      // Do nothing
    } else if (json[i][0].includes("(16)")) {
      let x = 1;
      while (json[i][x].length > 1) {
        const arr = json[i][x].split(",");
        while (arr.length < 10) {
          arr.push("");
        }
        const catchAllQuestion = new CatchAllClassLogic(arr[0], arr[1], arr[2], arr[7], arr[4], arr[5], arr[6], arr[8], arr[9], arr[3]);
        certainClassTimes.push(catchAllQuestion);
        x++;
      }
    } else if (json[i][0].includes("(17)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        overtimeTimeClockInputs = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        overtimeTimeClockInputs = false;
      }
    } else if (json[i][0].includes("(18)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        includeAgreements = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        includeAgreements = false;
      }
    } else if (json[i][0].includes("(19)")) {
      const pay = json[i][1].split(",");
      introComPercent = pay.splice(0, 1);
      introComPay = pay;
    } else if (json[i][0].includes("(20)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        introInstructorBonus = parseFloat(json[i][1]);
      } else {
        introInstructorBonus = 0;
      }
    } else if (json[i][0].includes("(21)")) {
      const pay = json[i][1].split(",");
      nonIntroComPercent = pay.splice(0, 1);
      nonIntroComPay = pay;
    } else if (json[i][0].includes("(22)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        payComUpgrades = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        payComUpgrades = false;
      }
    } else if (json[i][0].includes("(23)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        includeSalesFile = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        includeSalesFile = false;
      }
    } else if (json[i][0].includes("(24)")) {
      const pay = json[i][1].split(",");
      productComPercent = pay.splice(0, 1);
      productSalesPay = pay;
    } else if (json[i][0].includes("(25)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        organizeStaffLastName = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        organizeStaffLastName = false;
      }
    } else if (json[i][0].includes("(26)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        includeCommissionTabs = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        includeCommissionTabs = false;
      }
    } else if (json[i][0].includes("(27)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        noCommissionForStaffBoughtProducts = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        noCommissionForStaffBoughtProducts = false;
      }
    } else if (json[i][0].includes("(28)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        annualCommission = parseFloat(json[i][1]);
      } else {
        annualCommission = json[i][1];
      }
    } else if (json[i][0].includes("(29)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        singleClassCommissionPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        singleClassCommissionPay = false;
      }
    } else if (json[i][0].includes("(30)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        singleClassPrevNewAgreement = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        singleClassPrevNewAgreement = false;
      }
    } else if (json[i][0].includes("(31)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        privateTrainingCommission = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        privateTrainingCommission = false;
      }
    } else if (json[i][0].includes("(32)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        toeSocksPay = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        toeSocksPay = false;
      }
    } else if (json[i][0].includes("(33)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        noProductSalesCommissionBelow = parseFloat(json[i][1]);
      } else {
        noProductSalesCommissionBelow = json[i][1];
      }
    } else if (json[i][0].includes("(34)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        diffCommissionPayCol = parseFloat(json[i][1]);
      } else {
        diffCommissionPayCol = -1;
      }
    } else if (json[i][0].includes("(35)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        annualsAlwaysNew = true;
      } else if (json[i][1].toUpperCase().includes("FALSE")) {
        annualsAlwaysNew = false;
      }
    } else if (json[i][0].includes("(36)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        timePeriodPostIntro = parseFloat(json[i][1]);
      } else {
        timePeriodPostIntro = -1;
      }
    } else if (json[i][0].includes("(37)")) {
      if (json[i][1].includes("Group") || json[i][1].includes("Private") || json[i][1].includes("Intro") || json[i][1].includes("None")) {
        internalSpecialEvent = json[i][1];
      } else {
        internalSpecialEvent = "None";
      }
    } else if (json[i][0].includes("(38)")) {
      if (json[i][1].includes("Group") || json[i][1].includes("Private") || json[i][1].includes("Intro") || json[i][1].includes("None")) {
        studioTourEvent = json[i][1];
      } else {
        studioTourEvent = "None";
      }
    } else if (json[i][0].includes("(39)")) {
      if (json[i][1].includes("Group") || json[i][1].includes("Private") || json[i][1].includes("Intro") || json[i][1].includes("None")) {
        virtualClassOpenEvent = json[i][1];
      } else if (!isNaN(parseFloat(json[i][1]))) {
        virtualClassOpenEvent = parseFloat(json[i][1]);
      } else {
        virtualClassOpenEvent = "None";
      }
    } else if (json[i][0].includes("(40)")) {
      if (json[i][1].includes("Group") || json[i][1].includes("Private") || json[i][1].includes("Intro") || json[i][1].includes("None")) {
        virtualPrivateEvent = json[i][1];
      } else {
        virtualPrivateEvent = "None";
      }
    } else if (json[i][0].includes("(41)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        defaultPrivatePayForFreeCredits = parseFloat(json[i][1]);
      } else {
        defaultPrivatePayForFreeCredits = 45;
      }
    } else if (json[i][0].includes("(42)")) {
      if (json[i][1].includes("Group") || json[i][1].includes("Private") || json[i][1].includes("Intro") || json[i][1].includes("None")) {
        outdoorClass = json[i][1];
      } else {
        outdoorClass = "None";
      }
    } else if (json[i][0].includes("(43)")) {
      if (!json[i][1] === "None" || json[i][1].length !== 0) {
        productSaleCommentForNoCommission = json[i][1];
      }
    } else if (json[i][0].includes("(44)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        useGrossSalesDetail = true;
      } else {
        useGrossSalesDetail = false;
      }
    } else if (json[i][0].includes("(45)")) {
      let x = 1;
      while (json[i][x].length > 1) {
        const arr = json[i][x].split(",");
        // arr[0] = arr[0].replace("Club Pilates ", "");
        salariedEmployeeInputs.push(arr);
        x++;
      }
    } else if (json[i][0].includes("(46)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        reimbursementTimeClockInputs = true;
      } else {
        reimbursementTimeClockInputs = false;
      }
    } else if (json[i][0].includes("(47)")) {
      if (json[i][1].toUpperCase().includes("TRUE")) {
        includeCostPerClassMetric = true;
      } else {
        includeCostPerClassMetric = false;
      }
    } else if (json[i][0].includes("(48)")) {
      if (!isNaN(parseFloat(json[i][1]))) {
        groupClassCapacity = parseFloat(json[i][1]);
      } else {
        groupClassCapacity = 12;
      }
    } else if (json[i][0].includes("(49)")) {
      for (let d = 1; d < json[i].length; d++) {
        if (json[i][d].length !== 0) {
          const type = json[i][d].substring(0, json[i][d].indexOf(","));
          const correctTypes = json[i][d].substring(json[i][d].indexOf("[") + 1, json[i][d].indexOf("]"));
          const incorrectTypes = json[i][d].substring(json[i][d].indexOf("{") + 1, json[i][d].indexOf("}"));
          const classTypeRequirements = new ClassTypeRequirements(type, correctTypes.split(","), incorrectTypes.split(","));
          specificClassRequirements.push(classTypeRequirements);
        }
      }
    } else if(json[i][0].includes('(50)')) {
      if(json[i][1].length > 0){
        rescheduledClassStatuses = json[i][1].split(',');
      }
    } else if(json[i][0].includes('(51)')){
      if (json[i][1].toUpperCase().includes('TRUE')) {
        summaryTabCommissionForIndividualTabs = true;
      } else {
        summaryTabCommissionForIndividualTabs = false;
      }
    }
  }

  inputFilesArrays["input1Pay"] = staffPayArrayFromInp;
  inputFilesArrays["input1Questions"] = createQuestionArray();
  console.log("inputFilesArrays", inputFilesArrays);

  studiosInformation["instructorsArray"] = createInstructorArray();
  studiosInformation["staffArray"] = createStaffArray();
  console.log("Studios Information", studiosInformation);

  const studiosArray = findNumberOfStudios();
  payrollInformation["studiosInInput"] = studiosArray;
  payrollInformation["numberOfStudios"] = studiosArray.length;
  console.log("Payroll Information", payrollInformation);
  // updateCurrentlySelectedStudios(payrollInformation.studiosInInput);
  return correctFileType;
}

export function findNumberOfStudios() {
  const inputFile = inputFilesArrays.input1Pay;
  const locations = [];
  for (let i = 0; i < inputFile.length; i++) {
    for (let j = 0; j < inputFile[i].location.length; j++) {
      if (!locations.includes(inputFile[i].location[j])) {
        locations.push(inputFile[i].location[j]);
      }
    }
  }
  return locations;
}

export function createQuestionArray() {
  const questionArray = {
    "payOnClassSize" : payOnClassSize,
    "introPayOnSignUps" : introPayOnSignUps,
    "pastButNotLoggedPay" : pastButNotLoggedPay,
    "noShowPay" : noShowPay,
    "cancelledWithinRulesPay" : cancelledWithinRulesPay,
    "cancelledByAdminPay" : cancelledByAdminPay,
    "cancelledOutsidePolicyPay" : cancelledOutsidePolicyPay,
    "includeTimeClock" : includeTimeClock,
    "basePayRate" : basePayRate,
    "outputByStudio" : outputByStudio,
    "memberWorkshopPay" : memberWorkshopPay,
    "ptaPay" : ptaPay,
    "payMaxOnFullClasses" : payMaxOnFullClasses,
    "payOnPrivateClassRate" : payOnPrivateClassRate,
    "certainClassTimes" : certainClassTimes,
    "overtimeTimeClockInputs" : overtimeTimeClockInputs,
    "includeAgreements" : includeAgreements,
    "introComPercent" : introComPercent,
    "introComPay" : introComPay,
    "introInstructorBonus" : introInstructorBonus,
    "nonIntroComPercent" : nonIntroComPercent,
    "nonIntroComPay" : nonIntroComPay,
    "payComUpgrades" : payComUpgrades,
    "includeSalesFile" : includeSalesFile,
    "productComPercent" : productComPercent,
    "productSalesPay" : productSalesPay,
    "organizeStaffLastName" : organizeStaffLastName,
    "includeCommissionTabs" : includeCommissionTabs,
    "noCommissionForStaffBoughtProducts" : noCommissionForStaffBoughtProducts,
    "annualCommission" : annualCommission,
    "singleClassCommissionPay" : singleClassCommissionPay,
    "singleClassPrevNewAgreement" : singleClassPrevNewAgreement,
    "privateTrainingCommission" : privateTrainingCommission,
    "toeSocksPay" : toeSocksPay,
    "noProductSalesCommissionBelow" : noProductSalesCommissionBelow,
    "diffCommissionPayCol" : diffCommissionPayCol,
    "annualsAlwaysNew" : annualsAlwaysNew,
    "timePeriodPostIntro" : timePeriodPostIntro,
    "internalSpecialEvent" : internalSpecialEvent,
    "studioTourEvent" : studioTourEvent,
    "virtualClassOpenEvent" : virtualClassOpenEvent,
    "virtualPrivateEvent" : virtualPrivateEvent,
    "defaultPrivatePayForFreeCredits" : defaultPrivatePayForFreeCredits,
    "outdoorClass" : outdoorClass,
    "productSaleCommentForNoCommission" : productSaleCommentForNoCommission,
    "useGrossSalesDetail" : useGrossSalesDetail,
    "salariedEmployeeInputs" : salariedEmployeeInputs,
    "reimbursementTimeClockInputs" : reimbursementTimeClockInputs,
    "includeCostPerClassMetric" : includeCostPerClassMetric,
    "groupClassCapacity" : groupClassCapacity,
  };
  return questionArray;
}

export function createInstructorArray() {
  const instructorArray = [];
  const inputFile = inputFilesArrays.input1Pay;

  for (let i = 0; i < inputFile.length; i++) {
    if (stringEq(inputFile[i].type, "Instructor")) {
      instructorArray.push(inputFile[i]);
    }
  }

  if (organizeStaffLastName) {
    instructorArray.sort(sortArrayLastName);
  }

  return instructorArray;
}

export function createStaffArray() {
  const staffArray = [];
  const inputFile = inputFilesArrays.input1Pay;
  for (let i = 0; i < inputFile.length; i++) {
    staffArray.push(inputFile[i]);
  }

  if (organizeStaffLastName) {
    staffArray.sort(sortArrayLastName);
  }

  return staffArray;
}

export function bookingFileConverter(json, studioNumber) {
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
      currentBelPayPeriod = findPayPeriodDates(json[i][0]);
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
  inputFilesArrays["bel" + studioNumber] = belArrayFromInp;

  return correctFileType;
}

export function findPayPeriodDates(row) {
  const secondStr = row.substring(row.indexOf("\n") + 1, row.length);
  const dates = secondStr.substring(0, secondStr.indexOf("\n"));
  const firstDate = dates.substring(0, dates.indexOf("-") - 1).split("/");
  const fd = new Date(firstDate[2], firstDate[0] - 1, firstDate[1]);
  const secondDate = dates.substring(dates.indexOf("-") + 2).split("/");
  const sd = new Date(secondDate[2], secondDate[0] - 1, secondDate[1]);
  payrollInformation["belPayPeriods"].push([fd, sd]);
  const sdPlusOne = addDay(sd);
  const currentBelPayPeriod = [fd, sdPlusOne];
  return currentBelPayPeriod;
}

export function addDay(date) {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  return result;
}

export function memberFileConverter(json, studioNumber) {
  const memArrayFromInp = [];
  let memTableStudioName = "";
  let firstNameI = 0;
  let lastNameI = 0;
  let memberStartDateI = 0;

  let correctFileType = false;
  for (let i = 0; i < json.length; i++) {
    if (((json[i][0].includes("User ID") || json[i][0].includes("Store ID")) && json[i][1].includes("Location Name")) || json[i][1].includes("First Name") || json[i][0].includes("First Name")) {
      for (let u = 0; u < json[i].length; u++) {
        if (json[i][u].includes("First Name")) {
          firstNameI = u;
        } else if (json[i][u].includes("Last Name")) {
          lastNameI = u;
        } else if (json[i][u].includes("Member Since")) {
          memberStartDateI = u;
        }
      }
      correctFileType = true;
    } else if (json[i][0] !== "" && json[i][2] !== "" && !json[i][0].includes("Member First Name") && !json[i][0].includes("Store ID")) {
      const memDate = createDateFromString(json[i][memberStartDateI], "00:00");

      const member = new Member(memTableStudioName, memDate, json[i][firstNameI], json[i][lastNameI]);
      memArrayFromInp.push(member);
    } else if (json[i][0].includes("Member List -") || json[i][0].includes("Active Members -")) {
      const startIndex = json[i][0].indexOf("-") + 2;
      const endIndex = json[i][0].indexOf("(") - 1;
      //memTableStudioName = json[i][0].substring(startIndex, endIndex).replace("Club Pilates ", "");
      memTableStudioName = json[i][0].substring(startIndex, endIndex)
    }
  }
  inputFilesArrays["mem" + studioNumber] = memArrayFromInp;
  return correctFileType;
}

export function timeFileConverter(json, studioNumber) {

  const timeArrayFromInp = [];
  let nameI = 0;
  let location = "";
  let totalMinI = 0;
  let payRateI = 0;

  let correctFileType = false;
  for (let i = 0; i < json.length; i++) {
    if (json[i][0].includes("User ID") || json[i][1].includes("Employee Name") || json[i][2].includes("Home Location")) {
      for (let u = 0; u < json[i].length; u++) {
        if (json[i][u].includes("Employee Name")) {
          nameI = u;
        } else if (json[i][u].includes("Total") && json[i][u].includes("Minutes")) {
          totalMinI = u;
        } else if (json[i][u].includes("Pay Rate")) {
          payRateI = u;
        }
      }
      correctFileType = true;
    } else if (!isNaN(parseFloat(json[i][0])) && json[i][0] !== "") {
      let hours = Math.round((parseFloat(json[i][totalMinI].replace(",", "").replace("$", "")) / 60) * 100) / 100;
      if (isNaN(parseFloat(hours))) {
        hours = 0;
      }

      const pay = parseFloat(json[i][payRateI].substring(json[i][payRateI].lastIndexOf("$") + 1));

      let payRate = parseFloat(findHourlyPayRate(json[i][nameI], location));
      if (payRate === 0) {
        payRate = pay;
      }

      const timeEvent = new TimeEvent(json[i][nameI], location, hours, payRate, "", 0);
      timeArrayFromInp.push(timeEvent);

      if (overtimeTimeClockInputs) {
        const overtimeEvent = new TimeEvent(json[i][nameI], location, 0, 0, "Overtime", 0);
        timeArrayFromInp.push(overtimeEvent);
      }
    
      if (reimbursementTimeClockInputs) {
        const reimbursementEvent = new TimeEvent(json[i][nameI], location, 0, 0, "Reimbursement", 0);
        timeArrayFromInp.push(reimbursementEvent);
      }
    } else if (json[i][0].includes("Time Clock") && json[i][0].includes("-")) {
      const startIndex = json[i][0].indexOf("-") + 2;
      const endIndex = json[i][0].indexOf("(") - 1;
      // location = json[i][0].substring(startIndex, endIndex).replace("Club Pilates ", "");
      location = json[i][0].substring(startIndex, endIndex)
    }
  }


  for (let n = 0; n < salariedEmployeeInputs.length; n++) {
    //if (salariedEmployeeInputs[n][0].replace("Club Pilates ", "") === location) {
    if (salariedEmployeeInputs[n][0] === location) {
      let employeeAlreadyHasHours = false;
      for (let o = 0; o < timeArrayFromInp.length; o++) {
        if (timeArrayFromInp[o][0] === salariedEmployeeInputs[n][1]) {
          employeeAlreadyHasHours = true;
        }
      }
      if (!employeeAlreadyHasHours) {
        const salariedEvent = new TimeEvent(salariedEmployeeInputs[n][1], salariedEmployeeInputs[n][0], 0, parseFloat(salariedEmployeeInputs[n][2]), "Salary", parseFloat(salariedEmployeeInputs[n][2]));
        timeArrayFromInp.push(salariedEvent);
      }
    }
  }
  inputFilesArrays["time" + studioNumber] = timeArrayFromInp;
  return correctFileType;
}

export function findHourlyPayRate(name, location) {
  const instructorPayTable = inputFilesArrays.input1Pay;
  for (let i = 0; i < instructorPayTable.length; i++) {
    if (instructorPayTable[i].isLocated(location) && instructorPayTable[i].isNamed(name)) {
      return instructorPayTable[i].hourly[location][0];
    }
  }
  return basePayRate;
}

export function sessionFileConverter(json, studioNumber) {
  const payArrayFromInp = [];
  let customerI = 0;
  let locationName = 0;
  let dateI = 0;
  let timeI = 0;
  let classNameI = 0;
  let priceI = 0;
  let instructorI = 0;
  let packageNameI = 0;
  let correctFileType = false;

  for (let i = 0; i < json.length; i++) {
    if (json[i].includes("Booking ID") || json[i].includes("Date") || json[i].includes("Home Location")) {
      for (let u = 0; u < json[i].length; u++) {
        if (json[i][u] !== "undefined") {
          if (json[i][u].includes("Date") && !json[i][u].includes("Logged")) {
            dateI = u;
          } else if (json[i][u].includes("Customer")) {
            customerI = u;
          } else if (json[i][u].includes("Start Time")) {
            timeI = u;
          } else if (json[i][u].includes("Price")) {
            priceI = u;
          } else if (json[i][u].includes("Session Type")) {
            classNameI = u;
          } else if (json[i][u].includes("Provider")) {
            instructorI = u;
          } else if (json[i][u].includes("Package Name")) {
            packageNameI = u;
          }
        }
      }
      correctFileType = true;
    } else if (json[i][0].includes("Bookings - ") || json[i][1].includes("Bookings - ")) {
      let index = 0;
      if (json[i][1].includes("Bookings - ")) {
        index = 1;
      }
      const loc = json[i][index].substring(json[i][index].indexOf("-") + 2, json[i][index].indexOf("(") - 1);
      // locationName = loc.replace("Club Pilates ", "");
      locationName = loc;
    } else if (!json[i][0].includes("Totals")) {
      let classN = json[i][classNameI];
      if (classN.includes("30 Mins")) {
        classN = classN.replace("30 Mins session", "(30 min)");
      }

      const payDate = createDateFromString(json[i][dateI], json[i][timeI]);
      const sessionPayrollClassEvent = new SessionPayrollClassEvent(json[i][customerI], parseFloat(json[i][priceI]), locationName, classN, payDate, json[i][instructorI], json[i][packageNameI]);
      payArrayFromInp.push(sessionPayrollClassEvent);
    }
  }
  inputFilesArrays["pay" + studioNumber] = payArrayFromInp;
  return correctFileType;
}

export function agreementsFileConverter(json, studioNumber) {
  const agreeArrayFromInp = [];
  let agreeLocationI = 0;
  let agreeDateI = 0;
  let agreeDescriptionI = 0;
  let agreeSalesPersonI = 0;
  let agreeSalesPerson2I = 0;
  let agreeFirstNameI = 0;
  let agreeLastNameI = 0;
  let agreeMemTypeI = 0;
  let agreePriceI = 0;
  let agreePreviousI = 0;
  let agreePreviousDetailI = 0;
  let agreementsNotesI = 0;
  let agreeStatusI = 0;
  let agreeSetupFeeI = 0;
  let correctFileType = false;

  for (let i = 0; i < json.length; i++) {
    if (json[i][0] === "Location Name" && json[i][1] === "Agreed Date") {
      for (let j = 0; j < json[i].length; j++) {
        if (json[i][j].includes("Location Name")) {
          agreeLocationI = j;
        } else if (json[i][j].includes("Agreed Date") && !json[i][j].includes("Previous")) {
          agreeDateI = j;
        } else if (json[i][j].includes("Description")) {
          agreeDescriptionI = j;
        } else if (json[i][j].includes("Sales Person") && !json[i][j].includes("Second")) {
          agreeSalesPersonI = j;
        } else if (json[i][j].includes("Second Sales Person")) {
          agreeSalesPerson2I = j;
        } else if (json[i][j].includes("Client First")) {
          agreeFirstNameI = j;
        } else if (json[i][j].includes("Client Last")) {
          agreeLastNameI = j;
        } else if (json[i][j].includes("Membership Type")) {
          agreeMemTypeI = j;
        } else if ((json[i][j].includes(" Paid Upfront") && diffCommissionPayCol === -1) || (diffCommissionPayCol > -1 && j === diffCommissionPayCol)) {
          agreePriceI = j;
        } else if (json[i][j].includes("Previous Agreements")) {
          agreePreviousI = j;
        } else if (json[i][j].includes("Previous Agreement Detail")) {
          agreePreviousDetailI = j;
        } else if (json[i][j].includes("Agreement Notes")) {
          agreementsNotesI = j;
        } else if (json[i][j].includes(" Setup Fee")) {
          agreeSetupFeeI = j;
        } else if (json[i][j].includes("Current Status")) {
          agreeStatusI = j;
        }
      }
      correctFileType = true;
    } else if (json[i][0].length > 7 && json[i][0] !== "" && !json[i][0].includes("Agreements Log") && json[i][agreeStatusI] !== "Cancelled") {
      const agreeDate = createDateFromString(json[i][agreeDateI], "00:00");

      // const location = json[i][agreeLocationI].substring(0, json[i][agreeLocationI].indexOf("(") - 1).replace("Club Pilates ", "");
      const location = json[i][agreeLocationI].substring(0, json[i][agreeLocationI].indexOf("(") - 1);
      let secondarySalesperson = "N/A";
      if (json[i][agreeSalesPerson2I].length > 1) {
        secondarySalesperson = json[i][agreeSalesPerson2I];
      }

      let payment = 0;
      if (diffCommissionPayCol === -1) {
        payment = parseFloat(json[i][agreePriceI].replace("$", "").replace("$", "")) - parseFloat(json[i][agreeSetupFeeI].replace("$", "").replace("$", ""));
      } else {
        payment = parseFloat(json[i][agreePriceI].replace("$", ""));
      }
      const previousAgreementNumber = parseFloat(json[i][agreePreviousI].replace("$", "").replace("$", ""));
      const agreementEvent = new AgreementEvent(location, agreeDate, json[i][agreeDescriptionI], json[i][agreeSalesPersonI], secondarySalesperson, json[i][agreeFirstNameI], json[i][agreeLastNameI], json[i][agreeMemTypeI], payment, previousAgreementNumber, json[i][agreePreviousDetailI], json[i][agreementsNotesI]);

      agreeArrayFromInp.push(agreementEvent);
    }
  }
  inputFilesArrays["agree" + studioNumber] = agreeArrayFromInp;
  return correctFileType;
}

export function productFileConverter(json, studioNumber) {
  const salesArrayFromInp = [];
  let salesLocationI = 0;
  let salesDateI = 0;
  let salesProductI = 0;
  let salesSalesPersonI = 0;
  let salesFirstNameI = 0;
  let salesLastNameI = 0;
  let salesPriceI = 0;
  let salesNotesI = 0;
  let correctFileType = false;

  if (json[0][0].includes("Gross")) {
    alert("Wrong retail sales file, please use the 'Product Sales Log'");
    return correctFileType;
  }
  for (let i = 0; i < json.length; i++) {
    if (json[i][0] === "Date" && json[i][1] === "Time") {
      for (let j = 0; j < json[i].length; j++) {
        if (json[i][j].includes("POS Terminal")) {
          salesLocationI = j;
        } else if (json[i][j].includes("Date")) {
          salesDateI = j;
        } else if (json[i][j].includes("Product")) {
          salesProductI = j;
        } else if (json[i][j].includes("Ran By")) {
          salesSalesPersonI = j;
        } else if (json[i][j].includes("First Name")) {
          salesFirstNameI = j;
        } else if (json[i][j].includes("Last Name")) {
          salesLastNameI = j;
        } else if (json[i][j].includes("Price")) {
          salesPriceI = j;
        } else if (json[i][j].includes("Notes")) {
          salesNotesI = j;
        }
      }
      correctFileType = true;
    } else if (json[i][1] !== "" && !json[i][0].includes("Products Sold")) {
      const salesDate = createDateFromString(json[i][salesDateI], "00:00");

      //const location = json[i][salesLocationI].replace(" POS", "").replace("Club Pilates ", "");
      const location = json[i][salesLocationI].replace(" POS", "");
      const price = parseFloat(json[i][salesPriceI].replace("$", "").replace("$", ""));
      const productEvent = new ProductEvent(location, salesDate, json[i][salesProductI], json[i][salesSalesPersonI], json[i][salesFirstNameI], json[i][salesLastNameI], price, json[i][salesNotesI]);

      salesArrayFromInp.push(productEvent);
    }
  }
  inputFilesArrays["sale" + studioNumber] = salesArrayFromInp;
  return correctFileType;
}

export function productFileConverterGrossSales(json, studioNumber) {
  const salesArrayFromInp = [];
  let salesLocation = "";
  let salesDateI = 0;
  let salesInvoiceTypeI = 0;
  let salesProductI = 0;
  let salesSalesPersonI = 0;
  let salesFirstNameI = 0;
  let salesLastNameI = 0;
  let salesPriceI = 0;
  let salesNotesI = 0;
  let correctFileType = false;

  if (json[0][0].includes("Product Sales")) {
    alert("Wrong retail sales file, please use the 'Gross Sales Detail'");
    return correctFileType;
  }
  for (let i = 0; i < json.length; i++) {
    if (json[i][0].includes("Gross Sales Detail -")) {
      // salesLocation = json[i][0].substring(json[i][0].indexOf("-") + 2, json[i][0].indexOf("(") - 1).replace("Club Pilates ", "");
      salesLocation = json[i][0].substring(json[i][0].indexOf("-") + 2, json[i][0].indexOf("(") - 1);
    } else if (json[i][0] === "Date" && json[i][1] === "Time") {
      for (let j = 0; j < json[i].length; j++) {
        if (json[i][j].includes("Date") && !json[i][j].includes("Pending") && !json[i][j].includes("Due") && !json[i][j].includes("Agreement")) {
          salesDateI = j;
        } else if (json[i][j].includes("Invoice Type")) {
          salesInvoiceTypeI = j;
        } else if (json[i][j].includes("Description")) {
          salesProductI = j;
        } else if (json[i][j].includes("Primary Sales Person")) {
          salesSalesPersonI = j;
        } else if (json[i][j].includes("First Name")) {
          salesFirstNameI = j;
        } else if (json[i][j].includes("Last Name")) {
          salesLastNameI = j;
        } else if (json[i][j].includes("Gross Revenue")) {
          salesPriceI = j;
        } else if (json[i][j].includes("Notes")) {
          salesNotesI = j;
        }
      }
      correctFileType = true;
    } else if (json[i][1] !== "" && json[i][salesInvoiceTypeI].includes("Product")) {
      const salesDate = createDateFromString(json[i][salesDateI], "00:00");

      const price = parseFloat(json[i][salesPriceI].replace("$", "").replace("$", ""));
      const productEvent = new ProductEvent(salesLocation, salesDate, json[i][salesProductI], json[i][salesSalesPersonI], json[i][salesFirstNameI], json[i][salesLastNameI], price, json[i][salesNotesI]);

      salesArrayFromInp.push(productEvent);
    }
  }
  inputFilesArrays["sale" + studioNumber] = salesArrayFromInp;
  return correctFileType;
}

// Create Classes
export function createClasses() {
  console.log("createClasses()...");
  console.log("From create class: ", inputFilesArrays);
  const belTable = inputFilesArrays.BEL;
  const classes = [];
  let classFound = false;

  for (let i = 0; i < belTable.length; i++) {
    if (i === 0) {
      classFound = false;
    } else {
      for (let y = 0; y < classes.length; y++) {
        if (stringEq(classes[y].name, belTable[i].className) && stringEq(classes[y].instructor, belTable[i].classInstructor) && stringEq(classes[y].location, belTable[i].classLocation) && classes[y].date.getTime() === belTable[i].classDate.getTime()) {
          const attendee = new ClassAttendee(belTable[i].getMemberName(), belTable[i].eventLoggedBy, belTable[i].eventLogDate, belTable[i].eventType, belTable[i].eventStatus);
          classes[y].attendeeList.push(attendee);
          classFound = true;
        }
      }
    }
    if (!classFound) {
      const classEvent = new ClassEvent(belTable[i].className, belTable[i].classInstructor, belTable[i].classLocation, belTable[i].classDate);
      const attendee = new ClassAttendee(belTable[i].getMemberName(), belTable[i].eventLoggedBy, belTable[i].eventLogDate, belTable[i].eventType, belTable[i].eventStatus);

      classEvent.attendeeList.push(attendee);
      classes.push(classEvent);
    }
    classFound = false;
  }

  console.log("Classes Table", classes);

  addClassType(classes);
  addClassCounts(classes);
  addClassPay(classes);
  if (certainClassTimes.length > 0) {
    addCatchAllLogicPay(classes);
  }
  if(rescheduledClassStatuses.length > 0){
    checkForRescheduledClasses(classes);
  }
  addClassComments(classes);
  organizeClasses(classes);
  studiosInformation["classes"] = classes;

  writeExcel();
}

export function addClassType(classesArray) {
  for (let i = 0; i < classesArray.length; i++) {
    const className = classesArray[i].name;
    if (className.includes('Private') && !(className.includes('Assessment') || className.includes('ASMT') || className.includes('Virtual') || className.includes('Intro')) ||
      ((className.includes('Assessment') || className.includes('ASMT')) && ptaPay.includes('Private')) ||
      (className.includes('Internal Special') && internalSpecialEvent == 'Private') ||
      (className.includes('Studio Tour') && studioTourEvent == 'Private') ||
      ((className.includes('Virtual Class - Open') || className.includes('Virtual Class!')) && (virtualClassOpenEvent == 'Private' )) ||
      (className.includes('Virtual Private') && (virtualPrivateEvent == 'Private' || (!isNaN(virtualPrivateEvent)) )) ||
      (className.includes('Outdoor Class') && (outdoorClass == 'Private' ))
    ) {
      classesArray[i].type = 'Private';
    } else if (className.includes('Intro') ||
    ((className.includes('Assessment') || className.includes('ASMT')) && ptaPay.includes('Intro')) ||
    (className.includes('Internal Special') && internalSpecialEvent == 'Intro') ||
    (className.includes('Studio Tour') && studioTourEvent == 'Intro') ||
    ((className.includes('Virtual Class - Open') || className.includes('Virtual Class!')) && (virtualClassOpenEvent == 'Intro' )) ||
    (className.includes('Virtual Private') && (virtualPrivateEvent == 'Intro' )) ||
    (className.includes('Outdoor Class') && (outdoorClass == 'Intro' ))
    ) {
      classesArray[i].type = 'Intro';
      setIntroClassSignups(classesArray[i]);
    } else if (className.includes('CP') ||
    ((className.includes('Assessment') || className.includes('ASMT')) && (ptaPay.includes('Group'))) ||
    (className.includes('Member Work') && memberWorkshopPay) ||
    (className.includes('Internal Special') && internalSpecialEvent == 'Group') ||
    (className.includes('Studio Tour') && studioTourEvent == 'Group') ||
    ((className.includes('Virtual Class - Open') || className.includes('Virtual Class!')) && ((virtualClassOpenEvent == 'Group' ) || (!isNaN(virtualClassOpenEvent)) )) ||
    (className.includes('Virtual Private') && virtualPrivateEvent == 'Group') ||
    (className.includes('Outdoor Class') && ((outdoorClass == 'Group' ) || (!isNaN(outdoorClass)) )) ||
    checkIfSpecificPaymentType(className)
) {
  classesArray[i].type = 'Group';
} else {
      classesArray[i].type = 'None';
    }
  }
}

export function checkIfSpecificPaymentType(className) {
  for (let i = 0; i < certainClassTimes.length; i++) {
    if (className.includes(certainClassTimes[i].className)) {
      return true;
    }
  }
  return false;
}

export function setIntroClassSignups(classObj) {
  const memTable = inputFilesArrays.MEM;
  const belPayPeriods = payrollInformation.belPayPeriods;

  for (let i = 0; i < classObj.attendeeList.length; i++) {
    const attendee = classObj.attendeeList[i];
    attendee.setSignedUpAfterIntro(false);
    for (let q = 0; q < memTable.length; q++) {
      if (stringEq(attendee.name, memTable[q].getFullName()) && stringEq(classObj.location, memTable[q].location) && (belPayPeriods[0][0].getTime() <= memTable[q].memberSince.getTime() && addDay(belPayPeriods[0][1]).getTime() >= memTable[q].memberSince.getTime())) {
        attendee.setSignedUpAfterIntro(true);
      }
    }
  }
}

// export function findIntroClassCount(classObj) {
//   const memTable = inputFilesArrays.MEM;
//   const belPayPeriods = payrollInformation.belPayPeriods;

//   for (let i = 0; i < classObj.attendeeList.length; i++) {
//     const attendee = classObj.attendeeList[i];
//     attendee.setSignedUpAfterIntro(false);
//     for (let q = 0; q < memTable.length; q++) {
//       if (stringEq(attendee.name, memTable[q].getFullName()) && stringEq(classObj.location, memTable[q].location) && belPayPeriods[0][0].getTime() <= memTable[q].memberSince.getTime() && addDay(belPayPeriods[0][1]).getTime() >= memTable[q].memberSince.getTime()) {
//         attendee.setSignedUpAfterIntro(true);
//       }
//     }
//   }
// }

export function addClassCounts(classesArray) {
  for (let i = 0; i < classesArray.length; i++) {
    const classObj = classesArray[i];
    for (let j = 0; j < classObj.attendeeList.length; j++) {
      const attendee = classObj.attendeeList[j];
      if (attendee.bookingEventType === "Booking Completed" ||
        (attendee.bookingEventType.includes("No-Show") && noShowPay) ||
        (attendee.bookingEventType === "Past But Not Logged" && pastButNotLoggedPay) ||
        (attendee.bookingEventType === "Booking Cancelled" && attendee.bookingStatus.includes("Cancelled By Admin") && cancelledByAdminPay) ||
        (attendee.bookingEventType === "Booking Cancelled" && attendee.bookingStatus.includes("Cancelled Within Policy Rules") && cancelledWithinRulesPay) ||
        (attendee.bookingEventType === "Booking Cancelled" && attendee.bookingStatus.includes("Cancelled Outside Policy") && cancelledOutsidePolicyPay)
      ) {
        attendee.completed = true;
        if (classObj.attendeeCount < groupClassCapacity) {
          classObj.attendeeCount += 1;
        }
      }
    }
    if (specificClassRequirements.length > 0) {
      findSpecificClassCounts(classObj);
    }
    if (payMaxOnFullClasses) {
      payMaxOnFullClassesCheck(classObj);
    }
  }
}

export function findSpecificClassCounts(classObj) {
  for (let i = 0; i < specificClassRequirements.length; i++) {
    if (stringEq(specificClassRequirements[i].type, classObj.type)) {
      let classCountNum = 0;
      for (let j = 0; j < classObj.attendeeList.length; j++) {
        const attendee = classObj.attendeeList[j];
        let attendeeCounts = false;
        for (let s = 0; s < specificClassRequirements[i].correctTypes.length; s++) {
          const correctTypeElement = specificClassRequirements[i].correctTypes[s];
          if (attendee.bookingEventType.includes(correctTypeElement) || attendee.bookingStatus.includes(correctTypeElement)) {
            attendeeCounts = true;
          }
        }
        for (let t = 0; t < specificClassRequirements[i].incorrectTypes.length; t++) {
          const incorrectTypeElement = specificClassRequirements[i].incorrectTypes[t];
          if (attendee.bookingEventType.includes(incorrectTypeElement) || attendee.bookingStatus.includes(incorrectTypeElement)) {
            attendeeCounts = false;
          }
        }

        if (attendeeCounts) {
          classCountNum += 1;
        }
      }
      classObj.attendeeCount = classCountNum;
    }
  }
}

export function payMaxOnFullClassesCheck(classObj) {
  let nonAttendees = 0;
  for (let j = 0; j < classObj.attendeeList.length; j++) {
    const attendee = classObj.attendeeList[j];

    if (!attendee.bookingEventType.includes('Booking Completed')) {
      if (attendee.loggedTime.getTime() + (12*60*60*1000) >= classObj.date.getTime()) {
        nonAttendees++;
      } else if (attendee.bookingEventType.includes('No-Show')) {
        nonAttendees++;
      } else if (attendee.bookingEventType.includes('Booking Cancelled')) {
        if (attendee.bookingStatus.includes('Cancelled Outside Policy') || attendee.bookingStatus.includes('Rescheduled By Admin')) {
          nonAttendees++;
        }
      }
    }
  }
  if (classObj.attendeeCount + nonAttendees >= groupClassCapacity) {
    classObj.attendeeCount = groupClassCapacity;
    classObj.comment.push('Full class with Cancels & No-Shows');
  }
}

function addClassPay(classesArray) {
  const instructorPayTable = inputFilesArrays.input1Pay;
  for (let i = 0; i < classesArray.length; i++) {
    for (let j = 0; j < instructorPayTable.length; j++) {
      if (instructorPayTable[j].isLocated(classesArray[i].location) && instructorPayTable[j].isNamed(classesArray[i].instructor)) {
        if (stringEq(classesArray[i].type, 'Group')) {
          const finalPay = parseFloat(instructorPayTable[j].groupRates[classesArray[i].location][(classesArray[i].attendeeCount)]);
          classesArray[i].pay = finalPay;

        } else if (stringEq(classesArray[i].type, 'Private')) {
          let pay = 0;
          if (classesArray[i].attendeeCount-1 >= 0) {
            pay = parseFloat(instructorPayTable[j].privateRates[classesArray[i].location][(classesArray[i].attendeeCount)-1]);

            if (classesArray[i].name.includes('(30 min)') && instructorPayTable[j].privateThirtyRate[classesArray[i].location][0] > 0) {
              pay = parseFloat(instructorPayTable[j].privateThirtyRate[classesArray[i].location][0]);
            }

            if (payOnPrivateClassRate && pay < 1 ) {
              const cost = privatePercentageOfPay(classesArray[i]);
              if (cost == null) {
                classesArray[i].comment.push('*NO SESSION PAYROLL CLASS FOUND');
              }
              pay = pay * cost;
            }
          }

          classesArray[i].pay = pay;
        } else if (stringEq(classesArray[i].type, 'Intro')) {
          let pay = parseFloat(instructorPayTable[j].introRates[classesArray[i].location][(classesArray[i].attendeeCount)]);

          if (introPayOnSignUps) {
            const signUps = findIntroSignUps(classesArray[i]);
            pay = parseFloat(instructorPayTable[j].introRates[classesArray[i].location][signUps]);
          }
          classesArray[i].pay = pay;
        }
      }
    }
  }
}

  function findIntroSignUps(classObj) {
    let signUps = 0;
    for (let i = 0; i < classObj.attendeeList.length; i++) {
      const attendee = classObj.attendeeList[i];
      if (attendee.signedUpAfterIntro) {
        signUps++;
      }
    }
    return signUps;
  }

function addCatchAllLogicPay(classesArray){
  for(let i = 0; i < classesArray.length; i++){
    if(classesArray[i].instructor.length > 0){
      checkClassCatchAllFulfilment(classesArray[i]);
    }
  }
}

  function checkClassCatchAllFulfilment(classObj) {
    for (let i = 0; i < certainClassTimes.length; i++) {
      const attributesCorrect = catchAllAttributesCorrect(classObj, certainClassTimes[i]);
      if (!attributesCorrect) {
        continue;
      }
      const timeCorrect = catchAllTimesCorrect(classObj, certainClassTimes[i]);
      if(!timeCorrect){
        continue;
      }
      let rateComment = addCatchAllPayRate(classObj, certainClassTimes[i]);
      if(rateComment != '')
        classObj.comment.push(createCatchAllComment(certainClassTimes[i]) + rateComment);
      }
  }

    function catchAllAttributesCorrect(classObj, catchAll) {
      if (!(catchAll.className == 'Any' || classObj.name.includes(catchAll.className) ) ) {
        return false;
      } if (!(catchAll.instructor == 'Any' || stringEq(catchAll.instructor, classObj.instructor) )) {
        return false;
      } if (!(catchAll.studio == 'Any' || stringEq(catchAll.studio, classObj.location) )) {
        return false;
      } if (!(catchAll.day.toUpperCase().includes('ANY') || weekDictionary[catchAll.day] == classObj.date.getDay() )) {
        return false;
      } if (!(catchAll.type == 'Any' || stringEq(catchAll.type, classObj.type) )) {
        return false;
      } if (!(catchAll.payAmount == 'Any' || checkIfPayAmountCorrect(catchAll.payAmount, parseFloat(classObj.pay)) )) {
        return false;
      } if (!(catchAll.attendeeAmount == 'Any' || checkIfAttendeeAmountCorrect(catchAll.attendeeAmount, parseFloat(classObj.attendeeCount)) )) {
        return false;
      }
      return true;
    }

      function checkIfPayAmountCorrect(catchAllPay, classPay) {
        let operator = catchAllPay.substring(0,1);
        let amount = parseFloat(catchAllPay.substring(1));
        if(stringEq(operator, '<') ) {
          return classPay < amount;
        }else if(stringEq(operator, '>')) {
          return classPay > amount;
        }else if(stringEq(operator, '=')){
          return amount == classPay;
        }else if(stringEq(operator, '!')){
          return amount != classPay;
        }
        return false;
      }

      function checkIfAttendeeAmountCorrect(catchAllPay, classAttendence) {
        let operator = catchAllPay.substring(0,1);
        let amount = parseFloat(catchAllPay.substring(1));
        if(stringEq(operator, '<') ) {
          return classAttendence < amount;
        }else if(stringEq(operator, '>')) {
          return classAttendence > amount;
        }else if(stringEq(operator, '=')){
          return amount == classAttendence;
        }else if(stringEq(operator, '!')){
          return amount != classAttendence;
        }
        return false;
      }

    function catchAllTimesCorrect(classObj, catchAll) {
      const classes = studiosInformation.classes;
      const classTime = classObj.date.getHours() + (classObj.date.getMinutes() / 60);
      const catchAllHours = stringHoursToDigit(catchAll.time);

      if (catchAll.sequence.includes('All') ) {
        return true;
      } else if (catchAll.sequence.includes('Before')) {
        if (classTime < catchAllHours) {
          return true
        }
      } else if (catchAll.sequence.includes('After')) {
        if (classTime > catchAllHours) {
          return true
        }
      } else if (catchAll.sequence.includes('First') ) {
        let first = true;
        for (let x = 0; x < classes.length; x++) {
          if (classes[x].date.getDate() == classObj.date.getDate() ) {
            if (classes[x].date.getTime() < classObj.date.getTime() ) {
              first = false;
            }
          }
        }
        if (first) {
          return true;
        }
      }
      return false;
    }

      function stringHoursToDigit(time) {
        const hour = time.substring(0, time.indexOf(':'));
        const minutes = time.substring(time.indexOf(':') + 1);
        const hourStr = parseFloat(hour);
        const minStr = parseFloat(minutes) / 60;
        return hourStr + minStr;
      }

    function addCatchAllPayRate(classObj, catchAll) {
      const rate = catchAll.rate;
      let instructorObj = findInstructorObj(classObj.instructor);
      if(instructorObj == null){
        return;
      }
      if (rate.includes('@')) {
        const studNum = parseFloat(rate.substring(1));
        const studentNumberPay = parseFloat(instructorObj.groupRates[classObj.location][studNum]);
        if (studentNumberPay > classObj.pay || catchAll.overridePay) {
          classObj.pay = studentNumberPay;
          return '' + rate.substring(1) + ' attendee rate';
        }
      } else if (rate.includes('*')) {
        const exactNum = rate.substring(1);
        const exactAmountPay = parseFloat(exactNum);
        if (exactAmountPay > classObj.pay || catchAll.overridePay) {
          classObj.pay = exactAmountPay;
          return '$' + rate.substring(1) + ' exactly';
        }
      } else if (rate.includes('NS') || rate.includes('LC')) {
        let students = classObj.attendeeCount;
        let nslcComment = '';
        let nsComment = '0 No-Shows';
        let lcComment = '0 Late-Cancels';

        if (rate.includes('NS')) {
          const noShows = findNoShows(classObj.attendeeList);
          students += noShows;
          nsComment = noShows + " No-Shows";
        }
        if (rate.includes('LC')) {
          const lateCancels = findLateCancels(classObj.attendeeList);
          students += lateCancels;
          lcComment = lateCancels + " Late-Cancels";
        }
        if (students > groupClassCapacity) {
          students = groupClassCapacity;
        }
        const includingNSLCPay = parseFloat(instructorObj.groupRates[classObj.location][students]);
        if (includingNSLCPay > classObj.pay || catchAll.overridePay) {
          classObj.pay = includingNSLCPay;
          return nsComment + " & " + lcComment + " paid";
        }
      } else if (rate.includes('hourly')) {
        const hourlyPay = findHourlyPayRate(classObj.instructor, classObj.location);
        const mathSign = rate.indexOf('hourly')-1;
        if (rate[mathSign] == '+') {
          let staticAmount = rate.substring(0, rate.indexOf('+'));
          if (staticAmount < 1) {
            staticAmount = staticAmount * privatePercentageOfPay(classObj);
          }
          classObj.pay = parseFloat(staticAmount) - hourlyPay;
          return '$' + staticAmount + ' + hourly ($' + hourlyPay + ')';
        } else if (rate[mathSign] == '-') {
          let staticAmount = rate.substring(0, rate.indexOf('-'));
          if (staticAmount < 1) {
            staticAmount = staticAmount * privatePercentageOfPay(classObj);
          }
          classObj.pay = parseFloat(staticAmount) - hourlyPay;
          return '$' + staticAmount + ' - hourly ($' + hourlyPay + ')';
        } else {
          alert('Unrecognizable hourly usage');
        }
      } else if (parseFloat(rate) > 1) {
        const addedAmountPay = parseFloat(instructorObj.groupRates[classObj.location][classObj.attendeeCount]) + parseFloat(rate);
        if (addedAmountPay > classObj.pay || catchAll.overridePay) {
          classObj.pay = addedAmountPay;
          return '+$' + rate + ' bonus';
        }
      } else if (parseFloat(rate) <= 1) {
        const percentagePay = parseFloat(rate) * parseFloat(instructorObj.groupRates[classObj.location][groupClassCapacity]);
        if (percentagePay > classObj.pay || catchAll.overridePay) {
          classObj.pay = percentagePay;
          return '' + rate + '% of full class rate';
        }
      } else if (rate == 'Group') {
        classObj.pay = parseFloat(instructorObj.groupRates[classObj.location][classObj.attendeeCount]);
        return 'Group Rate';
      } else if (rate == 'Private') {
        classObj.pay = parseFloat(instructorObj.privateRates[classObj.location][classObj.attendeeCount]);
        return 'Private Rate';
      } else if (rate == 'Intro') {
        classObj.pay = parseFloat(instructorObj.introRates[classObj.location][classObj.attendeeCount]);
        return 'Intro Rate';
      } 
      return '';
    }

      function findInstructorObj(instructor){
        const instructorArray = studiosInformation.instructorsArray;
        for(let i = 0; i < instructorArray.length; i++){
          if(instructorArray[i].isNamed(instructor)){
            return instructorArray[i];
          }
        }
        return null;
      }

      function findNoShows(attendeeList) {
        let noShows = 0;
        for (let i = 0; i < attendeeList.length; i++) {
          if (attendeeList[i].bookingStatus.includes('No Show')) {
            noShows++;
          }
        }
        return noShows;
      }

      function findLateCancels(attendeeList) {
        let lateCancels = 0;
        for (let i = 0; i < attendeeList.length; i++) {
          if (attendeeList[i].bookingStatus.includes('Cancelled Outside Policy')) {
            lateCancels++;
          }
        }
        return lateCancels;
      }

      function privatePercentageOfPay(classObj) {
        const payChartTable = inputFilesArrays.PAY;
        const attendeeName = classObj.attendeeList[0].name;
        for (let i = 0; i < payChartTable.length; i++) {
          if (stringEq(attendeeName, payChartTable[i].customer) && payChartTable[i].className.includes(classObj.name) && stringEq(classObj.location, payChartTable[i].location) && classObj.date.getDate() == payChartTable[i].date.getDate()) {
            checkForClassPack(classObj, payChartTable[i]);
            return parseFloat(payChartTable[i].price);
          }
        }
        return null;
      }

        function checkForClassPack(classObj, sessionPayrollClass) {
          if (sessionPayrollClass.classPackage.length == 0) {
            classObj.comment.push('No Class Package Found');
          }
        }

    function createCatchAllComment(c){
      let comment = c.type + ", " + c.className + ", " + c.day + ", " + c.sequence + " " + c.time + ", " + c.instructor + ", " + c.studio + ", " + c.payAmount + ", " + c.attendeeAmount + ", ";
      if(c.rate.includes('FLAG:')){
        return c.rate.substring(c.rate.indexOf(':')+1);
      }
      if(c.type.toUpperCase() == 'ANY'){
        comment = comment.replace(c.type + ', ', '');
      }
      if(c.className.toUpperCase() == 'ANY'){
        comment = comment.replace(c.className + ', ', '');
      }
      if(c.day.toUpperCase() == 'ANY'){
        comment = comment.replace(c.day + ', ', '');
      }
      if(c.sequence.toUpperCase() == 'ALL'){
        comment = comment.replace('All ', '');
        comment = comment.replace('00:00, ', '');
        comment = comment.replace('0:00, ', '');
      }
      if(c.sequence.toUpperCase() == 'FIRST'){
        comment = comment.replace('00:00, ', 'Class');
        comment = comment.replace('0:00, ', 'Class');
      }
      if(c.instructor.toUpperCase() == 'ANY'){
        comment = comment.replace(c.instructor + ', ', '');
      }
      if(c.studio.toUpperCase() == 'ANY'){
        comment = comment.replace(c.studio + ', ', '');
      }
      if(c.payAmount.toUpperCase() == 'ANY'){
        comment = comment.replace(c.payAmount + ', ', '');
      }else{
        comment = comment.replace(c.payAmount + ', ', c.payAmount.substring(0,1) + '$' + c.payAmount.substring(1) + ', ');
      }
      if(c.attendeeAmount.toUpperCase() == 'ANY'){
        comment = comment.replace(c.attendeeAmount + ', ', '');
      }else{
        comment = comment.replace(c.attendeeAmount + ', ', c.attendeeAmount + ' attendees, ');
      }
      comment = comment + ': ';
      comment = comment.replace(', : ', ': ');
      return comment;
    }

function checkForRescheduledClasses(classes){
  for(let x = 0; x < classes.length; x++){
    let classObj = classes[x];

    let attendeesWhoWereRescheduled = 0;
    let attendeesWhoWerentReschedule = 0;
    for(let i = 0; i < classObj.attendeeList.length; i++){
      let rescheduled = false;
      let attendee = classObj.attendeeList[i];
      for(let j = 0; j < rescheduledClassStatuses.length; j++){
        if( (attendee.bookingEventType.includes(rescheduledClassStatuses[j]) || attendee.bookingStatus.includes(rescheduledClassStatuses[j]) )){
          attendeesWhoWereRescheduled++;
          rescheduled = true;
        }
      }
      if(attendee.bookingStatus.includes("Cancelled Within Policy Rules") || rescheduled){
        // Do nothing
      }else{
        attendeesWhoWerentReschedule++;
      }
    }

    if(attendeesWhoWereRescheduled > 0 && attendeesWhoWerentReschedule == 0){
      classObj.pay = 0;
      classObj.comment.push('*RESCHEDULED*');
    }
  }
}

function addClassComments(classes) {
  for (let i = 0; i < classes.length; i++) {
    semiPrivateAttendeeCheck(classes[i]);
    addCommentForNoBookingClasses(classes[i]);
  }
}

  function semiPrivateAttendeeCheck(classObj) {
    if (classObj.name.includes('Semi') && classObj.attendeeCount == 1) {
      classObj.comment.push('Semi with only one completed booking');
    }
  }

  function addCommentForNoBookingClasses(classObj) {
    let bookingsFound = 0;
    for (let j = 0; j < classObj.attendeeList.length; j++) {
      if (!stringEq(classObj.attendeeList[j].bookingEventType, 'No Bookings')) {
        bookingsFound++;
      }
    }
    if (bookingsFound == 0) {
      classObj.comment.push('No Bookings Found');
    }
  }

function organizeClasses(classes) {
  classes.sort((a, b) => (a.date.getTime() > b.date.getTime()) ? 1 : -1);
}

// Write Excel
const currencyLocations = [];

const sumCellClassTypeArray = [];

const cellRefByInstructor = [];

const detailInstructorRefBoxList = [];

const commissionDetailRefBoxList = [];

function writeExcel() {
  studiosInformation.studiosArray = createStudioArray();
  const wb = createExcelFile();
  addClassDetail(wb);
  addTimeDetail(wb);
  addCommissionDetail(wb);
  addSummaryTab(wb);
  addUnaddedTab(wb);
  addStaffTabs(wb);
  addCurrencyLocations(wb);

  alert('PayWell Output Created - Continue?');
  XLSX.writeFile(wb, createExcelName());
}

  function createExcelFile() {
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: 'Payroll',
      Author: 'PayWell',
    };
    return wb;
  }

  function createExcelName() {
    const studiosString = buildFormatedStudioString('-');
    
    const today = new Date();
    const date = (today.getMonth()+1)+'-'+today.getDate();
    return studiosString + '_' + date + '_PayWell' + '.xlsx';
  }

    // function buildStudioString(seperator) {
    //   let studiosA = studiosInformation.studiosArray;
    //   return studiosA.join(seperator);
    // }

    function buildFormatedStudioString(seperator){
      let studiosA = JSON.parse(JSON.stringify(studiosInformation.studiosArray));
      for(let i = 0; i < studiosA.length; i++){
        studiosA[i] = studiosA[i].replace('Club Pilates', 'CP');
      }
      return studiosA.join(seperator);
    }

function addDetailHeader(array) {
  const belPayPeriods = payrollInformation.belPayPeriods;

  array.push([buildFormatedStudioString('/')]);
  array.push(['Pay Period: ' + belPayPeriods[0][0].toDateString() + ' - ' + belPayPeriods[0][1].toDateString()]);
  array.push(blankExcelRow);
  array.push(blankExcelRow);
}

// Write Excel -> Class Tab
  function addClassDetail(wb) {
    wb.SheetNames.push('Class Detail');
    let sumCellOverallArray = [];
    const classDetail = createClassDetail(sumCellOverallArray);
    const classDetailWS = XLSX.utils.aoa_to_sheet(classDetail);
    addClassDetailFormulas(classDetailWS, sumCellOverallArray);
    wb.Sheets['Class Detail'] = classDetailWS;
  }

    function createClassDetail(sumCellOverallArray) {
      const instructorArray = studiosInformation.instructorsArray;
      const classDetail = [];
  
      addDetailHeader(classDetail);
  
      for (let i = 0; i < instructorArray.length; i++) {
        const sumIndCells = [];
        const classDetailInstructorRefBox = new DetailReferenceBox('Class', instructorArray[i].name[0]);
        classDetailInstructorRefBox.startingRef = classDetail.length + 2;

        const groupClassTotals = addGroupClasses(classDetail, instructorArray[i]);
        sumIndCells.push(classDetail.length);
  
        const privateClassTotals = addPrivateClasses(classDetail, instructorArray[i]);
        sumIndCells.push(classDetail.length);

        const introClassTotals = addIntroClasses(classDetail, instructorArray[i]);
        sumIndCells.push(classDetail.length);
  
        classDetailInstructorRefBox.endingRef = classDetail.length;
  
        classDetail.push(blankExcelRow);
  
  
        const instructorClasses = groupClassTotals.groupClassCount + privateClassTotals.privateClassCount + introClassTotals.introClassCount;
        const instructorPay = groupClassTotals.groupPayTotal + privateClassTotals.privatePayTotal + introClassTotals.introPayTotal;
  
        classDetail.push(blankExcelRow);
        classDetail.push([instructorArray[i].name[0] + ' Totals', '', '', '', instructorClasses, instructorPay, '', '', '']);
        currencyLocations.push([0, 5, classDetail.length]);
  
        sumCellOverallArray.push([classDetail.length, sumIndCells]);
  
        classDetail.push(blankExcelRow);
        classDetail.push(blankExcelRow);
  
        detailInstructorRefBoxList.push(classDetailInstructorRefBox);
      }
      return classDetail;
    }

      function addGroupClasses(classDetail, instructor) {
        const organizedTable = studiosInformation.classes;
    
        classDetail.push([instructor.getNameString()]);
        classDetail.push(blankExcelRow);
        
        classDetail.push(['Group Classes', '', '', '', '', '', '']);
        classDetail.push(['Class', 'Location', 'Date', 'Time', 'Class Size', 'Payment', 'Comments']);

        let groupClassCount = 0;
        let groupPayTotal = 0;
        for (let x = 0; x < organizedTable.length; x++) {
          if ( instructor.isNamed(organizedTable[x].instructor)) {
            if (stringEq(organizedTable[x].type, 'Group')) {
              groupClassCount++;
              groupPayTotal += parseFloat(organizedTable[x].pay);
  
              let gcName = organizedTable[x].name;
              if (gcName.includes('(')) {
                gcName = gcName.substring(0, gcName.indexOf('(') - 1);
              }
  
              classDetail.push([gcName, organizedTable[x].location, organizedTable[x].date.toDateString(), organizedTable[x].date.toLocaleTimeString('en-US'), organizedTable[x].attendeeCount, organizedTable[x].pay, organizedTable[x].commentsToString()]);
              cellRefByInstructor.push(new CellReference('Group', instructor.name[0], organizedTable[x].location, classDetail.length, 5));
              organizedTable[x].addedToExcel = true;
              currencyLocations.push([0, 5, classDetail.length]);
            }
          }
        }
        classDetail.push(['Totals', '', '', '', groupClassCount, groupPayTotal, '', '', '']);
        currencyLocations.push([0, 5, classDetail.length]);

        sumCellClassTypeArray.push([classDetail.length, groupClassCount]);

        return {'groupClassCount': groupClassCount, 'groupClassPay': groupPayTotal};
      }

      function addPrivateClasses(classDetail, instructor) {
        const organizedTable = studiosInformation.classes;
    
        classDetail.push(blankExcelRow);
        classDetail.push(['Private Classes', '', '', '', '', '', '']);
        classDetail.push(['Participant', 'Location', 'Date', 'Time', 'Class Size', 'Payment', 'Comments']);
  
        let privateClassCount = 0;
        let privatePayTotal = 0;
        for (let x = 0; x < organizedTable.length; x++) {
          if (instructor.isNamed(organizedTable[x].instructor)) {
            if (stringEq(organizedTable[x].type, 'Private')) {
              privateClassCount++;
              privatePayTotal += parseFloat(organizedTable[x].pay);
  
              if(organizedTable[x].name.includes("Semi")){
                classDetail.push([organizedTable[x].name, organizedTable[x].location, organizedTable[x].date.toDateString(), organizedTable[x].date.toLocaleTimeString('en-US'), organizedTable[x].attendeeCount, parseFloat(organizedTable[x].pay), organizedTable[x].commentsToString()]);
                cellRefByInstructor.push(new CellReference('Semi', instructor.name[0], organizedTable[x].location, classDetail.length, 5));
              }else{
                let participantAndName = organizedTable[x].attendeeList[0].name + ' - ' + organizedTable[x].name;
                if (organizedTable[x].attendeeList[0].bookingEventType.includes('Cancelled')) {
                  participantAndName = organizedTable[x].attendeeList[0].name + ' - [CANCELLED] ' + organizedTable[x].name;
                }
                classDetail.push([participantAndName, organizedTable[x].location, organizedTable[x].date.toDateString(), organizedTable[x].date.toLocaleTimeString('en-US'), organizedTable[x].attendeeCount, parseFloat(organizedTable[x].pay), organizedTable[x].commentsToString()]);
                cellRefByInstructor.push(new CellReference('Private', instructor.name[0], organizedTable[x].location, classDetail.length, 5));
              }
              organizedTable[x].addedToExcel = true;
              currencyLocations.push([0, 5, classDetail.length]);
            }
          }
        }
        classDetail.push(['Totals', '', '', '', privateClassCount, privatePayTotal, '', '', '']);
        currencyLocations.push([0, 5, classDetail.length]);

        sumCellClassTypeArray.push([classDetail.length, privateClassCount]);

        return {'privateClassCount': privateClassCount, 'privateClassPay': privatePayTotal};
      }

      function addIntroClasses(classDetail, instructor) {
        const organizedTable = studiosInformation.classes;

        classDetail.push(blankExcelRow);
        classDetail.push(['Intro Classes', '', '', '', '', '', '']);
        classDetail.push(['Class', 'Location', 'Date', 'Time', 'Class Size', 'Payment', 'Comments']);
  
        let introClassCount = 0;
        let introPayTotal = 0;
        for (let x = 0; x < organizedTable.length; x++) {
          if (instructor.isNamed(organizedTable[x].instructor)) {
            if (stringEq(organizedTable[x].type, 'Intro')) {
              introClassCount++;
              introPayTotal += parseFloat(organizedTable[x].pay);
  
              const signUps = findIntroSignUps(organizedTable[x]);
  
              classDetail.push([organizedTable[x].name, organizedTable[x].location, organizedTable[x].date.toDateString(), organizedTable[x].date.toLocaleTimeString('en-US'), '(' + signUps + '/' + organizedTable[x].attendeeCount + ')', organizedTable[x].pay, organizedTable[x].commentsToString()]);
              cellRefByInstructor.push(new CellReference('Intro', instructor.name[0], organizedTable[x].location, classDetail.length, 5));
              organizedTable[x].addedToExcel = true;
              currencyLocations.push([0, 5, classDetail.length]);
            }
          }
        }
  
        classDetail.push(['Totals', '', '', '', introClassCount, introPayTotal, '', '', '']);
        currencyLocations.push([0, 5, classDetail.length]);

        sumCellClassTypeArray.push([classDetail.length, introClassCount]);

        return {'introClassCount': introClassCount, 'introClassPay': introPayTotal};
      }


    function addClassDetailFormulas(classDetailWS, sumCellOverallArray) {
      for (let i = 0; i < sumCellClassTypeArray.length; i++) {
        addClassDetailCountFormulas(classDetailWS, sumCellClassTypeArray[i][0], sumCellClassTypeArray[i][1]);
        addClassDetailPayFormulas(classDetailWS, sumCellClassTypeArray[i][0], sumCellClassTypeArray[i][1]);
      }
      for (let j = 0; j < sumCellOverallArray.length; j++) {
        addClassDetailInstructorCountTotal(classDetailWS, sumCellOverallArray[j][0], sumCellOverallArray[j][1]);
        addClassDetailInstructorPayTotal(classDetailWS, sumCellOverallArray[j][0], sumCellOverallArray[j][1]);
      }
    }

      function addClassDetailCountFormulas(worksheet, row, numClasses) {
        const col = alphabet.charAt(COUNTINDEX);
        const endRow = row;
        let sumVar = '';
    
        if (numClasses == 0) {
          sumVar = '0';
        } else {
          sumVar = 'counta('+ col+(endRow-numClasses) +':' + col+(row-1) +')';
        }
        worksheet[col+row] = {t: 'n', f: sumVar};
      }
    
      function addClassDetailPayFormulas(worksheet, row, numClasses) {
        const col = alphabet.charAt(PAYINDEX);
    
        let endRow = row;
        if (numClasses == 0) {
          endRow = endRow - 1;
        }
    
        const sumVar = 'sum('+ col+(endRow-numClasses) +':' + col+(row-1) +')';
        worksheet[col+row] = {t: 'n', f: sumVar, z: '$##,##0.00'};
      }
    
      function addClassDetailInstructorCountTotal(worksheet, totalCell, contributingCells) {
        const col = alphabet.charAt(COUNTINDEX);
    
        let sumString = '';
        for (let i = 0; i < contributingCells.length; i++) {
          sumString += ('+' + col + contributingCells[i]);
        }
        sumString = sumString.substr(1);
    
        worksheet[col + totalCell] = {t: 'n', f: 'sum('+ sumString +')'};
      }
    
      function addClassDetailInstructorPayTotal(worksheet, totalCell, contributingCells) {
        const col = alphabet.charAt(PAYINDEX);
    
        let sumString = '';
        for (let i = 0; i < contributingCells.length; i++) {
          sumString += ('+' + col + contributingCells[i]);
        }
        sumString = sumString.substr(1);
    
        worksheet[col + totalCell] = {t: 'n', f: 'sum('+ sumString +')', z: '$##,##0.00'};
      }

// Write Excel -> Time Tab
function addTimeDetail(wb) {
  wb.SheetNames.push('Time Detail');
  let timeDetail = [];
  let timeClockPayFormulas = [];
  if (inputFilesArrays.TIME != null) {
    timeDetail = createTimeDetail(timeClockPayFormulas);
  }
  const timeDetailWS = XLSX.utils.aoa_to_sheet(timeDetail);
  addTimeClockPayFormulas(timeDetailWS, timeClockPayFormulas);
  wb.Sheets['Time Detail'] = timeDetailWS;
}

  function createTimeDetail(timeClockPayFormulas) {
    const staffArray = studiosInformation.staffArray;
    const timeTable = inputFilesArrays.TIME;

    const timeDetail = [];
    addDetailHeader(timeDetail);

    for (let m = 0; m < staffArray.length; m++) {
      let timeEventCount = 0;
      const timeDetailInstructorRefBox = new DetailReferenceBox('Time', staffArray[m].name[0]);
      for(let i = 0; i < timeTable.length; i++){
        if(staffArray[m].isNamed(timeTable[i].staffName)){
          if(timeEventCount == 0){
            timeDetail.push([timeTable[i].staffName]);
            timeDetailInstructorRefBox.startingRef = timeDetail.length;
            timeDetail.push(['Location', 'Pay Rate', 'Hours', 'Pay', 'Comments']);
          }

          let description = timeTable[i].location + ' Totals';
          if(timeTable[i].description.length > 1){
            description = timeTable[i].description + ' ' + description;
          }

          timeDetail.push([description, timeTable[i].payRate, timeTable[i].hoursWorked, timeTable[i].payTotal, '']);
          cellRefByInstructor.push(new CellReference('Time', timeTable[i].staffName, timeTable[i].location, timeDetail.length, 3));
          timeTable[i].addedToExcel = true;
          timeClockPayFormulas.push(timeDetail.length);

          currencyLocations.push([1, 1, timeDetail.length]);
          currencyLocations.push([1, 3, timeDetail.length]);

          timeEventCount++;
        }
      }

      if(timeDetailInstructorRefBox.startingRef > 0){
        timeDetailInstructorRefBox.endingRef = timeDetail.length;
        detailInstructorRefBoxList.push(timeDetailInstructorRefBox);
        timeDetail.push(blankExcelRow);
      }
    }

    return timeDetail;
  }

  function addTimeClockPayFormulas(timeWS, timeClockPayFormulas) {
    for (let i = 0; i < timeClockPayFormulas.length; i++) {
      timeWS['D' + timeClockPayFormulas[i]] = {t: 'n', f: 'B' + timeClockPayFormulas[i] + '* C' + timeClockPayFormulas[i], z: '$##,##0.00'};
    }
  }

// Write Excel -> Commission Tab
function addCommissionDetail(wb) {
  let commissionDetailArray = [];
  if (inputFilesArrays.AGREE != null) {
    commissionDetailArray = createCommissionDetail();
  }
  wb.SheetNames.push('Commission Detail');
  const commissionDetailWS = XLSX.utils.aoa_to_sheet(commissionDetailArray);
  wb.Sheets['Commission Detail'] = commissionDetailWS;
}

  function createCommissionDetail() {
    const commissionDetail = [];

    addDetailHeader(commissionDetail);

    addPostIntroAgreements(commissionDetail);
    addNonIntroAgreements(commissionDetail);
    addUpgradeAgreements(commissionDetail);
    addProducts(commissionDetail);

    return commissionDetail;
  }

    function addPostIntroAgreements(commissionDetail) {
      const organizedTable = studiosInformation.classes;
      const agreementsTable = inputFilesArrays.AGREE;
      let introComCount = 0;
  
      for (let i = 0; i < organizedTable.length; i++) {
        const classObj = organizedTable[i];
        if (classObj.type.includes('Intro')) {
          for (let j = 0; j < classObj.attendeeList.length; j++) {
            const attendee = classObj.attendeeList[j];
            for (let k = 0; k < agreementsTable.length; k++) {
              if (!agreementsTable[k].addedToExcel && stringEq(attendee.name, agreementsTable[k].getFullName()) && attendee.signedUpAfterIntro ) {
                if (introComCount == 0) {
                  commissionDetail.push(['Intros - New Agreements']);
                  commissionDetail.push(blankExcelRow);
                  commissionDetail.push(['Location', 'Date', 'New Member', 'Payment', 'Agreement Type', 'Opened Booking', 'Opened Pay', 'Closed Booking', 'Closed Pay', 'Instructor', 'Instructor Pay', 'Secondary Sales Person', 'Secondary Sales Person Pay', 'Comments']);
                }
  
                let instructorBonus = 0;
                const introPay = findIntroAgreementPay(agreementsTable[k], organizedTable[i], attendee.loggedBy);
                if (addInstructorBonus(organizedTable[i].date, agreementsTable[k].date)) {
                  instructorBonus = introInstructorBonus;
                }
                commissionDetail.push([organizedTable[i].location, organizedTable[i].date.toDateString(), agreementsTable[k].getFullName(), agreementsTable[k].price, agreementsTable[k].description, attendee.loggedBy, introPay[0], agreementsTable[k].salespeople.PrimarySalesperson, introPay[1], organizedTable[i].instructor, introPay[2] + instructorBonus, agreementsTable[k].salespeople.SecondarySalesperson, introPay[3], '']);
                agreementsTable[k].addedToExcel = true;

                commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Intro', attendee.loggedBy, 'Opened', commissionDetail.length));
                commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Intro', agreementsTable[k].salespeople.PrimarySalesperson, 'Closed', commissionDetail.length));
                commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Intro', organizedTable[i].instructor, 'Instructor', commissionDetail.length));
                commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Intro', agreementsTable[k].salespeople.SecondarySalesperson, 'Secondary', commissionDetail.length));
  
                currencyLocations.push([2, 3, commissionDetail.length]);
                currencyLocations.push([2, 6, commissionDetail.length]);
                currencyLocations.push([2, 8, commissionDetail.length]);
                currencyLocations.push([2, 10, commissionDetail.length]);
                currencyLocations.push([2, 12, commissionDetail.length]);
  
                cellRefByInstructor.push(new CellReference('Agree', attendee.loggedBy, organizedTable[i].location, commissionDetail.length, 6));
                cellRefByInstructor.push(new CellReference('Agree', agreementsTable[k].salespeople.PrimarySalesperson, organizedTable[i].location, commissionDetail.length, 8));
                cellRefByInstructor.push(new CellReference('Agree', organizedTable[i].instructor, organizedTable[i].location, commissionDetail.length, 10));
                cellRefByInstructor.push(new CellReference('Agree', agreementsTable[k].salespeople.SecondarySalesperson, organizedTable[i].location, commissionDetail.length, 12));
  
                introComCount++;
              }
            }
          }
        }
      }
    }

      function findIntroAgreementPay(agreementObj, classObj, opened) {
        let commission = [0, 0, 0, 0];
        let split = 0;
        for (let i = 0; i < introComPay.length; i++) {
          if (introComPay[i] == 'Open' && !opened.includes('System Admin') && isStaff(opened)) {
            split += 1;
            commission[0] = introComPercent;
          } else if (introComPay[i] == 'Close' && isStaff(agreementObj.salespeople.PrimarySalesperson)) {
            split += 1;
            commission[1] = introComPercent;
          } else if (introComPay[i] == 'Instructor') {
            split += 1;
            commission[2] = introComPercent;
          } else if (introComPay[i] == '*Instructor' && isStaff(classObj.instructor)) {
            if (classObj.date.getMonth() == agreementObj.date.getMonth() && classObj.date.getDate() == agreementObj.date.getDate() && (classObj.dateclassDate.getHours()+2 >= agreementObj.date.getHours()+1)) {
              split += 1;
              commission[2] = introComPercent;
            }
          } else if (introComPay[i] == 'Second' && !agreementObj.salespeople.SecondarySalesperson.includes('N/A') && isStaff(agreementObj.salespeople.SecondarySalesperson)) {
            split += 1;
            commission[3] = introComPercent;
          }
        }
    
        for (let u = 0; u < commission.length; u++) {
          if (commission[u] == introComPercent) {
            commission[u] = commission[u] * (agreementObj.price / split);
          }
        }
    
        if (agreementObj.description.includes('Annual Membership')) {
          if (annualCommission > 1) {
            for (let q = 0; q < commission.length; q++) {
              if (commission[q] != 0) {
                commission[q] = (annualCommission/split);
              }
            }
          } else if (annualCommission < 1) {
            for (let x = 0; x < commission.length; x++) {
              if (commission[x] != 0) {
                commission[x] = annualCommission * (agreementObj.price / split);
              }
            }
          }
        } else if (agreementObj.description.includes('Single Class')) {
          if (!singleClassCommissionPay) {
            commission = [0, 0, 0, 0];
          }
        } else if (agreementObj.description.includes('Private Training Session') || agreementObj.description.includes('Private Sessions')) {
          if (!privateTrainingCommission) {
            commission = [0, 0, 0, 0];
          }
        }
        return commission;
      }

      function addInstructorBonus(classDate, agreementDate) {
        if (classDate.getMonth() == agreementDate.getMonth() && classDate.getDate() == agreementDate.getDate()) {
          return true;
        }
        return false;
      }

    function addNonIntroAgreements(commissionDetail) {
      const agreementsTable = inputFilesArrays.AGREE;

      let nonIntroComCount = 0;
      for (let w = 0; w < agreementsTable.length; w++) {
        if (!agreementsTable[w].addedToExcel && ((agreementsTable[w].previousAgreementNumber == 0 || agreementsTable[w].previousAgreements.length == 0) || (singleClassPrevNewAgreement && (agreementsTable[w].previousAgreements.includes('Single Class') && parseInt(agreementsTable[w].previousAgreementNumber)<=1 ) || (agreementsTable[w].description.includes('Annual Membership') && annualsAlwaysNew) || (agreementsTable[w].description.includes('Private Session')) )) ) {
          if (nonIntroComCount == 0) {
            commissionDetail.push(blankExcelRow);
            commissionDetail.push(blankExcelRow);
            commissionDetail.push(['Non-Intros - New Agreements']);
            commissionDetail.push(blankExcelRow);
            commissionDetail.push(['Location', 'Date', 'New Member', 'Payment', 'Agreement Type', 'Closed Booking', 'Closed Pay', 'Secondary Sales Person', 'Secondary Sales Person Pay', 'Comments']);
          }
  
          const nonIntroPay = findNonIntroAgreementPay(agreementsTable[w]);

          commissionDetail.push([agreementsTable[w].location, agreementsTable[w].date.toDateString(), agreementsTable[w].getFullName(), agreementsTable[w].price, agreementsTable[w].description, agreementsTable[w].salespeople.PrimarySalesperson, nonIntroPay[0], agreementsTable[w].salespeople.SecondarySalesperson, nonIntroPay[1], '']);
          agreementsTable[w].addedToExcel = true;

          commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Non-Intro', agreementsTable[w].salespeople.PrimarySalesperson, 'Closed', commissionDetail.length));
          commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Non-Intro', agreementsTable[w].salespeople.SecondarySalesperson, 'Secondary', commissionDetail.length));
  
          currencyLocations.push([2, 3, commissionDetail.length]);
          currencyLocations.push([2, 6, commissionDetail.length]);
          currencyLocations.push([2, 8, commissionDetail.length]);
  
          cellRefByInstructor.push(new CellReference('Agree', agreementsTable[w].salespeople.PrimarySalesperson, agreementsTable[w].location, commissionDetail.length, 6));
          cellRefByInstructor.push(new CellReference('Agree', agreementsTable[w].salespeople.SecondarySalesperson, agreementsTable[w].location, commissionDetail.length, 8));
          nonIntroComCount++;
        }
      }
    }

      function findNonIntroAgreementPay(agreementObj) {
        let commission = [0, 0];
        let split = 0;
        for (let i = 0; i < nonIntroComPay.length; i++) {
          if (nonIntroComPay[i] == 'Close' && isStaff(agreementObj.salespeople.PrimarySalesperson)) {
            split += 1;
            commission[0] = nonIntroComPercent;
          } else if (nonIntroComPay[i] == 'Second' && !agreementObj.salespeople.SecondarySalesperson.includes('N/A') && isStaff(agreementObj.salespeople.SecondarySalesperson)) {
            split += 1;
            commission[1] = nonIntroComPercent;
          }
        }
    
        for (let u = 0; u < commission.length; u++) {
          if (commission[u] == nonIntroComPercent) {
            commission[u] = commission[u] * (agreementObj.price / split);
          }
        }
    
        if (agreementObj.description.includes('Annual Membership')) {
          if (annualCommission > 1) {
            for (let q = 0; q < commission.length; q++) {
              if (commission[q] != 0) {
                commission[q] = (annualCommission/split);
              }
            }
          } else if (annualCommission < 1) {
            for (let x = 0; x < commission.length; x++) {
              if (commission[x] != 0) {
                commission[x] = annualCommission * (agreementObj.price / split);
              }
            }
          }
        } else if (agreementObj.description.includes('Single Class')) {
          if (!singleClassCommissionPay) {
            commission = [0, 0];
          }
        } else if (agreementObj.description.includes('Private Training Session') || agreementObj.description.includes('Private Sessions')) {
          if (!privateTrainingCommission) {
            commission = [0, 0];
          }
        }
        return commission;
      }

    function addUpgradeAgreements(commissionDetail) {
      const agreementsTable = inputFilesArrays.AGREE;

      let upgradeComCount = 0;
      for (let p = 0; p < agreementsTable.length; p++) {
        if (!agreementsTable[p].addedToExcel) {
          if (upgradeComCount == 0) {
            commissionDetail.push(blankExcelRow);
            commissionDetail.push(blankExcelRow);
            commissionDetail.push(['Upgrades/Downgrades']);
            commissionDetail.push(blankExcelRow);
            commissionDetail.push(['Location', 'Date', 'Member', 'Payment', 'New Agreement', 'Previous Agreement', 'Upgrade/Downgrade', 'Closed Booking', 'Closed Pay', 'Secondary Sales Person', 'Secondary Sales Person Pay', 'Comments']);
          }
  
          const upOrDown = upgradeOrDowngrade(agreementsTable[p].previousAgreements, agreementsTable[p].description);
  
          let comment = '';
          if (agreementsTable[p].previousAgreements.includes('Single Class') && (upOrDown.includes('Upgrade') || upOrDown.includes('N/A')) ) {
            comment = 'Attention: Unable to determine if commissionable';
          }
  
          commissionDetail.push([agreementsTable[p].location, agreementsTable[p].date.toDateString(), agreementsTable[p].getFullName(), agreementsTable[p].price, agreementsTable[p].description, agreementsTable[p].previousAgreements, upOrDown, agreementsTable[p].salespeople.PrimarySalesperson, 0, agreementsTable[p].salespeople.SecondarySalesperson, 0, comment]);
  
          commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Upgrade-Downgrade', agreementsTable[p].salespeople.PrimarySalesperson, 'Closed', commissionDetail.length));
          commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Upgrade-Downgrade', agreementsTable[p].salespeople.SecondarySalesperson, 'Secondary', commissionDetail.length));
  
          currencyLocations.push([2, 3, commissionDetail.length]);
          currencyLocations.push([2, 8, commissionDetail.length]);
          currencyLocations.push([2, 10, commissionDetail.length]);
  
          cellRefByInstructor.push(new CellReference('Agree', agreementsTable[p].salespeople.PrimarySalesperson, agreementsTable[p].location, commissionDetail.length, 8));
          cellRefByInstructor.push(new CellReference('Agree', agreementsTable[p].salespeople.SecondarySalesperson, agreementsTable[p].location, commissionDetail.length, 10));
          upgradeComCount++;
        }
      }
    }

      function upgradeOrDowngrade(prevAgree, newAgree) {
        let previous = -1;
        let newest = -1;
    
        if (stringEq(prevAgree, newAgree)) {
          previous = 1;
          newest = 1;
          return 'Same';
        }
    
        if (prevAgree.includes('Membership 3') || prevAgree.includes('Unlimited')) {
          previous = 10;
        } else if (prevAgree.includes('Membership 2') || prevAgree.includes('8 Classes')) {
          previous = 8;
        } else if (prevAgree.includes('Membership 1') || prevAgree.includes('4 Classes')) {
          previous = 4;
        } else if (prevAgree.includes('1 x Single') || prevAgree.includes('Single Class')) {
          previous = 1;
        }
    
        if (newAgree.includes('Membership 3') || newAgree.includes('Unlimited')) {
          newest = 10;
        } else if (newAgree.includes('Membership 2') || newAgree.includes('8 Classes')) {
          newest = 8;
        } else if (newAgree.includes('Membership 1') || newAgree.includes('4 Classes')) {
          newest = 4;
        } else if (newAgree.includes('1 x Single') || newAgree.includes('Single Class')) {
          newest = 1;
        }
    
        if (previous == -1 || newest == -1) {
          return 'N/A';
        } else if (previous > newest) {
          return 'Downgrade';
        } else if (previous < newest) {
          return 'Upgrade';
        }
        return 'Same';
      }

    function addProducts(commissionDetail) {
      const salesTable = inputFilesArrays.SALE;

      let productComCount = 0;
      for (let q = 0; q < salesTable.length; q++) {
        if (productComCount == 0) {
          commissionDetail.push(blankExcelRow);
          commissionDetail.push(blankExcelRow);
          commissionDetail.push(['Product Sales']);
          commissionDetail.push(blankExcelRow);
          commissionDetail.push(['Location', 'Date', 'Customer', 'Payment', 'Product', 'Staff', 'Staff Pay', 'Comments']);
        }
  
        const productPay = findRetailPay(salesTable[q]);
        commissionDetail.push([salesTable[q].location, salesTable[q].date.toDateString(), salesTable[q].getClientName(), salesTable[q].price, salesTable[q].name, salesTable[q].salesPerson, productPay, '']);
  
        commissionDetailRefBoxList.push(new CommissionDetailReferenceBox('Product', salesTable[q].salesPerson, 'Closed', commissionDetail.length));
  
        currencyLocations.push([2, 3, commissionDetail.length]);
        currencyLocations.push([2, 6, commissionDetail.length]);
  
        cellRefByInstructor.push(new CellReference('Retail', salesTable[q].salesPerson, salesTable[q].location, commissionDetail.length, 6));
        productComCount++;
      }
    }

      function findRetailPay(retailObj) {
        let commission = 0;
        for (let i = 0; i < productSalesPay.length; i++) {
          if (productSalesPay[i] == 'Close' && isStaff(retailObj.salesPerson)) {
            commission = productComPercent;
          }
        }
        commission = commission * retailObj.price;
    
        if (retailObj.name.toUpperCase().includes('TOE') || retailObj.name.toUpperCase().includes('GRIP') || retailObj.name.includes('S0') || retailObj.name.includes('T0')) {
          if (toeSocksPay == false || retailObj.price < toeSocksPay || retailObj.price < noProductSalesCommissionBelow) {
            commission = [0, 0];
          }
        } else if (retailObj.price < noProductSalesCommissionBelow) {
          commission = [0, 0];
        }
        if (noCommissionForStaffBoughtProducts) {
          if (isStaff(retailObj.getClientName()) ) {
            commission = [0, 0];
          }
        }
        if (retailObj.notes.includes(productSaleCommentForNoCommission)) {
          commission = [0, 0];
        }
        return commission;
      }

// Write Excel -> Summary Tab
function addSummaryTab(wb) {
  wb.SheetNames.push('Summary');
  const summaryTabOutput = [];
  const summaryRowsArray = createSummarySheet(summaryTabOutput);
  const refArray = findSummaryCellReference(summaryTabOutput);
  const allSummaryCurrencyFormatLocations = findRowsWithCurrency(summaryTabOutput);
  const summary = XLSX.utils.aoa_to_sheet(summaryTabOutput);
  addSummaryReferences(summary, refArray);
  addSummaryReferencesTotals(summary, summaryTabOutput);
  addAllSummaryCurrencyFormats(summary, allSummaryCurrencyFormatLocations);
  addSummaryTotalsFormulas(summary, summaryRowsArray);
  wb.Sheets['Summary'] = summary;
}

let summaryStudioInstructorLocations = [];

  function createSummarySheet(summaryTabOutput) {
    const studiosArray = studiosInformation.studiosArray;
    const overallTotal = createOverallSummaryTemplate();
    const totalsByStudio = createStudioSummariesTemplates();

    addDetailHeader(summaryTabOutput);

    const summaryRowsArray = [];
    const summaryHeader = ['Employee', 'Group Class Amount', 'Group Class Pay', 'Private Class Amount', 'Private Class Pay', 'Semi-Private Class Amount', 'Semi-Private Class Pay', 'Intro Class Amount', 'Intro Class Pay', 'All Class Amount', 'All Class Pay', 'Time Clock Hours', 'Time Clock Pay', 'Agreements Amount', 'Agreements Pay', 'Retail Amount', 'Retail Pay', 'Commission Amount', 'Commission Pay', 'Total Pay'];

    if (includeCostPerClassMetric) {
      summaryHeader.push('Cost Per Class');
    }

    summaryTabOutput.push(['Overall']);
    summaryTabOutput.push(summaryHeader);
    for (let a = 0; a < overallTotal.length; a++) {
      summaryTabOutput.push(overallTotal[a].slice(0, overallTotal[a].length));
      summaryRowsArray.push(summaryTabOutput.length);

      currencyLocations.push([3, 2, summaryTabOutput.length]); // Group Class Pay
      currencyLocations.push([3, 4, summaryTabOutput.length]); // Private Class Pay
      currencyLocations.push([3, 6, summaryTabOutput.length]); // Semi Private Class Pay
      currencyLocations.push([3, 8, summaryTabOutput.length]); // Intro Pay
      currencyLocations.push([3, 10, summaryTabOutput.length]); // All Class Pay

      currencyLocations.push([3, 12, summaryTabOutput.length]); // Time Pay
      currencyLocations.push([3, 14, summaryTabOutput.length]); // Agreement Pay
      currencyLocations.push([3, 16, summaryTabOutput.length]); // Retail Pay
      currencyLocations.push([3, 18, summaryTabOutput.length]); // Commission Pay
      currencyLocations.push([3, 19, summaryTabOutput.length]); // Total Pay

      if (includeCostPerClassMetric) {
        currencyLocations.push([3, 20, summaryTabOutput.length]);
      }
      if (studiosArray.length == 1){
        summaryStudioInstructorLocations.push([studiosArray[0], overallTotal[a][0], summaryTabOutput.length]);
      }
    }

    if (studiosArray.length > 1) {
      for (let b = 0; b < totalsByStudio.length; b++) {
        summaryTabOutput.push(blankExcelRow);
        summaryTabOutput.push([totalsByStudio[b][0][totalsByStudio[b][0].length-1]]);
        summaryTabOutput.push(summaryHeader);

        for (let w = 0; w < totalsByStudio[b].length; w++) {
          summaryTabOutput.push(totalsByStudio[b][w].slice(0, totalsByStudio[b][w].length-1));
          summaryRowsArray.push(summaryTabOutput.length);

          currencyLocations.push([3, 2, summaryTabOutput.length]); // Group Class Pay
          currencyLocations.push([3, 4, summaryTabOutput.length]); // Private Class Pay
          currencyLocations.push([3, 6, summaryTabOutput.length]); // Semi Private Class Pay
          currencyLocations.push([3, 8, summaryTabOutput.length]); // Intro Pay
          currencyLocations.push([3, 10, summaryTabOutput.length]); // All Class Pay

          currencyLocations.push([3, 12, summaryTabOutput.length]); // Time Pay
          currencyLocations.push([3, 14, summaryTabOutput.length]); // Agreement Pay
          currencyLocations.push([3, 16, summaryTabOutput.length]); // Retail Pay
          currencyLocations.push([3, 18, summaryTabOutput.length]); // Commission Pay
          currencyLocations.push([3, 19, summaryTabOutput.length]); // Total Pay

          summaryStudioInstructorLocations.push([totalsByStudio[b][0][totalsByStudio[b][0].length-1], totalsByStudio[b][w][0], summaryTabOutput.length]);
        }
      }
    }
    return summaryRowsArray;
  }

    function createOverallSummaryTemplate() {
      const overallTotal = [];

      const staffArray = studiosInformation.staffArray;
      for (let z = 0; z < staffArray.length; z++) {
        const instructorTotalLine = [staffArray[z].name[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (includeCostPerClassMetric) {
          instructorTotalLine.push(0);
        }
        overallTotal.push(instructorTotalLine);
      }
      const overallTotalsLine = ['Overall Totals', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      if (includeCostPerClassMetric) {
        overallTotalsLine.push(0);
      }
      overallTotal.push(overallTotalsLine);
      return overallTotal;
    }

    function createStudioSummariesTemplates() {
      const studiosArray = studiosInformation.studiosArray;
      const staffArray = studiosInformation.staffArray;
      const totalsByStudio = [];

      for (let i = 0; i < studiosArray.length; i++) {
        totalsByStudio.push([]);
        for (let z = 0; z < staffArray.length; z++) {
          let instTotalPayLine = [staffArray[z].name[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, studiosArray[i]];
          if (includeCostPerClassMetric) {
            instTotalPayLine = [staffArray[z].name[0], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, studiosArray[i]];
          }
          const instructorTeach = staffWorkedAtStudio(studiosArray[i], staffArray[z]);
          if (instructorTeach) {
            totalsByStudio[i].push(instTotalPayLine);
          }
        }
        const totalTotalPayLine = [studiosArray[i] + ' Totals', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (includeCostPerClassMetric) {
          totalTotalPayLine.push(0);
        }
        totalsByStudio[i].push(totalTotalPayLine);
      }
      return totalsByStudio;
    }

  function findSummaryCellReference(summaryTab) {
    const studiosArray = studiosInformation.studiosArray;
    const refWithSumLocations = [];
    let studioName = 'Overall';

    for (let i = 0; i < summaryTab.length; i++) {
      if (summaryTab[i].length == 1) {
        for (let j = 0; j < studiosArray.length; j++) {
          if (studiosArray[j].includes(summaryTab[i][0])) {
            studioName = summaryTab[i][0];
          }
        }
      } else if (summaryTab[i].length > 2 && summaryTab[i][0] != 'Employee') {
        for (let j = 0; j < cellRefByInstructor.length; j++) {
          if (studioName.includes('Overall') || stringEq(cellRefByInstructor[j].studio, studioName)) {
            if (checkIfNamesAreSameStaff(cellRefByInstructor[j].instructor, summaryTab[i][0])) {
              refWithSumLocations.push([(i + 1), cellRefByInstructor[j].row, cellRefByInstructor[j].type, cellRefByInstructor[j].column] );
            }
          }
        }
      }
    }
    return refWithSumLocations;
  }

    function checkIfNamesAreSameStaff(staffName1, staffName2) {
      const staffArray = studiosInformation.staffArray;
      if (staffName1.length > 0 && staffName2.length > 0) {
        for (let i = 0; i < staffArray.length; i++) {
          if (staffArray[i].isNamed(staffName1)) {
            if (staffArray[i].isNamed(staffName2)) {
              return true;
            }
          }
        }
      }
      return false;
    }

  function findRowsWithCurrency(array) {
    var allSummaryCurrencyFormatLocations = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i].length > 3 && !array[i][0].includes('Employee')) {
          allSummaryCurrencyFormatLocations.push(i+1);
        }
      }
      return allSummaryCurrencyFormatLocations;
    }

  function addSummaryReferences(worksheet, array) {
    let classTypeIndex;
    let payString;
    let countString;
    let tab;
    let countIndex;
    let payIndex;

    for (let t = 0; t < array.length; t++) {
      payString = '';
      countString = '';

      const refInfo = findReferenceType(array[t][2]);
      classTypeIndex = refInfo[0];
      tab = refInfo[1];

      for (let v = 0; v < array.length; v++) {
        countIndex = array[v][3] - 1;
        payIndex = array[v][3];
        if (array[v][0] == array[t][0] && array[t][2] == array[v][2]) {
          if (classTypeIndex == 12) {
            countString += (',' + tab + alphabet.charAt(countIndex) + array[v][1]);
          } else if (classTypeIndex == 14 || classTypeIndex == 16) {
            countString += (', "' + tab + alphabet.charAt(payIndex) + array[v][1] + '"');
          } else {
            countString += (', "' + tab + alphabet.charAt(countIndex) + array[v][1] + '"');
          }
          payString += ('+' + tab + alphabet.charAt(payIndex) + array[v][1]);
        }
      }

      if (classTypeIndex < 12) {
        addClassSummaryReferences(worksheet, countString.substring(1), payString.substring(1), classTypeIndex, array[t][0]);
      } else if (classTypeIndex == 12) {
        addTimeSummaryReferences(worksheet, countString.substring(1), payString.substring(1), classTypeIndex, array[t][0]);
      } else if (classTypeIndex == 14 || classTypeIndex == 16) {
        addCommissionSummaryReferences(worksheet, countString.substring(1), payString.substring(1), classTypeIndex, array[t][0]);
      }
    }
  }

    function findReferenceType(referenceType) {
      let tab = '\'Class Detail\'!';
      let index = 0;
  
      if (referenceType == 'Group') {
        index = 2;
      } else if (referenceType == 'Private') {
        index = 4;
      } else if (referenceType == 'Semi') {
        index = 6;
      } else if (referenceType == 'Intro') {
        index = 8;
      } else if (referenceType == 'Time') {
        index = 12;
        tab = '\'Time Detail\'!';
      } else if (referenceType == 'Agree') {
        index = 14;
        tab = '\'Commission Detail\'!';
      } else if (referenceType == 'Retail') {
        index = 16;
        tab = '\'Commission Detail\'!';
      }
      return [index, tab];
    }

    function addClassSummaryReferences(worksheet, countString, payString, classTypeIndex, excelRow) {
      const countFunc = 'sum(countif(indirect({' + countString + '}), "<>0"))';
      const sumFunc = 'sum(' + payString + ')';
  
      worksheet[alphabet.charAt(classTypeIndex - 1) + excelRow] = {t: 'n', f: countFunc};
      worksheet[alphabet.charAt(classTypeIndex) + excelRow] = {t: 'n', f: sumFunc, z: '$##,##0.00'};
  
      if (includeCostPerClassMetric) {
        addCostPerClassReference(worksheet, excelRow);
      }
    }
  
      function addCostPerClassReference(worksheet, excelRow) {
        const classCost = '= C' + excelRow + '/ B' + excelRow;
        worksheet[alphabet.charAt(20) + excelRow] = {t: 'n', f: classCost, z: '$##,##0.00'};
      }

    function addTimeSummaryReferences(worksheet, countString, payString, classTypeIndex, excelRow) {
      const countFunc = 'sum(' + countString + ')';
      const sumFunc = 'sum(' + payString + ')';
  
      worksheet[alphabet.charAt(classTypeIndex - 1) + excelRow] = {t: 'n', f: countFunc};
      worksheet[alphabet.charAt(classTypeIndex) + excelRow] = {t: 'n', f: sumFunc, z: '$##,##0.00'};
    }

    function addCommissionSummaryReferences(worksheet, countString, payString, classTypeIndex, excelRow) {
      const countFunc = 'sum(countif(indirect({' + countString + '}), ">0"))';
      const sumFunc = 'sum(' + payString + ')';
  
      worksheet[alphabet.charAt(classTypeIndex - 1) + excelRow] = {t: 'n', f: countFunc};
      worksheet[alphabet.charAt(classTypeIndex) + excelRow] = {t: 'n', f: sumFunc, z: '$##,##0.00'};
    }

  function addSummaryReferencesTotals(worksheet, summaryArray) {
    let location = 'Overall';
    let count = 0;
    for (let i = 0; i < summaryArray.length; i++) {
      count++;
      if (summaryArray[i].length == 1) {
        location = summaryArray[i];
        count = 0;
      } else if (summaryArray[i].length > 2 && summaryArray[i][0].includes(location) && summaryArray[i][0].includes('Total')) {
        const startIndex = (i+1) - (count - 2);
        worksheet[alphabet.charAt(1) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(1) + startIndex + ':' + alphabet.charAt(1) + (i) +')'};
        worksheet[alphabet.charAt(2) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(2) + startIndex + ':' + alphabet.charAt(2) + (i) + ')', z: '$##,##0.00'};

        worksheet[alphabet.charAt(3) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(3) + startIndex + ':' + alphabet.charAt(3) + (i) +')'};
        worksheet[alphabet.charAt(4) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(4) + startIndex + ':' + alphabet.charAt(4) + (i) + ')', z: '$##,##0.00'};

        worksheet[alphabet.charAt(5) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(5) + startIndex + ':' + alphabet.charAt(5) + (i) +')'};
        worksheet[alphabet.charAt(6) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(6) + startIndex + ':' + alphabet.charAt(6) + (i) + ')', z: '$##,##0.00'};

        worksheet[alphabet.charAt(7) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(7) + startIndex + ':' + alphabet.charAt(7) + (i) +')'};
        worksheet[alphabet.charAt(8) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(8) + startIndex + ':' + alphabet.charAt(8) + (i) + ')', z: '$##,##0.00'};

        worksheet[alphabet.charAt(9) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(9) + startIndex + ':' + alphabet.charAt(9) + (i) +')'};
        worksheet[alphabet.charAt(10) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(10) + startIndex + ':' + alphabet.charAt(10) + (i) + ')', z: '$##,##0.00'};

        worksheet[alphabet.charAt(11) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(11) + startIndex + ':' + alphabet.charAt(11) + (i) +')'};
        worksheet[alphabet.charAt(12) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(12) + startIndex + ':' + alphabet.charAt(12) + (i) + ')', z: '$##,##0.00'};
        worksheet[alphabet.charAt(13) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(13) + startIndex + ':' + alphabet.charAt(13) + (i) + ')'};
        worksheet[alphabet.charAt(14) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(14) + startIndex + ':' + alphabet.charAt(14) + (i) + ')', z: '$##,##0.00'};
        worksheet[alphabet.charAt(15) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(15) + startIndex + ':' + alphabet.charAt(15) + (i) + ')'};
        worksheet[alphabet.charAt(16) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(16) + startIndex + ':' + alphabet.charAt(16) + (i) + ')', z: '$##,##0.00'};
        worksheet[alphabet.charAt(17) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(17) + startIndex + ':' + alphabet.charAt(17) + (i) + ')'};

        worksheet[alphabet.charAt(18) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(18) + startIndex + ':' + alphabet.charAt(18) + (i) + ')', z: '$##,##0.00'};
        worksheet[alphabet.charAt(19) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(19) + startIndex + ':' + alphabet.charAt(19) + (i) + ')', z: '$##,##0.00'};
        worksheet[alphabet.charAt(20) + (i+1)] = {t: 'n', f: 'sum(' + alphabet.charAt(20) + startIndex + ':' + alphabet.charAt(20) + (i) + ')', z: '$##,##0.00'};
      }
    }
  }

  function addAllSummaryCurrencyFormats(worksheet, allSummaryCurrencyFormatLocations) {
    for (let i = 0; i < allSummaryCurrencyFormatLocations.length; i++) {
      try {
        worksheet[alphabet.charAt(4) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(2) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(6) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(8) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(10) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';

        worksheet[alphabet.charAt(12) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(14) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(16) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(18) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(19) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
        worksheet[alphabet.charAt(20) + allSummaryCurrencyFormatLocations[i]].z = '$##,##0.00';
      } catch (e) {}
    }
  }

  function addSummaryTotalsFormulas(worksheet, summaryRowsArray) {
    for (let i = 0; i < summaryRowsArray.length; i++) {
      // Class Totals
      worksheet[alphabet.charAt(9) + summaryRowsArray[i]] = {t: 'n', f: 'sum(' + alphabet.charAt(1) + summaryRowsArray[i] + '+' + alphabet.charAt(3) + summaryRowsArray[i] + '+' + alphabet.charAt(5) + summaryRowsArray[i] + '+' + alphabet.charAt(7) + summaryRowsArray[i] + ')'};
      worksheet[alphabet.charAt(10) + summaryRowsArray[i]] = {t: 'n', f: 'sum(' + alphabet.charAt(2) + summaryRowsArray[i] + '+' + alphabet.charAt(4) + summaryRowsArray[i] + '+' + alphabet.charAt(6) + summaryRowsArray[i] + '+' + alphabet.charAt(8) + summaryRowsArray[i] + ')', z: '$##,##0.00'};

      // Agreement Totals
      worksheet[alphabet.charAt(17) + summaryRowsArray[i]] = {t: 'n', f: 'sum(' + alphabet.charAt(13) + summaryRowsArray[i] + '+' + alphabet.charAt(15) + summaryRowsArray[i] + ')'};
      worksheet[alphabet.charAt(18) + summaryRowsArray[i]] = {t: 'n', f: 'sum(' + alphabet.charAt(14) + summaryRowsArray[i] + '+' + alphabet.charAt(16) + summaryRowsArray[i] + ')', z: '$##,##0.00'};

      // Total Total
      worksheet[alphabet.charAt(19) + summaryRowsArray[i]] = {t: 'n', f: 'sum(' + alphabet.charAt(2) + summaryRowsArray[i] + '+' + alphabet.charAt(4) + summaryRowsArray[i] + '+' + alphabet.charAt(6) + summaryRowsArray[i] + '+' + alphabet.charAt(8) + summaryRowsArray[i] + '+' + alphabet.charAt(12) + summaryRowsArray[i] + '+' + alphabet.charAt(14) + summaryRowsArray[i] + '+' + alphabet.charAt(16) + summaryRowsArray[i] +')', z: '$##,##0.00'};
    }
  }


// Write Excel -> Unadded Tab
function addUnaddedTab(wb) {
  const unaddedClasses = findUnaddedClasses();
  const unaddedTime = findUnaddedTime();
  if (unaddedClasses.length == 0 && unaddedTime.length == 0) {
    return;
  }
  wb.SheetNames.push('Unadded');
  const unaddedArray = [];
  addDetailHeader(unaddedArray);

  formatUnaddedClassesArray(unaddedArray, unaddedClasses);
  formatUnaddedTimeArray(unaddedArray, unaddedTime);
  const unaddedWS = XLSX.utils.aoa_to_sheet(unaddedArray);
  wb.Sheets['Unadded'] = unaddedWS;
}

  function findUnaddedClasses() {
    const unaddedClasses = [];
    const classes = studiosInformation.classes;

    for (let i = 0; i < classes.length; i++) {
      if (!classes[i].addedToExcel) {
        unaddedClasses.push(classes[i]);
      }
    }
    return unaddedClasses;
  }

  function findUnaddedTime() {
    const unaddedTime = [];
    const timeEvents = inputFilesArrays.TIME;

    for (let i = 0; i < timeEvents.length; i++) {
      if (!timeEvents[i].addedToExcel) {
        unaddedTime.push(timeEvents[i]);
      }
    }
    return unaddedTime;
  }

  function formatUnaddedClassesArray(unaddedArray, unaddedClasses) {
    if (unaddedClasses.length > 0) {
      unaddedArray.push(['Unadded Classes']);
      unaddedArray.push(['Class Name', 'Instructor', 'Location', 'Date', 'Time', 'Class Size']);
      for (let i = 0; i < unaddedClasses.length; i++) {
        const tempArray = ['', unaddedClasses[i].instructor, unaddedClasses[i].location, unaddedClasses[i].date.toDateString(), unaddedClasses[i].date.toLocaleTimeString('en-US'), unaddedClasses[i].attendeeCount];
        if (unaddedClasses[i].name.includes('(') && unaddedClasses[i].name.includes('min')) {
          tempArray[0] = unaddedClasses[i].name.substring(0, unaddedClasses[i].name.indexOf('(') - 1);
        } else {
          tempArray[0] = unaddedClasses[i].name;
        }
        unaddedArray.push(tempArray);
      }
      unaddedArray.push('');
      unaddedArray.push('');
    }
  }

  function formatUnaddedTimeArray(unaddedArray, unaddedTime) {
    if (unaddedTime.length > 0) {
      unaddedArray.push(['Unadded Time']);
      unaddedArray.push(['Location', 'Staff', 'Hours']);
      for (let i = 0; i < unaddedTime.length; i++) {
        const tempArray = [unaddedTime[i].location, unaddedTime[i].staffName, unaddedTime[i].hoursWorked];
        unaddedArray.push(tempArray);
      }
    }
  }


// Write Excel -> Staff Tabs
function addStaffTabs(wb) {
  const staffTabArray = [];
  buildStaffTabsRef(staffTabArray);
  for (let i = 0; i < staffTabArray.length; i++) {
    const instructorData = XLSX.utils.aoa_to_sheet(staffTabArray[i].slice(1));
    const staffObj = findStaffFromName(staffTabArray[i][0]);
    addStaffTabReferences(instructorData, staffObj);
    XLSX.utils.book_append_sheet(wb, instructorData, staffTabArray[i][0]);
  }
}

  function buildStaffTabsRef(staffTabArray) {

    const staffArray = studiosInformation.staffArray;
    for (let i = 0; i < staffArray.length; i++) {
      staffTabArray.push([[staffArray[i].name[0]]]);

      let staffRefBoxSize = 0;
      for (let f = 0; f < detailInstructorRefBoxList.length; f++) {
        if (staffArray[i].isNamed(detailInstructorRefBoxList[f].staffName)) {
          staffRefBoxSize += (detailInstructorRefBoxList[f].endingRef - detailInstructorRefBoxList[f].startingRef + 1);
        }
      }

      for (let d = 0; d < commissionDetailRefBoxList.length; d++) {
        if (staffArray[i].isNamed(commissionDetailRefBoxList[d].staffName)) {
          staffRefBoxSize += 1;
        }
      }

      for (let j = 0; j < staffRefBoxSize + 25; j++) {
        if ((j - 6) < 0) {
          staffTabArray[staffTabArray.length-1].push(['']);
        } else {
          staffTabArray[staffTabArray.length-1].push(['', '', '', '', '', '', '']);
        }
      }
    }
  }

  function findStaffFromName(name) {
    const staffArray = studiosInformation.staffArray;
    for (let i = 0; i < staffArray.length; i++) {
      if (staffArray[i].isNamed(name)) {
        return staffArray[i];
      }
    }
  }

  function addStaffTabReferences(excelSheet, staff) {
    let staffTabIndex = addStaffTabHeader(excelSheet, staff);

    let staffRefBox = findStaffReferenceBox('Class', staff);
    //console.log(JSON.stringify(staffRefBox));
    if (staffRefBox != null) {
      staffTabIndex = addStaffTabClassReferences(excelSheet, staffRefBox, staffTabIndex);
    }

    staffRefBox = findStaffReferenceBox('Time', staff);
    if (staffRefBox != null) {
      staffTabIndex = addStaffTabTimeReferences(excelSheet, staffRefBox, staffTabIndex);
    }

    if (includeCommissionTabs && hasCommission(staff) && !summaryTabCommissionForIndividualTabs) {
      staffTabIndex = addStaffTabCommissionReferences(excelSheet, staff, staffTabIndex);
    }

    if(summaryTabCommissionForIndividualTabs){
      staffTabIndex = addCommissionFromSummaryTab(excelSheet, staff, staffTabIndex);
    }

    addStaffTabFooter(excelSheet, staff, staffTabIndex);
  }

    function addStaffTabHeader(excelSheet, staff) {
      const payPeriod = payrollInformation.belPayPeriods;

      excelSheet['A' + 1] = {t: 's', v: findStaffLocationsWorkedString(staff)};
      excelSheet['A' + 2] = {t: 's', v: 'Pay Period: ' + payPeriod[0][0].toDateString() + ' - '+ payPeriod[0][1].toDateString()};
      excelSheet['A' + 3] = {t: 's', v: ''};
      excelSheet['A' + 4] = {t: 's', v: ''};
      excelSheet['A' + 5] = {t: 's', v: staff.getNameString()};
      excelSheet['A' + 6] = {t: 's', v: ''};
      return 7;
    }

      function findStaffLocationsWorkedString(staff) {
        const studioArray = studiosInformation.studiosArray;
        let staffLocationsWorked = '';

        for (let i = 0; i < studioArray.length; i++) {
          if (staffWorkedAtStudio(studioArray[i], staff)) {
            staffLocationsWorked = staffLocationsWorked + studioArray[i] + '/';
          }
        }
        if (staffLocationsWorked.length > 0) {
          return staffLocationsWorked.substring(0, staffLocationsWorked.length-1);
        }
        return 'N/A';
      }

    function findStaffReferenceBox(detail, staff) {
      for (let i = 0; i < detailInstructorRefBoxList.length; i++) {
        if (staff.isNamed(detailInstructorRefBoxList[i].staffName) && stringEq(detailInstructorRefBoxList[i].type, detail)) {
          return detailInstructorRefBoxList[i];
        }
      }
      return null;
    }

    function addStaffTabClassReferences(excelSheet, staffRefBox, staffTabIndex) {
      const size = staffRefBox.endingRef - staffRefBox.startingRef;
      let classDetailCount = 1;
      while (classDetailCount <= size) {
        for (let k = 0; k < 7; k++) {
          if (k==5) {
            excelSheet[alphabet.charAt(k) + staffTabIndex] = {t: 's', f: '\'Class Detail\'!' + alphabet.charAt(k) + (classDetailCount+staffRefBox.startingRef), z: '$##,##0.00'};
          } else {
            excelSheet[alphabet.charAt(k) + staffTabIndex] = {t: 's', f: '\'Class Detail\'!' + alphabet.charAt(k) + (classDetailCount+staffRefBox.startingRef)};
          }
        }
        classDetailCount++;
        staffTabIndex++;
      }
      excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
      staffTabIndex++;
      return staffTabIndex;
    }

    function addStaffTabTimeReferences(excelSheet, staffRefBox, staffTabIndex) {
      let timeDetailCount = 1;
      excelSheet['A' + staffTabIndex] = {t: 's', v: 'Time Clock'};
      staffTabIndex++;

      const size = staffRefBox.endingRef - staffRefBox.startingRef;
      while (timeDetailCount <= size) {
        excelSheet['A' + (staffTabIndex)] = {t: 's', f: '\'Time Detail\'!' + 'A' + (timeDetailCount+staffRefBox.startingRef)};
        excelSheet['D' + (staffTabIndex)] = {t: 's', f: '\'Time Detail\'!' + 'B' + (timeDetailCount+staffRefBox.startingRef), z: '$##,##0.00'};
        excelSheet['E' + (staffTabIndex)] = {t: 's', f: '\'Time Detail\'!' + 'C' + (timeDetailCount+staffRefBox.startingRef)};
        excelSheet['F' + (staffTabIndex)] = {t: 'n', f: '\'Time Detail\'!' + 'D' + (timeDetailCount+staffRefBox.startingRef), z: '$##,##0.00'};
        excelSheet['G' + (staffTabIndex)] = {t: 's', f: '\'Time Detail\'!' + 'E' + (timeDetailCount+staffRefBox.startingRef)};
        timeDetailCount++;
        staffTabIndex++;
      }
      excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
      staffTabIndex++;
      return staffTabIndex;
    }

    function hasCommission(staff) {
      const agreements = inputFilesArrays.AGREE;
      const products = inputFilesArrays.SALE;
      let commissionFound = false;

      for (let d = 0; d < agreements.length; d++) {
        if (staff.isNamed(agreements[d].salespeople.PrimarySalesperson) || staff.isNamed(agreements[d].salespeople.SecondarySalesperson) ) {
          commissionFound = true;
        }
      }

      for (let e = 0; e < products.length; e++) {
        if (staff.isNamed(products[e].salesPerson)) {
          commissionFound = true;
        }
      }
      return commissionFound;
    }

    function addStaffTabCommissionReferences(excelSheet, staff, staffTabIndex) {
      staffTabIndex = addStaffTabsIntroCommissionReferences(excelSheet, staff, staffTabIndex);
      staffTabIndex = addStaffTabsNonIntroCommissionReferences(excelSheet, staff, staffTabIndex);
      staffTabIndex = addStaffTabsUpgradeReferences(excelSheet, staff, staffTabIndex);
      staffTabIndex = addStaffTabsProductReferences(excelSheet, staff, staffTabIndex);
      return staffTabIndex;
    }

      function addStaffTabsIntroCommissionReferences(excelSheet, staff, staffTabIndex) {
        let introCommissionsCount = 0;
        for (let i = 0; i < commissionDetailRefBoxList.length; i++) {
          if (staff.isNamed(commissionDetailRefBoxList[i].staffName) && commissionDetailRefBoxList[i].type == 'Intro') {
            if (introCommissionsCount == 0) {
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'New Agreements (Intros)'};
              staffTabIndex++;
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Location'};
              excelSheet['B' + staffTabIndex] = {t: 's', v: 'Date'};
              excelSheet['C' + staffTabIndex] = {t: 's', v: 'New Member'};
              excelSheet['D' + staffTabIndex] = {t: 's', v: 'Payment'};
              excelSheet['E' + staffTabIndex] = {t: 's', v: 'Role -- Agreement'};
              excelSheet['F' + staffTabIndex] = {t: 's', v: 'Commission'};
              excelSheet['G' + staffTabIndex] = {t: 's', v: 'Comments'};
              staffTabIndex++;
            }

            excelSheet['A' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'A' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['B' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'B' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['C' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'C' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['D' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'D' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            const refVar = '\'Commission Detail\'!' + 'E' + (commissionDetailRefBoxList[i].ref);
            if (commissionDetailRefBoxList[i].staffType == 'Opened') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Opened -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 'n', f: '\'Commission Detail\'!' + 'G' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            } else if (commissionDetailRefBoxList[i].staffType == 'Closed') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Closed -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 'n', f: '\'Commission Detail\'!' + 'I' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            } else if (commissionDetailRefBoxList[i].staffType == 'Instructor') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Instructor -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 'n', f: '\'Commission Detail\'!' + 'K' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            } else if (commissionDetailRefBoxList[i].staffType == 'Secondary') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Secondary -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 'n', f: '\'Commission Detail\'!' + 'M' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            }
            excelSheet['G' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'N' + (commissionDetailRefBoxList[i].ref)};
            staffTabIndex++;
            introCommissionsCount++;
          }
        }

        if (introCommissionsCount > 0) {
          excelSheet['A' + staffTabIndex] = {t: 's', v: 'Totals'};
          excelSheet['F' + staffTabIndex] = {t: 'n', f: 'SUM(F' + (staffTabIndex-1) + ':' +'F' + (staffTabIndex - introCommissionsCount) + ')', z: '$##,##0.00'};
          staffTabIndex++;
          excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
          staffTabIndex++;
        }
        return staffTabIndex;
      }

      function addStaffTabsNonIntroCommissionReferences(excelSheet, staff, staffTabIndex) {
        let nonIntroCommissionsCount = 0;
        for (let i = 0; i < commissionDetailRefBoxList.length; i++) {
          if (staff.isNamed(commissionDetailRefBoxList[i].staffName) && commissionDetailRefBoxList[i].type == 'Non-Intro') {
            if (nonIntroCommissionsCount == 0) {
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'New Agreements (Non-Intros)'};
              staffTabIndex++;
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Location'};
              excelSheet['B' + staffTabIndex] = {t: 's', v: 'Date'};
              excelSheet['C' + staffTabIndex] = {t: 's', v: 'New Member'};
              excelSheet['D' + staffTabIndex] = {t: 's', v: 'Payment'};
              excelSheet['E' + staffTabIndex] = {t: 's', v: 'Role -- Agreement'};
              excelSheet['F' + staffTabIndex] = {t: 's', v: 'Commission'};
              excelSheet['G' + staffTabIndex] = {t: 's', v: 'Comments'};
              staffTabIndex++;
            }

            excelSheet['A' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'A' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['B' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'B' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['C' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'C' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['D' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'D' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            const refVar = '\'Commission Detail\'!' + 'E' + (commissionDetailRefBoxList[i].ref);
            if (commissionDetailRefBoxList[i].staffType == 'Closed') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Closed -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 'n', f: '\'Commission Detail\'!' + 'G' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            } else if (commissionDetailRefBoxList[i].staffType == 'Secondary') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Secondary -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 'n', f: '\'Commission Detail\'!' + 'I' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            }
            excelSheet['G' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'J' + (commissionDetailRefBoxList[i].ref)};
            staffTabIndex++;
            nonIntroCommissionsCount++;
          }
        }

        if (nonIntroCommissionsCount > 0) {
          excelSheet['A' + staffTabIndex] = {t: 's', v: 'Totals'};
          excelSheet['F' + staffTabIndex] = {t: 'n', f: 'SUM(F' + (staffTabIndex-1) + ':' +'F' + (staffTabIndex - nonIntroCommissionsCount) + ')', z: '$##,##0.00'};
          staffTabIndex++;
          excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
          staffTabIndex++;
        }
        return staffTabIndex;
      }

      function addStaffTabsUpgradeReferences(excelSheet, staff, staffTabIndex) {
        let upgradeCommissionsCount = 0;
        for (let i = 0; i < commissionDetailRefBoxList.length; i++) {
          if (staff.isNamed(commissionDetailRefBoxList[i].staffName) && commissionDetailRefBoxList[i].type == 'Upgrade-Downgrade') {
            if (upgradeCommissionsCount == 0) {
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Upgrades/Downgrades'};
              staffTabIndex++;
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Location'};
              excelSheet['B' + staffTabIndex] = {t: 's', v: 'Date'};
              excelSheet['C' + staffTabIndex] = {t: 's', v: 'Member'};
              excelSheet['D' + staffTabIndex] = {t: 's', v: 'Payment'};
              excelSheet['E' + staffTabIndex] = {t: 's', v: 'Role -- Type'};
              excelSheet['F' + staffTabIndex] = {t: 's', v: 'Commission'};
              excelSheet['G' + staffTabIndex] = {t: 's', v: 'Comments'};
              staffTabIndex++;
            }

            excelSheet['A' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'A' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['B' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'B' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['C' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'C' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['D' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'D' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            const refVar = '\'Commission Detail\'!' + 'G' + (commissionDetailRefBoxList[i].ref);
            if (commissionDetailRefBoxList[i].staffType == 'Closed') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Closed -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'I' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            } else if (commissionDetailRefBoxList[i].staffType == 'Secondary') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Secondary -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'K' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            }
            excelSheet['G' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'L' + (commissionDetailRefBoxList[i].ref)};
            staffTabIndex++;
            upgradeCommissionsCount++;
          }
        }

        if (upgradeCommissionsCount > 0) {
          excelSheet['A' + staffTabIndex] = {t: 's', v: 'Totals'};
          excelSheet['F' + staffTabIndex] = {t: 'n', f: 'SUM(F' + (staffTabIndex-1) + ':' +'F' + (staffTabIndex - upgradeCommissionsCount) + ')', z: '$##,##0.00'};
          staffTabIndex++;
          excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
          staffTabIndex++;
        }
        return staffTabIndex;
      }

      function addStaffTabsProductReferences(excelSheet, staff, staffTabIndex) {
        let productCommissionsCount = 0;
        for (let i = 0; i < commissionDetailRefBoxList.length; i++) {
          if (staff.isNamed(commissionDetailRefBoxList[i].staffName) && commissionDetailRefBoxList[i].type == 'Product') {
            if (productCommissionsCount == 0) {
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Product Sales'};
              staffTabIndex++;
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Location'};
              excelSheet['B' + staffTabIndex] = {t: 's', v: 'Date'};
              excelSheet['C' + staffTabIndex] = {t: 's', v: 'Customer'};
              excelSheet['D' + staffTabIndex] = {t: 's', v: 'Payment'};
              excelSheet['E' + staffTabIndex] = {t: 's', v: 'Role -- Type'};
              excelSheet['F' + staffTabIndex] = {t: 's', v: 'Commission'};
              excelSheet['G' + staffTabIndex] = {t: 's', v: 'Comments'};
              staffTabIndex++;
            }

            excelSheet['A' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'A' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['B' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'B' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['C' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'C' + (commissionDetailRefBoxList[i].ref)};
            excelSheet['D' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'D' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            const refVar = '\'Commission Detail\'!' + 'E' + (commissionDetailRefBoxList[i].ref);
            if (commissionDetailRefBoxList[i].staffType == 'Closed') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Closed -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'G' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            } else if (commissionDetailRefBoxList[i].staffType == 'Secondary') {
              excelSheet['E' + (staffTabIndex)] = {t: 's', f: 'CONCATENATE("Secondary -- " & '+ refVar +')'};
              excelSheet['F' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'I' + (commissionDetailRefBoxList[i].ref), z: '$##,##0.00'};
            }
            excelSheet['G' + (staffTabIndex)] = {t: 's', f: '\'Commission Detail\'!' + 'H' + (commissionDetailRefBoxList[i].ref)};
            staffTabIndex++;
            productCommissionsCount++;
          }
        }

        if (productCommissionsCount > 0) {
          excelSheet['A' + staffTabIndex] = {t: 's', v: 'Totals'};
          excelSheet['F' + staffTabIndex] = {t: 'n', f: 'SUM(F' + (staffTabIndex-1) + ':' +'F' + (staffTabIndex - productCommissionsCount) + ')', z: '$##,##0.00'};
          staffTabIndex++;
          excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
          staffTabIndex++;
        }
        return staffTabIndex;
      }

      function addCommissionFromSummaryTab(excelSheet, staff, staffTabIndex){
        let summaryCommissionCount = 0
        for(let i = 0; i < summaryStudioInstructorLocations.length; i++){
          if(staff.isNamed(summaryStudioInstructorLocations[i][1])){
            if(summaryCommissionCount == 0){
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Commission Summary'};
              staffTabIndex++;
              excelSheet['A' + staffTabIndex] = {t: 's', v: 'Location'};
              excelSheet['E' + staffTabIndex] = {t: 's', v: 'Amount'};
              excelSheet['F' + staffTabIndex] = {t: 's', v: 'Pay'};
              staffTabIndex++;
            }

            excelSheet['A' + (staffTabIndex)] = {t: 's', v: summaryStudioInstructorLocations[i][0]};
            excelSheet['E' + (staffTabIndex)] = {t: 's', f: '\'Summary\'!' + 'R' + (summaryStudioInstructorLocations[i][2])};
            excelSheet['F' + (staffTabIndex)] = {t: 's', f: '\'Summary\'!' + 'S' + (summaryStudioInstructorLocations[i][2]), z: '$##,##0.00'};
            staffTabIndex++;
            summaryCommissionCount++;
          }
        }

        if (summaryCommissionCount > 0) {
          excelSheet['A' + staffTabIndex] = {t: 's', v: 'Totals'};
          excelSheet['E' + staffTabIndex] = {t: 'n', f: 'COUNTIF(E' + (staffTabIndex-1) + ':' +'E' + (staffTabIndex - summaryCommissionCount) + ', "<>0")'};
          excelSheet['F' + staffTabIndex] = {t: 'n', f: 'SUM(F' + (staffTabIndex-1) + ':' +'F' + (staffTabIndex - summaryCommissionCount) + ')', z: '$##,##0.00'};
          staffTabIndex++;
          excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
          staffTabIndex++;
        }
       
        return staffTabIndex;
      }

    function addStaffTabFooter(excelSheet, staff, staffTabIndex) {
      excelSheet['A' + staffTabIndex] = {t: 's', v: ''};
      staffTabIndex++;

      excelSheet['A' + staffTabIndex] = {t: 's', v: staff.name[0] + ' Totals'};
      excelSheet['F' + staffTabIndex] = {t: 'n', f: 'SUMIF(A1:A' + (staffTabIndex-1) + ',"<>Totals",F1:F' + (staffTabIndex-1) + ')', z: '$##,##0.00'};
    }

// Write Excel -> *Add Currency
function addCurrencyLocations(wb) {
  for (let q = 0; q < currencyLocations.length; q++) {
    const worksheet = wb.Sheets[wb.SheetNames[currencyLocations[q][0]]];
    const cellName = alphabet.charAt(currencyLocations[q][1]) + currencyLocations[q][2];
    worksheet[cellName].z = '$##,##0.00';
  }
}

export function sendPayWellFileToUploadsFolder(file) {
  const endPoint = "/api/upload";
  const formData = new FormData();
  const isPayWellFile = true;
  formData.append("file", file);
  formData.append("isPayWellFile", isPayWellFile);

  return fetch(endPoint, {
    method: "POST",
    body: formData,
  })
    .then(function () {
      console.log("Fetch Success");
      return true;
    })
    .catch(function () {
      console.log("Fetch Error: " + console.er);
      return false;
    });
}

export async function getStaffEmailArray(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, {
    cellFormula: true,
    sheetStubs: true,
    cellNF: true,
    bookDeps: true,
  });
  // Grab all formulas in each excel tab
  let formulaArrays = [];
  for (let i = 4; i < workbook.SheetNames.length; i++) {
    let sheetName = workbook.Sheets[workbook.SheetNames[i]];
    formulaArrays.push(XLSX.utils.sheet_to_formulae(sheetName));
  }

  var formattedExcelTabArray = [];
  for (var i = 0; i < formulaArrays.length; i++) {
    var formattedExcelTab = [];
    for (var j = 0; j < formulaArrays[i].length; j++) {
      let row = parseInt(formulaArrays[i][j].substring(1, formulaArrays[i][j].indexOf("=")));
      let cellValue = formulaArrays[i][j].substring(formulaArrays[i][j].indexOf("=") + 1, formulaArrays[i][j].length);
      let rawValue = lookupCellReference(workbook, cellValue);
      if (row > formattedExcelTab.length) {
        formattedExcelTab.push([rawValue]);
      } else {
        formattedExcelTab[formattedExcelTab.length - 1].push(rawValue);
      }
    }
    replaceFormulas(workbook, formattedExcelTab);
    formattedExcelTabArray.push(formattedExcelTab);
  }
  //let emails = [{address:"scott.smith0703@gmail.com", content:[[],[]]},{address:"scott.smith0703@gmail.com", content:[[]]},{address:"scott.smith0703@gmail.com", content:[[]]}]
  console.log("Staff Tabs", formattedExcelTabArray);
  let emailsObject = matchEmailWithStaffTab(formattedExcelTabArray);
  return emailsObject;
}

function matchEmailWithStaffTab(tabArrays){
  let emailsObject = [];
  const staffArray = studiosInformation.staffArray;
  for(let i = 0; i < tabArrays.length; i++){
    for(let j = 0; j < staffArray.length; j++){
      try{
        if(typeof tabArrays[i][4].toString() === 'string'){
          let staffName = tabArrays[i][4].toString().replace("'","");
          if(staffName.includes('/')){
            staffName = staffName.substring(0, staffName.indexOf('/'));
          }
          if(staffArray[j].isNamed(staffName)){
            if(staffArray[j].email.length > 0 && staffArray[j].email.includes('@')){
              emailsObject.push({address: staffArray[j].email, content: tabArrays[i]});
            }
          }
        }
      }catch(e){
      }
    }
  }
  console.log(emailsObject);
  return emailsObject;
}

function lookupCellReference(workbook, cellValue) {
  if (cellValue.includes("!")) {
    var address = cellValue.substring(cellValue.indexOf("!") + 1);
    try {
      if (cellValue.includes("Class Detail")) {
        return workbook.Sheets["Class Detail"][address].v;
      } else if (cellValue.includes("Time Detail")) {
        return workbook.Sheets["Time Detail"][address].v;
      } else if (cellValue.includes("Commission Detail")) {
        return workbook.Sheets["Commission Detail"][address].v;
      } else if (cellValue.includes("Summary")) {
        return workbook.Sheets["Summary"][address].v;
      }
    } catch (e) {}
  }
  return cellValue;
}

function replaceFormulas(workbook, excelTab) {
  addTotalFormula(excelTab, "Group Classes");
  addTotalFormula(excelTab, "Private Classes");
  addTotalFormula(excelTab, "Intro Classes");
  addTimeTotals(excelTab);
  addTotalFormula(excelTab, "New Agreements (Intros)");
  addTotalFormula(excelTab, "New Agreements (Non-Intros)");
  addTotalFormula(excelTab, "Upgrades/Downgrades");
  addTotalFormula(excelTab, "Product Sales");
  addTotalFormula(excelTab, "Commission Summary");
  addOverallTotalFormula(excelTab);
  formatTab(workbook, excelTab);
}

function addTotalFormula(excelTab, payTypeHeader) {
  let count = 0;
  let pay = 0;
  let headerFound = false;

  for (let i = 0; i < excelTab.length; i++) {
    if (excelTab[i][0].includes(payTypeHeader)) {
      headerFound = true;
      i++;
      continue;
    }

    if (headerFound) {
      if (excelTab[i][0].includes("Totals")) {
        excelTab[i][4] = count;
        excelTab[i][5] = pay;
      } else {
        count++;
        pay += excelTab[i][5];
      }
    }
  }
}

function addTimeTotals(excelTab) {
  let headerFound = false;

  for (let i = 0; i < excelTab.length; i++) {
    if (excelTab[i][0].includes("Time Clock")) {
      headerFound = true;
      i++;
      continue;
    }

    if (headerFound) {
      if (!excelTab[i][0].includes("Totals")) {
        return;
      } else {
        excelTab[i][5] = excelTab[i][3] * excelTab[i][4];
      }
    }
  }
}

function addOverallTotalFormula(excelTab) {
  let pay = 0;
  let lastTotalIndex = -1;
  for (let i = 0; i < excelTab.length; i++) {
    if (excelTab[i][0].includes("Totals") || excelTab[i][0].includes("Salary")) {
      lastTotalIndex = i;
      pay += excelTab[i][5];
    }
  }
  if (lastTotalIndex > 0) {
    excelTab[lastTotalIndex][4] = "";
    excelTab[lastTotalIndex][5] = parseFloat(pay);
  }
}

function formatTab(workbook, excelTab) {
  for (let i = 0; i < excelTab.length; i++) {
    for (let j = 0; j < excelTab[i].length; j++) {
      excelTab[i][j] = String(excelTab[i][j]);
      if (excelTab[i][j] == "'") {
        excelTab[i][j] = '';
      }
      if (excelTab[i][j].includes("CONCATENATE(")) {
        let type = excelTab[i][j].substring(excelTab[i][j].indexOf('"') + 1, excelTab[i][j].indexOf("-- ") + 3);
        let ref = excelTab[i][j].substring(excelTab[i][j].indexOf("&") + 3, excelTab[i][j].indexOf(")"));
        let value = lookupCellReference(workbook, ref);
        if (value.length > 26) {
          excelTab[i][j] = type + value.substring(0, 25) + "...";
        } else {
          excelTab[i][j] = type + value;
        }
      }
      if(excelTab[i][j].charAt(0) === "'"){
        excelTab[i][j] = excelTab[i][j].substring(1);
      }
      if (!isNaN(parseFloat(excelTab[i][j])) && j == 5) {
        excelTab[i][j] = "$" + parseFloat(excelTab[i][j]).toFixed(2);
      }
    }
  }
}

export async function grabDataPrototype(fileId, file) {
  var fileName = file.name;
  var json = [];
  var json_3 = [];
  // console.log("File: ", file);
  var result = await axios.get("api/getUpload", {
    params: {
      fileName: fileName,
    },
  });
  var workbook = result.data;
  var first_sheet_name = workbook.SheetNames[0];
  var worksheet = workbook.Sheets[first_sheet_name];
  json = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  });
  var third_sheet_name = workbook.SheetNames[2];
  var worksheet_3 = workbook.Sheets[third_sheet_name];
  json_3 = XLSX.utils.sheet_to_json(worksheet_3, {
    header: 1,
    raw: false,
    defval: "",
  });
  var correctFileType = convertJSON(fileId, json, json_3);
  console.log("is " + fileId + " correct: " + correctFileType);
  console.log(inputFilesArrays);
  return correctFileType;
}
const ReportCompilerContext = React.createContext();

export function useReportCompiler() {
  return useContext(ReportCompilerContext);
}

export function ReportCompilerProvider({ children }) {
  // const [currentFiles, setCurrentFiles] = useState();
  // const [loading, setLoading] = useState(true);

  // Becuase of firebase's verification delay we load until useEffect is run
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setCurrentUser(user);
  //     setLoading(false);
  //   });

  //   return unsubscribe;
  // }, []);

  function grabDataScrape(fileId, file) {
    console.log("grabDataPrototype...");
    var json = [];
    var json_3 = [];
    var workbook = file;
    var first_sheet_name = workbook.SheetNames[0];
    console.log("sheet name: " + first_sheet_name);
    var worksheet = workbook.Sheets[first_sheet_name];
    json = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: "",
    });
    var third_sheet_name = workbook.SheetNames[2];
    var worksheet_3 = workbook.Sheets[third_sheet_name];
    json_3 = XLSX.utils.sheet_to_json(worksheet_3, {
      header: 1,
      raw: false,
      defval: "",
    });
    convertJSON(fileId, json, json_3);
    console.log("inputFilesArray", inputFilesArrays);
    // convertRawJSONArray(fileId, json, json_3);
  }

  // Context
  const value = {
    // currentFiles,
    grabDataScrape,
  };

  // if not loading then we render children of auth provider
  return (
    <ReportCompilerContext.Provider value={value}>
      {children}
    </ReportCompilerContext.Provider>
  );
}