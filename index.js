var express = require('express');
var http=require('http');
var bcrypt=require('bcrypt-nodejs');
var mongoose =require ('mongoose');
var db=require('./database/index');
var books1 = require('google-books-search');
var bodyParser = require('body-parser');
var books=require('./database/model/books'); 
var users=require('./database/model/users');
var reviews=require('./database/model/reviews');
var session=require('express-session'); 
var morgan = require('morgan')

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname+'/client'));
var port=process.env.PORT ||1128;

//this part for user login & signup
//intialize  user session
app.use(session({
  secret:"shhh it's a secret",
  resave:false,
  aveUnintinalized:true
}));

// app.get('/index2',function(req, res){
//   res.redirect('/index2.html');
// })
app.get('/logout', function(req, res) {
  req.session.username = null;
  console.log('->>>>>>>>>>>>>', req.session);
  res.redirect('/login');
});

app.get ('/', (req, res) => {
  console.log ('aaaaaaaaaaaaa')
  if ( !!req.session.username ){
    res.redirect ('/index2.html');
  }else{
    res.redirect ('/login');
  }
})

app.get ('/index2', (req, res) => {
  // console.log (req.session.username, '--------', !!req.session.username);
  if (!!req.session.username){
    res.redirect ('/index2.html');
  }else{
    // console.log ('-------- refused to login')
    res.redirect ('/login');
  }
})

//render the login page
app.get('/login', 
  function(req, res) {
    res.redirect('login.html');
  });
//render the signup page
app.get('/signup', 
  function(req, res) {
    res.redirect('/signup.html');
  });
//this post to handle the sigin up post from the client
app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
      //check if user is already exsist  
      users.findOne({ username: username })
      .exec(function(err, user) {
        //if the user dosen't exsist 
        if (!user) {
          var newUser = new users({
            username: username,
            password: password
          });
          //save the new user in the database 
          newUser.save(function(err, newUser) {
            if (err) {
              res.send(500, err);
            }
            else {
              // createSession(req, res, newUser);
              req.session.username=newUser.username
              res.redirect("/")

            }
          });
        } 
        else {
          console.log('Account already exists');
          res.redirect('/signup.html');
        } 
      });
    });
//create the user session 
var createSession = function(req, res, newUser) {
  return req.session.regenerate(function() {
    console.log( req.session)
    req.session.user = newUser;
    res.redirect('index2.html');
  });
};
//comparing the input password to the saved one in the database 
var comparePassword = function (attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    if(err) {
      callback(err, null);
    }
    else {
      callback(null, isMatch);
    }
  });
}
//handle the login post 
app.post('/login', function(req, res) {
  console.log ('++++++> ');
  var username = req.body.username;
  var password = req.body.password;
  //check if the user in the database or not 
  users.findOne({ username: username }, function(err, user) {
   if (!user) {
     res.redirect('/login');
   } else {
     // comparePassword(password, function(err, match) {
     //  if (match) {
        // users.createSession(req, res, user);
        if (password === user.password){
        req.session.username = user.username;
        console.log ('----> ', req.session.username)
        res.redirect ('/index2');
      } else {
        res.redirect('/login');
      }
    // });
   }
   })
  });
//end of user siginup and login handling

app.get ('/logout', (req, res) => {
  req.session.username = null;
  redirect ('/login');
})

//this part for search in google Api
app.post('/search',function (req,res){
  books1.search( req.body.token, function(error, results) {
    //console.log(req.session)
    if ( ! error ) {
      res.json(results);
    } else {
      console.log(error);
    }
  });
})
//this part is for comment storing and send all the comments to the client 
app.post('/coment',function (req,res){
  review=new reviews({bookid:req.body.id,text:req.body.coment});
  review.save(function(err, result){
    if(err){
      res.status(500).send(err);
    } 
  })
  reviews.find({bookid:req.body.id}).exec(function(err, data){
    if(err){
      console.log(error);
    }else{
      res.json(data)
    }
    
    })
  })
//this get to send all the books data from the database to the client 
//it will recived in index2.html page 
app.get('/init',function (req,res){
  books.find({},function(err, result){
    res.json(result)
  })
})

