"use client";

import AutoSlider from "@/components/AutoSlider";
import { IconTile } from "@/components/icons";
import {
  ShieldCheckIcon,
  UsersIcon,
  TruckIcon,
  HeadphonesIcon,
} from "@/components/icons";

const VALUES = [
  {
    icon: ShieldCheckIcon,
    title: "Authorized & Genuine",
    desc: "Every product we supply is 100% genuine Samsung with full manufacturer warranty. We are an official Samsung Business Display partner with an ISO 9001:2015-certified quality management system.",
  },
  {
    icon: UsersIcon,
    title: "Client-First Approach",
    desc: "We don't push products — we understand your space, use case, and budget, then recommend exactly what's right for you.",
  },
  {
    icon: TruckIcon,
    title: "End-to-End Service",
    desc: "From pre-sales consultation to post-installation support, we manage the entire journey. One point of contact, zero headaches.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    desc: "A responsive support team that resolves issues fast, with guaranteed response SLAs for enterprise accounts.",
  },
];

function PrincipleCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="group bg-white p-7 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <IconTile className="mb-6">
          <Icon className="text-current" size={22} />
        </IconTile>
        <h3 className="font-bold text-gray-900 text-lg mb-2.5 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function PrinciplesSlider() {
  return (
    <>
      {/* Desktop & Tablet: 4-Column Grid View */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALUES.map((val) => (
          <PrincipleCard key={val.title} {...val} />
        ))}
      </div>

      {/* Mobile: Horizontal Auto-Moving Slider */}
      <div className="md:hidden">
        <AutoSlider
          slideWidth="w-[88vw] sm:w-[360px]"
          slideMaxWidth="max-w-md"
          interval={3800}
        >
          {VALUES.map((val) => (
            <PrincipleCard key={val.title} {...val} />
          ))}
        </AutoSlider>
      </div>
    </>
  );
}
