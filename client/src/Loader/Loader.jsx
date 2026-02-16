// Spinner.js

import React from 'react';
import './loader.css'; // Import the CSS file

const Spinner = () => {
    return (
        <div className="spinner-container">
            <div className="spinner">
                <span>L</span>
                <span>O</span>
                <span>A</span>
                <span>D</span>
                <span>I</span>
                <span>N</span>
                <span>G</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </div>
        </div>
    );
};


export default Spinner;
