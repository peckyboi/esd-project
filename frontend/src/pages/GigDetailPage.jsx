import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import GigImage from "@/components/GigImage";
import FreelancerCard from "@/components/FreelancerCard";
import ReviewList from "@/components/ReviewList";
import GigDescription from "@/components/GigDescription";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Loader2 } from "lucide-react";
import { fetchGigById } from "@/api/browseGigApi";

function GigDetailPage() {
    const { gigId } = useParams();
    
    const [gig, setGig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const orderStatus = null; // can be null, in_progress or delivered

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchGigById(gigId);
                if (!data) setError("Gig not found.");
                else setGig(data);
            } catch (err) {
                setError("Could not load gig details. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [gigId]);

    if (loading) {
        return (
            <main className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin" size={36} />
            </main>
        );
    }
    
    if (error || !gig) { 
        return (
          <main className="flex flex-col items-center justify-center py-20">
            <Text as="h2" className="mb-4 text-2xl font-semibold">
              {error || "Gig not found."}
            </Text>
            <Link to={`/`}>
              <Button variant="outline">← Back to Homepage</Button>
            </Link>
          </main>
        );
    }


    return (
        <main className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-6xl space-y-6">

                <Link to={`/`}>
                    <Button variant="outline">← Back to Homepage</Button>
                </Link>

                <Text as="h1" className="mt-6">{gig.title}</Text>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <GigImage image={gig.image_url} />
                    <FreelancerCard
                        name={gig.freelancer_name}
                        avatar={gig.avatar}
                        rating={gig.average_rating}
                        price={gig.price}
                        delivery_days={gig.delivery_days}
                        category={gig.category}
                        orderStatus={orderStatus}
                    />
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
                        <Button variant="outline">Dispute Order</Button>
                        <Button>Confirm Order</Button>
                    </div>
                )}

                <ReviewList reviews={gig.review_list} />

            </div>
        </main>
    );
}
export default GigDetailPage;