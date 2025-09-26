"use client";
import React, { useEffect, useState } from 'react';
import SectionHeading from './../../Helper/SectionHeading';
import { fetchDepartments } from '@/lib/database';
import PropertyCard from './PropertyCard';
import { Department } from '@/lib/types/types';

const Properties = () => {
    const [apartments, setApartments] = useState<Department[]>([]);

    useEffect(() => {
        const loadApartments = async () => {
            const { data, error } = await fetchDepartments();
            if (data) setApartments(data);
            if (error) console.error('Error al obtener departamentos:', error);
        };

        loadApartments();
    }, []);

    return (
        <div className='pt-16 pb-16 bg-gray-100'>
            <div className='w-[80%] mx-auto'>
                <SectionHeading heading='Descubre nuestras Propiedades' />
                <div className='mt-10 md:mt-20 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 items-center'>
                    {apartments.map((apartment) => (
                        <div key={apartment.id}>
                            <PropertyCard apartment={apartment} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Properties;