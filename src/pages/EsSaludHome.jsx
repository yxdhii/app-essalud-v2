import React from "react";
import HomeHeader from "../components/HomeHeader";
import SearchBar from "../components/SearchBar";
import NextAppointment from "../components/NextAppointment";
import ServicesGrid from "../components/ServicesGrid";
import OnlineAttention from "../components/OnlineAttention";
import BottomNavigation from "../components/BottomNavigation";
import HealthTip from "../components/HealthTip";

export default function EsSaludHome() {
const user = {
name: "María Guadalupe",
gender: "female",
};

return (
<main className="essalud-home">
<HomeHeader user={user} />

  <div className="home-content">
    <SearchBar />

    <HealthTip />

    <OnlineAttention />

    <ServicesGrid />

    <NextAppointment />
  </div>

  <BottomNavigation />
</main>

);
}