import { NextResponse } from "next/server";
import { MOCK_COMPANIES } from "@/lib/mock-data";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Business registration number (id) is required" },
            { status: 400 }
        );
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const company = MOCK_COMPANIES[id];

    if (!company) {
        return NextResponse.json(
            { error: "Company not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(company);
}
