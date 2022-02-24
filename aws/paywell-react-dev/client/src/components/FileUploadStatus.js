import React from "react";
import IconWrapper from "./IconWrapper";
import LinearProgressBar from "./LinearProgressBar";
// import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
// import ErrorIcon from "@mui/icons-material/Error";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Tooltip from "@mui/material/Tooltip";
// import ReplayCircleFilledRoundedIcon from "@mui/icons-material/ReplayCircleFilledRounded";

import FileAction from "./FileAction";
import Menu from "./Menu";
// import InsertDriveFileRoundedIcon from "./IconWrapper";
// import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
// import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
// import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
// import FileDownloadOffRoundedIcon from "@mui/icons-material/FileDownloadOffRounded";
// import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
// import LoopRoundedIcon from "@mui/icons-material/LoopRounded";
// import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
// import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
// import Button from "@mui/material/Button";

export default function FileUploadStatus(props) {
  if (props.fileType === "input") {
    if (props.status === "fileError") {
      return (
        <Tooltip
          sx={{ fontSize: "5rem" }}
          title="Invalid Input File"
          placement="top"
          arrow
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              paddingLeft: "1em",
              marginTop: "1em",
              fontSize: "1em",
            }}
          >
            <IconWrapper color={"red"} />
            <p
              style={{
                display: "flex",
                fontSize: ".75em",
                color: "red",
                alignItems: "center",
                marginBottom: "0",
              }}
            >
              {props.fileName}
            </p>
            {/* <ErrorOutlineIcon style={{ marginLeft: "auto", color: "red" }} /> */}
          </div>
        </Tooltip>
      );
    } else if (props.status === "uploadError") {
      return (
        <Tooltip
          sx={{ fontSize: "5rem" }}
          title={"Failed to Upload File"}
          placement="top"
          arrow
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              paddingLeft: "1em",
              marginTop: "1em",
              fontSize: "1em",
            }}
          >
            <IconWrapper color={"red"} />
            <p
              style={{
                display: "flex",
                fontSize: ".75em",
                color: "red",
                alignItems: "center",
                marginBottom: "0",
              }}
            >
              {props.fileName}
            </p>
            {/* <ErrorOutlineIcon style={{ marginLeft: "auto", color: "red" }} /> */}
          </div>
        </Tooltip>
      );
    } else if (props.status === "loading") {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            paddingLeft: "1em",
            marginTop: "1em",
            fontSize: "1em",
          }}
        >
          <IconWrapper color={"#4baf4f"} />
          <p
            style={{
              display: "flex",
              fontSize: ".75em",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "0",
              flexDirection: "column",
              height: "2.2em",
            }}
          >
            {props.fileName}
            {/* <LinearWithValueLabel /> */}

            <LinearProgressBar />

            {/* <div style={{ display: "flex" }}>
            <FileAction type={"retry"} />
            <FileAction type={"upload"} />
            <FileAction type={"delete"} />
          </div> */}
          </p>
        </div>
      );
    } else if (props.status === "done") {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            paddingLeft: "1em",
            marginTop: "1em",
            fontSize: "1em",
          }}
        >
          <IconWrapper color={"#4baf4f"} />
          <p
            style={{
              display: "flex",
              fontSize: ".75em",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "0",
              flexDirection: "row",
              height: "2.2em",
            }}
          >
            {props.fileName}
            {/* <LinearWithValueLabel /> */}
            {/* <CheckCircleRoundedIcon style={{ color: "#4baf4f" }} /> */}
            {/* <LinearProgressBar /> */}
          </p>
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            paddingLeft: "1em",
            marginTop: "1em",
            fontSize: "1em",
          }}
        >
          <IconWrapper color={"#4baf4f"} />
          <p
            style={{
              display: "flex",
              fontSize: ".75em",
              alignItems: "center",
              marginBottom: "0",
            }}
          >
            {props.fileName}
          </p>
        </div>
      );
    }
  } else if (props.status === "idle") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          paddingLeft: "1em",
          marginTop: "1em",
          fontSize: "1em",
        }}
      >
        <IconWrapper color={"#c3c3c3"} />
        <p
          style={{
            display: "flex",
            fontSize: ".75em",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "0",
            flexDirection: "row",
            height: "2.2em",
          }}
        >
          {props.fileName}
          {/* <LinearWithValueLabel /> */}
          {/* <ReplayCircleFilledRoundedIcon
            style={{ color: "#c3c3c3" }}
          ></ReplayCircleFilledRoundedIcon> */}
          {/* <LinearProgressBar /> */}
        </p>
        <Menu
          reports={props.reports}
          fileType={props.fileType}
          studioIndex={props.studioIndex}
          handleSetFileStatusToFileError={props.handleSetFileStatusToFileError}
          handleSetFileStatusToUploadError={
            props.handleSetFileStatusToUploadError
          }
          updateIfStudioIsComplete={props.updateIfStudioIsComplete}
          handleSetFileStatusToLoading={props.handleSetFileStatusToLoading}
          fileIndex={props.fileIndex}
          handleSetFileStatusToDone={props.handleSetFileStatusToDone}
          handleUploadReport={props.handleUploadReport}
          handleRetryReport={props.handleRetryReport}
          handleDeleteReport={props.handleDeleteReport}
        />
      </div>
    );
  } else if (props.status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          paddingLeft: "1em",
          marginTop: "1em",
          fontSize: "1em",
        }}
      >
        <IconWrapper color={"#4baf4f"} />
        <p
          style={{
            display: "flex",
            fontSize: ".75em",
            alignItems: "flex-start",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "0",
            flexDirection: "column",
            height: "2.2em",
          }}
        >
          {props.fileName}
          {/* <LinearWithValueLabel /> */}

          <LinearProgressBar />

          {/* <div style={{ display: "flex" }}>
            <FileAction type={"retry"} />
            <FileAction type={"upload"} />
            <FileAction type={"delete"} />
          </div> */}
        </p>
      </div>
    );
  } else if (props.status === "done") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          paddingLeft: "1em",
          marginTop: "1em",
          fontSize: "1em",
        }}
      >
        <IconWrapper color={"#4baf4f"} />
        <p
          style={{
            display: "flex",
            fontSize: ".75em",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "0",
            flexDirection: "row",
            height: "2.2em",
          }}
        >
          {props.fileName}
          {/* <LinearWithValueLabel /> */}
          {/* <CheckCircleRoundedIcon style={{ color: "#4baf4f" }} /> */}
          {/* <LinearProgressBar /> */}
        </p>
        <Menu
          reports={props.reports}
          fileType={props.fileType}
          studioIndex={props.studioIndex}
          handleSetFileStatusToFileError={props.handleSetFileStatusToFileError}
          handleSetFileStatusToUploadError={
            props.handleSetFileStatusToUploadError
          }
          updateIfStudioIsComplete={props.updateIfStudioIsComplete}
          handleSetFileStatusToLoading={props.handleSetFileStatusToLoading}
          fileIndex={props.fileIndex}
          handleSetFileStatusToDone={props.handleSetFileStatusToDone}
          handleUploadReport={props.handleUploadReport}
          handleRetryReport={props.handleRetryReport}
          handleDeleteReport={props.handleDeleteReport}
        />
      </div>
    );
  } else if (props.status === "error") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          paddingLeft: "1em",
          marginTop: "1em",
          fontSize: "1em",
        }}
      >
        <IconWrapper color={"#c3c3c3"} />
        <p
          style={{
            display: "flex",
            fontSize: ".75em",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "0",
            flexDirection: "row",
            height: "2.2em",
          }}
        >
          {props.fileName}
          {/* <LinearWithValueLabel /> */}
          {/* <ReplayCircleFilledRoundedIcon
            style={{ color: "#c3c3c3" }}
          ></ReplayCircleFilledRoundedIcon> */}
          {/* <FileAction></FileAction> */}
          {/* <LinearProgressBar /> */}
        </p>
        <Menu
          reports={props.reports}
          fileType={props.fileType}
          fileIndex={props.fileIndex}
          studioIndex={props.studioIndex}
          handleSetFileStatusToDone={props.handleSetFileStatusToDone}
          handleUploadReport={props.handleUploadReport}
          handleRetryReport={props.handleRetryReport}
          handleDeleteReport={props.handleDeleteReport}
        />
      </div>
    );
  } else if (props.status === "fileError") {
    return (
      <Tooltip
        sx={{ fontSize: "5rem" }}
        title="Invalid Report"
        placement="top"
        arrow
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            paddingLeft: "1em",
            marginTop: "1em",
            fontSize: "1em",
          }}
        >
          <IconWrapper color={"red"} />
          <p
            style={{
              display: "flex",
              fontSize: ".75em",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "0",
              flexDirection: "row",
              height: "2.2em",
            }}
          >
            {props.fileName}
            {/* <LinearWithValueLabel /> */}
            {/* <ErrorOutlineIcon style={{ marginLeft: "auto", color: "red" }} /> */}
            {/* <LinearProgressBar /> */}
          </p>
          <Menu
            reports={props.reports}
            fileType={props.fileType}
            studioIndex={props.studioIndex}
            fileIndex={props.fileIndex}
            handleSetFileStatusToLoading={props.handleSetFileStatusToLoading}
            handleSetFileStatusToUploadError={
              props.handleSetFileStatusToUploadError
            }
            handleSetFileStatusToFileError={
              props.handleSetFileStatusToFileError
            }
            updateIfStudioIsComplete={props.updateIfStudioIsComplete}
            handleSetFileStatusToDone={props.handleSetFileStatusToDone}
            handleUploadReport={props.handleUploadReport}
            handleRetryReport={props.handleRetryReport}
            handleDeleteReport={props.handleDeleteReport}
          />
        </div>
      </Tooltip>
    );
  } else if (props.status === "uploadError") {
    return (
      <Tooltip
        sx={{ fontSize: "5rem" }}
        title="Failed Uploading File"
        placement="top"
        arrow
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            paddingLeft: "1em",
            marginTop: "1em",
            fontSize: "1em",
          }}
        >
          <IconWrapper color={"red"} />
          <p
            style={{
              display: "flex",
              fontSize: ".75em",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "0",
              flexDirection: "row",
              height: "2.2em",
            }}
          >
            {props.fileName}
            {/* <LinearWithValueLabel /> */}
            {/* <ErrorOutlineIcon style={{ marginLeft: "auto", color: "red" }} /> */}
            {/* <LinearProgressBar /> */}
          </p>
          <Menu
            reports={props.reports}
            fileType={props.fileType}
            studioIndex={props.studioIndex}
            fileIndex={props.fileIndex}
            handleSetFileStatusToLoading={props.handleSetFileStatusToLoading}
            handleSetFileStatusToFileError={
              props.handleSetFileStatusToFileError
            }
            handleSetFileStatusToUploadError={
              props.handleSetFileStatusToUploadError
            }
            handleSetFileStatusToDone={props.handleSetFileStatusToDone}
            handleUploadReport={props.handleUploadReport}
            handleRetryReport={props.handleRetryReport}
            handleDeleteReport={props.handleDeleteReport}
          />
        </div>
      </Tooltip>
    );
  } else if (props.status === "studioError") {
    return (
      <Tooltip
        sx={{ fontSize: "5rem" }}
        title="Wrong Studio"
        placement="top"
        arrow
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%",
            paddingLeft: "1em",
            marginTop: "1em",
            fontSize: "1em",
          }}
        >
          <IconWrapper color={"red"} />
          <p
            style={{
              display: "flex",
              fontSize: ".75em",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "0",
              flexDirection: "row",
              height: "2.2em",
            }}
          >
            {props.fileName}
            {/* <LinearWithValueLabel /> */}
            {/* <ErrorOutlineIcon style={{ marginLeft: "auto", color: "red" }} /> */}
            {/* <LinearProgressBar /> */}
          </p>
          <Menu
            reports={props.reports}
            fileType={props.fileType}
            studioIndex={props.studioIndex}
            fileIndex={props.fileIndex}
            handleSetFileStatusToLoading={props.handleSetFileStatusToLoading}
            handleSetFileStatusToFileError={
              props.handleSetFileStatusToFileError
            }
            handleSetFileStatusToUploadError={
              props.handleSetFileStatusToUploadError
            }
            handleSetFileStatusToDone={props.handleSetFileStatusToDone}
            handleUploadReport={props.handleUploadReport}
            handleRetryReport={props.handleRetryReport}
            handleDeleteReport={props.handleDeleteReport}
          />
        </div>
      </Tooltip>
    );
  }
}
