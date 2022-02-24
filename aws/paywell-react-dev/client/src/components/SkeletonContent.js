import * as React from "react";
import Skeleton from "@mui/material/Skeleton";

export default function SkeletonContent() {
  return (
    <>
      {/* <Skeleton /> */}
      <Skeleton
        animation="wave"
        sx={{
          borderRadius: "4px",
          width: "100%",
          transform: [{ rotate: "90deg" }],
        }}
      />
      {/* <Skeleton animation={false} /> */}
    </>
  );
}
