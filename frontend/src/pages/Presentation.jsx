import React from 'react';
import { Link } from 'react-router-dom';
import './Presentation.css';

const Presentation = () => {
    return (
        <div className="presentation-page">
            <div className="presentation-header">
                <img src="/gvplogo.png" alt="GVP Logo Left" className="gvp-logo" onError={(e) => { e.target.style.display = 'none' }} />
                <div className="header-text">
                    <h2>GAYATRI VIDYA PARISHAD</h2>
                    <h1>COLLEGE FOR DEGREE AND P.G COURSES (A)</h1>
                    <p className="accreditation">(Affiliated to Andhra University | Accredited by NAAC With 'A' Grade | ISO 9001: 2015)</p>
                    <p>Visakhapatnam-530045</p>
                    <p className="department">Department of Computer Applications (UG)</p>
                </div>
                <img src="/gvplogo.png" alt="GVP Logo Right" className="gvp-logo" onError={(e) => { e.target.style.display = 'none' }} />
            </div>

            <div className="presentation-title">
                <h1>AI Powered Course Generator For Personalized Learning</h1>
            </div>

            <div className="presentation-footer">
                <div className="footer-left">
                    <p className="footer-title">Project Guide:</p>
                    <p>Mr . B. Divakar</p>
                    <p>Assistant Professor</p>
                    <p>Department of Computer Applications.</p>
                    
                    <p className="slide-no">Slide No: 1/17</p>
                </div>
                <div className="footer-right">
                    <p className="footer-title">Team-8</p>
                    <p>Project Members:</p>
                    <p>1.K.Sai Sampath(2023-2402002)</p>
                    <p>2.N.Venkata Ramana(2023-2402014)</p>
                    <p>3.B.Nomya Sri(2023-2402038)</p>
                    <p>4.D.Anahitha(2023-2402051)</p>
                    <p className="semester">BCA VI SEM</p>
                    
                    <p className="footer-bottom-text">AI Powered Course Generator For Personalized Learning</p>
                </div>
            </div>

            <div className="presentation-action">
                <Link to="/app" className="btn-enter-app">Enter Application</Link>
            </div>
        </div>
    );
};

export default Presentation;
