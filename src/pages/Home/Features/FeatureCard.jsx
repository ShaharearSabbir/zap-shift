const FeatureCard = ({ image, title, description }) => {
  return (
    // Card container is now explicitly a flex container.
    // flex-col makes items stack vertically on small screens.
    // lg:flex-row makes items go side-by-side on large screens.
    <div className="card p-16 border-2 border-base-300 flex flex-col lg:flex-row bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-colors duration-300 ease-in-out">
      {/* Image container on the left for larger screens, top for smaller screens.
          Updated background color and added a dashed right border to match the design. */}
      <div
        className="lg:w-1/4 w-full flex items-center justify-center p-6
                      lg:border-r-2 lg:border-dashed
                      flex-shrink-0"
      >
        {" "}
        {/* Added flex-shrink-0 to prevent image section from shrinking */}
        <img
          src={image}
          alt={title}
          className="w-32 h-32 object-contain rounded-lg"
          // Fallback for image loading errors
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/150x150/CCCCCC/000000?text=Image+Error";
          }}
        />
      </div>

      {/* Card body for title and description */}
      <div className="card-body lg:w-3/4 w-full p-6 flex flex-col justify-center flex-grow">
        {" "}
        {/* Added flex-grow */}
        {/* Card title with responsive text size and dark/light mode color */}
        <h2 className="card-title text-2xl font-semibold text-gray-800 dark:text-white mb-2 sm:text-3xl">
          {title}
        </h2>
        {/* Description text with responsive size and dark/light mode color */}
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
