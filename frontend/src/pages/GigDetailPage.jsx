import GigImage from "@/components/GigImage";
import FreelancerCard from "@/components/FreelancerCard";
import ReviewList from "@/components/ReviewList";
import GigDescription from "@/components/GigDescription";
import { Button } from "@/components/retroui/Button";
import { Link, useNavigate } from "react-router-dom";
import { Text } from "@/components/retroui/Text";

function GigDetailPage() {
  const navigate = useNavigate();

  const gig = {
    id: 1,
    title: "SaaS Web App Development",
    image: "/src/assets/gig-placeholder.svg",
    description:
      "I will develop a custom SaaS web application tailored to your business needs with modern design, secure authentication, and robust functionality.",
    freelancer: "Alice Williams",
    rating: 4.7,
    delivery: "3 days (active)",
    price: 495
  };

  const orderStatus = null; // can be null, in_progress or delivered

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
          <GigImage image={gig.image} />
          <FreelancerCard />
        </div>

        <GigDescription description={gig.description} />

        {orderStatus === null && (
          <Button onClick={handleOrderNow}>Order Now</Button>
        )}

        {orderStatus === "in_progress" && (
          <Button>Mark as Delivered</Button>
        )}

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