"use client";
import Link from "next/link";
import { useRouter } from "next/router";

const navLinks = [
  {
    name: "Admin Inputs",
    href: "/adminInputs",
    heading: "Property Listings Management",
  },
  {
    name: "Auto Calculated",
    href: "/autoCalculated",
    heading: "Auto Calculated Fields",
  },
  {
    name: "AI Summaries",
    href: "/aiSummaries",
    heading: "AI Summaries and Prompts",
  },
  { name: "Reviews", href: "/reviews", heading: "Reviews" },
];

export default function AdminPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const activeLink = router.pathname;
  const activeHead = navLinks.find((link) => activeLink.startsWith(link.href));

  return (
    <div className="mx-45 my-20 max-2xl:mx-20 max-sm:mx-10 max-sm:my-10">
      <div className="border-b-1 border-[#E5E5E5] pb-5">
        <h1 className=" text-6xl max-lg:text-4xl w-full font-bold text-[#101820] mb-10">
          {activeHead && activeHead.heading}
        </h1>
        <nav className="flex flex-row">
          {navLinks.map((link) => {
            const isActive = activeLink.startsWith(link.href);
            return (
              <Link
                key={link.name}
                className={
                  isActive
                    ? "font-bold text-[#101820] border-b-4 border-[#4ea8a1] rounded-sm pb-3 mr-10 max-md:mr-7"
                    : "font-bold mr-10 max-lg:mx-5 text-[#E5E5E5]"
                }
                href={link.href}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
