import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './gigya/main';
import App from './App';
import {createRoot} from 'react-dom/client';
import {Router} from "@reach/router";

// import {initDemoSite} from "./gigya/engine";

// document.addEventListener("DOMContentLoaded", function() {
//     // Initialize the site (and loads Gigya file)
//     initDemoSite();
// });
const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
    <Router>
        <App tab={'home'} path={'/'}/>
    </Router>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
