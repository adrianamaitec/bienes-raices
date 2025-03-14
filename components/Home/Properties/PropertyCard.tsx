import { Department } from '@/lib/types/types';
import Image from 'next/image';
import React from 'react'

type Props = {
    apartment: Department;
}
const PropertyCard = ({ apartment }: Props) => {
    return (
        <div className='bg-white overflow-hidden group rounded-lg cursor-pointer shadow-lg'>
            <div className='relative'>
                <Image src={apartment.image_url || '/default-image.jpg'} alt={apartment.name} width={300} height={300} className='w-full object-cover group-hover:scale-110 transition-all duration-300 ' />
            </div>
        </div>
    )
}

export default PropertyCard
