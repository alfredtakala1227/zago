$(document).ready(function(){
	// Route to Legacy View via AppCtrl route() function
	angular.element(document.getElementById('body')).scope().route('legacy', true);
});