import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ["/dashboard", "/admin"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes — redirect non-admins
  if (request.nextUrl.pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Restrict premium features for inactive subscribers.
  if (request.nextUrl.pathname.startsWith("/dashboard") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const subscriptionStatus = profile?.subscription_status;
    const hasActiveAccess = subscriptionStatus === "active" || subscriptionStatus === "trialing";
    const restrictedFeaturePaths = ["/dashboard/scores", "/dashboard/draws", "/dashboard/leaderboard"];
    const visitingRestrictedFeature = restrictedFeaturePaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (!hasActiveAccess && visitingRestrictedFeature) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/profile";
      url.searchParams.set("billing", "required");
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/auth/login", "/auth/signup"];
  if (authPaths.includes(request.nextUrl.pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
