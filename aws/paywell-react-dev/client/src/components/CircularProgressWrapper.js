import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

export default function CircularProgressWrapper(props) {
  return (
    <>
      <span
        style={{
          display: "flex",
          flex: "none",
          fontSize: "0.65em",
          fontWeight: "400",
          position: "absolute",
          color: "#4baf4f",
        }}
      >
        {props.reportStatusCount} / {props.numberOfReports}
      </span>
      <CircularProgress
        color="inherit"
        thickness="1.5"
        style={{
          // marginRight: "1em",
          height: "2em",
          width: "2em",
          color: "#4baf4f",
        }}
      />
    </>
  );
}
