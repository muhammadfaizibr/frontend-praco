import QueryForm from "components/QueryForm";
import ContactInfo from "components/ContactInfo";
import PracoMap from "components/PracoMap";
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"




const Home = () => {
  return (
    <div>
    <div className="centered-layout-wrapper layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing">
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
