var Q = require('q');


module.exports = function(app) {

  var listStatic = [],
      listProto = ['save'],
      models = app.models();

  function toPromisify(obj, list) {
    Object.keys(obj).forEach(function(methodName) {
      var method = obj[methodName];
      if(typeof method === 'function' && method._delegate) {
        list.push(methodName);
      }
    });
  }

  function doPromisify(obj, list) {
    Object.keys(obj).forEach(function(methodName) {
      var method = obj[methodName];
      if (typeof method === 'function' && list.indexOf(methodName) > -1 && (method.promisify || method.promisify === undefined)) {
        delete method.promisify;
        obj[methodName] = Q.nbind(method, obj);
        method.promised = true;
      }
    });
  }

  toPromisify(app.loopback.PersistedModel, listStatic);
  toPromisify(app.loopback.PersistedModel.prototype, listProto);


  models.forEach(function(Model) {
    if(Model.definition.settings.promisify) {
      doPromisify(Model, listStatic);
      doPromisify(Model.prototype, listProto);
    }
  });
};
