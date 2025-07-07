import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import React from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import {
  MdOutlineRemoveRedEye, // For View Details
  MdPayment, // For Pay
  MdCancel, // For Cancel/Delete
} from "react-icons/md";
import Loader from "../../Shared/Loader/Loader";
import Swal from "sweetalert2"; // Import SweetAlert2
import toast from "react-hot-toast"; // Assuming react-hot-toast is available
// IMPORTANT: For web applications, useNavigate is typically imported from 'react-router-dom'.
// Importing from 'react-router' directly might lead to runtime errors as it's the core package
// and 'react-router-dom' provides the web-specific bindings.
import { useNavigate } from "react-router"; // Changed import as per your instruction

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient(); // Initialize useQueryClient
  const navigate = useNavigate(); // Initialize useNavigate

  const { data: parcels = [], isPending } = useQuery({
    queryKey: ["myParcels", user.uid],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?userId=${user.uid}`);
      return res.data;
    },
    enabled: !!user?.uid, // Only run query if user.uid is available
  });

  // Function to format the date for better readability
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get a user-friendly payment status
  const getPaymentStatusDisplay = (status) => {
    switch (status) {
      case "Unpaid":
        return "Due";
      case "Paid":
        return "Paid";
      default:
        return status;
    }
  };

  // Function to get a user-friendly delivery status
  const getDeliveryStatusDisplay = (status) => {
    switch (status) {
      case "notCollected":
        return "Pending Pickup";
      case "collected":
        return "Collected";
      case "onTheWay":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  // Dummy handlers for button clicks, updated to use custom message box
  const handleViewDetails = (parcel) => {
    console.log("View Details for:", parcel.trackingId, parcel);
    const messageBox = document.createElement("div");
    messageBox.className =
      "fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50";

    // Constructing the HTML content with all parcel details
    messageBox.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-auto text-left">
        <h3 class="text-2xl font-bold mb-4 text-center text-gray-800">Parcel Details</h3>
        <div class="space-y-3 text-gray-700">
          <p><strong>Tracking ID:</strong> <span class="font-semibold">${
            parcel.trackingId
          }</span></p>
          <p><strong>Parcel Type:</strong> <span class="capitalize">${
            parcel.parcelType
          }</span></p>
          <p><strong>Parcel Name:</strong> ${parcel.parcelName}</p>
          ${
            parcel.parcelWeight !== null
              ? `<p><strong>Parcel Weight:</strong> ${parcel.parcelWeight} kg</p>`
              : ""
          }
          <p><strong>Booking Date:</strong> ${formatDate(
            parcel.creationDate
          )}</p>
          <p><strong>Delivery Cost:</strong> ৳${parcel.deliveryCost.toFixed(
            2
          )}</p>
          <p><strong>Payment Status:</strong> <span class="font-semibold">${getPaymentStatusDisplay(
            parcel.paymentStatus
          )}</span></p>
          <p><strong>Delivery Status:</strong> <span class="font-semibold">${getDeliveryStatusDisplay(
            parcel.deliveryStatus
          )}</span></p>

          <h4 class="text-lg font-semibold mt-4 border-t pt-3 border-gray-200">Sender Information:</h4>
          <p><strong>Name:</strong> ${parcel.senderName}</p>
          <p><strong>Region:</strong> ${parcel.senderRegion}</p>
          <p><strong>Pickup Warehouse:</strong> ${
            parcel.senderPickupWarehouse
          }</p>
          <p><strong>Address:</strong> ${parcel.senderAddress}</p>
          <p><strong>Contact No:</strong> ${parcel.senderContactNo}</p>
          <p><strong>Pickup Instruction:</strong> ${
            parcel.pickupInstruction
          }</p>

          <h4 class="text-lg font-semibold mt-4 border-t pt-3 border-gray-200">Receiver Information:</h4>
          <p><strong>Name:</strong> ${parcel.receiverName}</p>
          <p><strong>Region:</strong> ${parcel.receiverRegion}</p>
          <p><strong>Delivery Warehouse:</strong> ${
            parcel.receiverDeliveryWarehouse
          }</p>
          <p><strong>Address:</strong> ${parcel.receiverAddress}</p>
          <p><strong>Contact No:</strong> ${parcel.receiverContactNo}</p>
          <p><strong>Delivery Instruction:</strong> ${
            parcel.deliveryInstruction
          }</p>
        </div>
        <div class="text-center">
          <button id="closeMessageBox" class="btn btn-primary mt-6 px-8 py-2 rounded-full text-lg font-semibold shadow-md transition duration-200 ease-in-out">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(messageBox);
    document.getElementById("closeMessageBox").onclick = () =>
      document.body.removeChild(messageBox);
  };

  const handlePayParcel = (parcel) => {
    console.log("Pay Parcel:", parcel.trackingId, parcel);

    Swal.fire({
      title: "Proceed to Payment",
      html: `
        <div class="text-base-content text-left space-y-2 text-lg">
          <p class="mb-2">You are about to pay for parcel: <span class="font-semibold">${
            parcel.parcelName
          }</span></p>
          <p class="mb-4">Tracking ID: <span class="font-semibold">${
            parcel.trackingId
          }</span><br/>Cost: <span class="font-semibold">৳${parcel.deliveryCost.toFixed(
        2
      )}</span></p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "💳 Pay Now",
      cancelButtonText: "Close",
      customClass: {
        popup: "rounded-lg shadow-xl",
        // Modified button classes for centering and new lines
        confirmButton:
          "btn bg-primary text-white hover:bg-primary-focus rounded-full py-3 text-lg font-semibold shadow-md transition duration-200 ease-in-out w-full mb-3", // Added w-full, mb-3
        cancelButton:
          "btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full py-3 text-lg font-semibold w-full", // Added w-full
        actions: "flex flex-col items-center w-full", // Added flex-col to stack buttons and items-center to center them
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked "Pay Now"
        navigate(`/dashboard/payment/${parcel._id}`); // Navigate to payment page using parcel._id
      }
      // If cancelled, SweetAlert2 automatically closes, no need for explicit closeMessageBox
    });
  };

  const handleCancelParcel = async (parcel) => {
    // Made the function async
    console.log("Attempting to cancel Parcel:", parcel.trackingId, parcel);

    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to cancel the parcel "${parcel.parcelName}" (Tracking ID: ${parcel.trackingId})? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
      customClass: {
        popup: "rounded-lg shadow-xl",
        confirmButton: "btn btn-error text-white",
        cancelButton: "btn btn-outline btn-info",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      // Ensure this callback is async
      if (result.isConfirmed) {
        try {
          // Assuming your backend delete endpoint is /parcels/:id
          const res = await axiosSecure.delete(`/parcels/${parcel._id}`);
          console.log("Backend delete response:", res.data); // Log the response for debugging

          if (res.data.deletedCount > 0) {
            // Check for successful deletion count
            toast.success("Parcel cancelled successfully!");
            // Invalidate the query to refetch the parcels data and update the UI
            queryClient.invalidateQueries(["myParcels", user.uid]);
          } else {
            toast.error(
              "Failed to cancel parcel. No deletion recorded by backend."
            );
          }
        } catch (error) {
          console.error("Error cancelling parcel:", error);
          toast.error("An error occurred while cancelling the parcel.");
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        toast("Cancellation aborted.", { icon: "👋" });
      }
    });
  };

  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-lg">
        <Loader />
      </div>
    );
  }

  if (!parcels || parcels.length === 0) {
    return (
      <div className="text-center p-6 text-lg text-gray-600">
        No parcels found. Book a new parcel to see it here!
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg bg-white p-4">
      <h2 className="text-2xl font-semibold my-2">My Parcel</h2>
      <div>
        <table className="table w-full">
          {/* Table Head - Added sticky header classes */}
          <thead className="bg-blue-500 text-white sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase rounded-tl-lg">
                Parcel Type
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Parcel Name
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Booking Date
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Payment Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Delivery Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Delivery Cost
              </th>
              <th className="py-3 px-4 text-center text-sm font-semibold uppercase rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {parcels.map((parcel) => (
              <tr
                key={parcel._id}
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-sm capitalize">
                  {parcel.parcelType}
                </td>
                <td className="py-3 px-4 text-sm">{parcel.parcelName}</td>
                <td className="py-3 px-4 text-sm">
                  {formatDate(parcel.creationDate)}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`badge ${
                      parcel.paymentStatus === "Paid"
                        ? "badge-success"
                        : "badge-warning"
                    } text-white`}
                  >
                    {getPaymentStatusDisplay(parcel.paymentStatus)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`badge ${
                      parcel.deliveryStatus === "delivered"
                        ? "badge-success"
                        : parcel.deliveryStatus === "onTheWay"
                        ? "badge-info"
                        : parcel.deliveryStatus === "collected"
                        ? "badge-primary"
                        : "badge-error"
                    } text-white`}
                  >
                    {getDeliveryStatusDisplay(parcel.deliveryStatus)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  ৳{parcel.deliveryCost.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => handleViewDetails(parcel)}
                      className="btn btn-sm btn-ghost tooltip tooltip-bottom"
                      data-tip="View Details"
                    >
                      <MdOutlineRemoveRedEye className="text-xl text-blue-500" />
                    </button>

                    {/* Pay Button - Only if Unpaid and notCollected */}
                    {parcel.paymentStatus === "Unpaid" &&
                      parcel.deliveryStatus === "notCollected" && (
                        <button
                          onClick={() => handlePayParcel(parcel)}
                          className="btn btn-sm btn-ghost tooltip tooltip-bottom"
                          data-tip="Pay Now"
                        >
                          <MdPayment className="text-xl text-green-500" />
                        </button>
                      )}

                    {/* Cancel Button - Only if not collected */}
                    {parcel.deliveryStatus === "notCollected" && (
                      <button
                        onClick={() => handleCancelParcel(parcel)}
                        className="btn btn-sm btn-ghost tooltip tooltip-bottom"
                        data-tip="Cancel Parcel"
                      >
                        <MdCancel className="text-xl text-red-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyParcels;
