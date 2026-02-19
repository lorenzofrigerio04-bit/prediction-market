"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  /** Minimum touch target 44px */
  fullWidth?: boolean;
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: never;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  type?: never;
  onClick?: never;
}

type CTAButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm transition-all duration-ds-normal ease-ds-ease focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-primary ds-tap-target ds-btn-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:active:scale-100";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover border border-white/20 shadow-card hover:shadow-card-hover focus-visible:ring-primary disabled:bg-primary/60 disabled:shadow-none disabled:border-white/10",
  secondary:
    "glass border border-border dark:border-white/10 text-fg hover:border-primary/25 hover:bg-white/5 focus-visible:ring-primary disabled:text-fg-subtle disabled:border-white/10 disabled:hover:bg-transparent",
  ghost:
    "bg-transparent border-transparent text-fg-muted hover:text-fg hover:bg-white/5 focus-visible:ring-primary disabled:text-fg-subtle",
};

export default function CTAButton({
  children,
  variant = "primary",
  className = "",
  fullWidth = false,
  ...rest
}: CTAButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`;

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonRest.type ?? "button"} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
