"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "WhatsApp",
      icon: <MessageCircle size={15} />,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("share", { method: "copy_link", content_type: "blog" });
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <Share2 size={12} />
        Share
      </span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("share", { method: link.label.toLowerCase(), content_type: "blog" })}
          aria-label={`Share on ${link.label}`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 text-xs font-medium transition-all ${link.color}`}
        >
          {link.icon}
          {link.label}
        </a>
      ))}
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 text-xs font-medium transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
