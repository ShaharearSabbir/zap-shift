import React from "react";

const ServiceCard = ({ title, description, Icon, highlight = false }) => {
  return (
    <div
      className={`rounded-xl p-6 shadow-md transition duration-300 hover:shadow-xl hover:bg-lime-200 hover:text-neutral bg-base-300 border border-base-100`}
    >
      <div className="flex justify-center mb-4 text-4xl text-primary">
        <Icon />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
};

export default ServiceCard;
