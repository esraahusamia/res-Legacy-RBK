var books= angular.module('book-store',['angular.filter'])
books.component('books',{



  controller: function($scope, $http){
    //This part to store comment in the database and bring all the comments on the book in the database
    this.books=window.data;
    this.lists=window.lists
    this.coment;
    this.coments;
    this.sendComent=function(){
      $.ajax({
       async: false, 
       data:{
        id : this.activeBook._id ,
        coment:this.coment
      },
      url: "/coment",
      type:'POST',
      dataType: 'json',
      success: function(result){
       $scope.$ctrl.coments=result;
       console.log($scope.$ctrl.coments)
     }
   })
    }
  
    var that=this;
   
    this.createList = function (listName){
      console.log ('------>', this.activeBook._id,listName)
      $.ajax({
       async: false, 
       data:{
        book_id : that.activeBook._id ,
        listName:listName
      },
      url: "/createList",
      type:'PUT',
      dataType: 'json',
      success: function(result){
       console.log(result)
     }
   })

    }


    this.addToList = function(){
     this.data = {
      target: this.event.target.innerText,
      id : this.activeBook._id
    }
    $http.put("/addToList", this.data)
    .then(function(response) {
      console.log("yeeeeeeeeeeeeeeeeeeeesssssssss");
    })
  }



    //this part to handle the filter of catogories 
    $scope.selected=[];
    $scope.geners=['Career & Study advice','Engineering','IT & Programming','Natural Sciences','others'];
    // $scope.lists = ["read", "want to read", "reading", "favourite"];
    $scope.currentList;
    $scope.exist=function(index){
      var  gener=$scope.geners[index];
      var search = $('#search').val();
      if(search===gener){
        $scope.search='';
      }else{
       $scope.search=gener;
     }
   }
   $scope.toggleSlection= function(item){
    var idx= $scope.selected.indexOf(item);
    if(idx> -1){
      $scope.selected.splice(idx,1);
    }
    else{
      $scope.selected.push(item);
    }
    $scope.$ctrl.books = $scope.selected;
  },
   // this function determine the book clicked in the modal
   this.activeBook={};
   this.changeBook=function (index){
    this.activeBook=index;
  }
  
  $scope.rating = 0;
    $scope.ratings = [{
        current: 3,
        max: 5
         }];

    this.getSelectedRating = function (rating) {
      this.data = {
        rating: rating,
        id : this.activeBook._id
      }
      var that = this;
      $.ajax({
         url : "/getSelectedRating",
         method: 'put' ,
         async: false,
         dataType: 'json',
         data : {
            rating: rating,
            id : that.activeBook._id
          },
         success : function (response) {  
            console.log('hiiiiiiiiiiiiiiiii', response)
            that.activeBook.rating.rate = response;
          }, 
          error : function error(err){
            console.log('err')
          }
       })
    }  
},



templateUrl:`../templates/books.html`

})

books.directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' +
            '</ul>',
        scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&'
        },
        link: function (scope, elem, attrs) {

            var updateStars = function () {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };

            scope.toggle = function (index) {
                scope.ratingValue = index + 1;
                scope.onRatingSelected({
                    rating: index + 1
                });
            };

            scope.$watch('ratingValue', function (oldVal, newVal) {
                if (newVal) {
                    updateStars();
                }
            });
        }
    }
});