// app.post('/addToList',function(req,res){
//   users.findOne({
//     username: req.session.username
//   }, (err, user) => {
//     if (err) console.log (err);

//     users.update({
//       lists: 
//     })
//   })
// })

app.put('/createList',function(req,res){
  // mongo.connect(url,function(err,db){
    console.log ('llllllllllllll')
    users.update(
      {username:req.session.username},
      {$push:
        {lists: {listName: req.body.listName, list: [req.body.book_id]}}
      },function(err,updateList){
        if(err)
          console.login('error')
        else
          res.send(updateList)
      }
    )

  })

app.get('/getLists',function(req,res){
  var book= db.collection('users').findOne({username:req.body.username}, (err, user) => {
    if(err)
      console.log(err)
    res.send(user.lists);
  })
    // res.redirect('/index')

})

app.post('/addbook', (req, res) => {
  var book = req.body.data;
  console.log("boookoskdoskdosjds",req.body)

  books.create({title:req.body.title,
                 gener:req.body.gener,
                 publisher:req.body.publisher,
                 pages:req.body.pages,
                 description:req.body.description,
                 Auther:req.body.Auther,
                  image:req.body.image}, (err, book) => {
    if(err){
      throw err;
    }
    // console.log('boooooooooooooooooooooooooooook',book)
    res.json(book);
  });
});
// [{listName:req.body.listName,list:[req.body.book_id]}]
// app.post('/index',function(req,res){
//   mongo.connect(url,function(err,db){
//     assert.equal(null,err)
//     db.collection('users').insertOne(
//       [{listName:req.body.listName,bookId:req.body.Id}
//        ]
//        ,function(err,result){
//     console.log('inserted');
//     db.close();
//   })
//   })
// })



// books.create({title:'creating-your-cv-as-a-self-marketing-tool',
//   gener:'Career & Study advice',

// description:"Whether you are just starting out on your career or are in employment, your job searching must have one tool before that journey starts and that is a professional CV.Your CV needs a creative and meaningful profile, clearly identifying your achievements and what you have to offer a potential employer through your personal skills and abilities.This book goes through a structured approach of how to tackle each key stage in order to bring your CV together, by carrying out a number of self analysis exercises.The benefits include increased confidence, self esteem and the belief that you will find the job you are looking for.",

// publisher:'The eBook company',
// Auther:'Paul H Brisk',
// publishDate:'2010',
// pages:118,
// rating :0 ,
// reviews :'' ,
// pdf:'creating-your-cv-as-a-self-marketing-tool.pdf',
// image:'creating-your-cv-as-a-self-marketing-tool.jpg'},
//   {title:'personal-confidence-and-motivation',
//   gener:'Career & Study advice',
//   description:'Do you have the self belief and confidence to make a difference Do you just know that you ll succeed no matter what Do you know what motivates and gets you ',
// publisher:'MTD Training & The eBook company',
// Auther:'Sean McPheat',
// publishDate:'2013',
// pages:60,
// rating :0 ,
// reviews :'' ,
// pdf:'personal-confidence-and-motivation.pdf',
// image:'personal-confidence-and-motivation.jpg'},
//   {title: 'nlp-skills-for-learning',
//   gener:'Career & Study advice',

//   description: "If you're an experienced trainer or presenter and you want to find out how NLP can help you to transform your skills then this book is for you.This book is written to both teach and demonstrate the application of NLP as a learning tool, with ready made exercises and applications to use right away.Peter Freeth has over twenty years' experience in using NLP to improve training in subjects from leadership and sales through to customer service and technical training . NLP - Skills for Learning is a NLP trainer's book, a book about NLP for trainers and a general introduction to NLP - all in one.",

//   publisher:'Peter Freeth',
//   Auther:'Peter Freeth',
//   publishDate:'2013',
//   pages:178,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'nlp-skills-for-learning.pdf',
//   image:'nlp-skills-for-learning.jpg'},


