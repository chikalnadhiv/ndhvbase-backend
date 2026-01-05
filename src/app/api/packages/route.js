import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";




export async function GET() {
    try {
        const packages = await prisma.package.findMany({
            include: { group: true },
            orderBy: { id: "asc" },
        });
        return NextResponse.json(packages);
    } catch (error) {
        console.error("GET /api/packages error:", error);
        return NextResponse.json({ error: error.message || "Error fetching packages" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const price = parseFloat(body.price);
        const bookingGoal = parseInt(body.bookingGoal);
        const revenueGoal = parseFloat(body.revenueGoal);

        const newPackage = await prisma.package.create({
            data: {
                name: body.name,
                price: isNaN(price) ? 0 : price,
                features: body.features || "",
                isPopular: body.isPopular || false,
                bookingGoal: isNaN(bookingGoal) ? 0 : bookingGoal,
                revenueGoal: isNaN(revenueGoal) ? 0 : revenueGoal,
                groupId: body.groupId ? parseInt(body.groupId) : null,
            },
        });
        return NextResponse.json(newPackage, { status: 201 });
    } catch (error) {
        console.error("POST /api/packages error:", error);
        return NextResponse.json({ error: error.message || "Error creating package" }, { status: 500 });
    }
}
