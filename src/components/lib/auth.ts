import NextAuth from "next-auth";
import { authOptions } from "@/config/nextAuth";

export const { auth, signIn, signOut } = NextAuth(authOptions);
