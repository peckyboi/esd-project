import { useState } from "react";
import { Text } from "@/components/retroui/Text";
import summaryImg from "@/assets/_.jpeg";

function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [saveCard, setSaveCard] = useState(true);

  const order = {
    basePackage: 495,
    delivery: "3 Days",
    total: 495
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <section className="min-h-screen w-full overflow-hidden bg-background px-8 py-10">
        <div className="mx-auto min-h-[1000px] w-full max-w-[1440px] bg-black px-16 py-14">
          <div className="grid grid-cols-1 gap-16 xl:grid-cols-[1.15fr_0.85fr]">
            
            {/* LEFT SIDE */}
            <section className="max-w-[700px] pt-10">

              {/* Tabs */}
              <div className="mb-10 flex w-fit rounded-[14px] bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit-card")}
                  className={`h-[54px] min-w-[170px] rounded-[12px] px-8 text-[18px] font-semibold transition ${
                    paymentMethod === "credit-card"
                      ? "bg-white/[0.10] text-white"
                      : "bg-transparent text-white"
                  }`}
                >
                  Credit Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`h-[54px] min-w-[170px] rounded-[12px] px-8 text-[18px] font-semibold transition ${
                    paymentMethod === "paypal"
                      ? "bg-white/[0.10] text-white"
                      : "bg-transparent text-white"
                  }`}
                >
                  PayPal
                </button>
              </div>

              {/* Card Number */}
              <div className="mb-5">
                <Text as="label" className="mb-3 block text-[18px] font-medium text-white">
                  Card Number
                </Text>
                <input
                  type="text"
                  defaultValue="1234 5678 9101 0000"
                  className="h-[58px] w-full rounded-[14px] border-none bg-white/[0.05] px-5 text-[18px] text-white outline-none"
                />
              </div>

              {/* Expiry + CVV */}
              <div className="mb-5 grid grid-cols-2 gap-8">
                <div>
                  <Text as="label" className="mb-3 block text-[18px] font-medium text-white">
                    Expiration Date
                  </Text>
                  <input
                    type="text"
                    defaultValue="MM / YY"
                    className="h-[58px] w-full rounded-[14px] border-none bg-white/[0.05] px-5 text-[18px] text-white outline-none"
                  />
                </div>

                <div>
                  <Text as="label" className="mb-3 block text-[18px] font-medium text-white">
                    CVV
                  </Text>
                  <input
                    type="password"
                    defaultValue="123"
                    className="h-[58px] w-full rounded-[14px] border-none bg-white/[0.05] px-5 text-[18px] text-white outline-none"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="mb-5">
                <Text as="label" className="mb-3 block text-[18px] font-medium text-white">
                  Name on Card
                </Text>
                <input
                  type="text"
                  defaultValue="Alice Williams"
                  className="h-[58px] w-full rounded-[14px] border-none bg-white/[0.05] px-5 text-[18px] text-white outline-none"
                />
              </div>

              {/* Country */}
              <div className="mb-5">
                <input
                  type="text"
                  defaultValue="United States"
                  className="h-[58px] w-full rounded-[14px] border-none bg-white/[0.05] px-5 text-[18px] text-white outline-none"
                />
              </div>

              {/* Save Card */}
              <label className="mb-8 flex cursor-pointer items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSaveCard((prev) => !prev)}
                  className={`h-5 w-5 rounded-full ${
                    saveCard ? "bg-orange-400" : "bg-white/20"
                  }`}
                />
                <Text as="span" className="text-[15px] text-white/75">
                  Save this card for future purchases
                </Text>
              </label>

              {/* Payment Brands */}
              <div className="mb-12 flex items-center gap-4 text-[15px] text-white/60">
                <span>VISA</span>
                <span>Mastercard</span>
                <span>PayPal</span>
                <span>Amex</span>
              </div>

              {/* Footer */}
              <Text as="p" className="text-[14px] text-white/40">
                Encrypted Checkout • SSL Secured • Money-back Guarantee
              </Text>
            </section>

            {/* RIGHT SIDE */}
            <aside className="flex justify-start xl:justify-center">
              <div className="w-full max-w-[420px] pt-14">

                {/* SAME IMAGE */}
                <div className="mb-3 h-[290px] w-full overflow-hidden bg-[#111827]">
                  <img
                    src={summaryImg}
                    alt="Order summary"
                    className="h-full w-full object-cover opacity-90"
                  />
                </div>

                <Text className="mb-6 text-center text-[24px] font-semibold text-white">
                  Order Summary
                </Text>

                <div className="mb-10 space-y-4">
                  <div className="flex justify-between">
                    <Text className="text-white">Base Package</Text>
                    <Text className="text-white">${order.basePackage}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text className="text-white">Delivery</Text>
                    <Text className="text-white">{order.delivery}</Text>
                  </div>

                  <div className="flex justify-between font-medium">
                    <Text className="text-white">Total</Text>
                    <Text className="text-white">${order.total} USD</Text>
                  </div>
                </div>

                <button
                  type="button"
                  className="mb-4 h-[60px] w-full rounded-full bg-[#ff6f73] text-lg font-semibold text-white"
                >
                  Pay ${order.total}
                </button>

                <div className="flex h-[50px] items-center justify-center rounded-[12px] bg-white/[0.05]">
                  <Text className="text-white">
                    SSL secured checkout
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

export default PaymentPage;
