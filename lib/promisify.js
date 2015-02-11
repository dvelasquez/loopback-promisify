var Q = require('q');


module.exports = promisify;
promisify.fn = promisifyMethod;

function promisifyMethod(fn, customCallback) {
  var fnp = function () {
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
    if(typeof args[args.length-1] !== 'function') {
      args.push(cb);
    }
    fn.apply(this, args);
    return deferred.promise;
  };
  return fnp;
}

function promisify(app) {

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
      if ((list.indexOf(methodName) > -1 && method.promisify !== false)
        || (typeof method === 'function' && method.promisify === true)) {
        delete obj[methodName].promisify;
        obj[methodName] = promisifyMethod(method);
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
}
