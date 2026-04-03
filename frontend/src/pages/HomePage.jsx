import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/retroui/Input";
import { Select } from "@/components/retroui/Select";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";
import { Link } from "react-router-dom";
import GigCard from "@/components/GigCard";
import { User, MessageSquare, Loader2 } from "lucide-react";
import { fetchGigs, fetchCategories } from "@/api/browseGigApi";

// Filter config drives the dropdowns so we don't hardcode repeated JSX blocks.
// Temporary data, will be linked later, currently it is for visuals

// Card data drives the grid so each gig card uses one reusable component.
function FilterSelect({ label, options, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <Text as="p" className="text-sm text-muted-foreground">
        {label}
      </Text>
      <Select defaultValue={options[0]} value={value} onValueChange={onChange}>
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
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");
  const [categoryOptions, setCategoryOptions] = useState(["All"]);

  useEffect(() => {
    fetchCategories()
      .then(setCategoryOptions)
      .catch(() => setCategoryOptions(["All"]));
  }, []);

  const filterConfig = [
    {
      id: "price",
      label: "Price",
      options: ["All", "$100-$300", "$300-$600", "$600-$1000"],
    },
    {
      id: "delivery",
      label: "Delivery",
      options: ["All", "Fast (< 3 days)", "3-7 days", "1-2 weeks"],
    },
  ];
  
  // Filter state 
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Data state
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch gigs whenever filters change 
  const loadGigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGigs({
        category: category === "All" ? null : category, search: debouncedSearch
      });
      setGigs(data);
    } catch (err) {
      setError("Could not load gigs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => { loadGigs(); }, [loadGigs]);

  const filteredGigs = gigs.filter((gig) => {
    const priceMap = {
      "$100-$300": [100, 300],
      "$300-$600": [300, 600],
      "$600-$1000": [600, 1000],
    };
    if (priceRange !== "All") {
      const [min, max] = priceMap[priceRange];
      if (gig.price < min || gig.price > max) return false;
    }
  
    const deliveryMap = {
      "Fast (< 3 days)": [0, 2],
      "3-7 days": [3, 7],
      "1-2 weeks": [8, 14],
    };
    if (deliveryFilter !== "All") {
      const [min, max] = deliveryMap[deliveryFilter];
      if (gig.delivery_days < min || gig.delivery_days > max) return false;
    }

    return true;
  });

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
          <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
            <label className="flex flex-col gap-1">
              <Text as="p" className="text-sm text-muted-foreground">
                Search
              </Text>
              <Input
                className="h-12 text-lg"
                placeholder="search for any gig"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <FilterSelect
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />
            {/* Price and delivery filters are UI-only for now — 
                add state + backend params when your API supports them */}
            <FilterSelect
              label="Price"
              options={filterConfig[0].options} value={priceRange} onChange={setPriceRange} />
            <FilterSelect
              label="Delivery"
              options={filterConfig[1].options} value={deliveryFilter} onChange={setDeliveryFilter} />
          </section>

          
          {/* Gig cards also render from one array, so there is no hardcoded repetition */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin" size={36} />
            </div>
          )}

          {error && (
            <div className="py-10 text-center text-destructive">
              <Text as ="p">{error}</Text>
            </div>
          )}

          {!loading && !error && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredGigs.map((gig) => (
                <GigCard
                  key={gig.gig_id}
                  gig={gig}
                  onClick={() => navigate(`/gig/${gig.gig_id}`)}
                />
              ))}
            </section>
          )}
        </section>

      </section>
    </main>
  );
}

export default HomePage;
