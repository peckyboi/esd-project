import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Link } from "react-router-dom";
import gigPlaceholder from "@/assets/gig-placeholder.svg";

export default function GigCard({ gig }) {
  return (
    <Card className="w-full rounded-none">
      <Card.Content className="p-5">
        <img
          src={gigPlaceholder}
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
            {gig.delivery}
          </Text>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <Avatar.Fallback className="text-xs">
                {gig.freelancer[0]}
              </Avatar.Fallback>
            </Avatar>

            <Text as="p" className="text-sm">
              {gig.freelancer}
            </Text>
          </div>

          <Text as="p" className="text-sm">
            ★ {gig.rating}
          </Text>
        </div>

        {/* Navigation */}
        <Link to={`/gig/${gig.id}`}>
          <Button className="w-full justify-center">
            View Gig
          </Button>
        </Link>

      </Card.Content>
    </Card>
  );
}