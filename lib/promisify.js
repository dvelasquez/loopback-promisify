var Q = require('q');


module.exports = function(app) {

  var listStatic = [],
      listProto = ['save'],
      models = app.models();

  function promisifyMethod(fn, customCallback) {
    return function () {
      var args,
        deferred,
        cb;

      deferred = Q.defer();
      if(customCallback) {
        cb = customCallback(deferred);
      }
      else {
        cb = function (err, res) {
          if (err) {
            return deferred.reject(err);
          } else {
            return deferred.resolve(res);
          }
        };
      }

      args = arguments != null ? Array.prototype.slice.call(arguments) : [];
      args.push(cb);
      fn.apply(this, args);
      return deferred.promise;
    };
  };

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
      if ((list.indexOf(methodName) > -1 || typeof method === 'function') && method.promisify !== false) {
        delete obj[methodName].promisify;
        obj[methodName] = promisifyMethod(method, obj);
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
