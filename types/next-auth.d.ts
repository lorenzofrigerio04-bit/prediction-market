import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string;
      onboardingCompleted?: boolean;
      /** Data verifica email (null se non verificata) */
      emailVerified?: Date | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: string;
    onboardingCompleted?: boolean;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    onboardingCompleted?: boolean;
    emailVerified?: number | null; // timestamp in ms
  }
}
