import React from "react";
import Layout from "../components/Layout";
import { BiMailSend, BiPhoneCall, BiSupport } from "react-icons/bi";

const Contact = () => {
  return (
    <Layout title={"Contact us"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/contactus.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <h1 className="bg-dark p-2 text-white text-center">CONTACT US</h1>
          <p className="text-justify mt-2">
            For any query or info about product, feel free to call anytime. We are
            available 24X7.  
          </p>
          <div className="mt-3">
            <BiMailSend size={20}/>: www.help@ecommerceapp.com
          </div>
          <div className="mt-3">
            <BiPhoneCall size={20}/>: 012-3456789
          </div>
          <div className="mt-3">
            <BiSupport size={20}/>: 1800-0000-0000 (toll free)
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;