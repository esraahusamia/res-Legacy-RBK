angular.module('book-store')

.component('lists',{
  controller: function($scope, $http) {
    this.lists = 'kaka';
  // {
  //   name: 'Favorite Books',
  //   list: [{
  //     title: "حوجن",
  //     image: "https://images.gr-assets.com/books/1367615432l/17880881.jpg",
  //     genre: "Romantic"
  //   }]
  // }
  console.log(this.lists, '-------------');
    // get all user's lists
    var that = this;
    this.getLists = () => {
      console.log('lists ------------');
      $http({
        method: 'GET',
        url: '/getLists'
       }).then(function successCallback(response) {
          that.lists = response.data;
          console.log('++++++>', that.lists);
         }, function errorCallback(response) {
           console.log('----------> ', response.data);
         });
    }
  },
  templateUrl: `../templates/lists.html`
})
