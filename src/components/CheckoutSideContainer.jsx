import React from 'react'
import FormSideContainerStyles from 'assets/css/FormSideContainer.module.css'

const CheckoutSideContainer = () => {
  return (
    <div className={FormSideContainerStyles.container}>
      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Total Items</p>
        <p className="b3 dark">22 Items</p>
      </div>

      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Subtotal</p>
        <p className="b3 dark">£66.00</p>
      </div>

      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Estimated Delivery</p>
        <p className="b3 dark">28 Feb 2025</p>
      </div>

      <div className={FormSideContainerStyles.row}>
        <h4 className="dark">Total</h4>
        <h4 className="dark">£66.00</h4>
      </div>      
    </div>
  )
}

export default CheckoutSideContainer