import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import Loader from "../Shared/Loader/Loader";
import useAxiosSecure from "../../hooks/useAxiosSecure";
// IMPORTANT: As per your explicit instruction, useNavigate is imported from 'react-router'.
// Please be aware that for web applications, this hook is typically provided by 'react-router-dom'.
// Importing it directly from 'react-router' might lead to runtime errors if your setup
// does not specifically re-export it from the core package for browser use.
import { useNavigate } from "react-router"; // Changed import as per your instruction

// Assuming useAuth hook is provided externally and returns { user, loadingAuth }
// The user has clarified that this component is a protected route,
// meaning 'user' will always be available and not null when this component renders.
// 'loadingAuth' can still be used to indicate the initial loading state of auth.

const SendParcel = () => {
  const [allWarehouseData, setAllWarehouseData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filteredSenderWarehouses, setFilteredSenderWarehouses] = useState([]);
  const [filteredReceiverWarehouses, setFilteredReceiverWarehouses] = useState(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Directly use the user's provided useAuth hook
  const { user, loading: loadingAuth } = useAuth(); // user will be non-null here as it's a protected route
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate(); // Initialize useNavigate hook for redirection

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const parcelType = watch("parcelType");
  const senderRegion = watch("senderRegion");
  const receiverRegion = watch("receiverRegion");
  const parcelWeight = watch("parcelWeight"); // Watch parcelWeight for cost calculation

  // Fetch all warehouse data
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const response = await fetch("/warehouses.json");
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

  // Effect to filter sender warehouses based on senderRegion
  useEffect(() => {
    if (senderRegion && allWarehouseData.length > 0) {
      const warehousesInRegion = allWarehouseData
        .filter((item) => item.region === senderRegion)
        .map((item) => item.city);
      setFilteredSenderWarehouses([...new Set(warehousesInRegion)]);
      setValue("senderPickupWarehouse", "");
    } else {
      setFilteredSenderWarehouses([]);
      setValue("senderPickupWarehouse", "");
    }
  }, [senderRegion, allWarehouseData, setValue]);

  // Effect to filter receiver warehouses based on receiverRegion
  useEffect(() => {
    if (receiverRegion && allWarehouseData.length > 0) {
      const warehousesInRegion = allWarehouseData
        .filter((item) => item.region === receiverRegion)
        .map((item) => item.city);
      setFilteredReceiverWarehouses([...new Set(warehousesInRegion)]);
      setValue("receiverDeliveryWarehouse", "");
    } else {
      setFilteredReceiverWarehouses([]);
      setValue("receiverDeliveryWarehouse", "");
    }
  }, [receiverRegion, allWarehouseData, setValue]);

  /**
   * Generates a unique tracking ID.
   * This is a client-side generation for demonstration. In a real application,
   * this might be generated on the server to ensure global uniqueness and prevent collisions.
   * @returns {string} A unique tracking ID.
   */
  const generateTrackingId = () => {
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const randomString = Math.random().toString(36).substring(2, 8); // Random alphanumeric string
    return `TRK-${timestamp}-${randomString}`.toUpperCase();
  };

  // Cost calculation based on the provided pricing policy, returning detailed breakdown
  const calculateDeliveryCost = (type, senderCity, receiverCity, weight) => {
    let baseCost = 0;
    let extraCharges = 0;
    const extraChargesDetails = [];
    const isWithinCity = senderCity === receiverCity; // 'city' refers to 'district' here
    const effectiveWeight = parseFloat(weight) || 0;
    let deliveryZone = isWithinCity ? "Within City" : "Outside City/District";
    let totalCost = 0;

    if (type === "document") {
      baseCost = isWithinCity ? 60 : 80;
      totalCost = baseCost;
    } else if (type === "non-document") {
      if (effectiveWeight <= 3) {
        baseCost = isWithinCity ? 110 : 150;
        totalCost = baseCost;
      } else {
        baseCost = isWithinCity ? 110 : 150;
        const weightOver3kg = effectiveWeight - 3;
        const weightCharge = weightOver3kg * 40;
        extraCharges += weightCharge;
        extraChargesDetails.push(
          `Non-document over 3kg outside the district: ৳40 x ${weightOver3kg.toFixed(
            2
          )} kg = ৳${weightCharge.toFixed(2)}`
        );

        if (!isWithinCity) {
          extraCharges += 40;
          extraChargesDetails.push(`৳40 extra for outside district delivery`);
        }
        totalCost = baseCost + extraCharges;
      }
    }
    return {
      totalCost,
      baseCost,
      extraCharges,
      extraChargesDetails,
      deliveryZone,
    };
  };

  const onSubmit = (data) => {
    const costDetails = calculateDeliveryCost(
      data.parcelType,
      data.senderPickupWarehouse,
      data.receiverDeliveryWarehouse,
      parseFloat(data.parcelWeight)
    );

    // Prepare HTML for SweetAlert2 to match the screenshot
    let htmlContent = `
      <div class="text-base-content text-left space-y-2 text-lg">
        <div class="flex justify-between">
          <span>Parcel Type:</span>
          <span class="font-semibold capitalize">${data.parcelType}</span>
        </div>
        ${
          data.parcelType === "non-document"
            ? `
        <div class="flex justify-between">
          <span>Weight:</span>
          <span class="font-semibold">${data.parcelWeight} kg</span>
        </div>
        `
            : ""
        }
        <div class="flex justify-between">
          <span>Delivery Zone:</span>
          <span class="font-semibold">${costDetails.deliveryZone}</span>
        </div>
        <div class="flex justify-between pt-2 border-t border-gray-200">
          <span>Base Cost:</span>
          <span class="font-semibold">৳${costDetails.baseCost.toFixed(2)}</span>
        </div>
        <div class="flex justify-between">
          <span>Extra Charges:</span>
          <span class="font-semibold">৳${costDetails.extraCharges.toFixed(
            2
          )}</span>
        </div>
        ${
          costDetails.extraChargesDetails.length > 0
            ? `
        <div class="text-sm text-gray-600 pl-4 space-y-1">
          ${costDetails.extraChargesDetails
            .map((detail) => `<p>${detail}</p>`)
            .join("")}
        </div>
        `
            : ""
        }
        <div class="flex justify-between pt-2 border-t-2 border-gray-300 font-bold text-xl mt-4">
          <span>Total Cost:</span>
          <span class="text-primary">৳${costDetails.totalCost.toFixed(2)}</span>
        </div>
      </div>
    `;

    Swal.fire({
      title: "Delivery Cost Breakdown",
      html: htmlContent,
      iconHtml:
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      showCancelButton: true,
      confirmButtonText: "💳 Proceed to Payment",
      cancelButtonText: "✏️ Continue Editing",
      customClass: {
        container: "swal2-container",
        popup: "swal2-popup rounded-lg shadow-xl",
        title: "text-2xl font-bold text-center text-base-content",
        htmlContainer: "text-base-content",
        confirmButton:
          "btn bg-primary text-white hover:bg-primary-focus w-full rounded-full py-3 text-lg font-semibold shadow-md transition duration-200 ease-in-out",
        cancelButton:
          "btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 w-full rounded-full py-3 text-lg font-semibold mt-3",
      },
      buttonsStyling: false, // Disable default SweetAlert2 button styling
    }).then(async (result) => {
      // Made async to await axiosSecure.post
      if (result.isConfirmed) {
        // User clicked "Proceed to Payment"
        // Prepare the data to be sent, including user info and timestamp
        const parcelDataForBackend = {
          ...data, // All form data
          userEmail: user?.email, // User email from useAuth
          userId: user?.uid, // User UID from useAuth
          trackingId: generateTrackingId(), // Add the generated tracking ID
          deliveryCost: costDetails.totalCost,
          paymentStatus: "Unpaid",
          deliveryStatus: "notCollected",
          creationDate: new Date().toISOString(), // Client-side timestamp for parcel creation
        };

        try {
          const res = await axiosSecure.post("/parcels", parcelDataForBackend);
          if (res.data.insertedId) {
            Swal.fire({
              title: "Parcel Booked!",
              text: "Do you want to send another parcel?",
              icon: "success",
              showCancelButton: true,
              confirmButtonText: "Yes, send another!",
              cancelButtonText: "No, go to My Parcels",
              customClass: {
                popup: "rounded-lg shadow-xl",
                confirmButton:
                  "btn bg-primary text-white hover:bg-primary-focus",
                cancelButton:
                  "btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 mt-3",
              },
              buttonsStyling: false,
            }).then((followUpResult) => {
              if (followUpResult.isConfirmed) {
                reset(); // Clear the form
                toast.success("Form cleared for new parcel!");
              } else if (followUpResult.dismiss === Swal.DismissReason.cancel) {
                navigate("/dashboard/myParcels"); // Redirect to My Parcels page
                toast("Redirecting to My Parcels.", { icon: "👋" });
              }
            });
          } else {
            toast.error("Failed to book parcel. No inserted ID received.");
          }
        } catch (error) {
          toast.error("Failed to book parcel. Please try again.");
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // User clicked "Cancel"
        toast("Booking cancelled.", { icon: "👋" });
      }
    });
  };

  if (loading || loadingAuth) {
    // Wait for both form data and auth to load
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-lg">
        <Loader />
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-2">Add Parcel</h1>
      <p className="text-lg mb-6">
        Enter details for your door-to-door delivery.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Parcel Type Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Enter your parcel details
          </h2>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register("parcelType", {
                  required: "Parcel type is required",
                })}
                value="document"
                className="form-radio h-5 w-5 text-primary border-primary focus:ring-primary"
              />
              <span className="ml-2 text-lg">
                Document <span className="text-red-500">*</span>
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                {...register("parcelType", {
                  required: "Parcel type is required",
                })}
                value="non-document"
                className="form-radio h-5 w-5 text-primary border-primary focus:ring-primary"
              />
              <span className="ml-2 text-lg">
                Non-Document <span className="text-red-500">*</span>
              </span>
            </label>
          </div>
          {errors.parcelType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.parcelType.message}
            </p>
          )}
        </div>

        {/* Parcel Name and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="parcelName"
              className="block text-sm font-medium mb-1"
            >
              Parcel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="parcelName"
              {...register("parcelName", {
                required: "Parcel Name is required",
              })}
              placeholder="Parcel Name"
              className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
            />
            {errors.parcelName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.parcelName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="parcelWeight"
              className="block text-sm font-medium mb-1"
            >
              Parcel Weight (KG){" "}
              {parcelType === "non-document" && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="number"
              id="parcelWeight"
              {...register("parcelWeight", {
                required:
                  parcelType === "non-document"
                    ? "Parcel Weight is required for Non-Document parcels"
                    : false,
                valueAsNumber: true,
                min: { value: 0, message: "Weight must be positive" },
              })}
              placeholder="Parcel Weight (KG)"
              step="0.01"
              className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              disabled={parcelType === "document"}
            />
            {errors.parcelWeight && (
              <p className="text-red-500 text-sm mt-1">
                {errors.parcelWeight.message}
              </p>
            )}
          </div>
        </div>

        {/* Sender Details and Receiver Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sender Details</h3>
            <div>
              <label
                htmlFor="senderName"
                className="block text-sm font-medium mb-1"
              >
                Sender Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="senderName"
                {...register("senderName", {
                  required: "Sender Name is required",
                })}
                placeholder="Sender Name"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.senderName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.senderName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="senderRegion"
                className="block text-sm font-medium mb-1"
              >
                Your Region <span className="text-red-500">*</span>
              </label>
              <select
                id="senderRegion"
                {...register("senderRegion", {
                  required: "Sender Region is required",
                })}
                className="select select-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              >
                <option value="">Select your region</option>
                {regions.map((region, index) => (
                  <option key={index} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {errors.senderRegion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.senderRegion.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="senderPickupWarehouse"
                className="block text-sm font-medium mb-1"
              >
                Sender Pickup Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                id="senderPickupWarehouse"
                {...register("senderPickupWarehouse", {
                  required: "Pickup Warehouse is required",
                })}
                className="select select-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
                disabled={!senderRegion}
              >
                <option value="">Select Wire house</option>
                {filteredSenderWarehouses.map((warehouse, index) => (
                  <option key={index} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
              {errors.senderPickupWarehouse && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.senderPickupWarehouse.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="senderAddress"
                className="block text-sm font-medium mb-1"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="senderAddress"
                {...register("senderAddress", {
                  required: "Sender Address is required",
                })}
                placeholder="Address"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.senderAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.senderAddress.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="senderContactNo"
                className="block text-sm font-medium mb-1"
              >
                Sender Contact No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="senderContactNo"
                {...register("senderContactNo", {
                  required: "Sender Contact No is required",
                })}
                placeholder="Sender Contact No"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.senderContactNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.senderContactNo.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="pickupInstruction"
                className="block text-sm font-medium mb-1"
              >
                Pickup Instruction <span className="text-red-500">*</span>
              </label>
              <textarea
                id="pickupInstruction"
                {...register("pickupInstruction", {
                  required: "Pickup Instruction is required",
                })}
                placeholder="Pickup Instruction"
                rows="3"
                className="textarea textarea-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              ></textarea>
              {errors.pickupInstruction && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pickupInstruction.message}
                </p>
              )}
            </div>
          </div>

          {/* Receiver Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receiver Details</h3>
            <div>
              <label
                htmlFor="receiverName"
                className="block text-sm font-medium mb-1"
              >
                Receiver Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="receiverName"
                {...register("receiverName", {
                  required: "Receiver Name is required",
                })}
                placeholder="Receiver Name"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.receiverName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receiverName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="receiverRegion"
                className="block text-sm font-medium mb-1"
              >
                Receiver Region <span className="text-red-500">*</span>
              </label>
              <select
                id="receiverRegion"
                {...register("receiverRegion", {
                  required: "Receiver Region is required",
                })}
                className="select select-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              >
                <option value="">Select your region</option>
                {regions.map((region, index) => (
                  <option key={index} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {errors.receiverRegion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receiverRegion.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="receiverDeliveryWarehouse"
                className="block text-sm font-medium mb-1"
              >
                Receiver Delivery Warehouse{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="receiverDeliveryWarehouse"
                {...register("receiverDeliveryWarehouse", {
                  required: "Delivery Warehouse is required",
                })}
                className="select select-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
                disabled={!receiverRegion}
              >
                <option value="">Select Wire house</option>
                {filteredReceiverWarehouses.map((warehouse, index) => (
                  <option key={index} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>
              {errors.receiverDeliveryWarehouse && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receiverDeliveryWarehouse.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="receiverAddress"
                className="block text-sm font-medium mb-1"
              >
                Receiver Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="receiverAddress"
                {...register("receiverAddress", {
                  required: "Receiver Address is required",
                })}
                placeholder="Address"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.receiverAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receiverAddress.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="receiverContactNo"
                className="block text-sm font-medium mb-1"
              >
                Receiver Contact No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="receiverContactNo"
                {...register("receiverContactNo", {
                  required: "Receiver Contact No is required",
                })}
                placeholder="Sender Contact No"
                className="input input-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              />
              {errors.receiverContactNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receiverContactNo.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="deliveryInstruction"
                className="block text-sm font-medium mb-1"
              >
                Delivery Instruction <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deliveryInstruction"
                {...register("deliveryInstruction", {
                  required: "Delivery Instruction is required",
                })}
                placeholder="Delivery Instruction"
                rows="3"
                className="textarea textarea-bordered w-full rounded-md p-2 border border-gray-300 focus:ring-primary focus:border-primary"
              ></textarea>
              {errors.deliveryInstruction && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.deliveryInstruction.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pickup Time Note */}
        <div className="text-sm mt-6">* PickUp Time 4pm-7pm Approx.</div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="btn bg-primary text-white hover:bg-primary-focus focus:ring-primary focus:ring-offset-2 rounded-full px-8 py-3 text-lg font-semibold shadow-md transition duration-200 ease-in-out"
          >
            Proceed to Confirm Booking
          </button>
        </div>
      </form>

      {/* Toaster component from react-hot-toast */}
      <Toaster />
    </div>
  );
};

export default SendParcel;
