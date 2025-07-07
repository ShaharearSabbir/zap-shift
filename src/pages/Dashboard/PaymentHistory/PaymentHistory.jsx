import React, { useState, useEffect, useRef } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../Shared/Loader/Loader";
import { FaFilePdf } from "react-icons/fa"; // For a PDF icon
import toast from "react-hot-toast"; // For notifications
import jsPDF from "jspdf"; // Import jsPDF
import html2canvas from "html2canvas"; // Import html2canvas

const PaymentHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  // State for PDF generation
  const receiptRef = useRef(); // Ref to the hidden div containing receipt content
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPaymentForPdf, setCurrentPaymentForPdf] = useState(null); // State to hold payment data for PDF

  // Fetch payment history for the logged-in user
  const {
    data: payments = [],
    isPending: paymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: ["paymentHistory", user?.uid],
    queryFn: async () => {
      if (!user?.uid) {
        return []; // Return empty array if user is not available
      }
      const res = await axiosSecure.get(`/payments?userId=${user.uid}`);
      return res.data;
    },
    enabled: !!user?.uid && !authLoading, // Only fetch if user is logged in and auth is not loading
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

  // Function to trigger PDF generation for a specific payment
  const triggerPdfGeneration = (payment) => {
    setCurrentPaymentForPdf(payment); // Set the payment data to trigger the useEffect
  };

  // useEffect to handle PDF generation when currentPaymentForPdf changes
  useEffect(() => {
    const generatePdf = async () => {
      if (!currentPaymentForPdf) {
        return; // Do nothing if no payment data is set
      }

      setIsGenerating(true);
      toast.loading("Generating PDF receipt...", { id: "pdf-toast" });

      // Add a small delay to ensure the hidden div is rendered in the DOM with updated content
      setTimeout(async () => {
        if (!receiptRef.current) {
          toast.error("Could not find receipt content to generate PDF.", {
            id: "pdf-toast",
          });
          setIsGenerating(false);
          setCurrentPaymentForPdf(null); // Clear the state
          return;
        }

        try {
          const canvas = await html2canvas(receiptRef.current, {
            scale: 2, // Increase scale for better resolution
            useCORS: true, // Important if you have external images/fonts
          });

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' for millimeters, 'a4' size
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`receipt-${currentPaymentForPdf.transactionId}.pdf`);
          toast.dismiss("pdf-toast"); // Dismiss loading toast
          toast.success("PDF receipt generated successfully!");
        } catch (error) {
          toast.dismiss("pdf-toast"); // Dismiss loading toast
          toast.error("Failed to generate PDF receipt.");
        } finally {
          setIsGenerating(false);
          setCurrentPaymentForPdf(null); // Clear the state after generation
        }
      }, 0); // 0ms delay to ensure DOM update
    };

    generatePdf();
  }, [currentPaymentForPdf]); // Dependency array: runs when currentPaymentForPdf changes

  if (authLoading || paymentsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-lg">
        <Loader />
      </div>
    );
  }

  if (paymentsError) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-lg text-red-600">
        Error loading payment history: {paymentsError.message}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center p-6 text-lg text-gray-600">
        No payment history found for your account.
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg bg-white p-4">
      <h2 className="text-2xl font-semibold my-2">My Payment History</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* Table Head */}
          <thead className="bg-blue-500 text-white sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase rounded-tl-lg">
                Transaction ID
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Parcel ID
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Amount
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Status
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Paid At
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase">
                Payment Type
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase rounded-tr-lg">
                Receipt
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.transactionId} // Using transactionId as key
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-sm">{payment.transactionId}</td>
                <td className="py-3 px-4 text-sm">{payment.parcelId}</td>
                <td className="py-3 px-4 text-sm">
                  {payment.currency.toUpperCase()} {payment.amount.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`badge ${
                      payment.status === "succeeded"
                        ? "badge-success"
                        : "badge-warning"
                    } text-white`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  {formatDate(payment.paidAt)}
                </td>
                <td className="py-3 px-4 text-sm capitalize">
                  {payment.paymentMethodType || "N/A"}
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {/* "View Online" link, only if receiptUrl exists */}
                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Online
                      </a>
                    )}
                    {/* Button to trigger PDF generation */}
                    <button
                      onClick={() => triggerPdfGeneration(payment)}
                      disabled={isGenerating}
                      className="btn btn-sm btn-info text-white tooltip tooltip-bottom"
                      data-tip={
                        isGenerating ? "Generating..." : "Generate PDF Receipt"
                      }
                    >
                      <FaFilePdf className="text-xl" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hidden div containing the receipt content for PDF generation */}
      {/* This div is conditionally rendered and its content is populated via currentPaymentForPdf state */}
      {currentPaymentForPdf && (
        <div
          ref={receiptRef}
          className="absolute -left-[9999px] -top-[9999px] w-[210mm] p-6 bg-white border border-gray-300 shadow-lg"
          style={{ zIndex: -1, display: "block" }} // Always block when currentPaymentForPdf is set
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Payment Receipt
            </h1>
            <p className="text-gray-600">
              Generated on: {formatDate(new Date().toISOString())}
            </p>
          </div>

          <div className="space-y-3 text-gray-700 mb-6">
            <p>
              <strong>Transaction ID:</strong>{" "}
              {currentPaymentForPdf.transactionId}
            </p>
            <p>
              <strong>Parcel ID:</strong> {currentPaymentForPdf.parcelId}
            </p>
            <p>
              <strong>Amount Paid:</strong>{" "}
              {currentPaymentForPdf.currency.toUpperCase()}{" "}
              {currentPaymentForPdf.amount.toFixed(2)}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span className="capitalize">{currentPaymentForPdf.status}</span>
            </p>
            <p>
              <strong>Paid At:</strong>{" "}
              {formatDate(currentPaymentForPdf.paidAt)}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              <span className="capitalize">
                {currentPaymentForPdf.paymentMethodType || "N/A"}
              </span>
            </p>
            <p>
              <strong>Customer Name:</strong>{" "}
              {currentPaymentForPdf.customerName || "N/A"}
            </p>
            <p>
              <strong>Customer Email:</strong>{" "}
              {currentPaymentForPdf.customerEmail || "N/A"}
            </p>
            <p>
              <strong>Gateway:</strong> {currentPaymentForPdf.gateway}
            </p>
            {currentPaymentForPdf.receiptUrl && (
              <p>
                <strong>Original Receipt URL:</strong>{" "}
                <a
                  href={currentPaymentForPdf.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 break-all"
                >
                  {currentPaymentForPdf.receiptUrl}
                </a>
              </p>
            )}
          </div>

          <div className="text-center text-sm text-gray-500 mt-8 border-t pt-4">
            Thank you for your business!
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
