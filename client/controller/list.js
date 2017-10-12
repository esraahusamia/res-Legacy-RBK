angular.module('book-store')
.component('list', {
  controller: function () {
    console.log('list ---------', this.list);
  },
  bindings: {
    list: '<'
  },
  templateUrl: '../templates/list.html'
})
// title
// gener
// image
