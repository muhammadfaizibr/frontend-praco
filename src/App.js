import React from "react";
import Navbar from "components/NavBar";
import AnnouncementBar from "components/AnnouncementBar";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "routes/routes";
import Footer from "components/Footer";
import MenuCategories from "components/MenuCategories";

function App() {
  return (
    <BrowserRouter>
      <AnnouncementBar />
      <Navbar />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;