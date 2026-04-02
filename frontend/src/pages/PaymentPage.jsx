import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Text } from "@/components/retroui/Text";
import summaryImg from "@/assets/_.jpeg";

function PaymentPage() {
  const location = useLocation();

  const gig = location.state?.gig || {
    freelancer: "Alice Williams",
    delivery: "3 days (active)",
    price: 495
  };

  const quantity = location.state?.quantity || 1;
  const totalPrice = location.state?.totalPrice || gig.price * quantity;

  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [saveCard, setSaveCard] = useState(true);

  const order = {
    basePackage: gig.price,
    delivery: gig.delivery,
    total: totalPrice
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="max-w-[700px]">
            <div className="mb-8 flex w-fit rounded-xl border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setPaymentMethod("credit-card")}
                className={`h-[48px] min-w-[150px] rounded-lg px-6 text-base font-semibold transition ${
                  paymentMethod === "credit-card"
                    ? "bg-card text-foreground"
                    : "bg-transparent text-muted-foreground"
                }`}
              >
                Credit Card
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`h-[48px] min-w-[150px] rounded-lg px-6 text-base font-semibold transition ${
                  paymentMethod === "paypal"
                    ? "bg-card text-foreground"
                    : "bg-transparent text-muted-foreground"
                }`}
              >
                PayPal
              </button>
            </div>

            <div className="mb-5">
              <Text as="label" className="mb-2 block text-sm font-medium">
                Card Number
              </Text>
              <input
                type="text"
                defaultValue="1234 5678 9101 0000"
                className="h-[56px] w-full rounded-xl border border-border bg-background px-4 text-base outline-none"
              />
            </div>

            <div className="mb-5 grid grid-cols-2 gap-6">
              <div>
                <Text as="label" className="mb-2 block text-sm font-medium">
                  Expiration Date
                </Text>
                <input
                  type="text"
                  defaultValue="MM / YY"
                  className="h-[56px] w-full rounded-xl border border-border bg-background px-4 text-base outline-none"
                />
              </div>

              <div>
                <Text as="label" className="mb-2 block text-sm font-medium">
                  CVV
                </Text>
                <input
                  type="password"
                  defaultValue="123"
                  className="h-[56px] w-full rounded-xl border border-border bg-background px-4 text-base outline-none"
                />
              </div>
            </div>

            <div className="mb-5">
              <Text as="label" className="mb-2 block text-sm font-medium">
                Name on Card
              </Text>
              <input
                type="text"
                defaultValue={gig.freelancer}
                className="h-[56px] w-full rounded-xl border border-border bg-background px-4 text-base outline-none"
              />
            </div>

            <div className="mb-5">
              <input
                type="text"
                defaultValue="United States"
                className="h-[56px] w-full rounded-xl border border-border bg-background px-4 text-base outline-none"
              />
            </div>

            <label className="mb-8 flex cursor-pointer items-center gap-3">
              <button
                type="button"
                onClick={() => setSaveCard((prev) => !prev)}
                className={`h-4 w-4 rounded-full ${
                  saveCard ? "bg-orange-400" : "bg-muted"
                }`}
              />
              <Text as="span" className="text-sm text-muted-foreground">
                Save this card for future purchases
              </Text>
            </label>

            <div className="mb-10 flex items-center gap-4 text-sm text-muted-foreground">
              <span>VISA</span>
              <span>Mastercard</span>
              <span>PayPal</span>
              <span>Amex</span>
            </div>

            <Text as="p" className="text-sm text-muted-foreground">
              Encrypted Checkout • SSL Secured • Money-back Guarantee
            </Text>
          </section>

          <aside className="flex justify-start lg:justify-center">
            <div className="w-full max-w-[380px] rounded-2xl border border-border bg-background p-5">
              <div className="mb-4 h-[240px] w-full overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={summaryImg}
                  alt="Order summary"
                  className="h-full w-full object-cover"
                />
              </div>

              <Text className="mb-5 text-center text-xl font-semibold">
                Order Summary
              </Text>

              <div className="mb-8 space-y-4">
                <div className="flex justify-between">
                  <Text>Base Package</Text>
                  <Text>${order.basePackage}</Text>
                </div>

                <div className="flex justify-between">
                  <Text>Delivery</Text>
                  <Text>{order.delivery}</Text>
                </div>

                <div className="flex justify-between font-medium">
                  <Text>Total</Text>
                  <Text>${order.total} USD</Text>
                </div>
              </div>

              <button
                type="button"
                className="mb-4 h-[58px] w-full rounded-full bg-[#ff6f73] text-base font-semibold text-white transition hover:opacity-90"
              >
                Pay ${order.total}
              </button>

              <div className="flex h-[50px] items-center justify-center rounded-xl border border-border bg-card">
                <Text className="text-sm">SSL secured checkout</Text>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PaymentPage;
