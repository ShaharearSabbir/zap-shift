import React from "react";
import FeatureCard from "./FeatureCard";
import tracking from "../../../assets/live-tracking.png";
import safe from "../../../assets/safe-delivery.png";

// Main App component
const Features = () => {
  // Array of feature data to render the cards dynamically
  const features = [
    {
      id: 1,
      image: tracking, // Placeholder for Live Parcel Tracking image
      title: "Live Parcel Tracking",
      description:
        "Stay updated in real-time with our live parcel tracking feature. From pick-up to delivery, monitor your shipment's journey and get instant status updates for complete peace of mind.",
    },
    {
      id: 2,
      image: safe, // Placeholder for 100% Safe Delivery image
      title: "100% Safe Delivery",
      description:
        "We ensure your parcels are handled with the utmost care and delivered securely to their destination. Our reliable process guarantees safe and damage-free delivery every time.",
    },
    {
      id: 3,
      image: safe, // Placeholder for 24/7 Call Center Support image
      title: "24/7 Call Center Support",
      description:
        "Our dedicated support team is available around the clock to assist you with any questions, updates, or delivery concerns—anytime you need us.",
    },
  ];

  return (
    // Main container with responsive padding and updated light mode background color to match the image.
    // Dark mode background is retained for consistency with overall application theme.
    <div className="flex flex-col items-center py-20 font-sans">
      {/* Grid container for feature cards */}
      <div className="w-full space-y-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            image={feature.image}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Features;
