import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const DEMO_EMAIL = "tentwenty@demo.com";
const DEMO_PASSWORD = "password123";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { email, password } = credentials;
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          return { id: "demo-user", name: "Demo User", email };
        }

        return null;
      },
    }),
  ],
};
