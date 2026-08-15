"use client";

import Link from "next/link";

// Size knobs
const BUTTON_SIZE_CLASS = "h-12 w-12"; // overall button size (padding feel)
const ICON_SIZE_CLASS = "h-8 w-8"; // icon size inside button

function SocialButton({
  href,
  label,
  bgClass,
  children,
}: {
  href: string;
  label: string;
  bgClass: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={[
        "flex items-center justify-center rounded-full shadow-lg",
        "transition-transform hover:scale-[1.03] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
        BUTTON_SIZE_CLASS,
        bgClass,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function HomeSocialFabs() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-4">

      </div>
    </div>
  );
}
