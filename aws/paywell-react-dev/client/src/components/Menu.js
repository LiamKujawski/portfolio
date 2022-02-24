import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  grabDataPrototype,
  sendPayWellFileToUploadsFolder,
  sendFileToUploadsFolder,
  findFileTypeFromName,
  getStudioAndReportTypeForFile,
} from "../contexts/ReportCompilerContext";
import { useStudioScrapeStatus } from "../contexts/StudioScrapeStatusContext";
import MenuItem from "@mui/material/MenuItem";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
// import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
// import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
const options = ["Retry", "Upload", "Delete"];

const Input = styled("input")({
  display: "none",
});

const ITEM_HEIGHT = 48;

export default function LongMenu(props) {
  const {
    getReportIndex,
    // incrementStudioReportsCount,
    reports,
    currentlySelectedStudios,
    studioCompletedReportCount,
    setStudioReportsCount,
  } = useStudioScrapeStatus();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // const handleUploadReport = () => {
  //   console.log("Upload Report");
  // };
  // const handleDeleteReport = () => {
  //   console.log("Delete Report");
  // };
  async function handleStudioUpload(event) {
    console.log("handleStudioUpload()");

    for (let i = 0; i < event.target.files.length; i++) {
      // Figure out what type of report the uploaded file is
      let reportInfo = await getStudioAndReportTypeForFile(
        event.target.files[i]
      );
      console.log(reports);
      console.log(
        reportInfo.studio,
        " = ",
        currentlySelectedStudios[props.studioIndex],
        " ",
        reportInfo.fileType,
        " = ",
        reports[i]
      );
      props.handleSetFileStatusToLoading(
        props.studioIndex,
        getReportIndex(reportInfo.fileType),
        reportInfo.fileType
      );
      if (reportInfo.studio !== null && reportInfo.studio !== undefined) {
        if (
          reportInfo.studio.includes(
            currentlySelectedStudios[props.studioIndex]
          ) &&
          reports.includes(reportInfo.fileType)
        ) {
          console.log("PASSED");
          let isUploaded = await sendFileToUploadsFolder(event.target.files[i]);
          if (isUploaded) {
            console.log(
              reportInfo.fileType,
              " ",
              props.studioIndex,
              " ",
              "file"
            );

            // Compile and check if report is valid
            let isReportValid = await grabDataPrototype(
              reportInfo.fileType + (props.studioIndex + 1) + "file",
              event.target.files[i],
              event.target.files[i].name
            );
            if (isReportValid) {
              // setFileStatusToDone(studioIndex, fileIndex, report, fileName)

              props.handleSetFileStatusToDone(
                props.studioIndex,
                getReportIndex(reportInfo.fileType),
                reportInfo.fileType,
                event.target.files[i].name
              );
              // Update reports finished count
              // incrementStudioReportsCount(props.studioIndex);
            } else {
              props.handleSetFileStatusToFileError(
                props.studioIndex,
                i,
                reports[i],
                event.target.files[i].name
              );
            }
          } else {
            // Set to report status to upload error
            props.handleSetFileStatusToUploadError(
              props.studioIndex,
              getReportIndex(reportInfo.fileType),
              reportInfo.fileType,
              event.target.files[i].name
            );
          }
        } else {
          if (
            reportInfo.studio !== currentlySelectedStudios[props.studioIndex]
          ) {
            console.log("wrong studio");
            props.handleSetFileStatusToStudioError(
              props.studioIndex,
              getReportIndex(reportInfo.fileType),
              reportInfo.fileType,
              event.target.files[i].name
            );
          } else if (reportInfo.fileType !== reports[i]) {
            console.log("WRong file type!!");
            props.handleSetFileStatusToFileError(
              props.studioIndex,
              getReportIndex(reportInfo.fileType),
              reportInfo.fileType,
              event.target.files[i].name
            );
          }
          if (studioCompletedReportCount === reports.length) {
            console.log("studioCompletedReportCount === reports.lengths");
            setStudioReportsCount(
              props.studioIndex,
              studioCompletedReportCount - 1
            );
          }
        }
      }
      // Check if all files are uploaded, if so mark studio as complete
      props.updateIfStudioIsComplete();
    }
  }

  async function handleReportUpload(event) {
    // Figure out what type of report the uploaded file is
    let reportInfo = await getStudioAndReportTypeForFile(event.target.files[0]);

    // Check if current file matches current report upload position
    // console.log(
    //   reportInfo.studio,
    //   " = ",
    //   currentlySelectedStudios[props.studioIndex],
    //   " ",
    //   reportInfo.fileType,
    //   " = ",
    //   props.fileType
    // );
    if (
      reportInfo.studio.includes(currentlySelectedStudios[props.studioIndex]) &&
      reportInfo.fileType === props.fileType
    ) {
      props.handleSetFileStatusToLoading(
        props.studioIndex,
        props.fileIndex,
        props.fileType,
        event.target.files[0].name
      );
      console.log("Correct file for position!!!");
      let isUploaded = await sendFileToUploadsFolder(event.target.files[0]);
      if (isUploaded) {
        // Compile and check if report is valid
        let isReportValid = await grabDataPrototype(
          props.fileType + (props.studioIndex + 1) + "file",
          event.target.files[0],
          event.target.files[0].name
        );
        if (isReportValid) {
          // Set File Status to done
          props.handleSetFileStatusToDone(
            props.studioIndex,
            props.fileIndex,
            props.fileType,
            event.target.files[0].name
          );
          // Update reports finished count
          // incrementStudioReportsCount(props.studioIndex);
        } else {
          props.handleSetFileStatusToFileError(
            props.studioIndex,
            props.fileIndex,
            props.fileType,
            event.target.files[0].name
          );
        }
      } else {
        // Set to report status to upload error
        props.handleSetFileStatusToUploadError(
          props.studioIndex,
          props.fileIndex,
          props.fileType,
          event.target.files[0].name
        );
      }
    } else {
      if (reportInfo.studio !== currentlySelectedStudios[props.studioIndex]) {
        console.log("wrong studio");
        props.handleSetFileStatusToFileError(
          props.studioIndex,
          props.fileIndex,
          props.fileType,
          event.target.files[0].name
        );
      } else if (reportInfo.fileType !== props.fileType) {
        console.log("WRong file type!!");
        props.handleSetFileStatusToFileError(
          props.studioIndex,
          props.fileIndex,
          props.fileType,
          event.target.files[0].name
        );
      }
      console.log(studioCompletedReportCount, " ", reports.length);
      if (studioCompletedReportCount === reports.length) {
        console.log("studioCompletedReportCount === reports.lengths");
        setStudioReportsCount(
          props.studioIndex,
          studioCompletedReportCount - 1
        );
      }
    }

    // Check if all files are uploaded, if so mark studio as complete
    props.updateIfStudioIsComplete();
  }

  const handleOnChange = (file) => {
    // console.log("File Uploaded: ", file);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        {/* <MoreVertIcon /> */}
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "20ch",
          },
        }}
      >
        {options.map((option) => {
          if (!props.isStudio && option === "Retry") {
            return (
              <MenuItem
                key={option}
                selected={option === "Pyxis"}
                onClick={props.handleRetryReport}
                style={{ color: "#757575" }}
              >
                {/* <ReplayRoundedIcon
                  style={{ color: "#757575", marginRight: ".75em" }}
                /> */}
                {option}
              </MenuItem>
            );
          } else if (props.isStudio && option === "Retry") {
            return (
              <MenuItem
                key={option}
                selected={option === "Pyxis"}
                onClick={props.handleRetryStudio}
                style={{ color: "#757575" }}
              >
                {/* <ReplayRoundedIcon
                  style={{ color: "#757575", marginRight: ".75em" }}
                /> */}
                {option}
              </MenuItem>
            );
          } else if (props.isStudio && option === "Upload") {
            return (
              <MenuItem
                key={option}
                selected={option === "Pyxis"}
                // onClick={props.handleUploadReport}
                style={{ color: "#757575" }}
              >
                <label style={{ marginBottom: "0" }}>
                  <Input
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={(event) => {
                      //console.log(event.target.files[0]);
                      //console.log(props.studioIndex);
                      handleStudioUpload(event);
                    }}
                    onClick={(event) => {
                      //console.log(event);
                      event.target.value = null;
                    }}
                  />
                  <Button
                    style={{
                      background: "none",
                      color: "inherit",
                      border: "none",
                      padding: "0",
                      font: "inherit",
                      cursor: "pointer",
                      outline: "inherit",
                      textTransform: "capitalize",
                      boxShadow: "none",
                      margin: "0",
                    }}
                    variant="text"
                    component="span"
                    raised={false}
                  >
                    {/* <UploadFileRoundedIcon
                      style={{
                        color: "#757575",
                        marginRight: ".75em",
                        minWidth: "1em",
                        minHeight: "1em",
                      }}
                    /> */}
                    Upload
                  </Button>
                </label>
              </MenuItem>
            );
          } else if (!props.isStudio && option === "Upload") {
            return (
              <MenuItem
                key={option}
                selected={option === "Pyxis"}
                onClick={props.handleUploadReport}
                style={{ color: "#757575" }}
              >
                <label style={{ marginBottom: "0" }}>
                  <Input
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={(event) => {
                      //console.log(event.target.files[0]);
                      //console.log(props.studioIndex);
                      handleReportUpload(event);
                    }}
                    onClick={(event) => {
                      //console.log(event);
                      event.target.value = null;
                    }}
                  />
                  <Button
                    style={{
                      background: "none",
                      color: "inherit",
                      border: "none",
                      padding: "0",
                      font: "inherit",
                      cursor: "pointer",
                      outline: "inherit",
                      textTransform: "capitalize",
                      boxShadow: "none",
                      margin: "0",
                    }}
                    variant="text"
                    component="span"
                    raised={false}
                  >
                    {/* <UploadFileRoundedIcon
                      style={{
                        color: "#757575",
                        marginRight: ".75em",
                        minWidth: "1em",
                        minHeight: "1em",
                      }}
                    /> */}
                    Upload
                  </Button>
                </label>
              </MenuItem>
            );
          } else if (option === "Delete") {
            return (
              <MenuItem
                key={option}
                selected={option === "Pyxis"}
                onClick={() => {
                  if (props.isStudio) {
                    //console.log(props.studioIndex);
                    props.handleDeleteStudio(props.studioIndex);
                  } else {
                    props.handleDeleteReport(
                      props.studioIndex,
                      props.fileType,
                      props.fileIndex
                    );
                  }
                }}
                style={{ color: "#757575" }}
              >
                {/* <CloseRoundedIcon
                  style={{ color: "#757575", marginRight: ".75em" }}
                /> */}
                {option}
              </MenuItem>
            );
          } else {
            return (
              <MenuItem
                key={option}
                selected={option === "Pyxis"}
                onClick={handleClose}
                style={{ color: "#757575" }}
              >
                {option}
              </MenuItem>
            );
          }
        })}
      </Menu>
    </div>
  );
}

// <Box sx={{ flexGrow: 0 }}>
//           <Tooltip title="Open settings">
//             <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//               <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
//             </IconButton>
//           </Tooltip>
//           <Menu
//             sx={{ mt: "45px" }}
//             id="menu-appbar"
//             anchorEl={anchorElUser}
//             anchorOrigin={{
//               vertical: "top",
//               horizontal: "right",
//             }}
//             keepMounted
//             transformOrigin={{
//               vertical: "top",
//               horizontal: "right",
//             }}
//             open={Boolean(anchorElUser)}
//             onClose={handleCloseUserMenu}
//           >
//             {settings.map((setting) => (
//               <MenuItemWrapper key={setting} setting={setting} />
//             ))}
//           </Menu>
//         </Box>
