import React from "react";
import { NavLink, Outlet } from "react-router";
import ProFastLogo from "../pages/Shared/ProFastLogo/ProFastLogo";
import {
  FaHome,
  FaBox,
  FaPlusCircle,
  FaHistory,
  FaUser, // For User Profile
  FaTruck, // For Track Parcel
  FaBell, // For Notifications
  FaQuestionCircle, // For Support/Help
  FaHourglassHalf, // New: For Pending Rider
  FaCheckCircle,
} from "react-icons/fa"; // Importing icons

const DashboardLayout = () => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="navbar bg-base-300 w-full flex justify-start gap-4 lg:hidden">
          <div className="flex-1">
            <label
              htmlFor="my-drawer-2"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="flex-1/2">
            <ProFastLogo />
          </div>
        </div>
        {/* Content here */}
        <Outlet />
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 space-y-3">
          <ProFastLogo />
          {/* Sidebar content here */}
          <li>
            <NavLink to="/">
              <FaHome className="text-xl" />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/sendParcel">
              <FaPlusCircle className="text-xl" />
              Add Parcel
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/myParcels">
              <FaBox className="text-xl" />
              My Parcel
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/trackParcel">
              <FaTruck className="text-xl" />
              Track Parcel
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/paymentHistory">
              <FaHistory className="text-xl" />
              Payment History
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/profile">
              <FaUser className="text-xl" />
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/notifications">
              <FaBell className="text-xl" />
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/support">
              <FaQuestionCircle className="text-xl" />
              Support
            </NavLink>
          </li>
          {/* Rider Management Links (grouped at the end) */}
          <li>
            <NavLink to="/dashboard/pendingRiders">
              <FaHourglassHalf className="text-xl" />
              Pending Rider
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/approvedRiders">
              <FaCheckCircle className="text-xl" />
              Approved Rider
            </NavLink>
          </li>
          {/* Add more dashboard links as needed */}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
