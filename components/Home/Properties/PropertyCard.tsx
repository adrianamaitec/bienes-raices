import { Department } from '@/lib/types/types';
import Image from 'next/image';
import React from 'react'
import { BiLinkExternal } from 'react-icons/bi';
import { BsHeart, BsPlusSquare } from 'react-icons/bs';
import { FaBath, FaBed, FaSquare } from 'react-icons/fa';
import { FaStairs } from 'react-icons/fa6';
import { MdElectricBolt } from 'react-icons/md';

type Props = {
    apartment: Department;
}
const PropertyCard = ({ apartment }: Props) => {
    return (
        <div className='bg-white overflow-hidden group rounded-lg cursor-pointer shadow-lg '>
            <div className='relative'>
                <Image src={apartment.image_url || ''} alt={apartment.name} width={300} height={300} className='h-[300px] w-full object-cover group-hover:scale-110 transition-all duration-300' />
                <h1 className='px-6 absolute bottom-4 left-4 py-1.5 text-sm bg-black w-fit text-white rounded-lg '>
                    <span className='text-base font-bold'>${apartment.price}</span>
                </h1>
                <div className='flex items-center space-x-1 px-6 absolute top-4 left-4 py-2 text-sm bg-rose-600 w-fit text-white rounded-md font-bold'>
                    <MdElectricBolt />
                    <span>Mas informacion</span>
                </div>

            </div>
            <div className='p-5'>
                <h1 className='mt-4 group-hover:underline text-gray-900 font-bold'>{apartment.name}</h1>
                <p className='text-sm text-gray-500 mt-3'>{apartment.street} {apartment.zone}</p>
                <div className='flex items-center my-6 justify-between w-full lg:w-[80%]'>
                    <div className='flex items-center space-x-2'>
                        <FaBed className='text-red-500' />
                        <p className='text-xs text-gray-600'>{apartment.bed}</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <FaBath className='text-red-500' />
                        <p className='text-xs text-gray-600'>{apartment.bathrooms}</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <FaStairs className='text-red-500' />
                        <p className='text-xs text-gray-600'>{apartment.floor}</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <FaSquare className='text-red-500' />
                        <p className='text-xs text-gray-600'>{apartment.size} m2</p>
                    </div>

                </div>
                <div className='w-full h-[1.2px] mt-4 mb-4 bg-gray-500 opacity-15 '></div>
                <div className='flex items-center justify-between '>
                    <h1 className='text-xs text-gray-600'>A la Venta</h1>
                    <div className='flex items-center space-x-4 text-gray-600'>
                        <BiLinkExternal />
                        <BsPlusSquare />
                        <BsHeart />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertyCard
