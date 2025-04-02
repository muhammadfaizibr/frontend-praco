import React from 'react'
import PracoMapStyles from "assets/css/PracoMapStyles.module.css"

const PracoMap = () => {
  return (
    <div className={PracoMapStyles.mapWrapper}>
        <p className="c3 clr-white">Find the exact location of Praco on the map</p>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2420.448233657716!2d-1.146306322499458!3d52.65188097209605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487761c2e2686421%3A0x790fb72fa804ab26!2sPraco%20Supplies!5e0!3m2!1sen!2s!4v1743604999921!5m2!1sen!2s" width="100%" height="600" allowfullscreen={true} loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  )
}

export default PracoMap