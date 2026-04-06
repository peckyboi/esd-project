import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/retroui/Input";
import { Select } from "@/components/retroui/Select";
import { Text } from "@/components/retroui/Text";
import GigCard from "@/components/GigCard";
import { Loader2 } from "lucide-react";
import { fetchGigs, fetchCategories, fetchGigById } from "@/api/browseGigApi";

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
  const queryClient = useQueryClient();
  const [priceRange, setPriceRange] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");

  const filterConfig = [
    {
      id: "price",
      label: "Price",
      options: ["All", "Under $100", "$100-$300", "$300-$600", "$600-$1000"],
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

  const { data: categoryOptions = ["All"] } = useQuery({
    queryKey: ["gig-categories"],
    queryFn: fetchCategories,
    initialData: ["All"],
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: gigs = [],
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["gigs", category, debouncedSearch],
    queryFn: () =>
      fetchGigs({
        category: category === "All" ? null : category,
        search: debouncedSearch,
      }),
    staleTime: 60 * 1000,
  });

  const filteredGigs = gigs.filter((gig) => {
    const priceMap = {
      "Under $100": [0, 99],
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
        <section className="p-5">
          <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
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

          {isError && (
            <div className="py-10 text-center text-destructive">
              <Text as ="p">Could not load gigs. Please try again.</Text>
            </div>
          )}

          {!loading && !isError && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredGigs.map((gig) => (
                <GigCard
                  key={gig.gig_id}
                  gig={gig}
                  onPrefetch={(gigId) => {
                    if (!gigId) return;
                    queryClient.prefetchQuery({
                      queryKey: ["gig", Number(gigId)],
                      queryFn: () => fetchGigById(gigId),
                      staleTime: 5 * 60 * 1000,
                    });
                  }}
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
