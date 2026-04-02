import FreelancerCard from "@/components/FreelancerCard";
import ReviewList from "@/components/ReviewList";
import GigDescription from "@/components/GigDescription";
import { Button } from "@/components/retroui/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Text } from "@/components/retroui/Text";

function GigDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const gig = location.state?.gig || {
    id: 1,
    title: "SaaS Web App Development",
    description:
      "I will develop a custom SaaS web application tailored to your business needs with modern design, secure authentication, and robust functionality.",
    freelancer: "Alice W",
    rating: 4.8,
    delivery: "2 days delivery",
    price: 495,
    category: "Web Development"
  };

  const orderStatus = null;

  const handleOrderNow = () => {
    navigate("/place-order", { state: { gig } });
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to="/home">
          <Button variant="outline">← Back to Homepage</Button>
        </Link>

        <Text as="h1" className="mt-6">
          {gig.title}
        </Text>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Gig Preview only */}
          <div className="border-2 border-black bg-[#dfe5f4] p-6 shadow-[4px_4px_0_0_#000]">
            <div className="border-[6px] border-black bg-[#d7dff0] p-8">
              <div className="mb-4 space-y-3">
                <div className="h-4 w-[38%] bg-[#c4cee8]" />
                <div className="h-4 w-[28%] bg-[#cfd8ee]" />
              </div>

              <div className="flex h-[320px] items-center justify-center bg-[#6679a7]">
                <Text as="span" className="text-5xl font-bold tracking-wide text-white">
                  GIG PREVIEW
                </Text>
              </div>

              <div className="mt-4 flex gap-4">
                <div className="h-5 w-[180px] bg-[#a78bfa]" />
                <div className="h-5 w-[120px] bg-[#a78bfa]" />
              </div>
            </div>
          </div>

          <FreelancerCard gig={gig} />
        </div>

        <GigDescription description={gig.description} />

        {orderStatus === null && <Button onClick={handleOrderNow}>Order Now</Button>}

        {orderStatus === "in_progress" && <Button>Mark as Delivered</Button>}

        {orderStatus === "delivered" && (
          <div className="flex gap-3">
            <Button variant="outline">Dispute Order</Button>
            <Button>Confirm Order</Button>
          </div>
        )}

        <ReviewList />
      </div>
    </main>
  );
}

export default GigDetailPage;