angular.module('app').factory('Storage', function(){
    var db = window.localStorage;
    // Test that LocalStorage works, return Angular object if disabled
    // @BUG this needs to be much more extensive (search for existing Angular storage factory/service)
    try {
        db.testKey = '1';
        delete db.testKey;
        return db; }
    catch (error) {
        return {}; }
});