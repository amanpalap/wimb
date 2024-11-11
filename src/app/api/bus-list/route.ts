import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { busNumber, from, to } = body;

        if (!busNumber && (!from || !to)) {
            return NextResponse.json(
                {
                    error: "Provide either busNumber or from & to values",
                    success: false,
                },
                { status: 400 }
            );
        }

        let buses;

        if (busNumber) {
            // Query Firestore for the document with the specific bus number
            const busRef = adminDb.collection("buses").where("busNumber", "==", busNumber);
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

            buses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } else if (from && to) {

            const From = from.toLowerCase()
            const To = to.toLowerCase()
            // Query Firestore for documents matching 'from' and 'to'
            const busRef = adminDb
                .collection("buses")
                .where("from", "==", From)
                .where("to", "==", To);
            const snapshot = await busRef.get();

            if (snapshot.empty) {
                return NextResponse.json(
                    {
                        error: "No buses found for the specified route",
                        success: false,
                    },
                    { status: 404 }
                );
            }

            buses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }

        return NextResponse.json(
            {
                data: buses,
                success: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving bus data:", error);
        return NextResponse.json(
            {
                error: "Failed to retrieve bus data",
                success: false,
            },
            { status: 500 }
        );
    }
}
