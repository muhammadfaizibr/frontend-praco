import QueryForm from "components/QueryForm";
import ContactInfo from "components/ContactInfo";
import PracoMap from "components/PracoMap";
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"
import { useEffect } from "react";




const Home = () => {
    useEffect(()=>{
      document.title = 'Contact - Praco';
    }, [])
  return (
    <div>
    <div className="centered-layout-wrapper full-width-flex-col layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout full-width-flex-col layout-spacing">
      <div className={`${FormsPageStyles.contentWrapper} ${FormsPageStyles.contactPage}`}>

        <ContactInfo />
        <QueryForm />
    </div>

      </div>
    </div>
      <PracoMap />
    </div>
  );
};

export default Home;
