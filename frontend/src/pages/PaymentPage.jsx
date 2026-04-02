import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Text } from "@/components/retroui/Text";
import { Check } from "lucide-react";
import { holdPayment } from "@/api/paymentApi";
import { updateOrderPaymentResult } from "@/api/orderApi";

function PaymentPage() {
  const location = useLocation();

  const gig = location.state?.gig || {
    title: "SaaS Web App Development",
    freelancer: "Alice W",
    delivery: "2 days delivery",
    price: 495
  };

  const quantity = location.state?.quantity || 1;
  const totalPrice = location.state?.totalPrice || gig.price * quantity;
  const orderId = location.state?.orderId || null;

  const [saveCard, setSaveCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [flowError, setFlowError] = useState("");

  const handlePay = async () => {
    setIsSubmitting(true);
    setFlowError("");
    setPaymentResult(null);

    try {
      if (!orderId) {
        throw new Error("Missing order id. Create the order first.");
      }

      const payment = await holdPayment({
        orderId,
        clientId: gig.client_id || 1,
        freelancerId: gig.freelancer_id || gig.user_id || 1,
        amount: totalPrice,
      });

      const updatedOrder = await updateOrderPaymentResult({
        orderId,
        paymentId: payment.payment_id,
        paymentStatus: payment.status,
      });

      setPaymentResult({ payment, updatedOrder });
    } catch (err) {
      setFlowError(err.message || "Payment flow failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Text as="h1" className="text-5xl font-bold text-black">
            Payment
          </Text>
          <Text as="p" className="mt-3 text-lg text-[#5f43b2]">
            Complete your order securely using your credit card details.
          </Text>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="border-2 border-black bg-[#f7f7f7] p-6 shadow-[6px_6px_0_0_#000]">
            <div className="border-2 border-black bg-[#ece8f8] p-5">
              <Text as="h2" className="text-2xl font-bold text-black">
                Credit Card
              </Text>

              <div className="mt-6 space-y-5">
                <div>
                  <Text as="label" className="mb-3 block text-lg text-black">
                    Card Number
                  </Text>
                  <input
                    type="text"
                    placeholder="1234 5678 9101 0000"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    className="h-14 w-full border-2 border-black bg-[#f7f7f7] px-4 text-lg text-black outline-none"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Text as="label" className="mb-3 block text-lg text-black">
                      Expiration Date
                    </Text>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      className="h-14 w-full border-2 border-black bg-[#f7f7f7] px-4 text-lg text-black outline-none"
                    />
                  </div>

                  <div>
                    <Text as="label" className="mb-3 block text-lg text-black">
                      CVV
                    </Text>
                    <input
                      type="password"
                      placeholder="123"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      className="h-14 w-full border-2 border-black bg-[#f7f7f7] px-4 text-lg text-black outline-none"
                    />
                  </div>
                </div>

                <div>
                  <Text as="label" className="mb-3 block text-lg text-black">
                    Name on Card
                  </Text>
                  <input
                    type="text"
                    placeholder="Full Name"
                    autoComplete="cc-name"
                    className="h-14 w-full border-2 border-black bg-[#f7f7f7] px-4 text-lg text-black outline-none"
                  />
                </div>

                <div>
                  <Text as="label" className="mb-3 block text-lg text-black">
                    Country
                  </Text>
                  <input
                    type="text"
                    placeholder="Country"
                    autoComplete="country"
                    className="h-14 w-full border-2 border-black bg-[#f7f7f7] px-4 text-lg text-black outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSaveCard((prev) => !prev)}
                  className="flex items-center gap-4 pt-2"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center border-2 border-black ${
                      saveCard ? "bg-[#ff9800]" : "bg-[#f7f7f7]"
                    }`}
                  >
                    {saveCard && (
                      <Check className="h-5 w-5 text-black" strokeWidth={3} />
                    )}
                  </div>

                  <Text as="span" className="text-lg text-[#5f43b2]">
                    Save this card for future purchases
                  </Text>
                </button>

                <Text as="p" className="pt-2 text-base text-[#5f43b2]">
                  Encrypted Checkout • SSL Secured • Money-back Guarantee
                </Text>
              </div>
            </div>
          </section>

          <aside className="border-2 border-black bg-[#f7f7f7] p-6 shadow-[6px_6px_0_0_#000]">
            <Text as="h2" className="text-3xl font-bold text-black">
              Order Summary
            </Text>

            <div className="mt-5 border-2 border-black bg-[#dfe5f4] p-4 shadow-[4px_4px_0_0_#000]">
              <div className="border-[4px] border-black bg-[#d7dff0] p-4">
                <div className="mb-3 space-y-2">
                  <div className="h-3 w-[42%] bg-[#c4cee8]" />
                  <div className="h-3 w-[30%] bg-[#cfd8ee]" />
                </div>

                <div className="flex h-[180px] items-center justify-center bg-[#6679a7]">
                  <Text className="text-3xl font-bold text-white">
                    GIG PREVIEW
                  </Text>
                </div>

                <div className="mt-3 flex gap-3">
                  <div className="h-4 w-[120px] bg-[#a78bfa]" />
                  <div className="h-4 w-[85px] bg-[#a78bfa]" />
                </div>
              </div>
            </div>

            <div className="mt-5 border-2 border-black bg-[#ece8f8] p-5">
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <Text className="text-[#5f43b2]">Base Price</Text>
                  <Text className="font-semibold text-black">
                    ${gig.price}
                  </Text>
                </div>

                <div className="flex justify-between text-lg">
                  <Text className="text-[#5f43b2]">Quantity</Text>
                  <Text className="font-semibold text-black">
                    {quantity}
                  </Text>
                </div>

                <div className="flex justify-between text-lg">
                  <Text className="text-[#5f43b2]">Delivery</Text>
                  <Text className="font-semibold text-black">
                    {gig.delivery}
                  </Text>
                </div>

                <div className="border-t-2 border-black pt-4 flex justify-between">
                  <Text className="text-2xl font-bold text-black">
                    Total
                  </Text>
                  <Text className="text-2xl font-bold text-black">
                    ${totalPrice}
                  </Text>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={isSubmitting}
                className="mt-6 w-full h-14 border-2 border-black bg-[#c9a7ff] text-black text-lg font-semibold shadow-[3px_3px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : `Pay $${totalPrice}`}
              </button>

              {flowError && (
                <Text as="p" className="mt-4 text-sm text-red-600">
                  {flowError}
                </Text>
              )}

              {paymentResult && (
                <div className="mt-4 rounded border-2 border-black bg-white p-3 text-sm">
                  <Text as="p">
                    Order ID: {paymentResult.updatedOrder?.id || orderId}
                  </Text>
                  <Text as="p">
                    Payment ID: {paymentResult.payment?.payment_id}
                  </Text>
                  <Text as="p">
                    Order Status: {paymentResult.updatedOrder?.status}
                  </Text>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PaymentPage;
