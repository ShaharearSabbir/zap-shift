import React from "react";
import location from "../../../assets/location-merchant.png";

const BeMarchent = () => {
  return (
    <div
      data-aos="zoom-in-up"
      className="p-20 my-20 bg-no-repeat rounded-4xl bg-[url(assets/be-a-merchant-bg.png)]  bg-[#03373D] text-white dark:text-black"
    >
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img src={location} className="max-w-sm" />
        <div>
          <h1 className="text-5xl font-bold">
            Merchant and Customer Satisfaction is Our First Priority
          </h1>
          <p className="py-6">
            We offer the lowest delivery charge with the highest value along
            with 100% safety of your product. Pathao courier delivers your
            parcels in every corner of Bangladesh right on time.
          </p>
          <button className="btn btn-primary text-accent-content rounded-full ">
            Become a Merchant
          </button>
          <button className="btn btn-outline btn-primary rounded-full hover:text-accent-content text-primary ml-5">
            Become a Merchant
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeMarchent;
