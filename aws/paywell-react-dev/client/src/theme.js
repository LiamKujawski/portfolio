"use strict";

import { createTheme } from "@material-ui/core/styles";

const theme = createTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: "5em",
      },
    },
  },
});

export default theme;
