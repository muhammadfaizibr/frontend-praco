import React from "react";
import HeadingBar from "components/HeadingBar";
import TrackOrderTable from "components/TrackOrderTable";

const TrackOrder = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout full-width-flex-col gap-m">
        <HeadingBar
          displayType={"row"}
          headline={"Track Order"}
          headlineSize={"h3"}
          headlineSizeType={"tag"}
          theme={"light"}
        />

        <TrackOrderTable />
      </div>
    </div>
  );
};

export default TrackOrder;
