import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Loader from "../../Shared/Loader/Loader";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEllipsisV,
  FaSearch,
  FaEye,
} from "react-icons/fa";

const PendingRider = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRiderDetails, setSelectedRiderDetails] = useState(null);

  // Fetch pending rider applications
  const {
    data: pendingRiders = [],
    isPending: loadingRiders,
    error: ridersError,
    refetch,
  } = useQuery({
    queryKey: ["pendingRiders", searchTerm],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/riders?status=Pending&search=${searchTerm}`
      );
      return res.data;
    },
  });

  // Function to format date for better readability
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle application status update (Approve/Reject)
  const handleUpdateStatus = async (riderId, newStatus) => {
    Swal.fire({
      title: `Are you sure you want to ${newStatus}?`,
      text: `This will change the status of the rider application to "${newStatus}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "Approved" ? "#3085d6" : "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Yes, ${newStatus} it!`,
      customClass: {
        popup: "rounded-lg shadow-xl",
        confirmButton: "btn btn-primary", // DaisyUI primary button
        cancelButton: "btn btn-outline", // DaisyUI outline button
      },
      buttonsStyling: false, // Disable default SweetAlert2 button styling
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Changed from patch to put, and status sent as query parameter
          const res = await axiosSecure.put(
            `/riders/${riderId}?status=${newStatus}`
          );

          // Check for message from the backend to confirm success
          if (res.data.message && res.data.message.includes("updated to")) {
            toast.success(
              `Rider application ${newStatus.toLowerCase()} successfully!`
            );
            refetch(); // Refetch data to update the table
          } else {
            toast.error(
              res.data.message ||
                `Failed to ${newStatus.toLowerCase()} rider application.`
            );
          }
        } catch (error) {
          toast.error(
            `Error ${newStatus.toLowerCase()} application: ${
              error.response?.data?.error || error.message
            }`
          );
        }
      }
    });
  };

  // Function to open the details modal
  const openDetailsModal = (rider) => {
    setSelectedRiderDetails(rider);
    setShowDetailsModal(true);
  };

  // Function to close the details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRiderDetails(null);
  };

  if (loadingRiders) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (ridersError) {
    return (
      <div className="text-center p-6 text-lg text-red-600">
        Error loading pending riders: {ridersError.message}
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-semibold my-2">
        Pending Rider Applications
      </h2>

      {/* Search Input */}
      <div className="flex justify-end mb-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search riders..."
            className="input input-bordered w-full pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Conditional rendering for no results after filtering */}
      {pendingRiders.length === 0 && !loadingRiders && !ridersError ? (
        <div className="text-center p-6 text-lg text-gray-600">
          {searchTerm
            ? `No riders found matching "${searchTerm}".`
            : "No pending rider applications found."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Table Head - Made sticky */}
            <thead className="bg-blue-500 text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold uppercase rounded-tl-lg">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                  Age
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                  Region
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                  Applied On
                </th>
                <th className="py-3 px-4 text-center text-sm font-semibold uppercase rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {pendingRiders.map((rider) => (
                <tr
                  key={rider._id}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm">{rider.name}</td>
                  <td className="py-3 px-4 text-sm">{rider.email}</td>
                  <td className="py-3 px-4 text-sm">{rider.age}</td>
                  <td className="py-3 px-4 text-sm">{rider.region}</td>
                  <td className="py-3 px-4 text-sm">
                    {formatDate(rider.applicationDate)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => openDetailsModal(rider)}
                        className="btn btn-ghost btn-sm tooltip tooltip-bottom"
                        data-tip="View Details"
                      >
                        <FaEye className="text-lg text-blue-500" />
                      </button>

                      {/* Three-dot Dropdown for Approve/Reject */}
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-sm m-1"
                        >
                          <FaEllipsisV className="text-lg" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36"
                        >
                          <li>
                            <button
                              onClick={() =>
                                handleUpdateStatus(rider._id, "Approved")
                              }
                              className="flex items-center gap-2 text-green-600 hover:bg-green-100"
                            >
                              <FaCheckCircle /> Approve
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() =>
                                handleUpdateStatus(rider._id, "Rejected")
                              }
                              className="flex items-center gap-2 text-red-600 hover:bg-red-100"
                            >
                              <FaTimesCircle /> Reject
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Toaster />

      {/* Rider Details Modal */}
      {showDetailsModal && selectedRiderDetails && (
        <dialog
          id="rider_details_modal"
          className="modal modal-open"
          onClick={closeDetailsModal}
        >
          <div
            className="modal-box w-11/12 max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-primary">
              Rider Application Details
            </h3>
            <div className="py-4 space-y-2">
              <p>
                <strong>Name:</strong> {selectedRiderDetails.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedRiderDetails.email}
              </p>
              <p>
                <strong>Age:</strong> {selectedRiderDetails.age}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {formatDate(selectedRiderDetails.dateOfBirth)}
              </p>
              <p>
                <strong>Region:</strong> {selectedRiderDetails.region}
              </p>
              <p>
                <strong>Warehouse:</strong> {selectedRiderDetails.warehouse}
              </p>
              <p>
                <strong>NID No:</strong> {selectedRiderDetails.nid}
              </p>
              <p>
                <strong>Contact:</strong> {selectedRiderDetails.contact}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="badge badge-warning">
                  {selectedRiderDetails.status}
                </span>
              </p>
              <p>
                <strong>Applied On:</strong>{" "}
                {formatDate(selectedRiderDetails.applicationDate)}
              </p>
              {selectedRiderDetails.bikeModel && (
                <p>
                  <strong>Bike Model:</strong> {selectedRiderDetails.bikeModel}
                </p>
              )}
              {selectedRiderDetails.licenseNo && (
                <p>
                  <strong>License No:</strong> {selectedRiderDetails.licenseNo}
                </p>
              )}
            </div>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn" onClick={closeDetailsModal}>
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default PendingRider;