//   {title:'WHO AM I ?',
//   gener:'Career & Study advice',
// description:"There is more to life than just living. There has to be more to life than to just live. There should be a higher purpose in life. The purpose of life is to come to the real answer of ‘Who am I?’ This is the unanswered question of infinite previous lives. The missing links of the search for ‘Who am I?’ are now being provided through the words of the Gnani Purush (The One who is completely Self-Realized). These words are edited for the purpose of comprehension. Who am I? What am I not? Who is the Self? What is mine? What is not mine? What is bondage? What is Moksha (liberation)? Is there a God? What is God? Who is the ‘doer’ in the world? Is God the ‘doer’ or not? What is the real nature of God? What is the nature of the real ‘doer’ in this world? Who runs the world? How does it function? What is the real nature of illusion? Whatever one knows is it real or is it an illusion? Will one become free or remain bound with the knowledge one has? This book will give the precise understanding of the truth behind these questions.",

// publisher:'Mr. Ajit C. Patel ,Mahavideh Foundation',
// Auther:'Dr. Niruben Amin',
// publishDate:'2006',
// pages:86,
// rating :0 ,
// reviews :'' ,
// pdf:'who-am-i.pdf',
// image:'who-am-i.jpg'},




// {title: 'a-first-course-on-aerodynamics',
//   gener:'Engineering',

//   description: "A First Course on Aerodynamics is designed to introduce the basics of aerodynamics to the unfamiliar reader. This text avoids lengthy and complicated derivations, focusing on primary equations and fundamental concepts. Detailed figures and explanations of important mathematical equations are interspersed throughout the text. This e-book can be downloaded free of charge.",

//   publisher:'Arnab Roy & bookboon.com',
//   Auther:'Arnab Roy',
//   publishDate:'2012',
//   pages:100,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'a-first-course-on-aerodynamics.pdf',
//   image:'a-first-course-on-aerodynamics.jpg'},




//   {title: 'construction-financial-management-exercises',
//   gener:'Engineering',

//   description: "This book contains the answers to the Exercise Questions contained in the 3rd edition of the book “Construction Financial Management” published by Bookboon (Denmark) in 2015. There are altogether 20 exercise questions spread in eight chapters of the book. One of them is an open-ended question and so the answer is not given. This book therefore contains 19 answers. Readers may treat these 19 answers as worked examples. They may find that Exercises Questions 4 and 5 of Chapter 3 and Exercise Question 2 of Chapter 4 are interesting and challenging. These are the author’s original work, and as far as the author knows readers will not find these in any other people’s works.",

//   publisher:'S.L. Tang & bookboon.com',
//   Auther:'S.L. TANG',
//   publishDate:'2017',
//   pages:56,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'construction-financial-management-exercises.pdf',
//   image:'construction-financial-management-exercises.jpg'},



//   {title: 'membrane-bioreactor-for-wastewater-treatment',
//   gener:'Engineering',

//   description: "his edited book aims to include the most related and practical knowledge about MBR. Detailed discussion about deep scientific knowledge in all fields of MBR is not addressed. The book starts from the introduction of biological wastewater treatment. In addition, the book focuses on knowledge of membrane, performance of MBR and its operation. This book is suitable for person who does not have any background in MBR. After reading this book, readers should be acquainted with MBR.",

//   publisher:'Dr. Jixiang Yang & bookboon.com',
//   Auther:'Dr. Jixiang Yang',
//   publishDate:'2013',
//   pages:125,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'membrane-bioreactor-for-wastewater-treatment.pdf',
//   image:'membrane-bioreactor-for-wastewater-treatment.jpg'},



//   {title: 'micro-and-nano-transport-of-biomolecules',
//   gener:'Engineering',

//   description: "This e-book introduces the reader to biomolecules and describes the experimental and theoretical aspects of their micro- and nano-scale motion in water. Particular emphasis is given to their transport in engineered micro-environments where they are driven by externally imposed electric fields. Envisaged application technologies of this wide-ranging science involve healthcare, food provisioning, environmental services, etc. The e-book is generally intended for undergraduate students studying chemical, life, physical and engineering sciences, and also interdisciplinary researchers.",

