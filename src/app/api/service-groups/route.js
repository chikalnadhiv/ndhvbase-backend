import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const groups = await prisma.serviceGroup.findMany({
            include: {
                categories: {
                    include: {
                        items: {
                            include: {
                                detailTemplates: true
                            }
                        }
                    }
                }
            },
            orderBy: { id: "asc" },
        });
        return NextResponse.json(groups);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching service groups" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const newGroup = await prisma.serviceGroup.create({
            data: {
                name: body.name,
                description: body.description,
                bookingGoal: body.bookingGoal ? parseInt(body.bookingGoal) : 0,
                revenueGoal: body.revenueGoal ? parseFloat(body.revenueGoal) : 0,
            },
        });
        return NextResponse.json(newGroup, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error creating service group" }, { status: 500 });
    }
}
