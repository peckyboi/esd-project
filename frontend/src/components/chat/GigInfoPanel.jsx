import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";

function GigInfoPanel() {
    return (
        <aside className="p-6 flex flex-col gap-3 h-full">
            <Link to="/home" className="mb-3 flex justify-end">
                <Button variant="outline" className="bg-white">← Back to Homepage</Button>
            </Link>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-4">
                <Text as="h4" className="font-semibold text-lg text-foreground">
                    SaaS Web App Development
                </Text>

                <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
                    <Text>Alice W</Text>
                    <Text>$250</Text>
                    <Text>3 days</Text>
                </div>

                <StatusBadge status="disputed" />

                <Text as="p" className="text-xs text-muted-foreground mt-1">
                    Client has raised a dispute. Resolve through chat or issue a refund.
                </Text>
            </div>

            <div className="flex flex-col gap-3">
                <Text className="font-medium text-m font-semibold text-foreground">Actions</Text>
                <Button className="w-full">Resolve via Chat</Button>
                <Button variant="outline" className="w-full bg-white">
                    Issue Refund
                </Button>
                <Text as="p" className="text-xs text-muted-foreground mt-1">
                    Disputes are handled through direct communication.
                    If unresolved, refund is processed.
                </Text>
            </div>
        </aside>
    );
}

export default GigInfoPanel;