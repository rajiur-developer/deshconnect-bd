import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function safeNext(value: string | null) {
  const path = value ?? "/dashboard?welcome=1";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard?welcome=1";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  if (searchParams.get("error")) return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const response = NextResponse.redirect(new URL(safeNext(searchParams.get("next")), request.url));

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let error: { message: string } | null = null;
  if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
  else if (tokenHash && type) ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  else return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));

  if (error) {
    console.error("Supabase auth callback failed.", error.message);
    return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
  }
  return response;
}
