import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SimpleAccordion from "./Accordion";
import AccordionBasic from "./AccordionBasic";
import { getNativeSelectUtilityClasses } from "@mui/material";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

export default function BasicCard(props) {
  return (
    <Card sx={{ minWidth: 275, width: " 773px", margin: "1em" }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          
          {props.tableHeaders[0] ?  props.tableHeaders[0] : null}
        </Typography>
        <Typography variant="h5" component="div">
          {props.tableHeaders[2] ? props.tableHeaders[2] : null }
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {props.tableHeaders[1] ? props.tableHeaders[1] : getNativeSelectUtilityClasses}
        </Typography>
        <Typography variant="body2">
          {props.tables.map((table, i) =>
            i === 0 ? null : (
              <AccordionBasic title={table.props.rows[0] ? table.props.rows[0] : null} content={table ? table : null} />
              // <SimpleAccordion title={table.props.rows[0]} content={table} />
            )
          )}
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={props.handleSendEmail} size="small">Send Email</Button>
      </CardActions>
    </Card>
  );
}
