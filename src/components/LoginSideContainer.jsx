import React from 'react'
import FormSideContainerStyles from 'assets/css/FormSideContainer.module.css'
import HeadingBar from './HeadingBar'
import { Link } from 'react-router-dom'

const LoginSideContainer = () => {
  return (
    <div className={FormSideContainerStyles.container}>
   <HeadingBar
           displayType={"column"}
           headline={"New to Praco?"}
           headlineSize={"h4"}
           highlightedText={"Create Your Customer Account"}
           headlineSizeType={"tag"}
           hideDivider={true}
         />
         <p className='c3'>Create a customer account for easy shopping, exclusive deals, and fast checkout on Praco packaging supplies.</p>
         <Link className="primary-btn large-btn full-width text-large anchor-btn" to={'/signup'}>
        Create an Account
      </Link>
    </div>
  )
}

export default LoginSideContainer