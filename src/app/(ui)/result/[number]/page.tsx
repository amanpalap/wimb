'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FaMapMarkerAlt, FaRegClock } from 'react-icons/fa'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card" // Assuming this path, adjust if necessary

// Define a type for city details
interface CityDetail {
    name: string;
    lat?: number;
    lon?: number;
    address?: string; // Full address/display name from Nominatim
    error?: string;
}

const Page = () => {
    const { number } = useParams()
    const [location, setLocation] = useState({ lat: '', lng: '' })
    const [currentAddress, setCurrentAddress] = useState<string>('');
    const [via, setVia] = useState<string[][]>([])
    const [viaCityDetails, setViaCityDetails] = useState<CityDetail[]>([]);
    const [activeFlagIndex, setActiveFlagIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!number) {
                setIsLoading(false);
                setError("Invalid tracking number provided.");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post('/api/location/update', { number })
                const { location: newLocation, via: newViaRaw } = response.data.data

                const newVia: string[][] = Array.isArray(newViaRaw) ?
                    newViaRaw.map(item => Array.isArray(item) ? item.map(String) : [String(item)])
                    : [];

                setLocation(newLocation || { lat: '', lng: '' });
                setVia(newVia);

                if (newLocation?.lat && newLocation?.lng) {
                    try {
                        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${newLocation.lat}&lon=${newLocation.lng}&format=json`;
                        const addressResponse = await axios.get(nominatimUrl);
                        setCurrentAddress(addressResponse.data.display_name || 'Address not found');
                    } catch (nominatimError) {
                        console.error('Error fetching address from Nominatim:', nominatimError);
                        setCurrentAddress('Could not fetch current address');
                    }
                } else {
                    setCurrentAddress('Current location coordinates not available.');
                }

                if (newVia.length > 0) {
                    const cityDetailsPromises = newVia.map(async (cityArray: string[]) => {
                        const cityName = cityArray && cityArray.length > 0 ? cityArray[0] : null;
                        if (!cityName || typeof cityName !== 'string') {
                            return { name: String(cityArray), error: 'Invalid city name format' };
                        }
                        try {
                            const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
                            const cityCoordResponse = await axios.get(searchUrl);
                            if (cityCoordResponse.data && cityCoordResponse.data.length > 0) {
                                const { lat, lon, display_name } = cityCoordResponse.data[0];
                                return { name: cityName, lat: parseFloat(lat), lon: parseFloat(lon), address: display_name };
                            }
                            return { name: cityName, error: 'Coordinates not found' };
                        } catch (cityError) {
                            console.error(`Error fetching coordinates for ${cityName}:`, cityError);
                            return { name: cityName, error: 'Failed to fetch coordinates' };
                        }
                    });
                    const resolvedCityDetails = await Promise.all(cityDetailsPromises);
                    setViaCityDetails(resolvedCityDetails);

                    if (newVia.length > 0) {
                        // Placeholder: set the first flag as active.
                        // TODO: Implement logic to determine activeFlagIndex based on current location and viaCityDetails
                        setActiveFlagIndex(0);
                    } else {
                        setActiveFlagIndex(null);
                    }
                } else {
                    setViaCityDetails([]);
                    setActiveFlagIndex(null);
                }

            } catch (err) {
                console.error('Error fetching location data:', err);
                setError('Failed to load journey data. Please check the tracking number or try again later.');
                setCurrentAddress('');
                setViaCityDetails([]);
                setLocation({ lat: '', lng: '' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchData()
    }, [number])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-background text-foreground">
                <div className="flex flex-col items-center">
                    <FaRegClock className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Loading journey details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-background text-foreground">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Operation Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-background text-foreground">
            <header className="text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-primary">Journey Tracker</h1>
                {number && <p className="text-muted-foreground mt-1">Tracking ID: {String(number)}</p>}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Route Progress</CardTitle>
                        <CardDescription>Follow the journey stop by stop.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative pt-2 pb-6 px-0 md:px-2">
                        {via.length > 0 ? (
                            <>
                                <div className="relative space-y-10 pl-6 pr-2 md:pl-0 md:pr-0"> {/* Increased space-y */}
                                    {via.map((cityArray, index) => {
                                        const cityName = cityArray && cityArray.length > 0 ? cityArray[0] : `Stop ${index + 1}`;
                                        const isCurrent = index === activeFlagIndex;
                                        const cityDetail = viaCityDetails[index];

                                        return (
                                            <div key={index} className="relative flex items-start ml-6 md:ml-12">
                                                {/* Indicator Circle + Arrow (positioned over the track line) */}
                                                {/* Corrected md:-left offset for proper alignment with the track line */}
                                                <div className="absolute -left-[34px] md:-left-[34px] top-[2px] flex flex-col items-center z-10">
                                                    <div
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold
                                                            ${isCurrent
                                                                ? 'bg-primary border-primary text-primary-foreground shadow-lg'
                                                                : 'bg-card border-muted-foreground text-foreground'
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                {/* City Info */}
                                                <div className="ml-2 flex-grow">
                                                    <p className={`font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                                        {cityName}
                                                    </p>
                                                    {cityDetail && !cityDetail.error && cityDetail.address && (
                                                        <p className="text-xs text-muted-foreground truncate w-full max-w-xs md:max-w-sm lg:max-w-md" title={cityDetail.address}>
                                                            {cityDetail.address.split(',').slice(0, 3).join(', ')}
                                                        </p>
                                                    )}
                                                    {cityDetail && cityDetail.error && (
                                                        <p className="text-xs text-destructive">{cityDetail.error}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground px-6">No route information available for this journey.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Current Location</CardTitle>
                        <CardDescription>Real-time GPS coordinates and address.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex items-center mb-1">
                                <FaMapMarkerAlt className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                                <span className="text-sm font-medium">Address:</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6 break-words">
                                {currentAddress || (location.lat && location.lng ? "Fetching address..." : "Address not available")}
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center mb-1">
                                <FaRegClock className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                                <span className="text-sm font-medium">Coordinates:</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">
                                Lat: <span className="font-semibold">{location.lat || 'N/A'}</span>, Lng: <span className="font-semibold">{location.lng || 'N/A'}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Optional: Display fetched city details for debugging */}
            {/*
            <Card className="mt-8">
                <CardHeader><CardTitle>Debug Information</CardTitle></CardHeader>
                <CardContent className="text-xs space-y-2 bg-muted/50 p-4 rounded-md">
                    <div><h3 className="font-semibold mb-1">Via City Details:</h3> <pre className="whitespace-pre-wrap break-all bg-background p-2 rounded">{JSON.stringify(viaCityDetails, null, 2)}</pre></div>
                    <div><h3 className="font-semibold mt-2 mb-1">Raw Via:</h3> <pre className="whitespace-pre-wrap break-all bg-background p-2 rounded">{JSON.stringify(via, null, 2)}</pre></div>
                    <div><h3 className="font-semibold mt-2 mb-1">Active Flag Index:</h3> <p className="bg-background p-2 rounded">{activeFlagIndex === null ? 'null' : activeFlagIndex}</p></div>
                    <div><h3 className="font-semibold mt-2 mb-1">Current Location State:</h3> <pre className="whitespace-pre-wrap break-all bg-background p-2 rounded">{JSON.stringify(location, null, 2)}</pre></div>
                    <div><h3 className="font-semibold mt-2 mb-1">Current Address State:</h3> <p className="bg-background p-2 rounded break-words">{currentAddress}</p></div>
                </CardContent>
            </Card>
            */}
        </div>
    );
}

export default Page;