import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/redefinir-senha", "/auth"];

// Subconjunto de PUBLIC_ROUTES que também afasta quem já está autenticado
// (ex: não faz sentido ver a tela de login logado). /redefinir-senha fica
// de fora de propósito — é ali que o usuário chega com uma sessão de
// recuperação recém-criada (ver app/auth/confirm/route.ts) e precisa ver o
// formulário de nova senha, não ser redirecionado pra "/".
const REDIRECT_AUTHENTICATED_AWAY = ["/login"];

/**
 * Atualiza a sessão Supabase a cada request e redireciona para /login quando
 * não há usuário autenticado. Chamado a partir de proxy.ts.
 *
 * Isso é só a primeira camada de proteção — cada layout/action protegido
 * também confere `supabase.auth.getUser()` por conta própria (ver
 * app/(app)/layout.tsx), já que o proxy pode ser contornado por quem chama
 * a rota diretamente.
 */
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const shouldRedirectAuthenticatedAway = REDIRECT_AUTHENTICATED_AWAY.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (user && shouldRedirectAuthenticatedAway) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
