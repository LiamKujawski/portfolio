import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStudioScrapeStatus } from "../contexts/StudioScrapeStatusContext";
import { useHistory } from "react-router-dom";
import ResponsiveAppBar from "./ResponsiveAppBar";
import Dropzone from "./Dropzone";
import { ReportCompilerProvider } from "../contexts/ReportCompilerContext";
import VerticalLinearStepper from "./VerticalLinearStepper";
import FileUploadStatus from "./FileUploadStatus";
import MultiSelectChip from "./MultiSelectChip";
import axios from "axios";
import SkeletonContent from "./SkeletonContent";
import { useCookies } from "react-cookie";
import Tabs from "./Tabs";
import BasicCard from "./Card";
import { Button } from "@mui/material";
import AccordionBasic from "./AccordionBasic";
import { Typography } from "@mui/material";
import { getNativeSelectUtilityClasses } from "@mui/material";

export default function Dashboard() {
  const [cookies, setCookie] = useCookies(["studios"]);

  // const clubReadyUsername = "PAttYJNML";
  // var clubReadyPassword = "FastEasyWell365!";
  const [clubReadyUsername, setClubReadyUsername] = useState("clubREadyUserName");
    const [clubReadyPassword, setClubReadyPassword] = useState("clubReadyPassword");
  const [tables, setTables] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [emailCards, setEmailCards] = useState([]);
  const [emails, setEmails] = useState([]);



  const [error, setError] = useState("");
  const { currentUser, logout,   currentClubReadyLogin } = useAuth();
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
    reports,
    fullNameReports

  } = useStudioScrapeStatus();
  const history = useHistory();
  const [state, setState] = useState(initialState);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedDates, setSelectedDates] = useState([null, null]);
  const [isManualUpload, setIsManualUpload] = useState(true);
  var studioList = [];
  var reportType = reports
  var initialState = studioList.map((studio) =>
    reportType.map((report, i) => (
      <FileUploadStatus
        status={"loading"}
        fileType={report}
        fileName={fullNameReports[i]}
        key={report}
      />
    ))
  );


  const addEmailCard = (newEmail) => {
    setEmailCards((emailCards=>emailCards.concat(newEmail)))
  }

  const addEmail = (newEmail, to, cc) => setEmails((emails => emails.concat({ email: newEmail, to: to, cc: cc })))


  const sendEmail = async (email) => {
      //  let to = staff.address;
      //   let cc = "scott.smith0703@gmail.com";
    console.log(`To: ${email.to} cc: ${email.cc} Email: ${email.email}`)
    // Send email to respective staff email with respective data
    var result = await axios.get("api/email", {
      params: {
        to: email.to,
        cc: email.cc,
        html: email.email,
      },
    });
  }

  const sendAllEmails = async (emails) => {
    emails.forEach((email) => {
      sendEmail(email);
      })
  }

    
// useEffect(()=>console.log(clubReadyUsername, " ", clubReadyPassword), [clubReadyUsername])
//   useEffect(async () => {
//     // await axios.get("api/testChrome");
//     // console.log(cookies);
//     if (!cookies.studios) {

//       setStudioOptions([<SkeletonContent></SkeletonContent>]);

//       await axios
//         .get("api/scrapeClubReadyStudio", {
//           params: {
//             clubReadyUsername: clubReadyUsername,
//             clubReadyPassword: clubReadyPassword,
//           },
//         })
//         .then(function (response) {
//           let studios = response.data.split("\n");
//           setStudioOptions(studios);
//           // setStudiosCompletedStatus((studiosCompletedStatusArray) =>
//           //   studios.map((studio) => false)
//           // );
//           // console.log(studiosCompletedStatusArray);

//           setCookie("studios", studios, { path: "/" });
//         })
//         .catch((err) => {
//           console.log("Failed axios call");
//           let message =
//             typeof err.response !== "undefined"
//               ? err.response.data.message
//               : err.message;
//           console.warn("error", message);
//         });
//     }
//     setStudioOptions(cookies.studios);
//     // setStudiosCompletedStatus((studiosCompletedStatusArray) =>
//     //   cookies["studios"].map((studio) => false)
//     // ); // fix
//   }, []);

  var steps = [
    {
      label: "Upload PayWell File",
      description: ``,
      content: (     
        <Dropzone
          type={"inputFile"}
          studioList={selectedOptions}
          reportType={reportType}
          dates={selectedDates}
        />
        
      ),
    },
    {
      label: "Select Studios",
      description: ``,
      content: <MultiSelectChip></MultiSelectChip>,
    },
    {
      label: "How would you like to add Club Ready Reports?",
      description: "",
      content: <Tabs studioList={selectedOptions} reportType={reportType} />,
    },
  ];
  steps.push({
    label: "Send Pay Summary to Staff",
    description: `Upload Paywell output file that you would like to send to staff`,
    content: (
      <>
        <Dropzone
          tables={tables}
          setTables={setTables}
          tableHeaders={tableHeaders}
          setTableHeaders={setTableHeaders}
          handleAddEmailCard={addEmailCard}
          emails={emails}
          addEmail={addEmail}
          type={"export"}
        />
        <Button onClick={() => sendAllEmails(emails)}>Send All Emails</Button>
        
        {/* Add feature to send all or remove/dont send */}
        {emailCards.map((email, i) => {


// MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1 MuiAccordion-root MuiAccordion-rounded Mui-expanded MuiAccordion-gutters css-1elwnq4-MuiPaper-root-MuiAccordion-root
          return (
            <AccordionBasic
              // sendEmailButton={
              //         <Button onClick={() => sendEmail(emails[i])}
              //         size="small">Send Email</Button>
              //       }
              title={(
              <>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                {email.headers[0] ?  email.headers[0] : null}
                </Typography>
                <Typography variant="h5" component="div">
                {email.headers[2] ? email.headers[2] : null }
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {email.headers[1] ? email.headers[1] : getNativeSelectUtilityClasses}
                  </Typography>
                   <Button onClick={() => sendEmail(emails[i])}
                      size="small">Send Email</Button>
                </>
            )} >
   
              <Typography variant="body2">
              {email.tables.map((table, i) =>
                i === 0 ? null : (
                  <AccordionBasic
                    title={table.props.rows[0] ? table.props.rows[0] : null}>{table ? table : null}
                  </AccordionBasic>
                  // <>
                  //   {
                  //     table.props.rows[0] ? table.props.rows[0] : null, 
                  //     table ? table: null
                  //   }
                  // </>
                
              )
              )}
              </Typography>
              {/* <BasicCard handleSendEmail={() => sendEmail(emails[i])} tableHeaders={email.headers} tables={email.tables} /> */}

              {/* <BasicCard handleSendEmail={() => sendEmail(emails[i])} tableHeaders={email.headers} tables={email.tables} /> */}
               {/* <Button onClick={()=>sendEmail(emails[i])} size="small">Send Email</Button> */}
            </AccordionBasic>
          )
        })
          }
      </>
    ),
  });

  return (
    <>
      <ResponsiveAppBar />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "1em",
        }}
      >
        <ReportCompilerProvider>
          <VerticalLinearStepper
            steps={steps}
    

            isManualUpload={isManualUpload}
          />
        </ReportCompilerProvider>
      </div>
    </>
  );
}

{
}
