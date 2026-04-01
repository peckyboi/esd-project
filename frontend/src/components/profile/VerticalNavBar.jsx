import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";

export default function VerticalNavbar({ activeLink, onSelect }) {
    const links = ["About Me", "Status (Active)", "Orders", "Reviews"];

    return (
        <Card className="p-3 flex flex-col gap-2 w-[200px]">
            {links.map((link) => (
                <Button
                    key={link}
                    variant={activeLink === link ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => onSelect(link)}
                >
                    {link}
                </Button>
            ))}
        </Card>
    );
}