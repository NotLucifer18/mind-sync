import { NavLink as RouterNavLink, NavLinkProps as RouterNavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends RouterNavLinkProps {
  activeClassName?: string;
}

export const NavLink = ({ className, activeClassName, ...props }: NavLinkProps) => {
  return (
    <RouterNavLink
      className={({ isActive, isPending, isTransitioning }) =>
        cn(
          typeof className === "function" ? className({ isActive, isPending, isTransitioning }) : className,
          isActive && activeClassName
        )
      }
      {...props}
    />
  );
};
