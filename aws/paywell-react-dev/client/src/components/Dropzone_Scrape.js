import React, { useCallback, useState, useEffect } from "react";
import {
  grabDataPrototype,
  sendPayWellFileToUploadsFolder,
  sendFileToUploadsFolder,
} from "../contexts/ReportCompilerContext";
import { useDropzone } from "react-dropzone";
import { Card } from "@mui/material";
// import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import Button from "@mui/material/Button";
import FileUploadStatus from "./FileUploadStatus";
import axios from "axios";
import xlsx from "xlsx";

export default function Dropzone(props) {
  var studio = props.studio;
  const [state, setState] = useState([]); // Individual File states
  var initialStudioLoadingStates = true;
  const [studioLoadingState, setStudioLoadingState] = useState(
    initialStudioLoadingStates
  );
  const [inputFile, setInputFile] = useState();
  var inputFileCnt = 0;
  var reportFileCnt = 0;
  function addToState(newvalue) {
    setState((state) => [...state, newvalue]);
    //console.log(reportFileCnt + " " + props.reportType.length);
  }

  const updateReportFile = (index, newvalue) => {
    if (reportFileCnt < props.reportType.length) {
      addToState(newvalue);
    } else if (reportFileCnt == props.reportType.length) {
      setState((state) => {
        let studioTemp = state.map((item, i) => {
          if (i === index) {
            return newvalue;
          } else {
            return item;
          }
        });
        return studioTemp;
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.forEach((file, i) => {
      sendFileToUploadsFolder(file);
      updateReportFile(
        i,
        <FileUploadStatus
          status={"done"}
          fileType={file.name}
          fileName={file.name}
          key={file.name}
        />
      );

      grabDataPrototype(props.reportType[i] + 1 + "file", file, file.name);
      reportFileCnt++;
    });
    setStudioLoadingState(false);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
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
          {props.content}
        </Card>
      ) : (
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
          {props.content}
        </Card>
      )}
    </div>
  );
}
