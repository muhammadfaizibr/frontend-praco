import React from 'react'
import NavbarStyles from "assets/css/NavbarStyles.module.css"

const Navbar = () => {
  return (
    <nav>
        <div className={NavbarStyles.logo}>
            <img src="logo" alt="Praco Logo" />
        </div>
        <div className={NavbarStyles.searchbar}>
            <input type="text" name="product-search" id="product-search" />
            <button type="button" name='show-advance-search' id='show-advance-search'>AS</button>
            <button type="button" name='search' id='search'>AS</button>
        </div>
        <div className={NavbarStyles.actionButtons}>
            <button type="button" name="unit-converter">Converter</button>
            <button type="button" name="cart">Cart</button>
            <button className={'primary-button'} type="button" name="login">Login</button>
            <button type="button" name="user-account">Account</button>
            <h1>Test</h1>
        </div>
    </nav>
  )
}

export default Navbar