importScripts('https://www.gstatic.com/firebasejs/8.2.10/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.10/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyBTLzKjK3rFYVzk1JBQqTtt7Tf5SN7ZTVQ",
    authDomain: "acil-shram.firebaseapp.com",
    projectId: "acil-shram",
    storageBucket: "acil-shram.appspot.com",
    messagingSenderId: "1090913107080",
    appId: "1:1090913107080:web:d923287b8ebf59466eb33d",
    measurementId: "G-6V8MN1DE3Q"
});
const messaging = firebase.messaging();