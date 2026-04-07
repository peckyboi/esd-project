const BROWSE_GIG_API_BASE_URL = "http://localhost:8087";

export async function fetchGigs({ category, search, skip = 0, limit = 20 } = {}) {
    const params = new URLSearchParams({skip, limit});
    if (category) params.append("category", category);
    if (search) params.append("search", search);

    const response = await fetch(`${BROWSE_GIG_API_BASE_URL}/browse/gigs?${params}`);
    if (!response.ok) throw new Error(`Failed to fetch gigs: ${response.status}`);
    return response.json();
}

export async function fetchGigById(gigId) {
    const response = await fetch(`${BROWSE_GIG_API_BASE_URL}/browse/gigs/${gigId}`);
    if (response.status === 404) return null; 
    if (!response.ok) throw new Error(`Failed to fetch gig ${gigId}: ${response.status}`);
    return response.json();
}

export async function fetchCategories() {
    const pageSize = 100;
    let skip = 0;
    const categories = new Set();

    while (true) {
        const response = await fetch(
            `${BROWSE_GIG_API_BASE_URL}/browse/gigs?skip=${skip}&limit=${pageSize}`
        );
        if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);

        const data = await response.json();
        const gigs = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

        gigs.forEach((gig) => {
            const category = String(gig?.category || gig?.Category || "").trim();
            if (category) categories.add(category);
        });

        if (gigs.length < pageSize) break;
        skip += pageSize;
    }

    return ["All", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
}
