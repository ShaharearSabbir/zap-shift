import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Loader from "../../Shared/Loader/Loader";
import riderImg from "../../../assets/agent-pending.png"; // Imported the image

const BeARider = () => {
  const [allWarehouseData, setAllWarehouseData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedRegion = watch("region");
  // Removed riderType watch as it's no longer used for conditional rendering

  // Fetch all warehouse data (assuming warehouses.json is in your public folder)
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const response = await fetch("./warehouses.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllWarehouseData(data);

        const uniqueRegions = [...new Set(data.map((item) => item.region))];
        setRegions(uniqueRegions);
      } catch (e) {
        setError(
          "Failed to load regions and warehouses. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseData();
  }, []);

  // Pre-fill user's name and email if available
  useEffect(() => {
    if (user) {
      setValue("name", user.displayName || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  // Effect to filter warehouses (now displaying district names) based on selected region
  useEffect(() => {
    if (selectedRegion && allWarehouseData.length > 0) {
      const districtsInRegion = allWarehouseData
        .filter((item) => item.region === selectedRegion)
        .map((item) => item.city);
      setFilteredWarehouses([...new Set(districtsInRegion)]);
      setValue("warehouse", "");
    } else {
      setFilteredWarehouses([]);
      setValue("warehouse", "");
    }
  }, [selectedRegion, allWarehouseData, setValue]);

  const onSubmit = async (data) => {
    // Calculate age from date of birth
    const dob = new Date(data.age); // 'age' field now holds date string
    const today = new Date();
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--;
    }

    const riderApplicationData = {
      ...data,
      dateOfBirth: data.age, // Store the date of birth string
      age: calculatedAge, // Store the calculated age
      userId: user?.uid,
      applicationDate: new Date().toISOString(),
      status: "Pending",
    // bikeModel and licenseNo are now always included due to direct registration
    };

    try {
      const res = await axiosSecure.post("/riders", riderApplicationData);

      if (res.data.insertedId) {
        Swal.fire({
          title: "Application Submitted!",
          text: "Your rider application has been successfully submitted. We will review it shortly.",
          icon: "success",
          confirmButtonText: "Great!",
          customClass: {
            popup: "rounded-lg shadow-xl",
            confirmButton: "btn bg-primary text-white hover:bg-primary-focus",
          },
          buttonsStyling: false,
        });
        // reset();
      } else {
        toast.error("Failed to submit application. No inserted ID received.");
      }
    } catch (apiError) {
      toast.error(
        apiError.response?.data?.message ||
          "An error occurred while submitting your application."
      );
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 rounded-lg shadow-lg flex flex-col lg:flex-row items-center gap-8 min-h-screen">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center lg:text-left">
          Be a Rider
        </h1>
        <p className="text-base md:text-lg mb-8 text-center lg:text-left">
          Enjoy fast, reliable parcel delivery with real-time tracking and zero
          hassle. From personal packages to business shipments — we deliver on
          time, every time.
        </p>
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center lg:text-left">
          Tell us about yourself
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name and Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "Your Name is required" })}
                placeholder="Your Name"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="age"
                {...register("age", {
                  required: "Date of Birth is required",
                  validate: (value) => {
                    const dob = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                      age--;
                    }
                    return age >= 18 || "You must be at least 18 years old.";
                  },
                })}
                placeholder="Your Date of Birth"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.age.message}
                </p>
              )}
            </div>
          </div>

          {/* Email and Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...register("email", { required: "Your Email is required" })}
                placeholder="Your Email"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
                readOnly
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="region"
                className="block text-sm font-medium mb-1"
              >
                Your Region <span className="text-red-500">*</span>
              </label>
              <select
                id="region"
                {...register("region", { required: "Your Region is required" })}
                className="select select-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              >
                <option value="">Select your region</option>
                {regions.map((region, index) => (
                  <option key={index} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.region.message}
                </p>
              )}
            </div>
          </div>

          {/* Warehouse Selection (now displaying district names) */}
          <div>
            <label
              htmlFor="warehouse"
              className="block text-sm font-medium mb-1"
            >
              Your Warehouse <span className="text-red-500">*</span>{" "}
            </label>
            <select
              id="warehouse"
              {...register("warehouse", {
                required: "Your Warehouse is required",
              })}
              className="select select-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              disabled={!selectedRegion || filteredWarehouses.length === 0}
            >
              <option value="">Select your warehouse (district)</option>{" "}
              {/* Clarified option text */}
              {filteredWarehouses.map((warehouse, index) => (
                <option key={index} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>
            {errors.warehouse && (
              <p className="text-red-500 text-sm mt-1">
                {errors.warehouse.message}
              </p>
            )}
          </div>

          {/* NID No and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nid" className="block text-sm font-medium mb-1">
                NID No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nid"
                {...register("nid", { required: "NID No is required" })}
                placeholder="NID"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.nid && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nid.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium mb-1"
              >
                Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contact"
                {...register("contact", { required: "Contact is required" })}
                placeholder="Contact"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.contact && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contact.message}
                </p>
              )}
            </div>
          </div>

          {/* Bike Model and License No. (Always required) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bikeModel"
                className="block text-sm font-medium mb-1"
              >
                Bike Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="bikeModel"
                {...register("bikeModel", {
                  required: "Bike Model is required", // Always required
                })}
                placeholder="Bike Model"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.bikeModel && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bikeModel.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="licenseNo"
                className="block text-sm font-medium mb-1"
              >
                License No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="licenseNo"
                {...register("licenseNo", {
                  required: "License No. is required", // Always required
                })}
                placeholder="License No."
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.licenseNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.licenseNo.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary rounded-md px-8 py-3 text-lg font-semibold shadow-md transition duration-200 ease-in-out w-full"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Image Section */}
      <div className="flex-1 flex justify-center items-center p-4 mt-8 lg:mt-0">
        <img
          src={riderImg}
          alt="Be a Rider"
          className="max-w-full h-auto"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x300/cccccc/000000?text=Image+Not+Found";
          }}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default BeARider;
