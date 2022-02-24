import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
// import { captureRejectionSymbol } from "nodemailer/lib/xoauth2";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

// const rows = [
//   createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
//   createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
//   createData("Eclair", 262, 16.0, 24, 6.0),
//   createData("Cupcake", 305, 3.7, 67, 4.3),
//   createData("Gingerbread", 356, 16.0, 49, 3.9),
// ];

export default function BasicTable(props) {
  return (
    <TableContainer
      component={Paper}
      sx={{ width: "fit-content", margin: "0em", boxShadow: "none" }}
    >
      {/* <Table sx={{ minWidth: 650 }} aria-label="simple table"> */}
      <Table sx={{ minWidth: "1001px" }} aria-label="simple table">
        <TableBody>
          {props.rows.map((cells, i) => {
            if (i === 1) {
              return (
                <TableRow
                  key={i}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {cells.map((cell) => (
                    <TableCell
                      component="th"
                      scope="row"
                      style={{ fontWeight: "bold" }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              );
            } else if (i === 0) {
              return null;
            }
            // } else if (i === 0) {
            //   return (
            //     <TableRow
            //       key={i}
            //       sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            //     >
            //       {cells.map((cell) => (
            //         <TableCell
            //           component="th"
            //           scope="row"
            //           style={{ fontSize: "1.5em" }}
            //         >
            //           {cell}
            //         </TableCell>
            //       ))}
            //     </TableRow>
            //   );
            // }
            return (
              <TableRow
                key={i}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {cells.map((cell) => (
                  <TableCell component="th" scope="row">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
