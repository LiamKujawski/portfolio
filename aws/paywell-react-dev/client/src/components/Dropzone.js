import React, { useCallback, useState, useEffect } from "react";
import {
  grabDataPrototype,
  sendPayWellFileToUploadsFolder,
  sendFileToUploadsFolder,
  addSummaryTotalsFormulas,
  getStudiosFromInputFile,
  getStaffEmailArray,
  getStudioAndReportTypeForFile,
  getReportsNeededFromInput,
} from "../contexts/ReportCompilerContext";
import { useStudioScrapeStatus } from "../contexts/StudioScrapeStatusContext";

import { useDropzone } from "react-dropzone";
import { Card, formLabelClasses } from "@mui/material";
// import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import Button from "@mui/material/Button";
import FileUploadStatus from "./FileUploadStatus";
import axios from "axios";
import xlsx from "xlsx";
import Exceljs from "exceljs";
import { letterSpacing } from "@mui/system";
import BasicTable from "./Table";
import { header } from "express/lib/request";

// var to_html = function to_html(workbook) {
//   HTMLOUT.innerHTML = "";
//   workbook.SheetNames.forEach(function (sheetName) {
//     var htmlstr = X.write(workbook, {
//       sheet: sheetName,
//       type: "string",
//       bookType: "html",
//     });
//     HTMLOUT.innerHTML += htmlstr;
//   });
//   return "";
// };

