export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Xcelinfotech",
  description: "The perfect page for your booking",
  navItems: [
    {
      label: "Offers",
      href: "/offers",
    },
  ],
  navMenuItems: [
    
    {
      label: "Offers",
      href: "/offers",
    },
  ],
  adminNavItems: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      label: "Orders",
      href: "/admin/orders",
    },
    {
      label: "Medicines",
      href: "/admin/medicines",
    },
    {
      label: "Delivery",
      href: "/admin/delivery_boys",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
