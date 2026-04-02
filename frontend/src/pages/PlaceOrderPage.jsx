import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Star } from "lucide-react";
import summaryImg from "@/assets/_.jpeg";

function PlaceOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const fallbackGig = {
    freelancer: "Alice Williams",
    rating: 4.7,
    description:
      "I will design a beautiful, modern UI for desktop, iOS, or Android apps using Figma",
    delivery: "3 days (active)",
    price: 495
  };

  const gig = location.state?.gig || fallbackGig;

  const [quantity, setQuantity] = useState(1);
  const [requirements, setRequirements] = useState("");

  const totalPrice = useMemo(() => gig.price * quantity, [gig.price, quantity]);

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
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
    <main className="min-h-screen w-full bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <section>
            <Text as="h1" className="mb-10 text-4xl font-semibold">
              Place Order
            </Text>

            <div className="mb-10 flex items-start gap-4">
              <Avatar className="h-12 w-12 border border-border bg-muted">
                <Avatar.Fallback className="bg-transparent text-foreground">
                  AW
                </Avatar.Fallback>
              </Avatar>

              <div>
                <Text as="p" className="text-xl font-medium">
                  {gig.freelancer}
                </Text>

                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Text as="span" className="text-sm">
                    {gig.rating}
                  </Text>
                </div>

                <Text
                  as="p"
                  className="mt-3 max-w-[460px] text-sm leading-6 text-muted-foreground"
                >
                  {gig.description}
                </Text>
              </div>
            </div>

            <div className="mb-8">
              <Text as="p" className="mb-3 text-sm font-medium">
                Delivery Time
              </Text>

              <div className="flex h-[56px] w-full max-w-[760px] items-center rounded-xl border border-border bg-background px-2">
                <button
                  type="button"
                  className="h-[40px] min-w-[190px] rounded-lg border border-orange-400 bg-transparent px-6 text-sm font-medium"
                >
                  {gig.delivery}
                </button>
              </div>
            </div>

            <div className="mb-12 flex w-full max-w-[760px] items-center justify-between gap-6">
              <Text as="p" className="text-sm font-medium">
                Number
              </Text>

              <div className="flex h-[56px] w-[220px] items-center justify-between rounded-xl border border-border bg-background px-6">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="text-2xl font-semibold transition hover:opacity-70"
                >
                  -
                </button>

                <Text as="span" className="text-xl font-medium">
                  {quantity}
                </Text>

                <button
                  type="button"
                  onClick={handleIncrease}
                  className="text-2xl font-semibold transition hover:opacity-70"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-8">
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Enter any specific project requirements here..."
                className="h-[130px] w-full max-w-[600px] resize-none rounded-xl border border-border bg-background px-5 py-4 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              className="flex h-[60px] w-full max-w-[700px] items-center justify-center rounded-full bg-[#ff6f73] px-8 text-lg font-semibold text-white transition hover:opacity-90"
            >
              Place Order (${totalPrice})
            </button>

            <div className="mt-5 flex w-full max-w-[700px] items-center justify-center gap-5 text-sm text-muted-foreground">
              <span>PayPal</span>
              <span>VISA</span>
              <span>MasterCard</span>
              <span>Apple Pay</span>
            </div>
          </section>

          <aside className="flex justify-start lg:justify-end">
            <div className="w-full max-w-[360px] rounded-2xl border border-border bg-background p-5">
              <Text as="h2" className="mb-5 text-xl font-semibold">
                Order Summary
              </Text>

              <div className="mb-6 h-[230px] w-full overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={summaryImg}
                  alt="Order summary preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between">
                <Text as="p" className="font-medium">
                  Total
                </Text>
                <Text as="p" className="font-medium">
                  ${totalPrice} USD
                </Text>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PlaceOrderPage;
