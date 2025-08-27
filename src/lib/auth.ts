import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import axios from "axios";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified?: boolean;
  organizationId?: string;
  clinicId?: string;
  complexId?: string;
  subscriptionId?: string;
  setupComplete?: boolean;
  onboardingComplete?: boolean;
  onboardingProgress?: string[];
  planType?: string | null;
  isOwner?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Call backend API for authentication
          const response = await axios.post(`${process.env.API_URL || 'http://localhost:3001/api/v1'}/auth/login`, {
            email: credentials.email,
            password: credentials.password
          });

          const { user, access_token } = response.data;

          if (user && access_token) {
            return {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              isActive: user.isActive,
              emailVerified: user.emailVerified,
              organizationId: user.organizationId,
              clinicId: user.clinicId,
              complexId: user.complexId,
              setupComplete: user.setupComplete,
              subscriptionId: user.subscriptionId,
              onboardingComplete: user.onboardingComplete,
              onboardingProgress: user.onboardingProgress,
              planType: user.planType,
              isOwner: user.isOwner,
              accessToken: access_token
            };
          }
          
          return null;
        } catch (error: any) {
          console.error("Authentication error:", error);
          throw new Error(error.response?.data?.message || "Authentication failed");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: (user as any).accessToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: (user as any).firstName,
            lastName: (user as any).lastName,
            role: (user as any).role,
            isActive: (user as any).isActive,
            emailVerified: (user as any).emailVerified,
            organizationId: (user as any).organizationId,
            clinicId: (user as any).clinicId,
            complexId: (user as any).complexId,
            setupComplete: (user as any).setupComplete,
            subscriptionId: (user as any).subscriptionId,
            onboardingComplete: (user as any).onboardingComplete,
            onboardingProgress: (user as any).onboardingProgress,
            planType: (user as any).planType,
            isOwner: (user as any).isOwner,
          }
        };
      }

      // Handle session refresh - fetch fresh user data from backend
      if (trigger === 'update' && token.user?.id) {
        try {
          console.log('🔄 JWT: Refreshing user data from backend for user:', token.user.id);
          
          // Fetch fresh user data from backend
          const response = await axios.get(`${process.env.API_URL || 'http://localhost:3001/api/v1'}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`
            }
          });

          const freshUserData = response.data;
          console.log('✅ JWT: Got fresh user data:', { setupComplete: freshUserData.setupComplete });

          return {
            ...token,
            user: {
              ...token.user,
              setupComplete: freshUserData.setupComplete,
              organizationId: freshUserData.organizationId,
              clinicId: freshUserData.clinicId,
              complexId: freshUserData.complexId,
              subscriptionId: freshUserData.subscriptionId,
              onboardingComplete: freshUserData.onboardingComplete,
              onboardingProgress: freshUserData.onboardingProgress,
              planType: freshUserData.planType,
            }
          };
        } catch (error) {
          console.error('❌ JWT: Failed to refresh user data:', error);
          // Return existing token if refresh fails
          return token;
        }
      }

      // Return previous token if no update needed
      return token;
    },
    async session({ session, token }) {
      session.accessToken = (token as any).accessToken;
      session.user = (token as any).user;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async signOut({ token }) {
      // Clear any client-side storage on signout
      if (typeof window !== 'undefined') {
        window.sessionStorage.clear();
        window.localStorage.removeItem('onboardingData');
      }
    },
    async session({ session }) {
      // Log session events for debugging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Session event:', session);
      }
    }
  },
  logger: {
    error: (code, metadata) => {
      // Prevent excessive logging of connection errors
      if (code !== 'CLIENT_FETCH_ERROR') {
        console.error('NextAuth Error:', code, metadata);
      }
    },
    warn: (code) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('NextAuth Warning:', code);
      }
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata);
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "lKXI7xsjzwQxWcbV2fMmyDkfu5EOqurXFkYksnIWGtE=",
}; 