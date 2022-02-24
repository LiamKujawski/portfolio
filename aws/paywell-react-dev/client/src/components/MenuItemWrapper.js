import React, { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MenuItemWrapper = (props) => {
  const { currentUser, logout } = useAuth();
  

  return props.setting.map((label) => <MenuItem key={label} onClick={props.handleLogout}><Typography textAlign="center">{label}</Typography></MenuItem>)
  // const setting = props.setting;
  // var menuComp = <MenuItem></MenuItem>;

  // switch (setting) {
  //   case "Logout":
  //     menuComp = (
  //       <MenuItem key={props.setting} onClick={props.handleLogout}>
  //         <Typography textAlign="center">{props.setting}</Typography>
  //       </MenuItem>
  //     );

  //   default:
  //     menuComp = (
  //       <MenuItem key={props.setting} onClick={props.handleCloseUserMenu}>
  //         <Typography textAlign="center">{props.setting}</Typography>
  //       </MenuItem>
  //     );
  // }

  // return menuComp;
};

export default MenuItemWrapper;
