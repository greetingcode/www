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
        app.uuid = 1234; //device.uuid; //**********************************
        console.log(app.uuid);
// NOTE: The FormData interface provides an easy way to construct a set of key/value pairs representing form fields and their values,
// which can then be easily sent using the XMLHttpRequest.send() method.
// It uses the same format a form would use if the encoding type were set to "multipart/form-data".
        var params = new FormData(); // Create a new FormData object.
        params.append("uuid", app.uuid); // Appends a new value onto an existing key inside the FormData object, or adds the key
// if it does not already exist.
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
        var xhr = ev.target;
        if (parseInt(xhr.status) < 300) {
            var data = JSON.parse(xhr.responseText);
            if (data.code == 0) { // Zero from PHP = OK
// everything is okay
                console.dir(data.reviews);
                var reviews = data.reviews;
                var list = document.querySelector("‪#‎list‬"); // get the list element
                list.innerHTML = ""; // empty the existing list
                if (reviews.length > 0) { // we have previoucs review(s)
                    console.log("We have existing reviews: " + data.message);
// loop through existing reviews and add a list item for each one
// reviews is an array so we can use array.forEach()
                    reviews.forEach(function (obj) { // forEach accaepts an iterator function and optionally, a value to use as this
// actually has 3 optional arguments: value, index, and an array reference
// create and initialize a new list item
                        var li = document.createElement("li");
                        li.setAttribute("data-review", obj.id);
                        li.textContent = obj.title;
                        list.appendChild(li);
// add click event to the list item so you can get all the details later
                        li.addEventListener("click", app.getDetails);
                        console.log("Existing data: ID: " + obj.id + " Title: " + obj.title + " Rating: " + obj.rating);
                    });
                } else { // no existing reviews
                    console.log("no existing reviews: " + data.message);
// create a single list item and display the default message
                    var li = document.createElement("li");
                    li.className = "loading";
                    li.setAttribute("data-review", 0);
                    li.textContent = data.message;
                    list.appendChild(li);
                }
            } else { // Did not get zero from PHP = NOT OK!
                app.ajaxErr(data);
            }
        } else { // xhr Status Error
            app.ajaxErr({
                "message": "Invalid HTTP Response"
            });
        }
    },
// here you should add getReview with the second url
// add will be using the camera.
    ajaxErr: function (err) {
        alert(err.message); // Houston we have an AJAX problem
    }
};
app.initialize();