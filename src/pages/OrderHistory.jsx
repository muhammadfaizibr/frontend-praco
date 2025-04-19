import React from "react";
import HeadingBar from "components/HeadingBar";
import OrderHistoryTable from "components/OrderHistoryTable";

const OrderHistory = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout full-width-flex-col gap-m">
        <HeadingBar
          displayType={"row"}
          headline={"Order History"}
          headlineSize={"h3"}
          headlineSizeType={"tag"}
          theme={"light"}
        />

        <OrderHistoryTable />
      </div>
    </div>
  );
};

export default OrderHistory;
