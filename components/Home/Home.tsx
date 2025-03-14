import React from 'react'
import Hero from './Hero/Hero'
import ApartmentType from './ApartmentType/ApartmentType'
import Properties from './Properties/Properties'

const Home = () => {
    return (
        <div className='overflow-hidden'>
            <Hero />
            <ApartmentType />
            <Properties />
        </div>
    )
}

export default Home
