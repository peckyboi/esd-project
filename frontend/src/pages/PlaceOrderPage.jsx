import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Star, Clock3 } from "lucide-react";
import { createOrder } from "@/api/orderApi";
import { useActor } from "@/context/actorContext";

function getDeliveryText(gig) {
  if (gig && gig.delivery) return gig.delivery;
  if (gig && typeof gig.delivery_days === "number") {
    return gig.delivery_days === 1 ? "1 day delivery" : `${gig.delivery_days} days delivery`;
  }
  return "N/A";
}

function PlaceOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, resolvedUserId } = useActor();
  const state = location.state || {};
  const gig = state.gig || null;

  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const totalPrice = gig && typeof gig.price === "number" ? gig.price : 0;
  const previewImage = gig ? (gig.image_url || gig.image || null) : null;
  const deliveryText = getDeliveryText(gig);
  const gigId = gig ? (gig.gig_id || gig.id) : null;
  const backPath = gigId ? `/gig/${gigId}` : "/home";
  const freelancerName = gig ? (gig.freelancer_name || gig.freelancer || "Unknown Freelancer") : "";
  const gigTitle = gig ? gig.title : "";
  const gigRating = gig ? (gig.average_rating || gig.rating || "N/A") : "N/A";
  const gigDescription = gig ? (gig.description || "No description available.") : "";

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      if (!gig) {
        throw new Error("Missing gig data. Please start from the gig details page.");
      }
      if (role !== "client") {
        throw new Error("Switch role to client on Home before placing an order.");
      }
      if (!resolvedUserId) {
        throw new Error("Set a valid user id on Home before placing an order.");
      }

      const gigId = gig.gig_id || gig.id;
      const clientId = resolvedUserId;
      const freelancerId = gig.freelancer_id || gig.user_id;
      if (!gigId) {
        throw new Error("Missing gig id. Please start from a gig details page.");
      }
      if (!clientId) {
        throw new Error("Missing client id.");
      }
      if (!freelancerId) {
        throw new Error("Missing freelancer id.");
      }

      const order = await createOrder({
        clientId,
        freelancerId,
        gigId,
        price: totalPrice,
        orderDescription: requirements || null,
      });

      navigate("/payment", {
        state: {
          gig,
          requirements,
          totalPrice,
          orderId: order.id,
        }
      });
    } catch (err) {
      setSubmitError(err.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!gig) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-3xl border-2 border-black bg-[#f7f7f7] p-6 shadow-[6px_6px_0_0_#000]">
          <Text as="h1" className="text-3xl font-bold text-black">
            Place Order
          </Text>
          <Text as="p" className="mt-3 text-lg text-red-600">
            Missing gig data. Please return to the gig details page and click Order Now again.
          </Text>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-6 flex h-12 items-center justify-center border-2 border-black bg-[#c9a7ff] px-6 font-semibold text-black shadow-[3px_3px_0_0_#000]"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to={backPath}>
          <Button variant="outline">← Back to Gig</Button>
        </Link>

        {/* Full-width gig box */}
        <div className="border-2 border-black bg-[#f7f7f7] p-6 shadow-[6px_6px_0_0_#000] mt-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16 rounded-none border-2 border-black bg-[#ddd5f3]">
              <Avatar.Fallback className="bg-transparent text-xl text-black">
                {freelancerName.charAt(0) || "A"}
              </Avatar.Fallback>
            </Avatar>

            <div className="flex-1">
              <Text as="h2" className="text-4xl font-bold leading-tight text-black">
                {gigTitle}
              </Text>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                <Text as="span" className="text-xl text-black">
                  {freelancerName}
                </Text>

                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Text as="span" className="text-xl text-[#5f43b2]">
                    {gigRating}
                  </Text>
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[#5f43b2]" />
                  <Text as="span" className="text-xl text-[#5f43b2]">
                    {deliveryText}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Order Summary Section (Main Box) */}
        <div className="border-2 border-black bg-[#f7f7f7] p-6 shadow-[6px_6px_0_0_#000]">
          <Text as="h2" className="text-3xl font-bold text-black">
            Order Summary
          </Text>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            {/* Left subpane: preview + description */}
            <div className="space-y-4">
              <div className="border-2 border-black bg-[#dfe5f4] p-4 shadow-[4px_4px_0_0_#000]">
                <div className="border-[4px] border-black bg-[#d7dff0] p-4">
                  <div className="mb-3 space-y-2">
                    <div className="h-3 w-[42%] bg-[#c4cee8]" />
                    <div className="h-3 w-[30%] bg-[#cfd8ee]" />
                  </div>

                  <div className="h-[220px] overflow-hidden bg-[#6679a7]">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={gig.title || "Gig preview"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Text as="span" className="text-4xl font-bold tracking-wide text-white">
                          GIG PREVIEW
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-3">
                    <div className="h-4 w-[120px] bg-[#a78bfa]" />
                    <div className="h-4 w-[85px] bg-[#a78bfa]" />
                  </div>
                </div>
              </div>

              <div className="border-2 border-black bg-[#ece8f8] p-5">
                <Text as="h3" className="text-2xl font-bold text-black">
                  Order Details
                </Text>

                <div className="mt-5">
                  <Text as="label" className="mb-3 block text-lg text-black">
                    Delivery Time
                  </Text>
                  <div className="flex h-14 items-center border-2 border-black bg-[#f7f7f7] px-4 text-lg text-black">
                    {deliveryText}
                  </div>
                </div>
              </div>

              <div className="border-2 border-black bg-[#ece8f8] p-4">
                <Text as="h3" className="text-lg font-semibold text-black">
                  Description
                </Text>

                <Text as="p" className="mt-2 text-base leading-7 text-[#5f43b2]">
                  {gigDescription}
                </Text>
              </div>
            </div>

            {/* Right pane: details + requirements + total */}
            <div className="space-y-5">
              <div className="border-2 border-black bg-[#ece8f8] p-5">
                <Text as="h3" className="text-2xl font-bold text-black">
                  Project Requirements
                </Text>

                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Enter any specific project requirements here..."
                  className="mt-4 min-h-[180px] w-full resize-none border-2 border-black bg-[#f7f7f7] p-4 text-lg text-black outline-none placeholder:text-[#6d5ab3]"
                />

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <Text as="span" className="text-[#5f43b2]">
                      Base Price
                    </Text>
                    <Text as="span" className="font-semibold text-black">
                      ${totalPrice}
                    </Text>
                  </div>

                  <div className="flex items-center justify-between text-lg">
                    <Text as="span" className="text-[#5f43b2]">
                      Delivery
                    </Text>
                    <Text as="span" className="font-semibold text-black">
                      {deliveryText}
                    </Text>
                  </div>

                  <div className="border-t-2 border-black pt-4">
                    <div className="flex items-center justify-between">
                      <Text as="span" className="text-2xl font-bold text-black">
                        Total
                      </Text>
                      <Text as="span" className="text-2xl font-bold text-black">
                        ${totalPrice}
                      </Text>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="mt-6 flex h-14 w-full items-center justify-center border-2 border-black bg-[#c9a7ff] text-lg font-semibold text-black shadow-[3px_3px_0_0_#000] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating order..." : "Continue to Payment"}
                </button>

                {submitError && (
                  <Text as="p" className="mt-3 text-sm text-red-600">
                    {submitError}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PlaceOrderPage;
