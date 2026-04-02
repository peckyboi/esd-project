import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Star, Clock3 } from "lucide-react";

function PlaceOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const gig = location.state?.gig || {
    id: 1,
    title: "SaaS Web App Development",
    freelancer: "Alice W",
    rating: 4.8,
    description:
      "I will develop a custom SaaS web application tailored to your business needs with modern design, secure authentication, and robust functionality.",
    delivery: "2 days delivery",
    price: 495,
    category: "Web Development"
  };

  const [quantity, setQuantity] = useState(1);
  const [requirements, setRequirements] = useState("");

  const totalPrice = useMemo(() => gig.price * quantity, [gig.price, quantity]);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handlePlaceOrder = () => {
    navigate("/payment", {
      state: {
        gig,
        quantity,
        requirements,
        totalPrice
      }
    });
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Text as="h1" className="text-5xl font-bold text-black">
            Place Order
          </Text>
          <Text as="p" className="mt-3 text-lg text-[#5f43b2]">
            Review your selected gig, confirm quantity, and add any project details before checkout.
          </Text>
        </div>

        {/* Full-width gig box */}
        <div className="border-2 border-black bg-[#f7f7f7] p-6 shadow-[6px_6px_0_0_#000]">
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16 rounded-none border-2 border-black bg-[#ddd5f3]">
              <Avatar.Fallback className="bg-transparent text-xl text-black">
                {gig.freelancer?.charAt(0) || "A"}
              </Avatar.Fallback>
            </Avatar>

            <div className="flex-1">
              <Text as="h2" className="text-4xl font-bold leading-tight text-black">
                {gig.title}
              </Text>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                <Text as="span" className="text-xl text-black">
                  {gig.freelancer}
                </Text>

                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Text as="span" className="text-xl text-[#5f43b2]">
                    {gig.rating}
                  </Text>
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[#5f43b2]" />
                  <Text as="span" className="text-xl text-[#5f43b2]">
                    {gig.delivery}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal summary section */}
        <div className="border-2 border-black bg-[#f7f7f7] p-6 shadow-[6px_6px_0_0_#000]">
          <Text as="h2" className="text-3xl font-bold text-black">
            Order Summary
          </Text>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            {/* Left: preview + description */}
            <div className="space-y-4">
              <div className="border-2 border-black bg-[#dfe5f4] p-4 shadow-[4px_4px_0_0_#000]">
                <div className="border-[4px] border-black bg-[#d7dff0] p-4">
                  <div className="mb-3 space-y-2">
                    <div className="h-3 w-[42%] bg-[#c4cee8]" />
                    <div className="h-3 w-[30%] bg-[#cfd8ee]" />
                  </div>

                  <div className="flex h-[220px] items-center justify-center bg-[#6679a7]">
                    <Text as="span" className="text-4xl font-bold tracking-wide text-white">
                      GIG PREVIEW
                    </Text>
                  </div>

                  <div className="mt-3 flex gap-3">
                    <div className="h-4 w-[120px] bg-[#a78bfa]" />
                    <div className="h-4 w-[85px] bg-[#a78bfa]" />
                  </div>
                </div>
              </div>

              <div className="border-2 border-black bg-[#ece8f8] p-4">
                <Text as="h3" className="text-lg font-semibold text-black">
                  Description
                </Text>

                <Text as="p" className="mt-2 text-base leading-7 text-[#5f43b2]">
                  {gig.description}
                </Text>
              </div>
            </div>

            {/* Right: details + requirements + total */}
            <div className="space-y-5">
              <div className="border-2 border-black bg-[#ece8f8] p-5">
                <Text as="h3" className="text-2xl font-bold text-black">
                  Order Details
                </Text>

                <div className="mt-5">
                  <Text as="label" className="mb-3 block text-lg text-black">
                    Delivery Time
                  </Text>
                  <div className="flex h-14 items-center border-2 border-black bg-[#f7f7f7] px-4 text-lg text-black">
                    {gig.delivery}
                  </div>
                </div>

                <div className="mt-5">
                  <Text as="label" className="mb-3 block text-lg text-black">
                    Number of Orders
                  </Text>

                  <div className="flex h-14 w-[220px] items-center justify-between border-2 border-black bg-[#f7f7f7] px-3">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-2xl text-black"
                    >
                      -
                    </button>

                    <Text as="span" className="text-xl font-medium text-black">
                      {quantity}
                    </Text>

                    <button
                      type="button"
                      onClick={handleIncrease}
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-2xl text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

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
              </div>

              <div className="border-2 border-black bg-[#ece8f8] p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <Text as="span" className="text-[#5f43b2]">
                      Base Price
                    </Text>
                    <Text as="span" className="font-semibold text-black">
                      ${gig.price}
                    </Text>
                  </div>

                  <div className="flex items-center justify-between text-lg">
                    <Text as="span" className="text-[#5f43b2]">
                      Quantity
                    </Text>
                    <Text as="span" className="font-semibold text-black">
                      {quantity}
                    </Text>
                  </div>

                  <div className="flex items-center justify-between text-lg">
                    <Text as="span" className="text-[#5f43b2]">
                      Delivery
                    </Text>
                    <Text as="span" className="font-semibold text-black">
                      {gig.delivery}
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
                  className="mt-6 flex h-14 w-full items-center justify-center border-2 border-black bg-[#c9a7ff] text-lg font-semibold text-black shadow-[3px_3px_0_0_#000] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PlaceOrderPage;
