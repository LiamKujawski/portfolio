import React from "react";
import SimpleAccordion from "./Accordion";

export default function Studio(props) {
  return (
    <SimpleAccordion
      sx={{ display: `${props.isVisible ? "flex" : "none"}` }}
      key={props.studio}
      title={props.studio}
      content={props.reportComponents}
      studioIndex={props.studioIndex}
      handleRetryStudio={props.handleRetryStudio}
      loading={props.loading}
      handleSetFileStatusToDone={props.handleSetFileStatusToDone}
      handleSetFileStatusToLoading={props.handleSetFileStatusToLoading}
      reportStatusCount={props.reportStatusCount}
      numberOfReports={props.numberOfReports}
      reports={props.reports}
      updateIfStudioIsComplete={props.updateIfStudioIsComplete}
      handleSetFileStatusToUploadError={props.handleSetFileStatusToUploadError}
      handleSetFileStatusToFileError={props.handleSetFileStatusToFileError}
      handleSetFileStatusToStudioError={props.handleSetFileStatusToStudioError}
      handleDeleteStudio={props.handleDeleteStudio}
    ></SimpleAccordion>
  );
}
