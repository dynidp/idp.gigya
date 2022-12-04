/**
 * ----------------
 *  # Engine JS File
 * ----------------
 *
 * This file includes some util and HTML functions to make the site fully functional, and to show/hide elements
 * depending if the user is logged or not. It contains as well the main variables to control the statuses or the
 * user / apikeys loaded in the page. Finally, there are methods to simulate purchases, to reload api keys
 * dynamically or delete totally the logged user. Some of these functions are based in backend calls, that they
 * are authorized using JWT communication between the frontend and the backend.
 * 
 * The file is divided in the next sections:
 *
 *  - 0. window.document Shorthands
 *  - 1. Logs Configuration
 *  - 2. User Global variable
 *  - 3. Demo Core Functions
 *  - 4. Progressive profiling and advanced data functions
 *  - 5. Deletion functions
 *  - 6. Dynamic API Key functions
 *
 * 
 * @link   https://github.com/gigya/cdc-starter-kit/blob/master/js/engine.js
 * @file   This file defines the main functions to make the demo site work.
 * @author juan.andres.moreno@sap.com
 * @since  1.0.0
 */

import {disableChangeApiKeyButton, loadGigyaForApiKey, validateAPIKey} from './dynamic-apikey'

import {log, getFromLocalStorage, getFromQueryString, setInLocalStorage} from "./utils";

// -- 0. window.document Shorthands
const query = document.querySelector.bind(document);
const queryAll = document.querySelectorAll.bind(document);
const logConfigFile = false; // Shows/hides config file into the console

// -- 1. Logs Configuration
var LOGS = false;
var showLog = LOGS;
let showEventsLog = LOGS;



export function changeLanguage(language) {
    // set the language in local storage
    setInLocalStorage("language", language);

    // // Refresh the page
    // location.href = location.href;
}

/**
 * Gets the language from the localStorage
 * @returns {string} The language from the localStorage
 */
export function getLanguage() {
    // get the language from local storage
    return getFromLocalStorage("language");
}
/** *****************************************************/
//                 3. DEMO CORE FUNCTIONS
/** *****************************************************/
/**
 * Loads the configuration file into the window object to be used later on to customize the UI
 */
export function initDemoSite() {
    // log('0. Init Demo site');
    // Read configuration file and load it
    fetch('/config/site.json')
        .then((res) => { return res.json(); })
        .then((out) => {

            // Init webpage
            loadConfigFromFile(out);

        }).catch((err) => { return console.error(err); });
}

export function loadFromConfig(config) {


    // 0. Store config in window global (:-s)
    if (logConfigFile === true) {
        console.table(config);
    }

    // 1. Get proper language
    const storedLanguage = getLanguage();
    if (storedLanguage !== null) {
        config.lang = storedLanguage;
    }

    log("2. Check URL Params  ");
    // After having the initial configuration, we check if we have params that will override these properties.
    // Properties accepted by the app are:
    //
    //      -  apiKey
    //      - screensetPrefix
    //      - showLog
    //      - showEventsLog
    //      - showSampleContent

    // 2. Check if we have the dynamic ApiKey in the url. If yes, substitute in the url
    const apiKeyFromQueryString = getFromQueryString("apiKey");
    var isValidApiKey = false;
    if (apiKeyFromQueryString && apiKeyFromQueryString !== null) {

        isValidApiKey = validateAPIKey(apiKeyFromQueryString) === "OK";
        log("VALID API Key ?" + isValidApiKey + "...", "BACKEND CALL RESPONSE");

        // Checking validity status and modify the change api key button accordingly.
        if (isValidApiKey === true) {

            // Enable the button and show the proper class for the input text
            config.apiKeyFromQueryString = apiKeyFromQueryString;

        } else {
            console.error("Invalid API Key. Loading default one...");
            // Updating error label to reflect the error
            setTimeout(disableChangeApiKeyButton, 1000);
        }
    }

    // 3. Check if we have the dynamic Screenset in the url
    const screensetPrefixFromQueryString = getFromQueryString("screensetPrefix");
    if (screensetPrefixFromQueryString && screensetPrefixFromQueryString !== null) {
        config.raas_prefix = screensetPrefixFromQueryString;
    }


    // 5. Check if we have the flag to show the logs into the page. If yes, override the default value
    const showLogsFromQueryString = getFromQueryString('showLog');
    if (showLogsFromQueryString && showLogsFromQueryString !== null) {
        showLog = showLogsFromQueryString === "true";
    }

    // 6. Check if we have the flag to show the logs into the page. If yes, override the default value
    const showEventLogsFromQueryString = getFromQueryString("showEventsLog");
    if (showEventLogsFromQueryString && showEventLogsFromQueryString !== null) {
        showEventsLog = showEventLogsFromQueryString === "true";
    }

    // API KEY + GIGYA LOAD SECTION
    // Checking if we have api key in local storage
    const apiKeyFromLocalStorage = getFromLocalStorage("reload-with-apikey");

    // Loading (initially) api key from file
    var apiKey = config.apiKey;

    // Check if we have api key in the url
    if (apiKeyFromQueryString && apiKeyFromQueryString !== null && apiKeyFromQueryString !== "" && isValidApiKey === true) {
        // We take the url of the query string and remove the dynamic one
        // setInLocalStorage("reload-with-apikey", apiKeyFromQueryString);
        apiKey = apiKeyFromQueryString;
        // out.apiKey = apiKeyFromQueryString;
    } else {

        if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== "") {
            apiKey = apiKeyFromLocalStorage;
        }
    }

    // 7. Store the exit of the file as a global object to be used along the site
    window.config = config;
    // debugger;
    log("3. Load Gigya for api key: " + apiKey, "LOAD GIGYA FILE");
    return loadScript(apiKey, config.domain || new URLSearchParams(location.search).domain);
}

