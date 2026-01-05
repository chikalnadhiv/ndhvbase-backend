import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await prisma.setting.findMany();
        // Convert array to object for easier frontend consumption
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        return NextResponse.json(settingsObj);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        // body is expected to be { key: value, key2: value2 }
        const updates = Object.entries(body).map(([key, value]) => {
            return prisma.setting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ message: "Settings saved" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error saving settings" }, { status: 500 });
    }
}
