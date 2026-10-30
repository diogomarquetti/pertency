import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/redefinir-senha", "/auth"];

// Subconjunto de PUBLIC_ROUTES que também afasta quem já está autenticado
// (ex: não faz sentido ver a tela de login logado). /redefinir-senha fica
// de fora de propósito — é ali que o usuário chega com uma sessão de
// recuperação recém-criada (ver app/auth/confirm/route.ts) e precisa ver o
// formulário de nova senha, não ser redirecionado pra "/".
const REDIRECT_AUTHENTICATED_AWAY = ["/login"];

// Admin da plataforma (admin.pertency.com.br): mesmo código, servido por
// outro deploy/domínio. As páginas dele vivem em app/admin/, mas no domínio
// do admin a URL não leva o prefixo — /escolas é reescrito para
// /admin/escolas. No app das escolas, /admin não existe.
const ADMIN_PREFIX = "/admin";
// Rotas que os dois apps usam iguais (link de acesso e nova senha).
const ROTAS_COMPARTILHADAS = ["/auth", "/redefinir-senha"];

/**
 * Em produção cada deploy define PERTENCY_APP (`admin` ou `escolas`) e só ela
 * vale — um header de host forjado não abre o admin no deploy das escolas.
 * Sem a variável (desenvolvimento local), o host `admin.*` decide, para que o
 * mesmo `pnpm dev` sirva os dois apps (http://admin.localhost:3000).
 */
function isAdminRequest(request: NextRequest) {
  const app = process.env.PERTENCY_APP;
  if (app) return app === "admin";
  // x-forwarded-host primeiro: o redirect() de uma Server Action é buscado
  // pelo próprio Next num fetch interno para a origem do servidor (Host
  // `localhost`), mas os headers originais vão junto.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  return host.startsWith("admin.");
}

function comecaCom(pathname: string, rota: string) {
  return pathname === rota || pathname.startsWith(`${rota}/`);
}

/**
 * Atualiza a sessão Supabase a cada request e redireciona para /login quando
 * não há usuário autenticado. Chamado a partir de proxy.ts. Também separa o
 * admin da plataforma do app das escolas (ver isAdminRequest).
 *
 * Isso é só a primeira camada de proteção — cada layout/action protegido
 * também confere `supabase.auth.getUser()` por conta própria (ver
 * app/(app)/layout.tsx), já que o proxy pode ser contornado por quem chama
 * a rota diretamente.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const admin = isAdminRequest(request);

  if (!admin && comecaCom(pathname, ADMIN_PREFIX)) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  if (admin && comecaCom(pathname, ADMIN_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(ADMIN_PREFIX.length) || "/";
    return NextResponse.redirect(url);
  }

  const destinoAdmin =
    admin && !ROTAS_COMPARTILHADAS.some((rota) => comecaCom(pathname, rota))
      ? new URL(`${ADMIN_PREFIX}${pathname === "/" ? "" : pathname}${request.nextUrl.search}`, request.url)
      : null;

  const responder = () =>
    destinoAdmin
      ? NextResponse.rewrite(destinoAdmin, { request })
      : NextResponse.next({ request });

  let supabaseResponse = responder();

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
          supabaseResponse = responder();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() e não getUser(): o proxy roda em toda requisição (navegação,
  // prefetch de link, Server Action), e getUser() sempre vai até o servidor
  // de Auth. getClaims() renova a sessão quando o token expira e valida a
  // assinatura localmente (chaves JWKS em cache) quando o projeto usa JWT
  // Signing Keys assimétricas; sem elas, cai na mesma chamada de rede. A
  // checagem completa continua no layout e nas actions (getCurrentUser()).
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

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
