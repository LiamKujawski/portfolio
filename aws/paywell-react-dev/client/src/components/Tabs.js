import React, { useState, useEffect } from "react";
import { useStudioScrapeStatus } from "../contexts/StudioScrapeStatusContext";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import BasicDateRangePicker from "./DateRangePicker";
import ScrapeStatus from "./ScrapeStatus";
import Dropzone from "./Dropzone";
import InputLabel from "./InputLabel";
import { Button } from "react-bootstrap";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {
  createClasses,
  compileEventArrays,
} from "../contexts/ReportCompilerContext";
import { useAuth } from "../contexts/AuthContext";

import ClubReadyAccountSelector from "./ClubReadyAccountSelector";

function TabPanel(props) {

  const { children, value, index, ...other } = props;

  // console.log("Props", props);

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// For Accessibility
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs(props) {
  const {
    studiosCompletedStatusArray,
    setStudiosCompletedStatusArray,
    numberOfStudios,
    setNumberOfStudios,
    numberOfCompletedStudios,
    setNumberOfCompletedStudios,
    studiosCompletedStatus,
    setStudiosCompletedStatus,
    currentlySelectedStudios,
    setCurrentlySelectedStudios,
    isScrapeComplete,
    setIsScrapeComplete,
    studioCompletedReportCount,
    setStudioCompletedReportCount,
  } = useStudioScrapeStatus();
      const { currentClubReadyLogin } = useAuth();

  const [value, setValue] = React.useState(0);
  const [selectedDates, setSelectedDates] = useState([null, null]);
  const [grabReportsButtonDisplay, setGrabReportsButtonDisplay] =
    useState("none");
  const [startScrape, setStartScrape] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDateChange = () => {
    console.log("Date has been selected, showing grab reports button");
    // SHOW GRAB REPORTS BUTTON
    setGrabReportsButtonDisplay("flex");
  };

  const handleDownload = () => {
    console.log("handleDownload()");
    compileEventArrays();
    createClasses();
  };

  const handleGrabReports = () => {
    console.log("handleGrabReports()");
    setStartScrape(true);
  };
  useEffect(() => {
    // console.log(
    //   "currentlySelectedStudios: ",
    //   currentlySelectedStudios,
    //   "\nstudiosCompletedStatusArray: ",
    //   studiosCompletedStatusArray,
    //   "\nnumberOfStudios: ",
    //   numberOfStudios,
    //   "\nnumberOfCompletedStudios: ",
    //   numberOfCompletedStudios,
    //   "\nstudiosCompletedStatus: ",
    //   studiosCompletedStatus,
    //   "\nisScrapeComplete: ",
    //   isScrapeComplete,
    //   "\nstudioCompletedReportCount",
    //   studioCompletedReportCount
    // );

    setIsScrapeComplete(
      studiosCompletedStatusArray.every((val) => val === true)
    );

    console.log(isScrapeComplete);
  }, [isScrapeComplete, studiosCompletedStatusArray]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Upload Reports" {...a11yProps(1)} />
          <Tab label="Automatically Grab Reports" {...a11yProps(0)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={1}>
        <Card>
          <CardContent style={{padding: "1em"}}>
        <ClubReadyAccountSelector></ClubReadyAccountSelector>
        <InputLabel>Select Pay Period for Reports</InputLabel>
        <BasicDateRangePicker
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          handleDateChange={handleDateChange}
          marginTop={".3em"}
          marginBotttom={".3em"}
        ></BasicDateRangePicker>
        <Button
          variant="text"
          onClick={handleGrabReports}
          style={{
            color: "#007bff",
            display: `${grabReportsButtonDisplay}`,
          }}
        >
          Grab Reports
        </Button>
        <ScrapeStatus
          startScrape={startScrape}
          reportType={props.reportType}
          dates={selectedDates}
        ></ScrapeStatus>
        <Button
          variant="text"
          onClick={handleDownload}
          style={{
            color: "#007bff",
          }}
          disabled={!isScrapeComplete}
        >
          Download
        </Button>
          {/* {scrapeStatusContent} */}
          </CardContent>
          </Card>
      </TabPanel>
      <TabPanel value={value} index={0}>
        {currentlySelectedStudios.map((studio, i) => {
          return (
            <Dropzone
              studio={studio}
              reportType={props.reportType}
              studioIndex={i}
              dates={selectedDates}
            />
          );
        })}
        <Button
          variant="text"
          onClick={handleDownload}
          style={{
          color: "#007bff",
          }}
          // disabled={!isScrapeComplete}
        >
          Download
        </Button>
      </TabPanel>
    </Box>
  );
}
