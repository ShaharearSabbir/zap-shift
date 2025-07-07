import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
// IMPORTANT: For web applications, useParams is typically imported from 'react-router-dom'.
// Importing from 'react-router' directly might lead to runtime errors as it's the core package
// and 'react-router-dom' provides the web-specific bindings.
import { useNavigate, useParams } from "react-router"; // Kept as 'react-router' as per your code
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Loader from "../../Shared/Loader/Loader";
import useAuth from "../../../hooks/useAuth";
import toast from "react-hot-toast"; // Import toast for notifications

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(""); // State to manage errors
  const [loading, setLoading] = useState(false); // State to manage loading
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { parcelId } = useParams();

  const { data: parcel = {}, isPending: isParcelLoading } = useQuery({
    queryKey: ["parcel", parcelId], // Changed queryKey for a single parcel fetch
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels/${parcelId}`);
      return res.data;
    },
    enabled: !!parcelId, // Only run query if parcelId is available
  });

  // Ensure price is a number before multiplication
  const price = parcel.deliveryCost ? parseFloat(parcel.deliveryCost) : 0;
  const priceInCents = Math.round(price * 100); // Use Math.round to avoid floating point issues

  if (isParcelLoading) {
    return <Loader />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading true on submission
    setError(""); // Clear previous errors

    if (!stripe || !elements) {
      setLoading(false);
      toast.error("Stripe is not loaded. Please try again.");
      return;
    }

    const card = elements.getElement(CardElement);

    if (!card) {
      setLoading(false);
      setError("Card input not found. Please refresh the page.");
      toast.error("Card input not found. Please refresh the page.");
      return;
    }

    // Create Payment Method
    const { error: createPaymentMethodError } =
      await stripe.createPaymentMethod({
        type: "card",
        card,
      });

    if (createPaymentMethodError) {
      setError(createPaymentMethodError.message);
      toast.error(createPaymentMethodError.message);
      setLoading(false);
      return;
    }

    try {
      // 1. Create Payment Intent on your backend
      const res = await axiosSecure.post("/create-payment-intent", {
        priceInCents,
        parcelId, // Pass parcelId to backend
      });

      const clientSecret = res.data.clientSecret;

      // 2. Confirm payment on the client-side
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.displayName || "Anonymous User", // Fallback for displayName
          },
        },
      });

      if (result.error) {
        // Handle errors from payment confirmation
        setError(result.error.message);
        toast.error(result.error.message);
      } else {
        // Payment succeeded
        if (result.paymentIntent.status === "succeeded") {
          // Access properties from result.paymentIntent
          const paymentRecord = {
            // 1. Core Identifiers & Links
            parcelId: parcelId, // Link to the parcel using its ObjectId
            userId: user.uid, // Firebase User ID
            transactionId: result.paymentIntent.id, // Stripe Payment Intent ID (Crucial for Stripe lookups)

            // 2. Financial Details
            amount: price, // Amount in smallest currency unit (e.g., cents)
            currency: result.paymentIntent.currency,

            // 3. Status & Timestamps
            status: result.paymentIntent.status, // e.g., "succeeded", "requires_action"
            paidAt: new Date(result.paymentIntent.created * 1000).toISOString(), // Timestamp from Stripe when payment completed
            paymentRecordedAt: new Date().toISOString(), // When your server recorded this payment

            // 4. Payment Method Details (General Type)
            paymentMethodType: result.paymentIntent.payment_method_types
              ? result.paymentIntent.payment_method_types[0] // Get the first payment method type
              : undefined,

            // 5. Customer Details (Essential for support)
            customerName: user.displayName, // Added customerName as requested
            customerEmail:
              user.email ||
              (result.paymentIntent.charges &&
              result.paymentIntent.charges.data[0] &&
              result.paymentIntent.charges.data[0].billing_details
                ? result.paymentIntent.charges.data[0].billing_details.email
                : undefined),

            // 6. Gateway Specifics
            gateway: "Stripe",
            receiptUrl:
              result.paymentIntent.charges &&
              result.paymentIntent.charges.data[0]
                ? result.paymentIntent.charges.data[0].receipt_url
                : undefined,
          };

          // --- Call the backend API to update parcel status and save payment record ---
          try {
            const backendUpdateRes = await axiosSecure.put(
              `/percels/payment/${parcelId}`,
              paymentRecord
            );

            if (
              backendUpdateRes.data.parcelUpdateResult &&
              backendUpdateRes.data.parcelUpdateResult.modifiedCount > 0
            ) {
              toast.success("Payment recorded and parcel status updated!"); // This is the only success toast
              // Optionally, you might want to redirect the user or refetch parcel data here
              // queryClient.invalidateQueries(["parcel", parcelId]); // To refetch the single parcel data
              navigate("/dashboard/myParcels"); // Example redirection
            } else {
              toast.error(
                "Payment recorded, but parcel status update failed on backend."
              );
            }
          } catch (backendError) {
            toast.error(
              "Payment succeeded, but failed to update status on backend."
            );
          }
        } else {
          // Handle other paymentIntent statuses if needed (e.g., 'requires_action')
          setError(`Payment status: ${result.paymentIntent.status}`);
          toast.error(`Payment status: ${result.paymentIntent.status}`);
        }
      }
    } catch (apiError) {
      setError("Payment failed due to a network or server error.");
      toast.error("Payment failed due to a network or server error.");
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-lg bg-white mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Complete Your Payment
      </h2>
      {parcel.parcelName && (
        <p className="text-lg text-center mb-4 text-gray-700">
          Paying for: <span className="font-semibold">{parcel.parcelName}</span>{" "}
          (Tracking ID:{" "}
          <span className="font-semibold">{parcel.trackingId}</span>)
        </p>
      )}
      <p className="text-xl font-bold text-center mb-6 text-primary">
        Amount Due: ৳{price.toFixed(2)}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Details input field */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-medium text-gray-700">
              Card Details
            </span>
          </label>
          <div className="border border-gray-300 p-4 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 ease-in-out">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
          {/* Error message display for CardElement validation */}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        {/* Submit button */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={!stripe || loading}
            className={`btn bg-primary text-white hover:bg-primary-focus focus:ring-primary focus:ring-offset-2 rounded-full px-8 py-3 text-lg font-semibold shadow-md transition duration-200 ease-in-out ${
              !stripe || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : `Pay ৳${price.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
