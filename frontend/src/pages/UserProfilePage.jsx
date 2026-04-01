import { useState } from "react";

import ProfileHeader from "@/components/profile/ProfileHeader";
import VerticalNavbar from "@/components/profile/VerticalNavbar";
import AboutMeCard from "@/components/profile/AboutMeCard";
import DashboardBoxes from "@/components/profile/DashboardBoxes";
import RecentOrders from "@/components/profile/RecentOrders";
import LatestReviews from "@/components/profile/LatestReviews";

export default function UserProfilePage() {
    const [activeLink, setActiveLink] = useState("About Me");

    const user = {
        name: "Alexa W.",
        role: "customer",
        rating: 4.8,
        profilePictureUrl:
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
        aboutMe:
            "Hi! I enjoy working with freelancers on creative projects and building great products.",
        ordersPlaced: 12,
        reviewsGiven: 8,
        activeOrders: 3,
    };

    const orders = [
        {
            id: 1,
            gigName: "Website Design",
            status: "In Progress",
            freelancerName: "Alice W",
            price: 500,
            deliveryDays: 7,
        },
        {
            id: 2,
            gigName: "Logo Design",
            status: "Delivered",
            freelancerName: "John D",
            price: 200,
            deliveryDays: 3,
        },
    ];

    const reviews = [
        {
            id: 1,
            gigName: "Website Design",
            content: "Great communication and very professional work!",
        },
        {
            id: 2,
            gigName: "Logo Design",
            content: "Delivered quickly and exceeded expectations.",
        },
        // {
        //     id: 1,
        //     name: "Jane Doe",
        //     rating: 5,
        //     date: "12 Apr 2026",
        //     content: "Great work and very fast delivery!"
        // },
        // {
        //     id: 1,
        //     name: "Alex Warner",
        //     rating: 5,
        //     date: "12 Apr 2026",
        //     content: "He was a beautiful man."
        // }
    ];

    return (
        <div className="p-6 space-y-6">

            <ProfileHeader
                name={user.name}
                role={user.role}
                rating={user.rating}
                profilePictureUrl={user.profilePictureUrl}
            />

            <div className="flex gap-6">

                <VerticalNavbar
                    activeLink={activeLink}
                    onSelect={setActiveLink}
                />

                <div className="flex-1 space-y-6">

                    <AboutMeCard about={user.aboutMe} />

                    <DashboardBoxes
                        ordersPlaced={user.ordersPlaced}
                        reviewsGiven={user.reviewsGiven}
                        activeOrders={user.activeOrders}
                    />

                    <RecentOrders orders={orders} />

                    <LatestReviews
                        role={user.role}
                        reviews={reviews}
                    />

                </div>

            </div>
        </div>
    );
}