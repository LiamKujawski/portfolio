import { PayWellStaff } from "../../ReportCompiler/classes/PayWellStaff";
import { CatchAllClassLogic } from "../../ReportCompiler/classes/CatchAllClassLogic";
import { ClassTypeRequirements } from "../../ReportCompiler/classes/ClassTypeRequirements";

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
  
          for (let f = 0; f < studios.length; f++) {
            studios[f] = studios[f].replace("Club Pilates ", "");
          }
  
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
                staffPayArrayFromInp[staffReferenceIndex].location.push(
                  studios[s]
                );
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
          arr[0] = arr[0].replace("Club Pilates ", "");
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
      }
    }
  
    inputFilesArrays["input1Pay"] = staffPayArrayFromInp;
    inputFilesArrays["input1Questions"] = createQuestionArray();
    console.log("inputFilesArrays", inputFilesArrays);
  
    studiosInformation["instructorsArray"] = createInstructorArray();
    studiosInformation["nonInstructorsArray"] = createNonInstructorArray();
    studiosInformation["staffArray"] = createStaffArray();
    console.log("Studios Information", studiosInformation);
  
    const studiosArray = findNumberOfStudios();
    payrollInformation["studiosInInput"] = studiosArray;
    payrollInformation["numberOfStudios"] = studiosArray.length;
    console.log("Payroll Information", payrollInformation);
    // updateCurrentlySelectedStudios(payrollInformation.studiosInInput);
    return correctFileType;
  }