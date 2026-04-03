import { Card } from "@/components/retroui/Card";

function GigImage({ image }) {
    return (
      <Card>
        <Card.Content className="p-0">
          <img
            src={image}
            alt="Gig Image"
            className="w-full max-h-[400px] object-cover"
          />
        </Card.Content>
      </Card>
    );
}
export default GigImage;