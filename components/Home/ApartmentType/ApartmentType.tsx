import React from 'react'
import SectionHeading from './../../Helper/SectionHeading';
import ApartmentTypeCard from './ApartmentTypeCard';
const ApartmentType = () => {
    return (
        <div className='pt-16 pb-16'>
            <div className='w-[80%] mx-auto'>
                <SectionHeading heading='Tipos de Departamentos' />
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-10 md:mt-20 gap-8 items-center '>
                    <ApartmentTypeCard type={{ icon: '/images/a1.png', title: 'tipo 1', number: 1 }} />
                    <ApartmentTypeCard type={{ icon: '/images/a2.png', title: 'tipo 2', number: 1 }} />
                    <ApartmentTypeCard type={{ icon: '/images/a3.png', title: 'tipo 3', number: 1 }} />
                    <ApartmentTypeCard type={{ icon: '/images/a4.png', title: 'tipo 4', number: 1 }} />
                    <ApartmentTypeCard type={{ icon: '/images/a5.png', title: 'tipo 5', number: 1 }} />
                </div>
            </div>
        </div>
    )
}

export default ApartmentType
