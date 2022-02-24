import React from "react";
// import Icons from "./Icons";
// import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
// import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
// import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
// import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
// import IconButton from "@mui/material/IconButton";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
export default function FileAction(props) {
  switch (props.type) {
    case "retry":
      return (
        <button>
          {"yo"}
          {/* <ReplayRoundedIcon /> */}
        </button>
      );
    case "upload":
      return (
        <button>
          {/* <UploadFileRoundedIcon /> */}
          {"yo"}
        </button>
      );
    case "delete":
      return (
        <button>
          {/* <CloseRoundedIcon /> */}
          {"yo"}
        </button>
      );
    default:
      console.log(`This is default.`);
      return <button>Error</button>;
  }
}
