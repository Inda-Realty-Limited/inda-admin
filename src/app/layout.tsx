"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeLink = usePathname();
  const activeHead = navLinks.find((link) => link.href === activeLink);

  return (
    <html lang="en">
      <body className="mx-45 my-20 max-2xl:mx-20 max-sm:mx-10 max-sm:my-10">
        <div className="border-b-1 border-[#E5E5E5] pb-5">
          <h1 className=" text-6xl max-lg:text-4xl w-full font-bold text-[#101820] mb-10">
            {activeHead && activeHead.heading}
          </h1>
          <nav className="flex flex-row"></nav>
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
        </div>
        {children}
      </body>
    </html>
  );
}

{
  /* <div>
          <h1>Property Listings Management</h1>
          <nav>
            <Link
              href="/adminInputs"
              className="font-bold mx-10 max-lg:mx-5 ml-0 text-[#E5E5E5]"
            >
              Admin Inputs
            </Link>
            <Link
              href="/autoCalculated"
              className="font-bold mx-10 max-lg:mx-5"
            ></Link>
            <Link href="/" className=""></Link>
            <Link
              href="/"
              className="font-bold mx-10 max-lg:mx-5 text-[#E5E5E5]"
            >
              Reviews
            </Link>
            <hr className="border-[#E5E5E5] w-full border-1 mt-5 border-top:none" />
          </nav>
        </div>
        {children}</div> */
}
