"use client"

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUserStatus = () => {
      const adminToken = localStorage.getItem('adminToken');
      const deliveryToken = localStorage.getItem('deliveryToken');
      
      console.log('Checking tokens:', { adminToken, deliveryToken }); // Debug
      
      setIsAdmin(!!adminToken);
      setIsDelivery(!!deliveryToken);
    };
  
    checkUserStatus();
    window.addEventListener('adminLoggedIn', checkUserStatus);
    window.addEventListener('deliveryLoggedIn', checkUserStatus);
  
    return () => {
      window.removeEventListener('adminLoggedIn', checkUserStatus);
      window.removeEventListener('deliveryLoggedIn', checkUserStatus);
    };
  }, []);
  

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
      window.dispatchEvent(new Event('adminLoggedIn'));
    }
    if (isDelivery) {
      localStorage.removeItem('deliveryToken');
      localStorage.removeItem('deliveryUser');
      setIsDelivery(false);
      window.dispatchEvent(new Event('deliveryLoggedIn'));
    }
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <NextUINavbar maxWidth="xl" position="sticky" ref={navbarRef} isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <img
              src="https://i.ibb.co/DkBX8VC/image-removebg-preview.png"
              alt="Logo"
              width={36}
              height={36}
              style={{ filter: "grayscale(100%)" }}
            />
            <p className="text-inherit">MedCare</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {isAdmin && (
          <>
            {siteConfig.adminNavItems.map((item) => (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium"
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </>
          )}
          {isDelivery && (
            <>
              {siteConfig.deliveryNavItems.map((item) => (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-medium"
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ))}
            </>
          )}
          {(isAdmin || isDelivery) && (
            <NavbarItem>
              <Button 
                color="danger"
                variant="flat"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
        <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {isAdmin && (
            <>
              {siteConfig.adminNavItems.map((item, index) => (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
                    color="foreground"
                    href={item.href}
                    size="lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ))}
            </>
          )}
          {isDelivery && (
            <>
              {siteConfig.deliveryNavItems.map((item, index) => (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
                    color="foreground"
                    href={item.href}
                    size="lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  </NavbarMenuItem>
              ))}
            </>
          )}
          {(isAdmin || isDelivery) && (
            <NavbarMenuItem>
              <Link
                color="danger"
                href="#"
                size="lg"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </Link>
            </NavbarMenuItem>
          )}
          {!isAdmin && !isDelivery && (
            siteConfig.navItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color="foreground"
                  href={item.href}
                  size="lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))
          )}
        </div>
      </NavbarMenu>
      </NextUINavbar>
  );
};