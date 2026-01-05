import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "jenggala-super-secret-key-123");

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        const response = new NextResponse(null, { status: 204 });
        const origin = request.headers.get("origin");
        const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

        // Allow the request origin if it matches our allowed origin
        if (origin === allowedOrigin) {
            response.headers.set("Access-Control-Allow-Origin", origin);
        } else {
            response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
        }

        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.headers.set("Access-Control-Allow-Credentials", "true");
        return response;
    }

    const response = await handleMiddleware(request);

    // Add CORS headers to all responses
    const origin = request.headers.get("origin");
    const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

    if (origin === allowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
    } else {
        response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
}

async function handleMiddleware(request) {
    const { pathname } = request.nextUrl;

    // Allow static files and public routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth") ||
        pathname === "/admin/login"
    ) {
        return NextResponse.next();
    }

    // Protect all /admin routes
    if (pathname.startsWith("/admin")) {
        const session = request.cookies.get("session")?.value;

        if (!session) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        try {
            await jwtVerify(session, SECRET);
            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/:path*"],
};
