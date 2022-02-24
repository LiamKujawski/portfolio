import React, { useContext, useState, useEffect } from "react";

const StudioScrapeStatusContext = React.createContext();

export function useStudioScrapeStatus() {
  return useContext(StudioScrapeStatusContext);
}

export function StudioScrapeStatusProvider({ children }) {
  const [studiosCompletedStatusArray, setStudiosCompletedStatusArray] =
    useState([]);
  const [numberOfStudios, setNumberOfStudios] = useState(0);
  const [numberOfCompletedStudios, setNumberOfCompletedStudios] = useState(0);
  const [studiosCompletedStatus, setStudiosCompletedStatus] = useState(0);
  const [isScrapeComplete, setIsScrapeComplete] = useState(false);
  const [currentlySelectedStudios, setCurrentlySelectedStudios] = useState(["null"]);
  const [studioCompletedReportCount, setStudioCompletedReportCount] =
    useState();
    const [isContinueButtonDisabled, setIsContinueButtonDisabled] = useState(true)

  const reports = ['bel', 'mem', 'time', 'pay', 'agree', 'gross'];
  // const reports = ['bel', 'mem', 'time', 'pay', 'agree'];
  // const reports = ['time'];

  // 'bel', 'mem', 'time', 'pay', 'agree', 'sale' or 'any'
  // var reports = ["agree", "bel", "mem", "time"];
    const fullNameReports = ["Booking Events Log", "Active Members Log", "Time Clock Payroll Log", "Session Payroll Log", "Agreements Log", "Sales Log"];
    // const fullNameReports = ["Booking Events Log", "Active Members Log", "Time Clock Payroll Log", "Session Payroll Log", "Agreements Log"];


  function getReportIndex(reportType) {
    return reports.indexOf(reportType);
  }

  // const reportsFinishedInitial = 0;
  // // Temp
  // const [reportsFinishedNorth, setReportsFinishedNorth] = useState(
  //   reportsFinishedInitial
  // );

  // var [reportsFinishedSouth, setReportsFinishedSouth] = useState(0);

  function incrementStudioReportsCount(studioIndex) {
    console.log("studioCompletedReportCount: ", studioCompletedReportCount);
    studioCompletedReportCount[studioIndex]++;
    console.log("studioCompletedReportCount: ", studioCompletedReportCount);
  }
  function decrementStudioReportsCount(studioIndex) {
    console.log("studioCompletedReportCount: ", studioCompletedReportCount);
    studioCompletedReportCount[studioIndex]--;
    console.log("studioCompletedReportCount: ", studioCompletedReportCount);
  }
  function setStudioReportsCount(studioIndex, newVal) {
    console.log("setStudioReportsCount()");
    console.log(studioCompletedReportCount);
    studioCompletedReportCount[studioIndex] = 0;
    console.log("studioCompletedReportCount: ", studioCompletedReportCount);
  }

  function updateCurrentlySelectedStudios(newVal) {
    console.log(
      "Updating currentlySelectedStudios from " +
        currentlySelectedStudios +
        " to " +
        newVal
    );
    setCurrentlySelectedStudios(newVal);
  }

  function updateStudiosCompletedStatusArray(index, newVal) {
    console.log(
      "Updating StudiosCompletedStatusArray[" +
        index +
        "] from " +
        studiosCompletedStatusArray[index] +
        " to " +
        newVal
    );
    setStudiosCompletedStatusArray((studiosCompletedStatusArray) => {
      return studiosCompletedStatusArray.map((studio, i) => {
        if (index === i) {
          console.log(
            "Changing " + studio + " to " + newVal + " " + index + " " + i
          );
          return newVal;
        } else {
          return studio;
        }
      });
    });
  }
  function updateStudioCompletedReportsCount(studioIndex, newVal) {
    console.log(
      "Updating " +
        studioCompletedReportCount[studioIndex][0] +
        " from " +
        studioCompletedReportCount[studioIndex][1] +
        " to " +
        newVal
    );
    // setStudioCompletedReportCount(() =>
    //   studioCompletedReportCount.map((studio, index) => {
    //     if (studioIndex === index) {
    //       return [studio[0], newVal];
    //     } else {
    //       return studio;
    //     }
    //   })
    // );
  }
  function updateNumberOfCompletedStudios() {
    const countOccurrences = (arr, val) =>
      arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

    setNumberOfCompletedStudios((studiosCompletedStatusArray) =>
      countOccurrences(studiosCompletedStatusArray, true)
    );
  }

  function setupStudios(currentlySelectedStudios) {
    setStudiosCompletedStatusArray(() =>
      currentlySelectedStudios.map(() => false)
    );
    setNumberOfStudios(currentlySelectedStudios.length);
    setStudiosCompletedStatus(
      numberOfCompletedStudios + "/" + currentlySelectedStudios.length
    );
    setStudioCompletedReportCount(() => currentlySelectedStudios.map(() => 0));
  }
  useEffect(() => {
    console.log(currentlySelectedStudios);
    setupStudios(currentlySelectedStudios);
  }, [currentlySelectedStudios]);
  // Context
  const value = {
    getReportIndex,
    studiosCompletedStatusArray,
    setStudiosCompletedStatusArray,
    numberOfStudios,
    setNumberOfStudios,
    numberOfCompletedStudios,
    setNumberOfCompletedStudios,
    studiosCompletedStatus,
    setStudiosCompletedStatus,

    updateStudiosCompletedStatusArray,
    updateNumberOfCompletedStudios,
    isScrapeComplete,
    setIsScrapeComplete,

    setCurrentlySelectedStudios,
    currentlySelectedStudios,
    updateCurrentlySelectedStudios,
    studioCompletedReportCount,
    setStudioCompletedReportCount,

    updateStudioCompletedReportsCount,

    incrementStudioReportsCount,
    decrementStudioReportsCount,
    setStudioReportsCount,
    reports,
    fullNameReports,
    isContinueButtonDisabled,
    setIsContinueButtonDisabled
  };

  // if not loading then we render children of auth provider
  return (
    <StudioScrapeStatusContext.Provider value={value}>
      {children}
    </StudioScrapeStatusContext.Provider>
  );
}
