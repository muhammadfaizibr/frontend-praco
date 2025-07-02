import React from "react";
import Navbar from "components/NavBar";
// import AnnouncementBar from "components/AnnouncementBar";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "routes/routes";
import Footer from "components/Footer";
import { Provider } from "react-redux";
import { store } from "utils/store";
import WhatsappChat from "components/WhatsappChat";
function App() {
  return (
      <Provider store={store}>
        <BrowserRouter>
          {/* <AnnouncementBar /> */}
          <Navbar />
          <AppRoutes />
          <WhatsappChat />
          <Footer />
        </BrowserRouter>
      </Provider>
  );
}

export default App;
