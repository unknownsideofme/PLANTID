import { useState, useEffect } from "react";
import "./index.css";
import logo from "./assets/Animation - 1742115741358.gif";
import psImg from "./assets/Screenshot 2025-03-16 134017.png";
import first from "./assets/Picture1.png";
import second from "./assets/Picture2.png";
import third from "./assets/inn8.png";
import mainLogo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import acc from "./assets/account_circle_35dp_000000_FILL0_wght400_GRAD0_opsz40.svg"
import learnMoreIcon from "./assets/more_up_24dp_F0EEE6_FILL0_wght400_GRAD0_opsz24.svg";
import AIarrow from "./assets/arrow_right_alt_25dp_FFFFFF_FILL0_wght600_GRAD0_opsz24.svg"
import ArrowWatch from "./assets/live_tv_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"

const Loading = () => {
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, []);

  //   useEffect(() => {
  //     const timer = setTimeout(() => {
  //       setLoading(false);
  //       document.querySelector(".PSimage").classList.add("slideInRight");
  //     }, 4000); // Delay to match loading animation

  //     return () => clearTimeout(timer);
  //   }, []);


  return (

    <div className="main">

      {loading ? (
        // loading page 
        <div className="loadingPG">
          <div className="gradientBG">
            <div className="loadingLogo">
              <img src={logo} alt="loadingLogo" />
            </div>
          </div>
          {/* <div className="bubbles">
    <span></span><span></span><span></span><span></span><span></span>
  </div> */}

          {/* <div className="loadingBar"><div className="loadingProg">
          </div></div> */}
        </div>
      ) : (
        // main page

        <div className="mainPG fadeIn" >
          <div className="mainContent">
            <div className="navbar">
              <div className="logo">
                <img src={mainLogo} alt="logo-img" />
              </div>
              {/* <div className="tagline">tagline...</div> */}
              <div className="accBtn">
                <button className="signUp">Sign Up</button>
                <button className="logIn">Log In</button>
                <div className="acc"><img src={acc} alt="accLogo" /></div></div>
            </div>

            <div className="headContainer">
              <div className="headContainerName">plantid</div>
              <h1 className="headContainerDes">Identify plant diseases. Get instant solutions.
                <div>Chat Now & Get Answers.</div></h1>
              <p className="headContainerContent">Revolutionize your farming with <b>AI-powered plant disease detection</b>! <br />Identify plant diseases early, make smarter decisions & boost crop health for a higher yield.</p>
              <button className="headContainerBtn" onClick={() => navigate("/anotherpage1")}>Ask AI About Your Crops <img src={AIarrow} alt="arrow" /></button>
            </div>
            <div className="firstContainer">
              <div className="PScontainer">
                <h1 className="PS">Early Disease Detection</h1>
                <p className="PScontent"><b>Unsure about your plant's health? </b><br />
                  Simply upload a photo, and our system will analyze it to identify diseases, provide diagnosis steps, and suggest effective solutions. Take the guesswork out of plant care and keep your crops healthy!</p>



                <button className="getStarted" onClick={() => navigate("/another")}>
                  Get Started <img src={AIarrow} alt="arrow" />
                </button>
              </div>
              <div className="PSimage fadeInRight ">
                <img src={psImg} alt="psImg" />
              </div>
            </div>

            <div className="secondContainer">

              <div className="slider-container">
                <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                  <div className={`slide ${currentIndex === 0 ? "active" : ""}`}>
                    <img src={first} alt="Slide 1" />
                    <div className="overlay-text">PLASMA SHOCK</div>
                  </div>
                  <div className={`slide ${currentIndex === 1 ? "active" : ""}`}>
                    <img src={second} alt="Slide 2" />
                    <div className="overlay-text">PLANT HEALTH</div>
                  </div>
                  <div className={`slide ${currentIndex === 2 ? "active" : ""}`}>
                    <img src={third} alt="Slide 3" />
                    <div className="overlay-text">CROP CARE</div>
                  </div>
                </div>

                <div className="dots-container">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className={`dot ${currentIndex === index ? "active" : ""}`} onClick={() => setCurrentIndex(index)}></div>
                  ))}
                </div>
              </div>

              <div className="infoContainer">
                <div className="infoContent"><b><h2>Need help using the chatbox? </h2></b> <br />
                  Follow our step-by-step tutorial to learn how to upload images, identify plant diseases, and get expert solutions. Start now and make the most of your AI assistant!</div>
                <div className="btnSec">
                <a href="https://drive.google.com/file/d/1K33ODObKbPf_MwNv_kDeZHTnBuU-vKWa/view" target="_blank" rel="noopener noreferrer">
                   <button className="tutorial">Watch <img src={ArrowWatch} alt="Arrow" /></button> 
                   </a>
                  <button className="learnMore">Learn More <img src={learnMoreIcon} alt="learnMoreIcon" /></button>
                </div>
              </div>

            </div>

            <div className="thirdContainer">

              <div className="firstSection">
                <div className="firstSectionContent">
                  <h2>Our Aim</h2>
                  <p>At Plantid, our mission is to empower farmers, gardeners, and plant enthusiasts with accurate and timely plant disease identification. By leveraging advanced technology and expert knowledge, we strive to minimize crop losses, promote sustainable farming practices, and enhance plant health. Our goal is to provide reliable solutions that help you detect, prevent, and manage plant diseases effectively.</p>
                </div>
              </div>

              <div className="secondSection">
                <div className="secondSectionContent">
                  <h2>Our Technology</h2>
                  <p>We use cutting-edge AI and machine learning to accurately diagnose plant diseases from images. Our system is trained on a vast database of plant health conditions to ensure precise results and expert-backed recommendations.</p>
                </div>
              </div>


              <div className="thirdSection">
                <div className="thirdSectionContent">
                  <h2>Why Choose Us?</h2>
                  <p><ul>
                    <li>Fast and accurate disease detection</li>
                    <li>User-friendly platform for farmers and gardeners</li>
                    <li>Preventive solutions to safeguard your crops</li>
                  </ul>
                  </p>
                </div>
              </div>

            </div>
           
            <div className="footer">

              <div className="footerContainer">
              
                <div className="footerSection about">
                  <h3>About Us</h3>
                  <p>Your personal assistant for plant health and care. </p>
                </div>
                <hr></hr>
                <div className="footerSection links">
                  <h3>Quick Links </h3>
                  <ul>
                    <li><a href="">Home</a></li>
                    <li><a href="">Services</a></li>
                    <li><a href="">Contact</a></li>
                    <li><a href="">Blog</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;





