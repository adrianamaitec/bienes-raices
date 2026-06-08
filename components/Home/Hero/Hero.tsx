import SearchBox from '@/components/Helper/SearchBox'
import React from 'react'

const Hero = () => {
    return (
        <div className='w-full pt-[4vh] md:pt-[12vh] h-screen bg-[#0f0715] overflow-hidden relative bg-[url(/images/hero.jpg)] bg-center bg-cover'>
            {/* Overlay */}
            <div className='absolute inset-0 bg-black opacity-50'></div>
            {/* Content */}
            <div className='flex justify-center items-center flex-col w-[95%] sm:w-[80%] h-full mx-auto relative z-10'>
                <h1 className='text-white text-opacity-80 text-center text-base sm:text-lg uppercase font-medium'>El mejor lugar para</h1>
                <h1 className='text-center font-semibold text-3xl sm:text-5xl text-white mt-4'>Encontrar tu hogar deseado</h1>
                <p className='mt-4 text-center text-sm sm:text-base text-gray-200'>Busca una departamento entre todas nuestras opciones</p>
                <div className='mt-12 w-full'>
                    <SearchBox />
                </div>
            </div>
        </div>
    )
}

export default Hero
