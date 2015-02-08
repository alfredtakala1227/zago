angular.module('app').factory('Styling', function(){
    var div = document.createElement('style');
    div.id = "stylesheet";
    div.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(div);

    return {
        'add' : function(str){ div.innerHTML = div.innerHTML.concat(str); },
        'clear' : function(){ div.innerHTML = ''; }
    }
});