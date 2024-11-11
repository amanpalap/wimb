export const revalidate = 0;

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
    try {
        // Parse the JSON body from the request
        const { number } = await request.json();

        // Validate required fields
        if (!number) {
            return NextResponse.json(
                {
                    error: "Bus number is required",
                    success: false
                },
                { status: 400 }
            );
        }

        const busRef = adminDb.collection("buses").where("busNumber", "==", number);
        const snapshot = await busRef.get();

        if (snapshot.empty) {
            return NextResponse.json(
                {
                    error: "Bus not found",
                    success: false,
                },
                { status: 404 }
            );
        }

        // Get the first bus document and serialize it
        const busData = snapshot.docs[0].data();

        return NextResponse.json(
            {
                data: busData,
                success: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching bus data:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                success: false
            },
            { status: 500 }
        );
    }
}
