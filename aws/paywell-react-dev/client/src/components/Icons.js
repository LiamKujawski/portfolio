import * as React from "react";
import Box from "@mui/material/Box";
import * as colors from "@mui/material/colors";
import Icon from "@mui/material/Icon";

export default function Icons(props) {
  return (
    <Box
      sx={{
        "& > :not(style)": {
          m: 2,
        },
      }}
    >
      <Icon>{props.children}</Icon>
    </Box>
  );
}
