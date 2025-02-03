import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";


const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await dbConnect();

        try {
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("User not found with given email");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error("User password is not valid");
          }

          const userWithId = {
            ...user,
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };

          // Return user data that will be saved in the JWT.
          return userWithId

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
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        }
      };
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        domain: process.env.NEXTAUTH_URL?.includes("vercel.app")
        ? "skc-pushpendra-jaat-ai-powered-python-tutor.vercel.app"
        : undefined, // No domain for local dev
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },
  
  
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
