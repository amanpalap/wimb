'use client'
import React, { useState, useEffect } from 'react';
import LoadMegaLoading from '../components/loading/MegaLoading'; // Fixed typo
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard'); // Redirect after loading
    }, 2000);

    return () => clearTimeout(timer); // Proper cleanup
  }, [router]);

  return (
    <div>
      {isLoading && <LoadMegaLoading />}
    </div>
  );
};

export default Page;