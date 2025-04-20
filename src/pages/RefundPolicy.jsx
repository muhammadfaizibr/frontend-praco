import React from "react";

const RefundPolicy = () => {
  return (
    <div className="centered-layout padding-m column-content gap-m">
      <h2 className="dark">Refund Policy</h2>

      <div className="column-content gap-m">
        <p className="b2 clr-text">
          We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.
        </p>
        <p className="b2 clr-text">
          To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
        </p>
        <p className="b2 clr-text">
          To start a return, you can contact us at{" "}
          <a href="mailto:info@repark.co.uk" className="b2 clr-primary">info@repark.co.uk</a>. Please note that returns will need to be sent to the following address: Unit 2 Brook St, Thurmaston, Leicester LE4 8DA
        </p>
        <p className="b2 clr-text">
          If your return is accepted, we’ll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
        </p>
        <p className="b2 clr-text">
          You can always contact us for any return question at{" "}
          <a href="mailto:info@repark.co.uk" className="b2 clr-primary">info@repark.co.uk</a>.
        </p>
      </div>

      <div className="column-content gap-m">
        <h4 className="dark">Damages and Issues</h4>
        <p className="b2 clr-text">
          Please inspect your order upon reception and contact us immediately if the item is defective, damaged, or if you receive the wrong item, so that we can evaluate the issue and make it right.
        </p>
      </div>

      <div className="column-content gap-m">
        <h4 className="dark">Exceptions / Non-returnable Items</h4>
        <p className="b2 clr-text">
          Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
        </p>
        <p className="b2 clr-text">
          Unfortunately, we cannot accept returns on sale items or gift cards.
        </p>
      </div>

      <div className="column-content gap-m">
        <h4 className="dark">Exchanges</h4>
        <p className="b2 clr-text">
          The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
        </p>
      </div>

      <div className="column-content gap-m">
        <h4 className="dark">European Union 14 Day Cooling Off Period</h4>
        <p className="b2 clr-text">
          Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You’ll also need the receipt or proof of purchase.
        </p>
      </div>

      <div className="column-content gap-m">
        <h4 className="dark">Refunds</h4>
        <p className="b2 clr-text">
          We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
        </p>
        <p className="b2 clr-text">
          If more than 15 business days have passed since we’ve approved your return, please contact us at{" "}
          <a href="mailto:info@repark.co.uk" className="b2 clr-primary">info@repark.co.uk</a>.
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;