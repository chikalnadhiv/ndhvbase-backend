import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    (await cookies()).delete("client_session");
    return NextResponse.json({ message: "Logged out" });
}
