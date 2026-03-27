import { Card } from "@/components/retroui/Card";

function GigImage({ image }) {
    return (

        <Card>
            <Card.Content className="p-0">
                <img
                    src={image}
                    alt="Gig Image"
                />
            </Card.Content>
      </Card>
    );
}
export default GigImage;