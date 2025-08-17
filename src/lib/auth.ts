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
  organizationId?: string;
  clinicId?: string;
  complexId?: string;
  setupComplete?: boolean;
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
              organizationId: user.organizationId,
              clinicId: user.clinicId,
              complexId: user.complexId,
              setupComplete: user.setupComplete,
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
    async jwt({ token, user, account }) {
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
            organizationId: (user as any).organizationId,
            clinicId: (user as any).clinicId,
            complexId: (user as any).complexId,
            setupComplete: (user as any).setupComplete,
          }
        };
      }

      // Return previous token if the access token has not expired
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
  secret: "lKXI7xsjzwQxWcbV2fMmyDkfu5EOqurXFkYksnIWGtE=",
}; 