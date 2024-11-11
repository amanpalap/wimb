"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BusForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        from: "",
        to: "",
        busNumber: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "busNumber" ? value.toUpperCase().replace(/[^a-zA-Z0-9]/g, "") : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            localStorage.setItem("busFormData", JSON.stringify(formData));
            toast.success("Data Submitted Successfully");
            router.push('/result');
        } catch (error) {
            console.error("Error storing data in localStorage:", error);
            toast.error("Failed to save data. Please try again.");
            return;
        }
    };


    return (
        <div className="flex flex-wrap items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="flex flex-wrap items-center space-y-4 justify-center max-w-md">
                <h2 className="text-2xl bg-gray-800 p-2 rounded-lg shadow-lg w-full max-w-md font-semibold text-center text-gray-200 mb-2">
                    Bus Form
                </h2>
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
                >


                    <label className="block text-gray-300 mb-2">
                        From
                        <input
                            type="text"
                            name="from"
                            value={formData.from}
                            onChange={handleInputChange}
                            className="w-full p-2 mt-1 bg-gray-700 rounded-md text-gray-100 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter starting location"
                            required
                        />
                    </label>

                    <label className="block text-gray-300 mb-2">
                        To
                        <input
                            type="text"
                            name="to"
                            value={formData.to}
                            onChange={handleInputChange}
                            className="w-full p-2 mt-1 bg-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter destination"
                            required

                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-200"
                    >
                        Submit
                    </button>
                </form>
                <div className="text-white font-bold"> - or -</div>
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
                >
                    <label className="block text-gray-300 mb-4">
                        Bus Number
                        <input
                            type="text"
                            name="busNumber"
                            value={formData.busNumber}
                            onChange={handleInputChange}
                            className="w-full p-2 mt-1 bg-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter bus number"
                            required

                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-200"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
