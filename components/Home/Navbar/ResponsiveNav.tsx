"use client";
import React, { useState } from 'react'
import NavbarHome from './NavbarHome'
import MobileNav from './MobileNav'

const ResponsiveNav = () => {
    const [showNav, setShowNav] = useState(false);
    const openNavHandler = () => setShowNav(true);
    const closeNavHandler = () => setShowNav(false);

    return (
        <div>
            <NavbarHome openNav={openNavHandler} />
            <MobileNav showNav={showNav} closeNav={closeNavHandler} />
        </div>
    )
}

export default ResponsiveNav
