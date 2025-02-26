import Home from '@/components/Home/Home'
import React from 'react'
import ResponsiveNav from '@/components/Home/Navbar/ResponsiveNav';

const HomePage = () => {
  return (
    <>
      <ResponsiveNav />
      <div className='has-[2000px]'>
        <Home />
      </div>

    </>

  )
}

export default HomePage
