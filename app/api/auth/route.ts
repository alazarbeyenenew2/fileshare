import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const body = await request.json();
    const { username, password } = body;

    // Simple hardcoded check for now (as per plan)
    // In a real app, this would check a DB
    if (username === "admin" && password === "password") {
        // Set a cookie for simple session management
        const cookieStore = await cookies();
        cookieStore.set("auth_token", "valid_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 // 1 day
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 401 });
}
