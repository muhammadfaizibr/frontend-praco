import React from "react";
import { Rings } from "react-loader-spinner";

const CustomLoading = () => {
  return (
    <div style={{width: '100%', display: 'flex',justifyContent: 'center', padding: '30px 0'}}><Rings
      visible={true}
      height="80"
      width="80"
      color="#ff6a01"
      ariaLabel="rings-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
    </div>
  );
};

export default CustomLoading;
