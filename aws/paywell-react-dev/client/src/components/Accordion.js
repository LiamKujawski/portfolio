import React, { useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CircularProgress from "@mui/material/CircularProgress";
import CircularProgressWrapper from "./CircularProgressWrapper";
import Menu from "./Menu";

export default function SimpleAccordion(props) {
  useEffect(() => console.log(props));
  return (
    <Accordion
      key={props.title}
      sx={{
        // borderRadius: 5,
        marginBottom: "1em !important",
        boxShadow:
          "0px 0px 2px 0px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
        // boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
        borderBottomLeftRadius: "4px",
        borderBottomRightRadius: "4px",
        maxWidth: "22em",
        // boxShadow: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          // width: "fit-content",
          alignItems: "center",
          justifyContent: "space-between",
          paddingRight: "1em",
        }}
      >
        <AccordionSummary
          // expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography style={{ flex: "none" }}>{props.title}</Typography>
        </AccordionSummary>
        <span
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            // marginRight: "1em",
          }}
        >
          {props.loading ? (
            <CircularProgressWrapper
              reportStatusCount={props.reportStatusCount}
              numberOfReports={props.numberOfReports}
            ></CircularProgressWrapper>
          ) : (
            "yay"
            // <CheckCircleRoundedIcon
            //   style={{
            //     color: "#4baf4f",
            //     fontSize: "1.5em",
            //   }}
            // />
          )}
        </span>

        <Menu
          handleDeleteStudio={props.handleDeleteStudio}
          handleSetFileStatusToDone={props.handleSetFileStatusToDone}
          studioIndex={props.studioIndex}
          fileType={props.fileType}
          handleRetryStudio={props.handleRetryStudio}
          reports={props.reports}
          handleSetFileStatusToLoading={props.handleSetFileStatusToLoading}
          updateIfStudioIsComplete={props.updateIfStudioIsComplete}
          isStudio={true}
          handleSetFileStatusToUploadError={
            props.handleSetFileStatusToUploadError
          }
          handleSetFileStatusToFileError={props.handleSetFileStatusToFileError}
          handleSetFileStatusToStudioError={
            props.handleSetFileStatusToStudioError
          }
        />
      </div>

      <AccordionDetails
        sx={{
          marginBottom: "1em",
        }}
      >
        <Typography>{props.content}</Typography>
      </AccordionDetails>
    </Accordion>
  );
}