//   publisher:'David Bakewell & Ventus Publishing ApS',
//   Auther:'David Bakewell',
//   publishDate:'2009',
//   pages:96,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'micro-and-nano-transport-of-biomolecules.pdf',
//   image:'micro-and-nano-transport-of-biomolecules.jpg'},



//   {title: 'theory-of-waves-in-materials',
//   gener:'Engineering',

//   description: "The book unites the basic theoretical facts from two parts of solid mechanics – mechanics of materials and mechanics of wave processes. It links three important for engineering mechanics groups of fundamental facts from modern mechanics: the basic physical properties of materials; the reflecting these properties mathematical models and the corresponding to these models mechanical theories; the characteristic features of propagation of waves while the waves being analyzed within the framework of the basic models on examples of simplest types of waves.",

//   publisher:'Jeremiah Rushchitsky & bookboon.com',
//   Auther:'Jeremiah Rushchitsky',
//   publishDate:'2011',
//   pages:270,
//   rating : 0,
//   reviews :'' ,
//   pdf:'theory-of-waves-in-materials.pdf',
//   image:'theory-of-waves-in-materials.jpg'},




// {title: 'an-introduction-to-java-programming-2',
//   gener:'IT & Programming',

//   description: "The three books in the Java series aim to give the learner a deep understanding of the Standard Edition (SE) Application Programming Interface (API) of the Java programming language. The series begins with an introduction to the basic concepts of Java objects and concludes with an exploration of the development of Java programmes that employ a graphical user interface to the business logic of a Java application",

//   publisher:'David Etheridge & Ventus Publishing ApS',
//   Auther:'David Etheridge',
//   publishDate:'2009',
//   pages:118,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'an-introduction-to-java-programming-2.pdf',
//   image:'an-introduction-to-java-programming-2.jpg'},



// {title: 'object-oriented-programming-using-java',
//   gener:'IT & Programming',

//   description: "This book will explain the Object Oriented approach to programming and through the use of small exercises, for which feedback is provided, develop some practical skills as well. At the end of the book one larger case study will be used to illustrate the application of the techniques. This will culminate in the development of a complete Java program which can be downloaded with this book. Topics covered include : Abstraction, Inheritance, Polymorphism, Object Oriented Software Analysis and Design, The Unified Modelling Language (UML) , Agile Programming and Test Driven Development.",

//   publisher:'Simon Kendal & bookboon.com',
//   Auther:'Simon Kendal',
//   publishDate:'2009',
//   pages:216,
//   rating : 0,
//   reviews :'' ,
//   pdf:'object-oriented-programming-using-java.pdf',
//   image:'object-oriented-programming-using-java.jpg'},



//   {title: 'policing-cyber-crime',
//   gener:'IT & Programming',

//   description: "Computer crime is an overwhelming problem worldwide. It has brought an array of new crime activities and actors and, consequently, a series of new challenges in the fight against this new threat (Picard, 2009). Policing computer crime is a knowledge-intensive challenge because of the innovative aspect of many kinds of computer crime.In this textbook you will learn more about Policing Cyber Crime. In this book a definition and examples of cyber crime will be given. Further you can read about crime protection and crime investigations",

//   publisher:'Petter Gottschalk & bookboon.com',
//   Auther:'Petter Gottschalk',
//   publishDate:'2010',
//   pages:159,
//   rating : 0,
//   reviews :'' ,
//   pdf:'policing-cyber-crime.pdf',
//   image:'policing-cyber-crime.jpg'},



//   {title: 'SQL: A Comparative Survey',
//   gener:'IT & Programming',

//   description: "SQL: A Comparative Survey is a companion to Hugh Darwen’s An Introduction to Relational Database Theory, best studied in parallel with that text. Closely following the structure of the theory book, it shows how the examples in that book can be expressed in SQL. SQL’s many deviations from relational database theory are thus exposed and their consequences discussed. Drawing on the author’s long experience as a member of the committee responsible for production of the ISO SQL standard, the book includes copious Historical Notes showing how SQL has evolved from its very beginnings in the 1970s",

