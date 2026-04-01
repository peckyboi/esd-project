import { Input } from "@/components/retroui/Input";
import { Select } from "@/components/retroui/Select";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Link } from "react-router-dom";
import GigCard from "@/components/GigCard";
import { User, MessageSquare } from "lucide-react";

// Filter config drives the dropdowns so we don't hardcode repeated JSX blocks.
// Temporary data, will be linked later, currently it is for visuals
const filterConfig = [
  {
    id: "category",
    label: "Category",
    options: ["Web Design", "UI/UX", "Backend", "Marketing"]
  },
  {
    id: "price",
    label: "Price",
    options: ["$100-$300", "$300-$600", "$600-$1000"]
  },
  {
    id: "delivery",
    label: "Delivery",
    options: ["Fast (< 3 days)", "3-7 days", "1-2 weeks"]
  }
];

// Card data drives the grid so each gig card uses one reusable component.
const gigs = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  title: "Full-Stack Web App Development",
  price: 250,
  delivery: "2 days delivery",
  freelancer: "Alice W",
  rating: 4.8
}));

function FilterSelect({ label, options }) {
  return (
    <label className="flex flex-col gap-1">
      <Text as="p" className="text-sm text-muted-foreground">
        {label}
      </Text>
      <Select defaultValue={options[0]}>
        <Select.Trigger className="h-12 w-full min-w-0 text-lg">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </label>
  );
}

function HomePage() {
  return (
    <main className="min-h-screen w-full">
      <section className="min-h-screen w-full overflow-hidden bg-background">
        {/* Top nav row */}
        <header className="flex items-center justify-between border-b border-border/60 bg-black/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <Text as="p" className="text-2xl font-semibold">
              Freelance Gig Service
            </Text>
          </div>
          <nav className="flex items-center gap-4 text-lg">
            <Link
              to="/profile"
              className="text-foreground no-underline"
              title="Profile"
              aria-label="Profile"
            >
              <Avatar className="h-10 w-10 border-2 border-border bg-card transition-colors hover:bg-muted">
                <Avatar.Fallback className="bg-transparent">
                  <User size={22} />
                </Avatar.Fallback>
              </Avatar>
            </Link>
            <a
              className="text-foreground no-underline"
              href="#"
              title="Messages"
              aria-label="Messages"
            >
              <Avatar className="h-10 w-10 border-2 border-border bg-card transition-colors hover:bg-muted">
                <Avatar.Fallback className="bg-transparent">
                  <MessageSquare size={22} />
                </Avatar.Fallback>
              </Avatar>
            </a>
          </nav>
        </header>

        <section className="p-5">
          {/* Logic to be implemented later */}
          <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
            <label className="flex flex-col gap-1">
              <Text as="p" className="text-sm text-muted-foreground">
                Search
              </Text>
              <Input className="h-12 text-lg" placeholder="search for any gig" />
            </label>
            {filterConfig.map((filter) => (
              <FilterSelect
                key={filter.id}
                label={filter.label}
                options={filter.options}
              />
            ))}
          </section>

          {/* Gig cards also render from one array, so there is no hardcoded repetition */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </section>
        </section>
      </section>
    </main>
  );
}

export default HomePage;
