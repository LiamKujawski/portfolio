import React from "react";

import LinearProgress from "@mui/material/LinearProgress";

export default function LinearProgressBar() {
  return (
    <LinearProgress
      style={{ width: "100%", borderRadius: "2em" }}
      color="success"
    />
  );
}
