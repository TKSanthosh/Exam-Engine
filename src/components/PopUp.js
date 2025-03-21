import React, { useState } from 'react';
import './PopUp.css'; // Add this line if you're using an external CSS file
import refresh from './assets/images/refresh.gif';
import { reloadComponent } from './utils';

const PopUp = ({ text }) => {
  const [isOpen, setIsOpen] = useState(true); // Open by default

  const closePopup = () => {
    setIsOpen(false);
  };
 
  return (
    <>
      {isOpen && (
       <div className={text === "QPPage" || text === "SamplePage" ? "popupQP" : "popup"}>
            <div className={text === "QPPage" || text === "SamplePage" ? "popupQP-content" : "popup-content"}>
            <span className="close-button" style={(text === "QPPage" || text === "SamplePage") ? { display: "none" } : {}} onClick={closePopup}>
              &times;
            </span>
            <center>
            {text === "QPPage" ? (
              <p><img className='loading' src={refresh}  onClick={reloadComponent} style={{ width: "50px",cursor:"pointer" }} alt="loading" /> Question Paper Loading..!</p>
            ) : text === "SamplePage" ? (
                <p><img className='loading' src={refresh} style={{ width: "50px" }} alt="loading" /> Sample Question Paper Loading..!</p>
              ) : (
              <p>This is your pop-up message!</p>
            )}
            </center>
          </div>
        </div>
      )}
    </>
  );
};

export default PopUp;