//   publisher:'Hugh Darwen & bookboon.com',
//   Auther:'Hugh Darwen',
//   publishDate:'2014',
//   pages:169,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'sql-a-comparative-survey.pdf',
//   image:'sql-a-comparative-survey.jpg'},



//   {title: 'Fundamentals of Chemistry',
//   gener:'Natural Sciences',

//   description: "This book is about fundamental concepts that any chemistry student should not only be aware of but proficient at. This book deals with the states of matter, the mole, the shapes of molecules, the elements and their properties in the periodic table, the electronic structure of the elements and includes many numerical examples to apply the newly-learned concepts. Solutions to the exercises will be provided in the second volume of “Fundamental of Chemistry",

//   publisher:'Romain Elsair & bookboon.com',
//   Auther:'Romain Elsair',
//   publishDate:'2012',
//   pages:133,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'fundamentals-of-chemistry.pdf',
//   image:'fundamentals-of-chemistry.jpg'},



//   {title: 'INTRODUCTION TO ASTRONOMY',
//   gener:'Natural Sciences',

//   description: "This book is aimed at first year university students. The comprehensive tour through astronomy stretches from the solar system to the stars, which are followed from infancy to their spectacular supernovae ends. Observational facts are balanced against the understanding of the physics behind, where the discussions of physics are kept at a fundamental level. The astronomer’s basic tools and challenges are briefly described, familiarising the reader with the terminology of this science. ",

//   publisher:'Dr. Karina Kjær & bookboon.com',
//   Auther:'DR. KARINA KJÆR',
//   publishDate:'2016',
//   pages:162,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'introduction-to-astronomy.pdf',
//   image:'introduction-to-astronomy.jpg'},



//   {title: 'INTRODUCTORY CLIMATE SCIENCE; GLOBAL WARMING EXPLAINED',
//   gener:'Natural Sciences',

//   description: "he book is a primer for students of the climate. It will also be of use to anyone wishing to understand the science underlying global warming from increasing greenhouse gas concentrations.",

//   publisher:'Terry Sloan & bookboon.com',
//   Auther:'TERRY SLOAN',
//   publishDate:'2016',
//   pages:202,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'introductory-climate-science.pdf',
//   image:'introductory-climate-science.jpg'},


//   {title: 'Study notes for Statistical Physics',
//   gener:'Natural Sciences',

//   description: "This is an academic textbook for a one-semester course in statistical physics at honours BSc level. It is in three parts and begins with a unified treatment of equilibrium systems, based on the concept of the statistical ensemble, in which the usual combinatorial calculation only has to be worked out once. In the second part, it deals with strongly interacting systems in terms of many-body theory, including the virial expansion and critical phenomena at the level of mean-field theory. The third, and last, part of the book is concerned with time-dependence; and, it begins with a classical treatment of the paradox posed by the `arrow of time'. This is the question of why macroscopic systems are irreversible when their constituent microscopic interactions are reversible in time. It then treats the derivation of transport equations, linear response theory, and quantum dynamics. Throughout the book, the emphasis is on a clear, concise exposition, with all steps being clearly explained.",

//   publisher:'W. David McComb & bookboon.com',
//   Auther:'W. David McComb',
//   publishDate:'2015',
//   pages:116,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'study-notes-for-statistical-physics.pdf',
//   image:'study-notes-for-statistical-physics.jpg'},




//   {title: '50 WAYS TO FALL IN LOVE WITH YOUR LIFE',
//   gener:'others',

//   description: "How to Have Eros are 60 ideas and ways to keep your “juice” going, keep you feeling passionate and renewed with enthusiasm for life, even with “all the slings and arrows of misfortune” that beset us daily. These 60 ideas are tonics and pick-me-ups to keep you enthralled with life and ensure you are enthralling to others.",

//   publisher:'Gay Walley & bookboon.com',
//   Auther:'GAY WALLEY',
//   publishDate:'2016',
//   pages:66,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'50-ways-to-fall-in-love-with-your-life.pdf',
//   image:'50-ways-to-fall-in-love-with-your-life.jpg'},


//   {title: 'CONTROL YOUR STRESS & MANAGE YOUR TIME!',
//   gener:'others',

