import React, {useEffect} from "react";
import TrackOrdersContent from "components/TrackOrdersContent";

const TrackOrders = () => {
        useEffect(()=>{
          document.title = 'Track Orders - Praco';
        }, [])
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
        <TrackOrdersContent />
      </div>
    </div>
  );
};

export default TrackOrders;