import GigImage from "@/components/GigImage";
import FreelancerCard from "@/components/FreelancerCard";
import ReviewList from "@/components/ReviewList";
import GigDescription from "@/components/GigDescription";
import { Button } from "@/components/retroui/Button";
import { Link } from "react-router-dom";
import { Text } from "@/components/retroui/Text";

function GigDetailPage() {

    const gig = {
        title: "SaaS Web App Development",
        image: "/src/assets/gig-placeholder.svg",
        description:
            "I will develop a custom SaaS web application tailored to your business needs with modern design, secure authentication, and robust functionality.",
    };

    const orderStatus = 'delivered'; // can be null, in_progress or delivered

    return (
        <main className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-6xl space-y-6">

                <Link to={`/`}>
                    <Button variant="outline" className="bg-white">← Back to Homepage</Button>
                </Link>

                <Text as="h1" className="mt-6">{gig.title}</Text>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <GigImage image={gig.image} />
                    <FreelancerCard />
                </div>

                <GigDescription description={gig.description} />

                {orderStatus === null && (
                    <Button>Order Now</Button>
                )}

                {orderStatus === "in_progress" && (
                    <Button>Mark as Delivered</Button>
                )}

                {orderStatus === "delivered" && (
                    <div className="flex gap-3">
                        <Link to={`/chat`}>
                            <Button variant="outline" className="bg-white">Dispute Order</Button>
                        </Link>
                        <Button>Confirm Order</Button>
                    </div>
                )}

                <ReviewList />

            </div>
        </main>
    );
}
export default GigDetailPage;