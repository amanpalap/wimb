"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaBus } from "react-icons/fa";
import MegaLoading from "@/components/loading/MegaLoading";

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
        }
    }, []);

    useEffect(() => {
        const fetchBusDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.post("/api/bus-list", formData);
                console.log(response);
                setBusDetails(response.data.data || []);
            } catch (err) {
                setError("Error fetching bus details");
            } finally {
                setLoading(false);
            }
        };

        fetchBusDetails();
    }, [formData]);

    const handleBusClick = (busNumber: string) => {
        router.push(`/result/${busNumber}`);
    };

    if (loading) {
        return <MegaLoading />;
    }

    if (busDetails.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
                <p>No buses found for the specified criteria.</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-200">
                    Bus Details
                </h2>

                <div className="text-gray-300 space-y-4">
                    {busDetails.map((bus) => (
                        <div
                            key={bus.id}
                            onClick={() => handleBusClick(bus.busNumber,)}
                            className="flex items-center justify-between p-4 border-b border-gray-600 bg-gray-700 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 ease-out cursor-pointer"
                        >
                            <div>
                                <p>
                                    <span className="font-semibold">Bus Number:</span> {bus.busNumber}
                                </p>
                                <p>
                                    <span className="font-semibold">From:</span> {bus.from}
                                </p>
                                <p>
                                    <span className="font-semibold">To:</span> {bus.to}
                                </p>
                                {bus.departureTime && (
                                    <p>
                                        <span className="font-semibold">Departure Time:</span> {bus.departureTime}
                                    </p>
                                )}
                                {bus.arrivalTime && (
                                    <p>
                                        <span className="font-semibold">Arrival Time:</span> {bus.arrivalTime}
                                    </p>
                                )}
                            </div>
                            <FaBus className="text-blue-500 text-4xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusDetailsPage;
