'use strict';

module.exports = function(Comfortbox) {
    /**
     * Display a message on a ComfortBox.
     * 
     * @param {string} text Text to display on the ComfortBox
     * @param {Function(Error, response)} callback
     */
    Comfortbox.prototype.displayText = function(text, callback) {
        console.log("Called function displayText with param text: " + text);

        var processResponse = function (error, response, body) {
            var result = processParticleResponse(error, response, body);
            callback(null, result);
        };

        console.log("Requesting Particle API with particle_id: " + this.particle_id);
        Comfortbox.app.dataSources.ParticleAPI.displayText(this.particle_id, text, processResponse);
    };

    /**
     * Display various LED colors on a ComfortBox.
     * 
     * @param {string} colorsInBase64 Colors to display on the ComfortBox formatted in Base64
     * @param {Function(Error, response)} callback
     */
    Comfortbox.prototype.displayLed = function(colorsInBase64, callback) {
        console.log("Called function displayLed with param colorsInBase64: " + colorsInBase64);

        var processResponse = function (error, response, body) {
            var result = processParticleResponse(error, response, body);
            callback(null, result);
        };

        console.log("Requesting Particle API with particle_id: " + this.particle_id);
        Comfortbox.app.dataSources.ParticleAPI.displayLed(this.particle_id, colorsInBase64, processResponse);
    };

    /**
     * Display a single LED color in HEX on a ComfortBox.
     * 
     * @param {string} colorInHex Color to display on the ComfortBox formatted in HEX
     * @param {Function(Error, response)} callback
     */
    Comfortbox.prototype.displayHexColor = function(colorInHex, callback) {
        console.log("Called function displayHexColor with param colorInHex: " + colorInHex);
        var base64Color = convertHexToBase64(colorInHex);
        var colorsInBase64 = multiplyBase64Color(base64Color, 24);

        var processResponse = function (error, response, body) {
            var result = processParticleResponse(error, response, body);
            callback(null, result);
        };

        console.log("Requesting Particle API with particle_id: " + this.particle_id);
        Comfortbox.app.dataSources.ParticleAPI.displayLed(this.particle_id, colorsInBase64, processResponse);
    };
    
};

// *****************************************************************************
// Helper functions

var processParticleResponse = function (error, response, body) {
    console.log("Processing response from Particle API.");
    var result;
    if (!error) {
        //if (body.statusCode === 200) {}
        console.log('response: ', response);
        // TODO: parse Particle API response 
        result = response[0];
    } else {
        console.log('Error received from calling Particle API: ' + error);
        console.log('response: ', response);
        if (error.statusCode === 401) {
            console.error("Received statusCode 401 from ParticleAPI. Did you enter your Particle token within the file './server/datasources.json'?");
        }
        result = error;
    }
    return result;
}

var convertHexToBase64 = function (hexColor) {
    if (hexColor.length % 2) {
        // Check if there is a '#' at the beginning.
        if (hexColor.startsWith('#')) {
            hexColor = hexColor.substring(1, hexColor.length);
        }
        else {
            console.error("The hexColor is odd and doesn't start with a '#': " + hexColor);
            return "";
        }
    }
    var binaryArray = new Array();
    for (var i = 0; i < hexColor.length / 2; i++) {
        var hexPart = hexColor.substr(i * 2, 2); // Parse to binary through the HEX string 
        binaryArray[i] = parseInt(hexPart, 16);        
    }
    var base64Color = new Buffer(binaryArray, 'binary').toString('base64');
    console.log("Converted HEX '" + hexColor + "' to Base64 '" + base64Color + "'.");
    return base64Color;
}

var multiplyBase64Color = function (base64Color, times) {
    var ledString = "";
    for (var i = 0; i < times; i++) {
        ledString += base64Color;
    }
    while (ledString.length < 96) {
        // Fill up ledString with A's (black color).
        ledString += "A";
    }
    console.log("ledString: " + ledString);
    return ledString;
}