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


          try {
            await dbConnect();

            const user = await User.findOne({ email: credentials.email });
          
            if (!user) {
              throw new Error("user not found")
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

            if (!isPasswordValid) {
              throw new Error("invalid password")
            }
            // Return user data that will be saved in the JWT.
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name
            };
            
          } catch (error) {
            console.error("Error in auth:", error);
            throw error
          }
        },
      }),
    ],

    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.status = user.status;
        }
        return token;
      },
      
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.status = token.status;
        }
        return session;
      }
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth.signin"
    },
  };