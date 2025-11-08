import React from 'react'
import { Link } from 'react-router';

const NavItems = () => {
  return (
    <section className='flex justify-between'>
    <Link to="/">
    <div className='flex items-center gap-2 p-2'>
        <img src="assets/icons/cutlery.png" className='w-[50px]' alt="" />
        <p className='font-bold'>Student Restaurant</p>
    </div>
    </Link>
    </section>
  )
}

export default NavItems