//   description: "This is a fresh innovative diversion from traditional ‘how-to-do it’ books dealing with stress and time. Aimed at today’s professionals, as well as students and members of the general public, overburdened by stress and anxiety and failing to master their time schedules. The book offers a novel, scientifically supported, and unique approach in helping the readers fully understand the nature of stress and anxiety and the concept of time. In its practical contribution the book provides a variety of easy to learn and to apply techniques aimed to help the readers’ ability to successfully control their stress and effectively manage their time. Basically an enjoyable, ‘must’ download and read book.",

//   publisher:'Georgios P. Piperopoulos & bookboon.com',
//   Auther:'GEORGIOS P. PIPEROPOULOS',
//   publishDate:'2017',
//   pages:65,
//   rating : 0,
//   reviews :'' ,
//   pdf:'control-your-stress-manage-your-time.pdf',
//   image:'control-your-stress-manage-your-time.jpg'},



//   {title: 'I Still Can’t Speak English',
//   gener:'others',

//   description: "Read how you can finally learn to speak English quickly by curating your own free and hugely effective social learning and social media English course.Follow the process and you will improve as much as the learners in the real case studies. One, a typically frustrated adult Chinese English learner, went from beginner to intermediate after just 18 hours of practice.English Out There, developed on the streets of London over 7 years with real paying students, has helped thousands of frustrated learners to experience rapid and permanent improvement.",

//   publisher:'Languages Out There Ltd',
//   Auther:'Jason West',
//   publishDate:'2013',
//   pages:71,
//   rating :0 ,
//   reviews :'' ,
//   pdf:'i-still-cant-speak-english.pdf',
//   image:'i-still-cant-speak-english.jpg'},



//   {title: 'Sustainable Food Systems',
//   gener:'others',

//   description: "Faced with a global threat to food security, it is perfectly possible that society will respond, not by a dystopian disintegration, but rather by reasserting co-operative traditions. This book, by a leading expert in urban agriculture, offers a genuine solution to today’s global food crisis. By contributing more to feeding themselves, cities can allow breathing space for the rural sector to convert to more organic sustainable approaches.Biel’s approach connects with current debates about agroecology and food sovereignty, asks key questions, and proposes lines of future research. He suggests that today’s food insecurity – manifested in a regime of wildly fluctuating prices – reflects not just temporary stresses in the existing mode of production, but more profoundly the troubled process of generating a new one. He argues that the solution cannot be implemented at a merely technical or political level: the force of change can only be driven by the kind of social movements which are now daring to challenge the existing unsustainable order.",

//   publisher:'UCL Press',
//   Auther:'Robert Biel',
//   publishDate:'2016',
//   pages:154,
//   rating : 0,
//   reviews :'' ,
//   pdf:'Sustainable-Food-Systems.pdf',
//   image:'fi-sustainablefood-950x640.jpg'},



//   {title: 'ADOLF HITLER',
//   gener:'others',

//   description: "The most notorious man in history, Adolf Hitler, is best known for having perpetrated crimes against humanity over the six-year course of World War II. His brutal extermination policies are responsible for the deaths of close to 30 million people he considered inferior, and added to that, the military casualties suffered by all parties, yields a grand total of approximately 60 million people dead by the end of the war. That number equates to 3% of the world’s population at the time. But, who was this man? What made him into the monster he became? Can his childhood explain the formation of such a brutal dictator?",

//   publisher:'Hourly History',
//   Auther:'',
//   publishDate:'2016',
//   pages:55,
//   rating : 0,
//   reviews :'' ,
//   pdf:'adolf-hitler-hourly-history.pdf',
//   image:'adolf-hitler2.jpg'},function (err, small) {
//      if (err) return console.error(err);
//   // saved!
// }) 
// Book1.find({},function (err,result){
//   if(err){
//     console.log(err);
//   }
//     else {
//       console.log(result)
//     }
  
// });
  app.use(function(req, res){
       res.send(404);
   });
//server creating 
app.listen(port, function() {
  console.log(`listening on port ${port}`);
});



