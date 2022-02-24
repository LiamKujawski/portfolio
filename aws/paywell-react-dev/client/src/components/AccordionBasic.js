import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function AccordionBasic(props) {
  return (
    // <div>
    <Accordion sx={{ width: "fit-content" }}>
      <AccordionSummary
        // expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{props.title}</Typography>
      </AccordionSummary>
      <AccordionDetails style={{ display: "flex" }}>
        <Typography>{props.children}</Typography>
      </AccordionDetails>
    </Accordion>

    // </div>
  );
}
