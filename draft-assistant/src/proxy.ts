import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk attaches the verified session to every request. Authorization happens
// in src/lib/auth.ts, as close to each page/route as possible.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
