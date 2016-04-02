/**
 * Created by Min on 2016-03-25.
 */
/**
 * Created by Greetingcode on 3/25/2016.
 */
"use strict"; // don't use let or const or fetch!
var app = {
    image: null,
    imgOptions: null,
    imgData: null,
    uuid: null,
    urlGetAllReviews: "https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/",
    urlGetReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/get/",
    urlSetNewReview: "https://griffis.edumedia.ca/mad9022/reviewr/review/set/",
    initialize: function () {
// document.addEventListener('deviceready', this.onDeviceReady, false); //**********************************
        document.addEventListener("DOMContentLoaded", this.onDeviceReady); // for regular development use this
    },
    onDeviceReady: function () {
// Get the device uuid, Note: we will use the device plugin for this
        app.uuid = 'MAD9022'; //device.uuid; //**********************************
        console.log(app.uuid);
// NOTE: The FormData interface provides an easy way to construct a set of key/value pairs representing
// form fields and their values,
// which can then be easily sent using the XMLHttpRequest.send() method.
// It uses the same format a form would use if the encoding type were set to "multipart/form-data".
        var params = new FormData(); // Create a new FormData object.
        params.append("uuid", app.uuid); // Appends a new value onto an existing key inside the FormData object,
// or adds the key if it does not already exist.
//Now get the existing list of reviews:
        app.ajaxCall(app.urlGetAllReviews, params, app.gotList, app.ajaxErr);
    },
    ajaxCall: function (url, formData, success, fail) {
//url - the url to call for xhr
//formData - the data to be sent to the AJAX call
//success - the function to call when successful
//fail - the function to call
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", success);
        xhr.addEventListener("error", fail);
        xhr.send(formData);
    },
    gotList: function (ev) {
        console.log(ev);
    },
    ajaxErr: function (err) {
        alert(err.message); // Houston we have an AJAX problem
    }
};
app.initialize();