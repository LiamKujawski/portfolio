import React from "react";
// import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

export default function IconWrapper(props) {
  var hex = props.color;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginRight: "1em",
      }}
    >
      <p
        style={{
          color: "white",
          position: "relative",
          fontSize: ".5em",
          marginTop: "3.1em",
          fontWeight: "bold",
          zIndex: 1,
        }}
      >
        XLSX
      </p>
      {/* <InsertDriveFileRoundedIcon
        style={{ color: hex, position: "absolute", fontSize: "3em" }}
      /> */}
    </div>
  );
}
