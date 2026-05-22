import { Metadata } from "next";
import RoomConfigurator from "@/components/RoomConfigurator";

const URL = "https://www.aplustechsol.com/room-configurator";

export const metadata: Metadata = {
  title: "Room Configurator | Build Your Samsung Meeting Room Bundle",
  description:
    "Tell us your room type and primary goal — get a complete Samsung display bundle (main display + interactive whiteboard + support screens) recommended by Aplus AV integrators.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    title: "Room Configurator | Aplus Technology Solutions",
    description:
      "Get a complete Samsung AV bundle for huddle rooms, boardrooms, training rooms, and auditoriums.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Samsung Meeting Room Configurator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Room Configurator | Aplus Technology Solutions",
    description:
      "Build a Samsung bundle for any meeting room — huddle, boardroom, training, auditorium.",
    images: ["/og-default.png"],
  },
};

export default function RoomConfiguratorPage() {
  return (
    <div className="min-h-screen bg-white">
      <RoomConfigurator />
    </div>
  );
}
