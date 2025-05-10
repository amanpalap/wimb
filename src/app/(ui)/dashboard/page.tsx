"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; // For the "or" divider

export default function BusForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        from: "",
        to: "",
        busNumber: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "busNumber" ? value.toUpperCase().replace(/[^a-zA-Z0-9]/g, "") : value,
        }));
    };

    const handleRouteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!formData.from || !formData.to) {
            toast.error("Please fill in both From and To fields.");
            setIsSubmitting(false);
            return;
        }
        try {
            // Clear busNumber when submitting by route
            const dataToStore = { from: formData.from, to: formData.to, busNumber: "" };
            localStorage.setItem("busFormData", JSON.stringify(dataToStore));
            toast.success("Searching by route...");
            router.push('/result');
        } catch (error) {
            console.error("Error storing data in localStorage:", error);
            toast.error("Failed to save route data. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBusNumberSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!formData.busNumber) {
            toast.error("Please fill in the Bus Number field.");
            setIsSubmitting(false);
            return;
        }
        try {
            // Clear from and to when submitting by bus number
            const dataToStore = { from: "", to: "", busNumber: formData.busNumber };
            localStorage.setItem("busFormData", JSON.stringify(dataToStore));
            toast.success("Searching by bus number...");
            router.push('/result');
        } catch (error) {
            console.error("Error storing data in localStorage:", error);
            toast.error("Failed to save bus number data. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Search by Route</CardTitle>
                        <CardDescription>Enter starting point and destination.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRouteSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <Input
                                    id="from"
                                    name="from"
                                    value={formData.from}
                                    onChange={handleInputChange}
                                    placeholder="Enter starting location"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <Input
                                    id="to"
                                    name="to"
                                    value={formData.to}
                                    onChange={handleInputChange}
                                    placeholder="Enter destination"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Searching..." : "Search by Route"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex items-center space-x-2">
                    <Separator className="flex-grow" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-grow" />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Search by Bus Number</CardTitle>
                        <CardDescription>Enter the bus registration number.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBusNumberSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="busNumber">Bus Number</Label>
                                <Input
                                    id="busNumber"
                                    name="busNumber"
                                    value={formData.busNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g., AB12CD3456"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Searching..." : "Search by Bus Number"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}