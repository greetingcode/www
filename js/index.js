'use strict';

/*
*
*  Created by Minseok Kim(kim00341)
*  Completed on 05/04/2016
*
* */

var app = {
  loadCount: 0, // count each time certain tag is loaded
  hammerSrc: 'js/hammer.min.js', // hammerjs source
  image: null,
  imgOption: null,
  imgData: null,
  uuid: null,
  rating: 0,

  //================================= URLs
  // list page
  urlGetAllReviews: 'https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/',
  // review page
  urlGetReview: 'https://griffis.edumedia.ca/mad9022/reviewr/review/get/',
  // add page
  urlSetNewReview: 'https://griffis.edumedia.ca/mad9022/reviewr/review/set/',


  //================================= Application Constructors
  initialize: function() {
    //******** NEED TO BE CHANGED AS THE BELOW WHEN RUN ON A DEVICE
    document.addEventListener('deviceready', this.onDeviceReady, false);
    //document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
  },

  onDeviceReady: function() {
    var script = document.createElement('script'); // for hammerjs
    script.setAttribute('src', app.hammerSrc);
    document.body.appendChild(script);
    script.addEventListener('load', app.load); // hammerjs loaded
  },

  load: function() {
    app.loadCount++;

    //***************************************************** hammerjs loaded
    if (app.loadCount === 1) {

      //***************************************************** nav tabs interactions
      var tabs = document.querySelectorAll('.page-link');
      [].forEach.call(tabs, function(obj) {
        var hammer1 = new Hammer(obj);
        hammer1.on('tap', app.navigate);                                          // adding event listeners to nav tabs.
      });

      //***************************************************** camera button interactions
      var cameraButton = document.querySelector("#btn");
      var hammer3 = new Hammer(cameraButton);
      hammer3.on('tap', app.callCamera);

      //***************************************************** submit button interactions
      var submit = document.querySelector('#nav_submit');
      var hammer4 = new Hammer(submit);
      hammer4.on('tap', app.addReview);

      //***************************************************** star interactions

      var stars = document.querySelectorAll('span.star');
      [].forEach.call(stars, function(obj){
        var hammer2 = new Hammer(obj);
        hammer2.on('tap', app.changeStar);
      });

      app.image = document.querySelector('#image');                               // for deploying an image on add_page after a picture is taken.
      //app.uuid = 4242;
      //***** THIS SHOULD BE UUID FOR THE SERVER WHEN RUN ON A DEVICE
      app.uuid = device.uuid;                                     // unique id for each device. It becomes a key to the server data exchange

      var params = new FormData();                                                // parameter container for communicating with the server
      params.append('uuid', app.uuid);

      app.ajaxCall(app.urlGetAllReviews,
                   params,
                   app.gotReviewList,
                   app.ajaxErr);                                                  // ajax call
    }
  },


  ///////////////////////// from hammer2.on('tap', app.changeStar)
  // STAR-CLICK INTERACTION PART
  changeStar: function(ev) {
    var spanStar = app.resetStar();
    var star = ev.target;
    var ratingValue = star.dataset.value;
    app.rating = ratingValue;

    var j=4;
    for(var i=0; i<ratingValue; i++) {
      if(j>=0) {
        spanStar[j].style.color = 'darkorange';
        j--;
      }
    }
  },

  resetStar: function() {
    var spanStar = document.getElementsByClassName('star');
    for(var k=0; k<5; k++) {
      spanStar[k].style.color = '#ccc';
    }
    return spanStar;
  },


  ///////////////////////// from hammer1.on('tap', app.navigate)
  // PAGE TRANSITION PART
  navigate: function(ev) {
    ev.preventDefault();
    var previous = document.querySelector('.active-page').id;
    var btn = ev.target;
    var href = btn.href;
    var id = href.split('#')[1];

    //****************************************************** page transition part
    var nextPage = document.getElementById(id);
    var prePage = document.getElementById(previous);

    app.resetStar();

    // VALIDATION for nav bar interactions

    var navList = document.querySelector('#nav_list');
    var navAdd = document.querySelector('#nav_add');
    var navCancel = document.querySelector('#nav_cancel');
    var navSubmit = document.querySelector('#nav_submit');

    switch (nextPage.id) {
      case 'add':
        navList.classList.add('hidden');
        navAdd.classList.add('hidden');
        navCancel.classList.remove('hidden');
        navSubmit.classList.remove('hidden');
        break;
      case 'list':
        navCancel.classList.add('hidden');
        navSubmit.classList.add('hidden');
        navList.classList.remove('hidden');
        navAdd.classList.remove('hidden');
        break;
      default:
          //do nothing
        break;
    }

    // active-page, inactive-page transition; the actual page transition part
    if (nextPage.className !== 'active-page') {
      nextPage.className = 'active-page';
      if (previous.className !== 'inactive-page') {
        prePage.className = 'inactive-page';
      }
    }
  },

  ajaxCall: function(url, formData, success, fail) {

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.addEventListener('load', success);
    xhr.addEventListener('error', fail);
    xhr.send(formData);
  },

  ///////////////////////// from app.ajaxCall(.., .., app.gotReviewList, app.ajaxErr)
  // REVIEW LIST DATA RECEPTION PART
  gotReviewList: function(ev) {

    var xhr = ev.target;
    if (parseInt(xhr.status) < 300) {

      var data = JSON.parse(xhr.responseText);
      if (data.code == 0) {

        var list = document.querySelector('#list');                                               // list page; <section id="list">
        list.innerHTML = '<table class="list-view"></table>';                                     // creating a table and removing the loading txt

        // VALIDATION: have previous review(s)?
        var reviews = data.reviews;
        if (reviews.length > 0) {

          console.log("We have existing reviews: " + data.message);
          app.displayList(data);                                                                  // display the review list
        } else {
          // FAILED

          console.log("no existing reviews: " + data.message);
          var tr = document.createElement("tr");                                                  // create a single list item and display the default message
          tr.className = "loading";
          tr.setAttribute("data-review", 0);
          tr.textContent = data.message;
          list.appendChild(tr);
        }
      } else {
        // FAILED
        app.ajaxErr(data);
      }
    } else {
      // FAILED; xhr Status Error
      app.ajaxErr({
        "message": "Invalid HTTP Response"
      });
    }
  },

  // AJAX ERROR
  ajaxErr: function(err) {

    console.log(err.message);
    document.querySelector('section').innerHTML = 'Oops, an error occurred!';
  },

  ///////////////////////// from app.displayList(data)
  // REVIEW LIST DISPLAY PART
  displayList: function(obj) {
    var reviews = obj.reviews;
    var listView = document.querySelector('.list-view');                                          // review list table

    // building frame for the data
    for (var i = 0; i < reviews.length; i++) {
      var id = reviews[i].id;
      var title = reviews[i].title;
      var rating = reviews[i].rating;
      var star = '';
                                                                                                  // getting id, title, rating for each table row (each item)

      for (var j = 0; j < rating; j++) {
        star += '&#x2605';
      }

      var frame = app.buildFrame(id, star, title);
      star = '';                                                                                  // reset the star
      listView.appendChild(frame);
    }                                                                                             // displaying items in the review list table

    // REVIEW LIST ITEM INTERACTION PART
    var tr = document.querySelectorAll('tr');                                                     // for interactions when clicking the review items
    [].forEach.call(tr, function(obj) {
      var hammer1 = new Hammer(obj);
      hammer1.on('tap', app.detailNavigate);
    });
  },

  ///////////////////////// from var frame = app.buildFrame(id, star, title)
  // REVIEW LIST DISPLAY FRAME(TABLE ROW WITH DATA) BUILDING PART
  buildFrame: function(id, star, ttle) {

    var tr = document.createElement('tr');
    tr.setAttribute('id', id);
    tr.setAttribute('class', 'details');

    var rating = document.createElement('td');
    rating.setAttribute('id', id);
    rating.setAttribute('class', 'details');
    rating.innerHTML = star;

    var title = document.createElement('td');
    title.setAttribute('id', id);
    title.setAttribute('class', 'details');
    title.innerHTML = ttle;

    tr.appendChild(rating);
    tr.appendChild(title);
    return tr;
  },
  ///////////////////////// from hammer1.on('tap', app.detailNavigate);
  // TRANSITION TO DETAIL PAGE
  detailNavigate: function(ev) {

    ev.preventDefault();
    var target = ev.target;
    var id = target.id;
    var href = target.className;
    var detailsPage = document.querySelector('#details');
    detailsPage.innerHTML = '';

                                                                                                // page transition part
    var nextPage = document.getElementById(href);
    var previous = document.getElementById('list');

    // VALIDATION
    if (nextPage.className !== 'active-page') {
      nextPage.className = 'active-page';
      if (previous.className === 'active-page') {
        previous.className = 'inactive-page';
      }
    }
    app.getDetails(id);                                                                         // retrieving data
  },

  // REQUESTING SPECIFIC REVIEW DATA
  getDetails: function(id) {

    var params = new FormData();
    params.append('uuid', app.uuid);
    params.append('review_id', id);
    app.ajaxCall(app.urlGetReview,
                 params,
                 app.getSpecificReview,
                 app.ajaxErr);                                                                  // ajax for one review details.
  },

  // RETRIEVING DATA
  getSpecificReview: function(ev) {

    var xhr = ev.target;
    if (parseInt(xhr.status) < 300) {

      console.log('less than 300');
      var data = JSON.parse(xhr.responseText);
      if (data.code == 0) {

        var checker = Object.keys(data.review_details);
        var detailsPage = document.querySelector('#details');                                   // get the list element
        var table = document.createElement('table');
        table.setAttribute('class', 'detail-view');
        detailsPage.appendChild(table);                                                         // table for the one review detail created
        var review_details = data.review_details;                                               //data from the server

        // we have previoucs review(s)
        if (checker.length > 0) {

          console.log("We have existing reviews: " + data.message);
          table.innerHTML = '';
          app.displayDetails(review_details);
          // EVERYTHING IS GOOD
        } else {

          // FAILED
          console.log("no existing reviews: " + data.message);
          var tr = document.createElement("tr");
          tr.className = "loading";
          tr.setAttribute("data-review", 0);
          tr.textContent = data.message;
          list.appendChild(tr);
        }
      } else {

        // FAILED
        app.ajaxErr(data);
      }
    } else {
      // FAILED: xhr Status Error
      app.ajaxErr({
        "message": "Invalid HTTP Response"
      });
    }
  },

  ///////////////////////// from app.displayDetails(review_details)
  // PREPARATION FOR DISPLAYING SPECIFIC REVIEW DETAILS
  displayDetails: function(obj) {

    var id = obj.id;
    var title = obj.title;
    var review_txt = obj.review_txt;
    var rating = obj.rating;
    var img = decodeURIComponent(obj.img);

    app.frameDetails(id, rating, title, review_txt, img);
  },

  frameDetails: function(id, star, ttle, txt, img) {

    var title = document.createElement('tr');
    title.setAttribute('id', id);
    title.innerHTML = ttle;                                                                             // title completed

    var rating = document.createElement('tr');
    var stars ='';
    for (var j = 0; j < star; j++) {
      stars += '&#x2605';
    }
    rating.innerHTML = stars;                                                                          // rating completed

    var text = document.createElement('tr');
    text.innerHTML = txt;                                                                             // text completed

    var image = document.createElement('tr');
    var imgTag = document.createElement('img');
    imgTag.src = img;
    image.appendChild(imgTag);                                                                        // image completed

    var detailsTable = document.querySelector('.detail-view');

    detailsTable.appendChild(title);
    detailsTable.appendChild(rating);
    detailsTable.appendChild(image);
    detailsTable.appendChild(text);
  },

  ///////////////////////// from cameraButton.addEventListener("click", app.callCamera)
  // CAMERA FUNCTIONS
  callCamera: function() {

    app.imgOptions = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      targetWidth: 250,
      cameraDirection: Camera.Direction.FRONT,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
    navigator.camera.getPicture(app.imgSuccess,
                                app.imgFail,
                                app.imgOptions);
  },

  imgSuccess: function(imageData) {
                                                                                                    // data comes as imageData in base64.
    var add = document.querySelector('#add');
    app.image.src = "data:image/jpeg;base64," + imageData;
    navigator.camera.cleanup();
  },

  imgFail: function(msg) {
    console.log("Failed to get image: " + msg);
  },

  addReview: function() {

    var title = document.querySelector('#title').value;
    var reviewText = document.querySelector('#review_text').value;
    var base64 = encodeURIComponent(app.image.src);
    var rating = app.rating;
    var li = document.querySelector('li.warning');

    var params = new FormData();

    if (title != '' && reviewText != '' && app.rating != 0) {

      params.append('uuid', app.uuid);
      params.append('action', 'insert'); // for php
      params.append('title', title);
      params.append('rating', rating);
      params.append('review_txt', reviewText);
      params.append('img', base64);

      app.ajaxCall(app.urlSetNewReview,
          params,
          app.reviewSave,
          app.ajaxErr);

    } else {
      li.classList.remove('hidden');
    }

  },

  reviewSave: function(ev) {
    location.reload();
    app.rating = 0;
  }

};

app.initialize();