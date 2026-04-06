import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Link } from "react-router-dom";
import gigPlaceholder from "@/assets/gig-placeholder.svg";

export default function GigCard({ gig, onClick, onPrefetch }) {
  const handlePrefetch = () => {
    if (onPrefetch) onPrefetch(gig.gig_id);
  };

  return (
    <Card onClick={onClick} onMouseEnter={handlePrefetch} className="w-full rounded-none">
      <Card.Content className="flex h-full min-h-[300px] flex-col p-5">
        <img
          src={gig.image_url || gigPlaceholder}
          alt="Gig placeholder"
          className="mb-3 h-32 w-full rounded-sm border-2 border-border object-cover"
        />

        <Text as="h4" className="mb-2 text-lg">
          {gig.title}
        </Text>

        <div className="flex items-center gap-2">
          <Text as="p" className="text-xl font-semibold">
            ${gig.price}
          </Text>
          <Text as="p" className="text-sm text-muted-foreground">
            {gig.delivery_days} day{gig.delivery_days > 1 ? "s" : ""} delivery
          </Text>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <Avatar.Fallback className="text-xs">
                {gig.avatar ? (<img src={gig.avatar} alt={gig.freelancer_name}
                />) : (gig.freelancer_name.charAt(0))}
              </Avatar.Fallback>
            </Avatar>

            <Text as="p" className="text-sm">
              {gig.freelancer_name}
            </Text>
          </div>

          <Text as="p" className="text-sm">
            ★ {gig.average_rating != null? gig.average_rating.toFixed(1) : "No ratings"}
          </Text>
        </div>

        {/* Navigation */}
        <Link to={`/gig/${gig.gig_id}`} className="mt-auto">
          <Button className="w-full justify-center" onMouseEnter={handlePrefetch}>
            View Gig
          </Button>
        </Link>

      </Card.Content>
    </Card>
  );
}
