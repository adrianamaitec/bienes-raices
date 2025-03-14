import Image from 'next/image';
import React from 'react'

type Props = {
    type: {
        icon: string;
        title: string;
        number: number;
    }
}

const ApartmentTypeCard = ({ type }: Props) => {
    return (
        <div className='rounded-lg shadow-lg p-6 hover:scale-110 transition-all duration-300'>
            <Image src={type.icon} alt={type.title} width={50} height={50} />
            <div className='mt-12 '>
                <h1 className='text-lg font-bold'>{type.title}</h1>
                <p className='mt-2 text-sm text-gray-700'>{type.number} disponibles</p>
            </div>
        </div>
    )
}

export default ApartmentTypeCard
