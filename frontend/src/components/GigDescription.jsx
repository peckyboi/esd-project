import { Text } from "@/components/retroui/Text";

function GigDescription({ description }) {
    return (
        <section className="space-y-4">
            <Text as="h2" className="text-xl font-semibold">
                Description
            </Text>

            <Text as="p" className="text-muted-foreground">
                {description}
            </Text>
        </section>
    );
}

export default GigDescription;