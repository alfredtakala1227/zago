// Give Modernizr.load a string, an object, or an array of strings and objects
Modernizr.load([
  {
    test: Modernizr.mobile || Modernizr.phone || Modernizr.tablet,
    yep: ['../css/touchscreens.css']
  }
]);