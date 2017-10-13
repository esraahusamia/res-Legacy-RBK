
angular.module('book-store')
  .component('addbook',{
	 controller: function($scope,$http){
	 	this.addBook = function(){
		console.log($scope.book)

		$http({
        method: 'POST',
        url: '/addbook',
        data: $scope.book
       }).then(function successCallback(response) {
       	console.log(response)
       	window.location.href='../index2.html'
       
      }, function errorCallback(response) {
      	console.log('ERROR')
     
      });
	}


	

},
templateUrl:`../templates/addbook.html`
})