import { FormLabel } from "@mui/material";
import React from "react";

export default function InputLabel(props) {
  return (
    <FormLabel style={{ paddingBottom: ".2em" }}>{props.children}</FormLabel>
  );
}
