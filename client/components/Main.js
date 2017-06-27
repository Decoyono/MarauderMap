import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { logout } from '../reducer/user';
import localStore from 'store';
import NameInput from './NameInput'
var Peer = require('simple-peer')
var socket = window.io(window.location.origin);
var output = document.getElementById('out');
var canvasK = document.getElementById('canvas');
var canvas = canvasK.getContext('2d');
var img = document.getElementById("foot");
var floor = document.getElementById("floor");


// Component //

const Main = props => {

  const { children, handleClick, loggedIn } = props;

(function () {

  socket.on('connect', function () {
    console.log('Connected!');
  });
})();
//image load first
(function() {
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.lineWidth = 1;
    drawStuff();
}
resizeCanvas();
})();
function drawStuff(){
    canvas.font = '100px Courier';
    canvas.textAlign = "center"; 
    // canvas.fillText("The Marauder's Map", (window.innerWidth / 2), 100);
    canvas.drawImage(floor, 300, 100, 2000, 2000);
    floor.onload = function() {
    canvas.drawImage(floor, 300, 100, 2000, 2000);
    }
    // canvas.strokeRect(10, 10, 1000, 1000);
}


function geoFindMe() {
  var options = {enableHighAccuracy: true}

  if (!navigator.geolocation){
    output.innerHTML = '<p>Geolocation is not supported by your browser</p>';
    return;
  }

  function success(position) {
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    localStore.set('coords', {latitude, longitude});
    var altLat = (250 * ((10000 * (latitude - 40.70)) - 45.3844))
    console.log("longtoFixed", latitude.toFixed(1))
    console.log("lat", latitude)
    console.log("altLat", altLat)
    console.log("longitutde", longitude)
    var altLong = (500 * ((-10000 * (longitude + 74.00)) - 90.5699))
    console.log("altLong", altLong)
    // canvas.drawImage(img, 10, 10, 50, 50);
    canvas.drawImage(img, altLat, altLong, 75, 75);
    canvas.font = '60px Arial';
    if (localStore.get('name')) {
      // console.log("TAKIN NAMES")
      var userName = localStore.get('name');
      canvas.fillText(userName, altLat, altLong);
    } else {
      var fakeName = 'Anonymous';
      canvas.fillText(fakeName, altLat, altLong);
    }
    console.log()
    
    // console.log('didit')
    // console.log(latitude, longitude)
      // setTimeout(function(){canvas.clearRect(altLat, altLong, 50, 50);}, 4500)
    // setTimeout(function(){canvas.clearRect(0, 0, canvas.width, canvas.height);}, 3500)
    // canvas.clearRect(0, 0, canvas.width, canvas.height)
    socket.emit('gps', {
      userName: userName,
      altLat: altLat,
      altLong: altLong,
      latitude: latitude,
      longitude: longitude
    });
  }

  function error() {
    console.log("Unable to retrieve your location")
  }


  setInterval(function(){navigator.geolocation.getCurrentPosition(success, error, options);}, 5000);

  // setInterval(function(){navigator.geolocation.watchPosition(success, error, options);}, 1000)
}
// setInterval(function(){
//   canvas.clearRect(0, 0, canvas.width, canvas.height);
//   drawStuff();
//   // canvas.drawImage(floor, 0, 0, 2000, 1000);
// //   // canvas.fillText("The Marauder's Map", (window.innerWidth / 2), 100);
// }, 30000);

socket.on('gps', function(data){
  console.log("im here", data.latitude, Number(data.latitude))
  canvas.drawImage(img, data.altLat, data.altLong, 75, 75);
  canvas.font = '60px Arial';
  canvas.fillText(data.userName, data.altLat, data.altLong);
  console.log("what's this", data.altLat, data.altLong)
  // output.innerHTML += '<p>Latitude is ' + data.latitude + '° <br>Longitude is ' + data.longitude + '°</p>'
  // canvas.strokeRect((Number(data.latitude)), (Math.abs(data.longtitude)), 100, 200)
  // canvas.strokeRect(40.884828, 73.2302039, 100, 200)

})

  return (
    <div id="out">
      <h1>The Marauder's Map</h1>
      <NameInput />
      <p><button onClick={geoFindMe()}>I solemnly swear I am up to no good</button></p>
      { children }
    </div>
  );
};

Main.propTypes = {
  children: PropTypes.object,
  handleClick: PropTypes.func.isRequired,
  loggedIn: PropTypes.bool.isRequired
};

// Container //

const mapState = ({ user }) => ({
  loggedIn: !!user.id
});

const mapDispatch = dispatch => ({
  handleClick () {
    dispatch(logout());
  }
});

export default connect(mapState, mapDispatch)(Main);