function loadScript(apiKey, domain) {
    const existing = document.body.querySelector('#gigya-script');

    const script = document.createElement('script');
    // window.onGigyaServiceReady = () => {
    //   resolve(script);
    // }

    const scriptDomain = domain || `cdns.gigya.com`;
    script.id = `gigya-script`;
    script.src = `https://${scriptDomain}/js/gigya.js?apikey=${apiKey}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
        document.body.removeChild(script);
    }
    /*  if(!existing){    }
  
      return () => {
          document.body.removeChild(existing);
      }*/


}


/**
 * Loads the site UI using the configuration file coming as parameter, loading Gigya file at the end.
 * If there are parameters in the query string, these are taken and overrides the ones in the file.
 * @param  {object} out the config from the file
 */
function loadConfigFromFile(out) {

    
    // 0. Store config in window global (:-s)
    if (logConfigFile === true) {
        console.table(out);
    }

    // 1. Get proper language
    const storedLanguage = getLanguage();
    if (storedLanguage !== null) {
        out.lang = storedLanguage;
    }

    log("2. Check URL Params  ");
    // After having the initial configuration, we check if we have params that will override these properties.
    // Properties accepted by the app are:
    //
    //      -  apiKey
    //      - screensetPrefix
    //      - showLog
    //      - showEventsLog
    //      - showSampleContent

    // 2. Check if we have the dynamic ApiKey in the url. If yes, substitute in the url
    const apiKeyFromQueryString = getFromQueryString("apiKey");
    var isValidApiKey = false;
    if (apiKeyFromQueryString && apiKeyFromQueryString !== null) {

        isValidApiKey = validateAPIKey(apiKeyFromQueryString) === "OK";
        log("VALID API Key ?" + isValidApiKey + "...", "BACKEND CALL RESPONSE");

        // Checking validity status and modify the change api key button accordingly.
        if (isValidApiKey === true) {

            // Enable the button and show the proper class for the input text
            out.apiKeyFromQueryString = apiKeyFromQueryString;

        } else {
            console.error("Invalid API Key. Loading default one...");
            // Updating error label to reflect the error
            setTimeout(disableChangeApiKeyButton, 1000);
        }
    }

    // 3. Check if we have the dynamic Screenset in the url
    const screensetPrefixFromQueryString = getFromQueryString("screensetPrefix");
    if (screensetPrefixFromQueryString && screensetPrefixFromQueryString !== null) {
        out.raas_prefix = screensetPrefixFromQueryString;
    }
 

    // 5. Check if we have the flag to show the logs into the page. If yes, override the default value
    const showLogsFromQueryString = getFromQueryString('showLog');
    if (showLogsFromQueryString && showLogsFromQueryString !== null) {
        showLog = showLogsFromQueryString === "true";
    }

    // 6. Check if we have the flag to show the logs into the page. If yes, override the default value
    const showEventLogsFromQueryString = getFromQueryString("showEventsLog");
    if (showEventLogsFromQueryString && showEventLogsFromQueryString !== null) {
        showEventsLog = showEventLogsFromQueryString === "true";
    }

    // API KEY + GIGYA LOAD SECTION
    // Checking if we have api key in local storage
    const apiKeyFromLocalStorage = getFromLocalStorage("reload-with-apikey");

    // Loading (initially) api key from file
    var apiKey = out.apiKey;

    // Check if we have api key in the url
    if (apiKeyFromQueryString && apiKeyFromQueryString !== null && apiKeyFromQueryString !== "" && isValidApiKey === true) {
        // We take the url of the query string and remove the dynamic one
        // setInLocalStorage("reload-with-apikey", apiKeyFromQueryString);
        apiKey = apiKeyFromQueryString;
        // out.apiKey = apiKeyFromQueryString;
    } else {

        if (apiKeyFromLocalStorage && apiKeyFromLocalStorage !== null && apiKeyFromLocalStorage !== "") {
            apiKey = apiKeyFromLocalStorage;
        }
    }

    // 7. Store the exit of the file as a global object to be used along the site
    window.config = out;
    // debugger;
    log("3. Load Gigya for api key: " + apiKey, "LOAD GIGYA FILE");
    loadGigyaForApiKey(apiKey);
}

   