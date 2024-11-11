'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'


const page = () => {
    const { number } = useParams()
    const [location, setLocation] = useState({
        lat: '',
        lng: ''
    })
    console.log(number)
    useEffect(() => {
        const FetchLocation = async () => {
            const response = await axios.post('/api/location/update', { number })
            console.log(response.data.data.location)
            setLocation(response.data.data.location)
        }
        FetchLocation()
    }, [])
    return (

        <div>
            {location.lat}
            { }
        </div>
    )
}

export default page
