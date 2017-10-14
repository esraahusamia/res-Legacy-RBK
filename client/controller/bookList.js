angular.module('book-store')

.component('booklist', {
  controller: function () {
    console.log('bookList +++++++++');
    console.log('>>>>>>>>>>>', this.book);
  },
  bindings: {
    book: '<'
  },
  templateUrl: '../templates/bookList.html'
})
