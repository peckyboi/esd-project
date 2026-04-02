import { useMemo, useState } from "react";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Star } from "lucide-react";
import summaryImg from "@/assets/order-summary.png";

function PlaceOrderPage() {
  const [quantity, setQuantity] = useState(1);
  const [requirements, setRequirements] = useState("");

  const gig = {
    freelancer: "Alice Williams",
    rating: 4.7,
    description:
      "I will design a beautiful, modern UI for desktop, iOS, or Android apps using Figma",
    delivery: "3 days (active)",
    price: 495
  };

  const totalPrice = useMemo(() => gig.price * quantity, [gig.price, quantity]);

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <section className="min-h-screen w-full overflow-hidden bg-background px-8 py-10">
        <div className="mx-auto min-h-[1000px] w-full max-w-[1440px] bg-black px-14 py-12">
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.7fr_0.9fr]">
            <section className="pt-2">
              <Text as="h1" className="mb-12 text-5xl font-semibold text-white">
                Place Order
              </Text>

              <div className="mb-14 flex items-start gap-4">
                <Avatar className="h-12 w-12 border border-white/20 bg-zinc-200">
                  <Avatar.Fallback className="bg-zinc-200 text-transparent">
                    AW
                  </Avatar.Fallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <Text as="p" className="text-xl font-medium text-white">
                      {gig.freelancer}
                    </Text>
                  </div>

                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Text as="span" className="text-sm text-white">
                      {gig.rating}
                    </Text>
                  </div>

                  <Text
                    as="p"
                    className="mt-3 max-w-[420px] text-base leading-6 text-white/75"
                  >
                    {gig.description}
                  </Text>
                </div>
              </div>

              <div className="mb-10">
                <Text as="p" className="mb-4 text-lg font-medium text-white">
                  Delivery Time
                </Text>

                <div className="flex h-[60px] w-full max-w-[760px] items-center bg-white/[0.06] px-2">
                  <button
                    type="button"
                    className="h-[42px] min-w-[190px] border border-orange-400 bg-transparent px-6 text-base font-medium text-white"
                  >
                    {gig.delivery}
                  </button>
                </div>
              </div>

              <div className="mb-20 flex w-full max-w-[760px] items-center justify-between gap-6">
                <Text as="p" className="text-lg font-medium text-white">
                  Number
                </Text>

                <div className="flex h-[54px] w-[210px] items-center justify-between bg-white/[0.06] px-6">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="text-3xl font-semibold text-white transition hover:opacity-70"
                  >
                    -
                  </button>

                  <Text as="span" className="text-2xl font-medium text-white">
                    {quantity}
                  </Text>

                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="text-3xl font-semibold text-white transition hover:opacity-70"
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
                  className="h-[120px] w-full max-w-[580px] resize-none border-none bg-white/[0.06] px-6 py-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                />
              </div>

              <button
                type="button"
                className="flex h-[64px] w-full max-w-[690px] items-center justify-center rounded-full bg-[#ff6f73] px-8 text-[20px] font-semibold text-white transition hover:opacity-90"
              >
                Place Order (${totalPrice})
              </button>

              <div className="mt-5 flex w-full max-w-[690px] items-center justify-center gap-5 text-sm text-white/70">
                <span>PayPal</span>
                <span>VISA</span>
                <span>MasterCard</span>
                <span>Apple Pay</span>
              </div>
            </section>

            <aside className="flex justify-start xl:justify-end">
              <div className="mt-12 w-full max-w-[370px] rounded-[20px] bg-white/[0.08] px-5 py-6">
                <Text as="h2" className="mb-5 text-2xl font-semibold text-white">
                  Order Summary
                </Text>

                <div className="mb-10 h-[250px] w-full overflow-hidden rounded-[4px] bg-[#111827]">
                  <img
                    src={summaryImg}
                    alt="Order summary preview"
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>

                <div className="flex items-center justify-between px-2">
                  <Text as="p" className="text-xl font-medium text-white">
                    Total
                  </Text>
                  <Text as="p" className="text-xl font-medium text-white">
                    ${totalPrice} USD
                  </Text>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PlaceOrderPage;
