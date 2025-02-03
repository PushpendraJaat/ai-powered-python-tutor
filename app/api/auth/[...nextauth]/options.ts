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
            throw new Error("credentials are required")
          }

          await dbConnect();

          try {
            const user = await User.findOne({ email: credentials.email });
            console.log(user)
            if (!user) {
              throw new Error("user not found")
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

            if (!isPasswordValid) {
              throw new Error("invalid password")
            }
            // Return user data that will be saved in the JWT.
            return user;
            
          } catch (error) {
            console.error("Error in auth:", error);
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
          token._id = user.id;
        }
        return token;
      },
      
      async session({ session, token }) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token._id,
          }
        };
      }
    },
    pages: {
      signIn: "/auth/signin",
    },
  };