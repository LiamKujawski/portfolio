import React, { useCallback, useState, useEffect } from "react";
import {
  useReportCompiler,
  createClasses,
  compileEventArrays,
  payWellFileConverter,
  sendPayWellFileToUploadsFolder,
  sendFileToUploadsFolder,
} from "../contexts/ReportCompilerContext";
import { useDropzone } from "react-dropzone";
import { Card } from "@mui/material";
// import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import Button from "@mui/material/Button";
import FileUploadStatus from "./FileUploadStatus";
import Stack from "@mui/material/Stack";
import axios from "axios";
import Studio from "./Studio";
import XLSX from "xlsx";

function createDateFromJSON(month, day, year) {
  return month + "/" + day + "/" + year;
}
export default function Dropzone(props) {
  var initialState = props.studioList.map((studio) =>
    props.reportType.map((report) => (
      <FileUploadStatus
        status={"loading"}
        fileType={report}
        fileName={report}
        key={report}
      />
    ))
  );

  var studioList = props.studioList;
  var reportType = props.reportType;
  const [state, setState] = useState([]); // Individual File states
  var initialStudioLoadingStates = studioList.map((studio, i) => true);
  const [studios, setStudioLoading] = useState(initialStudioLoadingStates);
  const [inputFile, setInputFile] = useState();
  const [files, setFiles] = useState();
  const [error, setError] = useState("");
  const { currentFiles, grabDataScrape } = useReportCompiler();
  var studio = studioList[0];

  const updateLoadingStateOfStudio = (index, newValue) => {
    setStudioLoading((studios) => {
      console.log(studios);
      let allStudios = studios.map((studio, i) => {
        if (index === i) {
          return newValue;
        } else {
          return studio;
        }
      });
      return allStudios;
    });
  };

  const updateItem = (studioIndex, index, newvalue) => {
    setState((state) => {
      console.log("State: ", state);
      const list = state.map((studio, s) => {
        if (studioIndex === s) {
          let studioTemp = studio.map((item, i) => {
            if (i === index) {
              return newvalue;
            } else {
              return item;
            }
          });
          return studioTemp;
        } else {
          return studio;
        }
      });
      return list;
    });
  };

  async function handleGrabDataScrape(fileId, file) {
    setError("");
    try {
      await grabDataScrape(fileId, file);
    } catch {
      setError("Failed to grabDataScrape()...");
    }
  }

  async function handleOnClick(studioIndex, fileIndex, reportType) {
    updateItem(
      studioIndex,
      fileIndex,
      <FileUploadStatus
        status={"loading"}
        fileType={reportType}
        fileName={reportType}
        key={reportType}
      />
    );
    await axios
      .get("api/scrapeFileFromStudio", {
        params: {
          startDate: props.dates[0],
          endDate: props.dates[1],
          studio: studioList[studioIndex],
          report: reportType,
        },
      })
      .then(async ({ data }) => {
        console.log(studioList[studioIndex], data);

        // ______ add condidtion that checks if all files are a success
        updateLoadingStateOfStudio(studioIndex, false); // Set studio loading state to false

        // set loading states of each individual file
        updateItem(
          studioIndex,
          fileIndex,
          <FileUploadStatus
            status={"done"}
            fileType={reportType}
            fileName={data.fileName}
            key={data.fileName}
          />
        );
        handleGrabDataScrape(reportType + studioIndex + "file", data.workbook);
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

  const onDrop = useCallback(async (acceptedFiles) => {
    let startDate = props.dates[0];
    let endDate = props.dates[1];

    props.type === "inputFile"
      ? acceptedFiles.forEach((file) => {
          sendPayWellFileToUploadsFolder(file);
          setInputFile(() => (
            <>
              <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
                PayWell file:
              </p>
              <FileUploadStatus
                fileType={"input"}
                fileName={acceptedFiles[0].path}
              />
            </>
          ));
        })
      : acceptedFiles.forEach((file) => {
          sendFileToUploadsFolder(file);
          //console.log(file);
          setFiles(() => (
            <>
              <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
                Reports:
              </p>

              <FileUploadStatus fileType={""} fileName={file.name} />
            </>
          ));
        });

    setState(initialState);

    for (let i = 0; i < studioList.length; i++) {
      studio = studioList[i];
      console.log("Hitting api/getClubReadyFileData for studio:", studio);

      await axios
        .get("api/scrapeAllFilesFromStudio", {
          params: {
            startDate: props.dates[0],
            endDate: props.dates[1],
            studio: studio,
            reports: reportType,
          },
        })
        .then(async ({ data }) => {
          //console.log(studio, data);
          //console.log(i);
          updateLoadingStateOfStudio(i, false); // Set studio loading state to false

          // set loading states of each individual file
          for (let j = 0; j < reportType.length; j++) {
            console.log(reportType[j] + " had error");
            if (data[j] === "error") {
              updateItem(
                i,
                j,
                <FileUploadStatus
                  handleOnClick={() => handleOnClick(i, j, reportType[j])}
                  status={"error"}
                  fileType={data[j].fileType}
                  fileName={
                    "Failed collecting " + reportType[j] + ". Try again."
                  }
                  key={data[j].fileName}
                />
              );
            } else {
              updateItem(
                i,
                j,
                <FileUploadStatus
                  status={"done"}
                  fileType={data[j].fileType}
                  fileName={data[j].fileName}
                  key={data[j].fileName}
                />
              );
              handleGrabDataScrape(
                data[j].fileType + (i + 1) + "file",
                data[j].workbook
              );
            }
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
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {studioList}
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Card
            raised="true"
            sx={{
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              margin: 2,
              minWidth: "22em",
              flex: 1,
              maxWidth: "32em",
              minHeight: "20em",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            }}
          >
            <Card
              raised="false"
              sx={{
                textAlign: "center",
                color: "#5f697a",
                borderRadius: 3,
                border: "2px solid #4d5efa",
                boxShadow: "none",
                backgroundColor: "#e8ecfe",
                minHeight: "20em",
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                p: 2,
                width: "100%",
                justifyContent: "center",
              }}
            >
              {/* <FolderRoundedIcon
                fontSize="large"
                style={{ color: "#4d5efa" }}
              /> */}
              <p style={{ maxWidth: "12em" }}>
                Drag your PayWell input file here to upload.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <hr
                  style={{
                    width: "3.5em",
                    borderWidth: "2px",
                    borderRadius: 2,
                    backgroundColor: "#CBD2EA",
                  }}
                />
                <p
                  style={{
                    marginLeft: ".5em",
                    marginTop: ".18em",
                    marginRight: ".5em",
                    opacity: 0.5,
                  }}
                >
                  OR
                </p>
                <hr
                  style={{
                    width: "3.5em",
                    borderWidth: "2px",
                    borderRadius: 2,
                    backgroundColor: "#CBD2EA",
                  }}
                />
              </div>
              <Button variant="contained">Browse files</Button>
            </Card>
          </Card>
        ) : (
          <Card
            raised="true"
            sx={{
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              margin: 2,
              minWidth: "22em",
              flex: 1,
              maxWidth: "32em",
              minHeight: "20em",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            }}
          >
            <Card
              raised="false"
              sx={{
                textAlign: "center",
                color: "#5f697a",
                borderRadius: 3,
                border: "1px dashed #CBD2EA",
                boxShadow: "none",
                backgroundColor: "#f4f7fd",
                minHeight: "20em",
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                p: 2,
                width: "100%",
                justifyContent: "center",
              }}
            >
              {/* <FolderRoundedIcon
                fontSize="large"
                style={{ color: "#4d5efa" }}
              /> */}
              <p style={{ maxWidth: "12em" }}>
                Drag your PayWell input file here to upload.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <hr
                  style={{
                    width: "3.5em",
                    borderWidth: "2px",
                    borderRadius: 2,
                    backgroundColor: "#CBD2EA",
                  }}
                />
                <p
                  style={{
                    marginLeft: ".5em",
                    marginTop: ".18em",
                    marginRight: ".5em",
                    opacity: 0.5,
                  }}
                >
                  OR
                </p>
                <hr
                  style={{
                    width: "3.5em",
                    borderWidth: "2px",
                    borderRadius: 2,
                    backgroundColor: "#CBD2EA",
                  }}
                />
              </div>
              <Button variant="contained">Browse files</Button>
            </Card>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              {inputFile}
            </div>
          </Card>
        )}
      </div>
      {state.map((sta, i) => (
        <Studio
          studio={props.studioList[i]}
          state={sta}
          loading={studios[i]}
        ></Studio>
      ))}
    </div>
  );
}
