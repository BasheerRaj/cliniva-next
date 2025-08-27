import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      emailVerified?: boolean;
      organizationId?: string | null;
      clinicId?: string | null;
      complexId?: string | null;
      setupComplete?: boolean;
      subscriptionId?: string | null;
      onboardingComplete?: boolean;
      onboardingProgress?: string[];
      planType?: string | null;
      isOwner?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    emailVerified?: boolean;
    organizationId?: string | null;
    clinicId?: string | null;
    complexId?: string | null;
    setupComplete?: boolean;
    subscriptionId?: string | null;
    onboardingComplete?: boolean;
    onboardingProgress?: string[];
    planType?: string | null;
    isOwner?: boolean;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      emailVerified?: boolean;
      organizationId?: string | null;
      clinicId?: string | null;
      complexId?: string | null;
      setupComplete?: boolean;
      subscriptionId?: string | null;
      onboardingComplete?: boolean;
      onboardingProgress?: string[];
      planType?: string | null;
      isOwner?: boolean;
    };
  }
} 