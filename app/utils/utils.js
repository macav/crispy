module.exports = function() {
  return {
    findWhere: function(a, params) {
      for (var i = 0; i < a.length; i++) {
        var result = true;
        for (var p in params) {
          if (params.hasOwnProperty(p) && params[p] != a[i][p]) {
            result = false;
          }
          if (result) {
            return a[i];
          }
        }
      }
      return null;
    },
    findById: function(a, id) {
      for (var i = 0; i < a.length; i++) {
        if (a[i]._id.equals(id)) {
          return a[i];
        }
      }
      return null;
    }
  }
}
