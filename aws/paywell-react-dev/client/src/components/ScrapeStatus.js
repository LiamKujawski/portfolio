import React, { useState, useEffect } from "react";
import {
  useReportCompiler,
  // createClasses,
  // compileEventArrays,
  // payWellFileConverter,
  // sendPayWellFileToUploadsFolder,
  // sendFileToUploadsFolder
  removeReport, 
  removeStudio
} from "../contexts/ReportCompilerContext";
import { useAuth } from "../contexts/AuthContext";

import { useStudioScrapeStatus } from "../contexts/StudioScrapeStatusContext";
// import Button from "@mui/material/Button";
import FileUploadStatus from "./FileUploadStatus";
import axios from "axios";
import Studio from "./Studio";
// import XLSX from "xlsx";


// For each studio accordion 
    // box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%) !important;
export default function ScrapeStatus(props) {
    const {currentClubReadyLogin } = useAuth();

  const {
    studiosCompletedStatusArray,
    setStudiosCompletedStatusArray,
    numberOfStudios,
    numberOfCompletedStudios,
    studiosCompletedStatus,
    currentlySelectedStudios,
    isScrapeComplete,
    updateStudioCompletedReportsCount,
    studioCompletedReportCount,
    reports,
    reportsFinishedNorth,
    reportsFinishedSouth,
    setReportsFinishedNorth,
    setReportsFinishedSouth,
    incrementStudioReportsCount,
    decrementStudioReportsCount,
    setStudioReportsCount,
    fullNameReports
  } = useStudioScrapeStatus();
  const [studiosVisibility, setStudiosVisibility] =
    currentlySelectedStudios.map(() => false);

  const handleChangeStudioStatus = (index, newValue) => {
    setStudiosCompletedStatusArray((studiosCompletedStatusArray) => {
      return studiosCompletedStatusArray.map((studio, i) => {
        if (index === i) {
          console.log(
            "Changing " + studio + " to " + newValue + " " + index + " " + i
          );
          return newValue;
        } else {
          return studio;
        }
      });
    });
  };
  function deleteStudio(studioIndex) {
    // Remove studio from UI
    setState((state) =>
      state.filter(
        (studio, i) => studio.key !== currentlySelectedStudios[studioIndex]
      )
    );

    // Remove studio data from compiler    
    removeStudio(studioIndex+1)
  }
  function deleteReport(studioIndex, fileType, reportIndex) {
    // Decrease Report counter 
    decrementStudioReportsCount(studioIndex);
    // Remove report from UI
    updateItem(studioIndex, reportIndex, null)
    // Remove report data from compiler    
    removeReport(fileType, (studioIndex+1))
  }

  var initialStudios = currentlySelectedStudios.map((studio, studioInd) => {
    return (
      <Studio
        key={currentlySelectedStudios[studioInd]}
        isVisible={`${studiosVisibility[studioInd]}`}
        studio={currentlySelectedStudios[studioInd]}
        reports={reportType}
        loading={!studiosCompletedStatusArray[studioInd]}
        reportStatusCount={studioCompletedReportCount[studioInd]}
        handleDeleteStudio={deleteStudio}
        studioIndex={studioInd}
        numberOfReports={props.reportType.length}
        handleRetryStudio={() => handleRetryStudio(studioInd, reportType)}
        handleSetFileStatusToDone={setFileStatusToDone}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioInd)}
        reportComponents={fullNameReports.map((report, fileInd) => (
          <FileUploadStatus
            status={"idle"}
            fileType={reports[fileInd]}
            fileName={report}
            reports={props.reports}
            fileIndex={fileInd}
            handleSetFileStatusToLoading={setFileStatusToLoading}
            handleSetFileStatusToUploadError={setFileStatusToUploadError}
            handleSetFileStatusToFileError={setFileStatusToFileError}
            handleSetFileStatusToStudioError={setFileStatusToStudioError}
            handleSetFileStatusToDone={setFileStatusToDone}
            updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioInd)}
            updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioInd)}
            handleDeleteReport={deleteReport}
            studioIndex={studioInd}
            key={reports[fileInd]}
          />
        ))}
      />
    );
  });
  var reportType = props.reportType;
  const [state, setState] = useState([]); // Individual File states
  const { grabDataScrape } = useReportCompiler();
  var studio = currentlySelectedStudios[0];
  // var studioErrors = currentlySelectedStudios.map(() => []);
  // const [studioErrors, setStudioErrors] = useState(
  //   currentlySelectedStudios.map(() => [])
  // );
  var studioErrorsArray = currentlySelectedStudios.map(() =>
    reportType.map(() => null)
  );

  const handleRetryReport = async (studioIndex, fileIndex, reportType) => {
    console.log(
      "Retry Report: ",
      currentlySelectedStudios[studioIndex],
      "->",
      reportType
    );
    setFileStatusToLoading(studioIndex, fileIndex, reportType);
    await axios
      .get("api/retryScrapeFileFromStudio", {
        params: {
          startDate: props.dates[0],
          endDate: props.dates[1],
          studio: currentlySelectedStudios[studioIndex],
          report: reportType,
          email: currentClubReadyLogin.email,
          password: currentClubReadyLogin.password,
        },
      })
      .then(async ({ data }) => {
        //(studio, data);
        // set loading states of each individual file
        if (data.failedScrape) {
          updateStudioError(
            studioIndex,
            fileIndex,
            reportType[fileIndex] + "Failed to Scrape on retry attempt"
          );
          setFileStatusToError(studioIndex, fileIndex, reportType);
        } else {
          removeStudioError(studioIndex, fileIndex);
          // incrementStudioReportsCount(studioIndex);
          setFileStatusToDone(
            studioIndex,
            fileIndex,
            reportType,
            data.fileName
          );
          handleGrabDataScrape(
            data.fileType + (studioIndex + 1) + "file",
            data.workbook
          );
          // console.log(studioCompletedReportCount);
          // console.log(studioCompletedReportCount[studioIndex]);
          updateIfStudioIsComplete(studioIndex);

          // props.setStudiosCompletedStatusArray(markFileAsComplete(reportType[j]));
        }
      })
      .catch((err) => {
        console.log("Failed axios call");
        let message =
          typeof err.response !== "undefined"
            ? err.response.data.message
            : err.message;
        console.warn("error", message);
      });
  };
  const handleRetryStudio = async (studioIndex, reports) => {
    console.log("handleRetryStudio()");
    // Reset studioCompletedReportCount to 0 for particular studio
    setStudioReportsCount(studioIndex, 0);

    // Set Studio studiosCompletedStatusArray to false for particular studio
    handleChangeStudioStatus(studioIndex, false);

    // Reset the status of each file to idle
    setAllStudioFilesToIdle(studioIndex);

    // For each report in reports array, run handleRetryReport()
    retryStudio(studioIndex);
  };
  async function retryStudio(studioIndex) {
    for (let i = 0; i < reportType.length; i++) {
      await handleRetryReport(studioIndex, i, reportType[i]);
    }
  }
  // const addStudioError = (studioIndex, reportIndex, newError) => {
  //   console.log(
  //     "addStudioError() for ",
  //     currentlySelectedStudios[studioIndex],
  //     " ",
  //     reportType[reportIndex],k
  //     " Error: ",
  //     newError
  //   );

  //   console.log("studioErrorsArray: ", studioErrorsArray);
  //   studioErrorsArray[studioIndex].push(newError);
  // };
  const updateStudioError = (studioIndex, reportIndex, newError) => {
    console.log(
      "updateStudioError() for ",
      currentlySelectedStudios[studioIndex],
      " ",
      reportType[reportIndex],
      " Error: ",
      newError
    );

    // console.log("studioErrorsArray: ", studioErrorsArray);
    studioErrorsArray[studioIndex].splice(reportIndex, 1, newError);
  };
  const removeStudioError = (studioIndex, reportIndex) => {
    console.log(studioErrorsArray);
    console.log(
      "removeStudioError() for ",
      currentlySelectedStudios[studioIndex],
      " ",
      reportType[reportIndex]
    );

    studioErrorsArray[studioIndex].splice(reportIndex, 1, null);
    console.log(studioErrorsArray);
  };
  const updateItem = (studioIndex, index, newvalue) => {
    setState((state) => {
      const list = state.map((studio, s) => {
        if (studioIndex === s) {
          let newStudio = (
            <Studio
              key={currentlySelectedStudios[studioIndex]}
              isVisible={`${studiosVisibility[studioIndex]}`}
              studio={currentlySelectedStudios[studioIndex]}
              reports={reportType}
              loading={!studiosCompletedStatusArray[studioIndex]}
              reportStatusCount={studioCompletedReportCount[studioIndex]}
              handleDeleteStudio={deleteStudio}
              studioIndex={studioIndex}
              numberOfReports={props.reportType.length}
              handleRetryStudio={() =>
                handleRetryStudio(studioIndex, reportType)
              }
              handleSetFileStatusToDone={setFileStatusToDone}
              handleSetFileStatusToLoading={setFileStatusToLoading}
              handleSetFileStatusToUploadError={setFileStatusToUploadError}
              handleSetFileStatusToFileError={setFileStatusToFileError}
              handleSetFileStatusToStudioError={setFileStatusToStudioError}
              updateIfStudioIsComplete={() =>
                updateIfStudioIsComplete(studioIndex)
              }
              reportComponents={studio.props.reportComponents.map(
                (report, i) => {
                  if (i === index) {
                    return newvalue;
                  } else {
                    return report;
                  }
                }
              )}
            />
          );
          // let studioTemp = studio.map((item, i) => {
          //   if (i === index) {
          //     console.log(
          //       "Updating: ",
          //       item,
          //       " from ",
          //       studio,
          //       " to ",
          //       newvalue
          //     );
          //     return newvalue;
          //   } else {
          //     console.log(
          //       "Keeping value: ",
          //       item,
          //       " from ",
          //       studio,
          //       " the same "
          //     );
          //     return item;
          //   }
          // });

          return newStudio;
        } else {
          return studio;
        }
      });
      return list;
    });
  };
  async function handleGrabDataScrape(fileId, file) {
    try {
      await grabDataScrape(fileId, file);
    } catch {
      console.log("Failed to grabDataScrape()...");
    }
  }
  // studioErrorsArray, studioIndex
  function updateIfStudioIsComplete(studioIndex) {
    console.log("updateIfStudioIsComplete()");
    console.log(reportType.length);
    console.log(reportType);
    console.log(studioErrorsArray);
    let studioComplete = true;
    for (let t = 0; t < studioErrorsArray[studioIndex].length; t++) {
      //console.log(studioErrorsArray[studioIndex][t]);
      if (
        studioErrorsArray[studioIndex][t] !== null ||
        studioCompletedReportCount[studioIndex] < reportType.length
      ) {
        console.log(
          "IS NULL ",
          studioErrorsArray[studioIndex][t],
          " ",
          studioCompletedReportCount[studioIndex]
        );
        studioComplete = false;
      }
    }
    if (studioComplete) {
      handleChangeStudioStatus(studioIndex, true);
      console.log(
        "Finsihed " +
          currentlySelectedStudios[studioIndex] +
          " studioCompleteStatus: " +
          studiosCompletedStatusArray
      );
    }
  }
  function setFileStatusToIdle(studioIndex, fileIndex, reportType) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"idle"}
        fileType={reportType}
        fileName={reportType}
        fileIndex={fileIndex}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        handleDeleteReport={deleteReport}
        handleDeleteStudio={deleteStudio}
        studioIndex={studioIndex}
        key={reportType}
      />
    );
  }
  function setFileStatusToUploadError(
    studioIndex,
    fileIndex,
    reportType,
    fileName
  ) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"uploadError"}
        fileType={reportType}
        fileName={reportType}
        fileIndex={fileIndex}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
          handleDeleteReport={deleteReport}
        handleDeleteStudio={deleteStudio}
        studioIndex={studioIndex}
        key={reportType}
      />
    );
  }
  function setAllStudioFilesToIdle(studioIndex) {
    for (let i = 0; i < reportType.length; i++) {
      setFileStatusToIdle(studioIndex, i, reportType[i]);
    }
  }
  function setFileStatusToLoading(
    studioIndex,
    fileIndex,
    reportType,
    fileName
  ) {
    if (fileName) {
      updateItem(
        studioIndex,
        fileIndex,
        <FileUploadStatus
          status={"loading"}
          fileType={reportType}
          fileName={fullNameReports[fileIndex]}
          key={reportType}
        />
      );
    } else {
      updateItem(
        studioIndex,
        fileIndex,
        <FileUploadStatus
          status={"loading"}
          fileType={reportType}
          fileName={fullNameReports[fileIndex]}
          key={reportType}
        />
      );
    }
  }
  function setFileStatusToLoadingWithFileName(
    studioIndex,
    fileIndex,
    reportType,
    fileName
  ) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"loading"}
        fileType={reportType}
        fileName={fileName}
        key={fileName}
      />
    );
  }
  function setFileStatusToFileError(
    studioIndex,
    fileIndex,
    reportType,
    fileName
  ) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"fileError"}
        studioIndex={studioIndex}
        fileIndex={fileIndex}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        handleUploadReport={props.handleUploadReport}
        handleRetryReport={() =>
          handleRetryReport(studioIndex, fileIndex, reportType)
        }
                handleDeleteStudio={deleteStudio}
        handleDeleteReport={deleteReport}
        handleSetFileStatusToDone={setFileStatusToDone}
        fileType={reportType}
        fileName={fileName}
        key={reportType}
      />
    );
  }
  function setFileStatusToStudioError(
    studioIndex,
    fileIndex,
    reportType,
    fileName
  ) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"studioError"}
        studioIndex={studioIndex}
        fileIndex={fileIndex}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        handleUploadReport={props.handleUploadReport}
        handleRetryReport={() =>
          handleRetryReport(studioIndex, fileIndex, reportType)
        }
         handleDeleteReport={deleteReport}
        handleDeleteStudio={deleteStudio}
        handleSetFileStatusToDone={setFileStatusToDone}
        fileType={reportType}
        fileName={fileName}
        key={reportType}
      />
    );
  }
  function setFileStatusToUploadError(
    studioIndex,
    fileIndex,
    reportType,
    fileName
  ) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"uploadError"}
        studioIndex={studioIndex}
        fileIndex={fileIndex}
        handleUploadReport={props.handleUploadReport}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        handleRetryReport={() =>
          handleRetryReport(studioIndex, fileIndex, reportType)
        }
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
         handleDeleteStudio={deleteStudio}
        handleDeleteReport={deleteReport}
        handleSetFileStatusToDone={setFileStatusToDone}
        fileType={reportType}
        fileName={fileName}
        key={reportType}
      />
    );
  }
  function setFileStatusToError(studioIndex, fileIndex, reportType, fileName) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"error"}
        studioIndex={studioIndex}
        fileIndex={fileIndex}
        handleUploadReport={props.handleUploadReport}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        handleRetryReport={() =>
          handleRetryReport(studioIndex, fileIndex, reportType)
        }
         handleDeleteStudio={deleteStudio}
        handleDeleteReport={deleteReport}
        handleSetFileStatusToDone={setFileStatusToDone}
        fileType={reportType}
        fileName={"Failed collecting " + reportType + ". Click to try again."}
        key={reportType}
      />
    );
  }
  function setFileStatusToDone(studioIndex, fileIndex, report, fileName) {
    //console.log("setFileStatusToDone() ", reportType[fileIndex]);
    //console.log("studioIndex: ", studioIndex, fileIndex, report, fileName);
    incrementStudioReportsCount(studioIndex);
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"done"}
        studioIndex={studioIndex}
        fileType={report}
        fileIndex={fileIndex}
        fileName={fileName}
        key={fileName}
        handleSetFileStatusToLoading={setFileStatusToLoading}
        handleSetFileStatusToUploadError={setFileStatusToUploadError}
        handleSetFileStatusToFileError={setFileStatusToFileError}
        handleSetFileStatusToStudioError={setFileStatusToStudioError}
        updateIfStudioIsComplete={() => updateIfStudioIsComplete(studioIndex)}
        handleSetFileStatusToDone={setFileStatusToDone}
        handleUploadReport={props.handleUploadReport}
        handleRetryReport={() =>
          handleRetryReport(studioIndex, fileIndex, reportType)
        }
         handleDeleteStudio={deleteStudio}
        handleDeleteReport={deleteReport}
      />
    );
  }
  useEffect(() => {
    // Start Scrape when this componenet is loaded
    console.log("Starting Scrape... ", props.startScrape);
    console.log("studiosCompletedStatusArray: ", studiosCompletedStatusArray);
    if (props.startScrape) {
      console.log("studioErros: ", studioErrorsArray);
      startScrape();
    }
    // startScrape();
  }, [props.startScrape]);


   async function startScrape() {
    setState(initialStudios);
    for (let i = 0; i < currentlySelectedStudios.length; i++) {
      for (let j = 0; j < reportType.length; j++) {
        let reportsFinished = reportsFinishedNorth;
        studio = currentlySelectedStudios[i];
        console.log(
          "Hitting api/getClubReadyFileData for studio:",
          studio + " and file: " + reportType[j]
        );
        setFileStatusToLoading(i, j, reportType[j]);
        await axios
          .get("api/scrapeFileFromStudio", {
            params: {
              startDate: props.dates[0],
              endDate: props.dates[1],
              studio: studio,
              report: reportType[j],
               email: currentClubReadyLogin.email,
          password: currentClubReadyLogin.password,
            },
          })
          .then(async ({ data }) => {
            console.log(
              "currentlySelectedStudios: ",
              currentlySelectedStudios,
              "\nstudiosCompletedStatusArray: ",
              studiosCompletedStatusArray,
              "\nnumberOfStudios: ",
              numberOfStudios,
              "\nnumberOfCompletedStudios: ",
              numberOfCompletedStudios,
              "\nstudiosCompletedStatus: ",
              studiosCompletedStatus,
              "\nisScrapeComplete: ",
              isScrapeComplete,
              "\nstudioCompletedReportCount: ",
              studioCompletedReportCount
            );
            // set loading states of each individual file
            if (data.failedScrape) {
              updateStudioError(i, j, reportType[j] + "Failed to Scrape");
              setFileStatusToError(i, j, reportType[j]);
            } else {
              setFileStatusToDone(i, j, reportType[j], data.fileName);
              handleGrabDataScrape(
                data.fileType + (i + 1) + "file",
                data.workbook
              );
            }
          })
          .catch((err) => {
            console.log("Failed axios call");
            let message =
              typeof err.response !== "undefined"
                ? err.response.data.message
                : err.message;
            console.warn("error", message);
          });
      }
      updateIfStudioIsComplete(i);

      // if (studioErrorsArray[i].length === 0) {
      //   handleChangeStudioStatus(i, true);
      //   console.log(
      //     "Finsihed " +
      //       currentlySelectedStudios[i] +
      //       " studioCompleteStatus: " +
      //       studiosCompletedStatusArray
      //   );
      // }

      // Fix Below
      // if (studiosCompletedStatusArray.every((val) => val === true)) {
      //   console.log("SCRAPE IS COMPLETE!!!");
      //   setIsScrapeComplete(true);
      // }
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        margin: "1em",
        justifyContent: "flex-start",
      }}
    >
      {state}
      {/* {state.map((sta, i) => (
        <Studio
          key={currentlySelectedStudios[i]}
          isVisible={`${studiosVisibility[i]}`}
          studio={currentlySelectedStudios[i]}
          reports={reportType}
          loading={!studiosCompletedStatusArray[i]}
          reportStatusCount={studioCompletedReportCount[i]}
          handleDeleteStudio={deleteStudio}
          studioIndex={i}
          numberOfReports={props.reportType.length}
          handleRetryStudio={() => handleRetryStudio(i, reportType)}
          handleSetFileStatusToDone={setFileStatusToDone}
          handleSetFileStatusToLoading={setFileStatusToLoading}
          handleSetFileStatusToUploadError={setFileStatusToUploadError}
          handleSetFileStatusToFileError={setFileStatusToFileError}
          updateIfStudioIsComplete={() => updateIfStudioIsComplete(i)}
        >
          {sta}
        </Studio>
      ))} */}
    </div>
  );
}
