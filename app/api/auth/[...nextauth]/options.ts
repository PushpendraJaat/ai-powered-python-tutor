import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";



export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credentials are required");
        }

        await dbConnect();

        try {
          const user = await User.findOne({ email: credentials.email }).lean();
          if (!user) {
            throw new Error("User not found");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return normalized user object
          return {
            id: user._id.toString(), // Convert ObjectId to string
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Store string ID in token
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id, // Ensure ID is properly set
        };
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
};