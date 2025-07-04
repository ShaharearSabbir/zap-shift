import React from "react";
import Banner from "../Banner/Banner";
import Services from "../Services/Services";
import TopClientsMarquee from "../TopClients/TopClientsMarquee";
import Features from "../Features/Features";
import BeMarchent from "../BeMarchent/BeMarchent";

const Home = () => {
  return (
    <div>
      <Banner />
      <Services />
      <TopClientsMarquee />
      <div className="border-b-2 border-dashed"></div>
      <Features />
      <div className="border-b-2 border-dashed"></div>
      <BeMarchent />
    </div>
  );
};

export default Home;