export default function Dropzone(props) {
  const {
    setStudiosCompletedStatusArray,
    updateCurrentlySelectedStudios,
    setNumberOfStudios,
    numberOfCompletedStudios,
    setStudiosCompletedStatus,
    currentlySelectedStudios,
    setStudioCompletedReportCount,
    isContinueButtonDisabled,
    setIsContinueButtonDisabled,
  } = useStudioScrapeStatus();

  var studio = props.studio;
  const [state, setState] = useState([]); // Individual File states
  var initialStudioLoadingStates = true;
  const [studioLoadingState, setStudioLoadingState] = useState(
    initialStudioLoadingStates
  );
  const [inputFile, setInputFile] = useState();
  var reportFileCnt = 0;
  const [headers, setHeaders] = useState(["header"]);
  const [rows, setRows] = useState(["row"]);
  const addedReports = [];
  // const [table, setTable] = useState("Table");
  useEffect(() => console.log(props.tables), [props.tables]);
  function createData([
    className,
    location,
    date,
    time,
    classSize,
    payment,
    comments,
  ]) {
    return { className, location, date, time, classSize, payment, comments };
  }
  function createSeperateTables(rowsFiltered, rows) {
    var jsxTables = [];
    let sliceIndexes = [];
    for (let i = 0; i < rowsFiltered.length; i++) {
      if (rowsFiltered[i].length === 1) {
        sliceIndexes.push(i);
      }
    }
    //console.log(sliceIndexes);
    let tables = [];
    for (let i = 0; i < sliceIndexes.length; i++) {
      if (i === 0) {
        tables.push(rows.slice(0, sliceIndexes[i]));
      } else {
        tables.push(rows.slice(sliceIndexes[i - 1], sliceIndexes[i]));
      }
    }
    tables.push(rows.slice(sliceIndexes[sliceIndexes.length - 1]));

    // Convert tables array  into BasicTable's
    jsxTables = tables.map((table) => {
      //console.log(table);
      return <BasicTable rows={table} />;
    });
    //console.log(jsxTables);

    return jsxTables;
  }
  const filterArray = (a, b) => {
    return a.filter((e) => {
      return e != b;
    });
  };
  const filterNestedArray = (a, b) => {
    let firstLevel = filterArray(a, b);

    return firstLevel.map((el) => {
      if (Array.isArray(el)) {
        return filterArray(el, b);
      } else {
        return el;
      }
    });
  };
  const removeEmptyRows = (array) => {
    return array.filter(
      (row) => !row.every((cell) => cell === "" || cell === "'")
    );
  };
  function arrayToHTML(rowsFiltered, unfilteredRows, headers) {
    let sliceIndexes = [];
    for (let i = 0; i < rowsFiltered.length; i++) {
      if (rowsFiltered[i].length === 1) {
        sliceIndexes.push(i);
      }
    }
    //console.log(sliceIndexes);
    let tables = [];
    for (let i = 0; i < sliceIndexes.length; i++) {
      if (i === 0) {
        tables.push(unfilteredRows.slice(0, sliceIndexes[i]));
      } else {
        tables.push(unfilteredRows.slice(sliceIndexes[i - 1], sliceIndexes[i]));
      }
    }
    tables.push(unfilteredRows.slice(sliceIndexes[sliceIndexes.length - 1]));

    var html = "";
    // var reversedHeaders = headers.reverse();
    html += headers.map((header) => `<h1>${header}</h1>`);
    tables.map((table) => {
      let htmlTable = `
       <head>
       <style>  
        table {
          empty-cells: hide;
          border: none;
        }
        tbody {
          font-family: Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
          border: none;
        }
        th {
          font-weight: bold;
          border: none;
        }
       
        tr {
          background-color: #f2f2f2 !important;
          border: none;
          padding: 25px;
        }
        td {
          border: none;
          padding: 8px;
          margin: 0px;
        }
      </style>
      <head>
      <table>
        <tbody>`;
      // let htmlTable=`<table><tbody>`;
      let htmlRows = "";
      table.map((row) => {
        let htmlRow = "<tr>";
        row.map((cell) => {
          htmlRow += `<td>${cell}</td>`;
        });
        htmlRow += "</tr>";
        htmlRows += htmlRow;
      });
      htmlTable += htmlRows;
      htmlTable += "</tbody></table>";
      html += htmlTable;
    });
    // setHeaders(_headers.flat());
    // setRows(_rows);
    return html;
  }
  useEffect(() => {
    console.log("headers: ", headers, " rows: ", rows);
  }, [headers, rows]);

  function addToState(newvalue) {
    setState((state) => [...state, newvalue]);
  }
  const isCorrectStudio = (uploadedReportStudio) => {
    console.log(uploadedReportStudio, " ", props.studio);
    return uploadedReportStudio.includes(props.studio);
  };
  const isReportAlreadyUploaded = (reportType) => {
    return addedReports.includes(reportType);
  };
  const updateReportForStudio = (reportType, newvalue) => {
    console.log("updateReportForStudio()");
    setState((state) =>
      state.map((report) => {
        if (report.props.fileType === reportType) {
          return newvalue;
        } else {
          return report;
        }
      })
    );
  };
  const addReportToStudio = (newvalue) => {
    console.log("addReportToStudio()");
    addToState(newvalue);
  };
  const updateReportStatus = (reportType, newvalue) => {
    updateReportForStudio(reportType, newvalue);
  };
  const uploadReport = async (studio, file, fileType) => {
    // IF report is for correct studio using getStudioAndReportTypeForFile()
    if (isCorrectStudio(studio)) {
      // IF File uploaded succesfully
      const isUploaded = await sendPayWellFileToUploadsFolder(file);
      if (isUploaded) {
        // IF report Is valid using grabDataPrototype()
        let isReportValid = await grabDataPrototype(
          fileType + (props.studioIndex + 1) + "file",
          file,
          file.name
        );
        if (isReportValid) {
          // update report UI to "done"
          updateReportStatus(
            fileType,
            <FileUploadStatus
              status={"done"}
              fileType={fileType}
              fileName={file.name}
              key={fileType}
            />
          );
          // update setStudioCompletedReportCount for current studio
          // IF all files are done for studio
          // Set studio status to done
        } // ELSE set report status UI to invalid file
        else {
        }
        // ELSE set reportStatus UI to failed upload tooltip
      } // ELSE switch out existing report to newly uploaded report
      else {
      }
    } // ELSE set report status UI to incorrect studio tooltip
    else {
      updateReportStatus(
        fileType,
        <FileUploadStatus
          status={"studioError"}
          fileType={fileType}
          fileName={file.name}
          key={fileType}
        />
      );
    }
  };

  const setInitalReportStates = () => {
    console.log("setInitalReportStates()");
    const { reportsNeeded, fullNameReportsNeeded } =
      getReportsNeededFromInput();
    fullNameReportsNeeded.map((reportName, i) => {
      addReportToStudio(
        <FileUploadStatus
          status={"idle"}
          fileType={reportsNeeded[i]}
          fileName={reportName}
          key={reportsNeeded[i]}
        />
      );
      addedReports.push(reportsNeeded[i]);
    });
  };

  useEffect(
    () => (props.type === "export" ? null : setInitalReportStates()),
    []
  );

  const handleReportUpload = async (file) => {
    console.log("handleReportUpload()");
    // Use getStudioAndReportTypeForFile() to determine what studio and report to add
    const { studio, fileType } = await getStudioAndReportTypeForFile(file);
    // check if wrong file type or studio
    if (
      studio !== null &&
      studio !== undefined &&
      fileType !== null &&
      fileType !== undefined
    ) {
      // IF same report type is not already uploaded
      if (!isReportAlreadyUploaded(fileType)) {
        // add Report with UI status to loading
        addReportToStudio(
          studio,
          fileType,
          <FileUploadStatus
            status={"idle"}
            fileType={fileType}
            fileName={file.name}
            key={fileType}
          />
        );
        addedReports.push(fileType);
        uploadReport(studio, file, fileType);
      } else {
        // add Report with UI status to loading
        updateReportStatus(
          fileType,
          <FileUploadStatus
            status={"loading"}
            fileType={fileType}
            fileName={file.name}
            key={fileType}
          />
        );
        uploadReport(studio, file, fileType);
        // IF File uploaded succesfully
        // IF report Is valid using grabDataPrototype()
        // update report UI to "done"
        // update setStudioCompletedReportCount for current studio
        // IF all files are done for studio
        // Set studio status to done
        // ELSE set report status UI to invalid file
        // ELSE set reportStatus UI to failed upload tooltip
      }
    }
    //     setInputFile(() => (
    //   <>
    //     <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
    //       PayWell file:
    //     </p>
    //     <FileUploadStatus
    //       fileType={"input"}
    //       status={"loading"}
    //       fileName={acceptedFiles[0].path}
    //     />
    //   </>
    // ));
    // let isUploaded = await sendPayWellFileToUploadsFolder(acceptedFiles[0]);
    // if (isUploaded) {
    //   // Compile and check if file is valid
    //   let isInputFileValid = await grabDataPrototype(
    //     "input",
    //     acceptedFiles[0]
    //   );
    //   if (isInputFileValid) {
    //     updateCurrentlySelectedStudios(getStudiosFromInputFile());
    //     // setStudiosCompletedStatusArray(() => value.map(() => false));
    //     // setNumberOfStudios(value.length);
    //     // setStudiosCompletedStatus(
    //     //   numberOfCompletedStudios + "/" + value.length
    //     // );
    //     // setStudioCompletedReportCount(() => value.map(() => 0));
    //   }
    //   setInputFile(() => (
    //     <>
    //       <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
    //         PayWell file:
    //       </p>
    //       <FileUploadStatus
    //         fileType={"input"}
    //         status={isInputFileValid ? "done" : "fileError"}
    //         fileName={acceptedFiles[0].path}
    //       />
    //     </>
    //   ));
    // } else {
    //   setInputFile(() => (
    //     <>
    //       <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
    //         PayWell file:
    //       </p>
    //       <FileUploadStatus
    //         fileType={"input"}
    //         status={"uploadError"}
    //         fileName={acceptedFiles[0].path}
    //       />
    //     </>
    //   ));
    // }
  };
  const onDrop = useCallback(async (acceptedFiles) => {
    if (props.type === "inputFile") {
      setInputFile(() => (
        <>
          <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
            PayWell file:
          </p>
          <FileUploadStatus
            fileType={"input"}
            status={"loading"}
            fileName={acceptedFiles[0].path}
          />
        </>
      ));
      let isUploaded = await sendPayWellFileToUploadsFolder(acceptedFiles[0]);
      if (isUploaded) {
        // Compile and check if file is valid
        let isInputFileValid = await grabDataPrototype(
          "input",
          acceptedFiles[0]
        );
        if (isInputFileValid) {
          // Update Dashboard studios prop or set in in studioScrapeContext
          updateCurrentlySelectedStudios(getStudiosFromInputFile());
          updateCurrentlySelectedStudios(getStudiosFromInputFile());
          setIsContinueButtonDisabled(false);
          // setStudiosCompletedStatusArray(() => value.map(() => false));
          // setNumberOfStudios(value.length);
          // setStudiosCompletedStatus(
          //   numberOfCompletedStudios + "/" + value.length
          // );
          // setStudioCompletedReportCount(() => value.map(() => 0));
        }
        setInputFile(() => (
          <>
            <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
              PayWell file:
            </p>
            <FileUploadStatus
              fileType={"input"}
              status={isInputFileValid ? "done" : "fileError"}
              fileName={acceptedFiles[0].path}
            />
          </>
        ));
      } else {
        setInputFile(() => (
          <>
            <p style={{ margin: "0", color: "#c3c3c3", marginTop: "1.5em" }}>
              PayWell file:
            </p>
            <FileUploadStatus
              fileType={"input"}
              status={"uploadError"}
              fileName={acceptedFiles[0].path}
            />
          </>
        ));
      }
    } else if (props.type === "export") {
      let emailContent = await getStaffEmailArray(acceptedFiles[0]);
      let emailAddress = emailContent[0].address;
      let content = emailContent[0].content;
      emailContent.map(async (staff) => {
        let to = staff.address;
        let cc = "scott.smith0703@gmail.com";

        // let html = `
        // <p>${staff.address}</p><br/><p>${staff.content}</p>
        // `;
        // const mailOptions = {
        //   from: "paywell.llc@gmail.com", // sender address
        //   to: "liamkujawski23@gmail.com", // list of receivers
        //   subject: "PayWell email fucker!!!", // Subject line
        //   cc: "scott.smith0703@gmail.com",
        //   html: "<p><ol><li>Payroll Data</li><li>Data 1</li></ol></p>", // plain text body
        // };
        let rows = removeEmptyRows(staff.content.slice(6));
        let headers = removeEmptyRows(staff.content.slice(0, 6));
        let rowsFiltered = filterNestedArray(rows, "");

        let tablesArray = createSeperateTables(rowsFiltered, rows);

        var html = arrayToHTML(rowsFiltered, rows, headers);

        let email = {
          headers: headers,
          tables: tablesArray,
        };
        props.handleAddEmailCard(email);
        props.addEmail(html, to, cc);
        // props.setTableHeaders(headers);
        // console.log("tablesArray: ", tablesArray);
        // console.log(props);

        // props.setTables(props.tables.concat(tablesArray));
        // props.setTables(tablesArray);

        // Send email to respective staff email with respective data
        // var result = await axios.get("api/email", {
        //   params: {
        //     to: to,
        //     cc: cc,
        //     html: html,
        //   },
        // });
      });
    } else {
      acceptedFiles.forEach((file, i) => {
        handleReportUpload(file);
      });
      // Handle Manual File Upload

      // acceptedFiles.forEach((file, i) => {
      //   sendFileToUploadsFolder(file);
      //   updateReportFile(
      //     i,
      //     <FileUploadStatus
      //       status={"done"}
      //       fileType={file.name}
      //       fileName={file.name}
      //       fileIndex={i}
      //       key={file.name}
      //     />
      //   );
      //   grabDataPrototype(props.reportType[i] + 1 + "file", file, file.name);
      //   reportFileCnt++;
      // });
      // setStudioLoadingState(false);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
    onDrop,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {studio}
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <Card
            raised={true}
            sx={{
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              mt: 1,
              ml: 0,
              mr: 1,
              mb: 1,
              minWidth: "19em",
              flex: 1,
              maxWidth: "32em",
              minHeight: "20em",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            }}
          >
            <Card
              raised={false}
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
                {props.type === "inputFile"
                  ? `Drag your PayWell input file here to upload.`
                  : `Drag your ${props.studio} reports here to upload.`}
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
            {props.type === "inputFile" ? inputFile : state}
          </Card>
        ) : (
          <Card
            raised={true}
            sx={{
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
              // alignItems: "flex-start",
              justifyContent: "flex-start",
              p: 3,
              // margin: 2,
              mt: 1,
              ml: 0,
              left: 0,
              mr: 1,
              mb: 1,
              minWidth: "19em",
              flex: 1,
              maxWidth: "32em",
              minHeight: "20em",
              boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
            }}
          >
            <Card
              raised={false}
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
                {props.type === "inputFile"
                  ? `Drag your PayWell input file here to upload.`
                  : `Drag your ${props.studio} reports here to upload.`}
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
              {props.type === "inputFile" ? inputFile : state}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
