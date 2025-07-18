import React, { useState } from "react";
import Navbar from "components/NavBar";
// import AnnouncementBar from "components/AnnouncementBar";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "routes/routes";
import Footer from "components/Footer";
import { Provider } from "react-redux";
import { store } from "utils/store";
import WhatsappChat from "components/WhatsappChat";
import SideMenu from "components/SideMenu";
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Provider store={store}>
      <BrowserRouter>
        {/* <AnnouncementBar /> */}
        <Navbar setIsOpen={setIsOpen} isOpen={isOpen} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          <SideMenu setIsOpen={setIsOpen} isOpen={isOpen} />
          <div style={{ width: "100%" }}>
            <AppRoutes />
          </div>
        </div>
        <WhatsappChat />
        <Footer />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
