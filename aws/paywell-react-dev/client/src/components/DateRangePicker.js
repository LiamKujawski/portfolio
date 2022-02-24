import * as React from "react";
import TextField from "@mui/material/TextField";
import DateRangePicker from "@mui/lab/DateRangePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import Box from "@mui/material/Box";

export default function BasicDateRangePicker(props) {
  const [value, setValue] = React.useState([null, null]);
  var startDate = "";
  var endDate = "";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateRangePicker
        startText="Start of Pay Period"
        endText="End of Pay Period"
        value={value}
        onChange={(newValue, startProps) => {
          // console.log(startDate);
          props.setSelectedDates([startDate, endDate]);
          setValue(newValue);
          if (value[0] !== null || value[1] !== null) {
            props.handleDateChange();
          }
        }}
        renderInput={(startProps, endProps) => {
          startDate = startProps.inputProps.value;
          endDate = endProps.inputProps.value;
          props.selectedDates.unshift(endDate);
          props.selectedDates.unshift(startDate);

          return (
            // <React.Fragment>
            <div
              style={{
                marginTop: ".3em",
                marginBottom: ".8em",
                display: "flex",
              }}
            >
              <TextField {...startProps} />
              <Box sx={{display: "flex", alignItems: "center", mx: 2 }}> to </Box>
              <TextField {...endProps} />
            </div>
            // </React.Fragment>
          );
        }}
      />
    </LocalizationProvider>
  );
}
