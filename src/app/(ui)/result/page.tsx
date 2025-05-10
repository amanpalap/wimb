"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaBus, FaExclamationTriangle } from "react-icons/fa";
import MegaLoading from "@/components/loading/MegaLoading";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // If you want to use Button for navigation, or keep div clickable

interface BusDetails {
    id: string;
    busNumber: string;
    from: string;
    to: string;
    departureTime?: string;
    arrivalTime?: string;
}

const BusDetailsPage = () => {
    const router = useRouter();
    const [busDetails, setBusDetails] = useState<BusDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        from: "",
        to: "",
        busNumber: "",
    });

    useEffect(() => {
        try {
            const storedData = localStorage.getItem("busFormData");
            if (storedData) {
                setFormData(JSON.parse(storedData));
            }
        } catch (err) {
            console.error("Error reading from localStorage:", err);
            // Optionally set an error state here if localStorage access is critical
        }
    }, []);

    useEffect(() => {
        const fetchBusDetails = async () => {
            // Ensure formData has been loaded from localStorage before fetching
            if (!formData.from && !formData.to && !formData.busNumber && localStorage.getItem("busFormData")) {
                // Still waiting for formData from localStorage effect, or it was empty
                return;
            }

            setLoading(true);
            setError(null); // Reset error before new fetch
            try {
                const response = await axios.post("/api/bus-list", formData);
                setBusDetails(response.data.data || []);
                if (!response.data.data || response.data.data.length === 0) {
                    setError("No buses found for the specified criteria.");
                }
            } catch (err) {
                console.error("Error fetching bus details:", err);
                setError("Failed to fetch bus details. Please try again later.");
                setBusDetails([]); // Clear previous details on error
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if formData is populated or if it's the initial load without localStorage data
        if ((formData.from || formData.to || formData.busNumber) || !localStorage.getItem("busFormData")) {
            fetchBusDetails();
        } else if (!localStorage.getItem("busFormData")) {
            // If no localStorage data, and form is empty, it implies an initial state where we might not want to auto-fetch
            // or we might want to show a message. For now, we'll fetch, which might result in "No buses found".
            fetchBusDetails();
        }


    }, [formData]);

    const handleBusClick = (busNumber: string) => {
        router.push(`/result/${busNumber}`);
    };

    if (loading) {
        return <MegaLoading />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                        Available Buses
                    </CardTitle>
                    <CardDescription>
                        Select a bus to view its live tracking details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && !busDetails.length && (
                        <div className="flex flex-col items-center justify-center text-center p-6 bg-destructive/10 border border-destructive/30 rounded-md">
                            <FaExclamationTriangle className="text-destructive text-4xl mb-3" />
                            <p className="text-destructive font-semibold">{error}</p>
                            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                                Go Back
                            </Button>
                        </div>
                    )}

                    {!error && busDetails.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/50 border border-border rounded-md">
                            <FaBus className="text-muted-foreground text-4xl mb-3" />
                            <p className="text-muted-foreground">No buses found matching your criteria.</p>
                            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                                Search Again
                            </Button>
                        </div>
                    )}

                    {busDetails.length > 0 && (
                        <div className="space-y-4">
                            {busDetails.map((bus) => (
                                <Card
                                    key={bus.id}
                                    onClick={() => handleBusClick(bus.busNumber)}
                                    className="hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold text-primary group-hover:underline">
                                                Bus No: {bus.busNumber}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">From:</span> {bus.from}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">To:</span> {bus.to}
                                            </p>
                                            {bus.departureTime && (
                                                <p className="text-xs text-muted-foreground">
                                                    <span className="font-medium">Departure:</span> {bus.departureTime}
                                                </p>
                                            )}
                                            {bus.arrivalTime && (
                                                <p className="text-xs text-muted-foreground">
                                                    <span className="font-medium">Arrival:</span> {bus.arrivalTime}
                                                </p>
                                            )}
                                        </div>
                                        <FaBus className="text-primary/70 text-3xl md:text-4xl group-hover:text-primary transition-colors" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default BusDetailsPage;