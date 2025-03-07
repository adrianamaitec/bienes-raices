import Home from '@/components/Home/Home'
import React from 'react'
import ResponsiveNav from '@/components/Home/Navbar/ResponsiveNav';

const HomePage = () => {
  return (
    <>
      <ResponsiveNav />
      <div>
        <Home />
      </div>
    </>

  )
}

export default HomePage
