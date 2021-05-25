const express = require('express');
const path = require('path')
const mongoose = require("mongoose")
const Recipe = require("./models/recipe")
const User = require("./models/User")
const passport = require("passport")
const session = require("express-session")
const dotenv = require ("dotenv")
const MongoStore = require("connect-mongo")
const capitalize = require("capitalize")
const methodOverride = require("method-override")
const { checkUrl, stripTags, editIcon, loggedIn, select, hasLiked, editIconRecipe, capitalizeWord} = require("./public/helpers")

 
// Load Config
dotenv.config({path: "./config/config.env"})

// Passport config
require('./config/passport')(passport)

const PORT = process.env.PORT || 3000;


var app = express();
app.set('port', PORT);
app.use(express.static(__dirname + "/public"))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Method Override for allowing put and delete requests from browser

app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// Connect to MongoDB and listen to port once connection is made
const mongoURI = process.env.MONGO_URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
.then(() => {
  app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
  });  
})
.catch((err) => console.log(err))


// HandleBars Set up

const handlebars = require('express-handlebars').create({
  defaultLayout:'main',
  helpers: {
    stripTags,
    editIcon,
    checkUrl,
    loggedIn,
    select,
    hasLiked,
    editIconRecipe,
    capitalizeWord
  }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Session middleware
app.use(session({
  secret: "8525Buddy",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: mongoURI})
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())


// get user id and likes
app.use(function (req, res, next) {
  if (req.user != undefined){
    res.locals.userId = req.user.id 
    res.locals.displayName = req.user.displayName
    res.locals.userLikes = req.user.likes
  } else {
    res.locals.userId = undefined
    res.locals.userName = undefined
    res.locals.userLikes = []
  }
  next()
})


//  ROUTES 


// AUTH Routes

app.get('/auth/google', passport.authenticate("google", {scope: ["profile"]}));

// Google Auth Callback
app.get('/auth/google/callback', passport.authenticate("google", {
  failureRedirect: '/auth/google'}), (req, res) => {
    res.redirect('/')
  }
  )

// Logout
app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})


// Main Routes

// PROFILE PAGE

app.get('/profile/:id',  (req, res) => {
  let id = req.params.id
  if(mongoose.Types.ObjectId.isValid(id)){
    User.findById(id).lean()
    .then((user) => {
      Recipe.find({"author": id}).sort("-likes").lean()
      .then(result => {
        result.userId = id
        result.userName = capitalize.words(user.displayName)
        res.render("profile", {data: result})
    })
      .catch(err => console.log(err))
    })
    .catch((err) => {
      res.render("404")
      console.log(err)
    })
  } else {
    res.render("404")
  }
})

// LIKED RECIPES
app.get('/profile/likes/:id',  (req, res) => {
  let id = req.params.id
  if(mongoose.Types.ObjectId.isValid(id)){
    User.findById(id).lean()
    .then((user) => {
      Recipe.find({_id: {$in : user.likes}}).sort("-likes").lean()
      .then(result => { 
        result.userId = id
        result.userName = capitalize.words(user.displayName)
        res.render("likedRecipes", {data: result})
      })
      .catch(err => console.log(err))
    })
    .catch((err) => {
      res.render("404")
      console.log(err)
    })
  } else {
    res.render("404")
  }
})

// CREATE PAGE

app.get('/create',function(req,res){
  let user = {}
  if (req.user != undefined){
    user.user = "Sign Out"
    user.path = "/logout"
    user.userId = "/" + req.user.id
    res.render('create', {data: user})
  } else{
    user.user = "Sign In"
    user.path = "/login"
    user.userId = ""
    res.redirect('/login')
  }
  
});

app.post('/create', (req, res) => {
  if (req.user){
    req.body.ingredients = req.body.ingredients.split("\r\n")
    req.body.instructions = req.body.instructions.split("\r\n")
    req.body.likes = 0
    req.body.author = req.user.id
    req.body.title = capitalize.words(req.body.title)
    if (req.body.image == ""){
      req.body.image = "https://cdn.pixabay.com/photo/2018/04/28/14/12/food-3357374_960_720.jpg"
    }
    const recipe = new Recipe(req.body)

    recipe.save()
      .then(() => {
        res.redirect('/')
      })
      .catch(err => console.log(err))
  }
  
})

// EDIT PAGE

app.get('/edit/:id',function(req,res){
  let id = req.params.id
 
  Recipe.findById(id).lean()
  .then((result) => {
    if (req.user != undefined){
    result.ingredients = result.ingredients.join("\r\n")
    result.instructions = result.instructions.join("\r\n")
    if (res.locals.userId != result.author) {
      res.redirect('/')
    }else{
      res.render('edit', {data: result})
    }
  } else{
    result.user = "Sign In"
    result.path = "/login"
    result.userId = ""
    res.redirect('/login')
  }
  })
});

// EDIT PUT REQUEST

app.put('/edit/:id',function(req,res){
  let id = req.params.id
 
  Recipe.findById(id).lean()
  .then((result) => {
    if (req.user != undefined){
    req.body.ingredients = req.body.ingredients.split("\r\n")
    req.body.instructions = req.body.instructions.split("\r\n")
    req.body.likes = Number(req.body.likes)
      if (res.locals.userId != result.author) {
        res.redirect('/')
      }else{
        Recipe.findOneAndUpdate({_id: id}, req.body, {runValidators: true})
        .then(() => res.redirect(`/recipe/${id}`))
      }
  } else{
    res.redirect('/login')
  }
  })
  .catch((err) => {
    console.log(err)
    res.redirect("/")
  })
});



// DELETE RECIPE

app.delete('/delete/:id',function(req,res){
  let id = req.params.id
 
  Recipe.findById(id)
  .then((result) => {
    if (res.locals.userId == result.author){
      Recipe.findOneAndDelete({_id: id})
      .then(() => {
        res.json({redirect: '/'})
      })
    } 
  })
  .catch((err) => {
    console.log(err)
    res.redirect("/")
  })
});


// INDEX

app.get('/',function(req,res){
  Recipe.find().sort("-likes").limit(100).lean()
    .then((result) => {      
      Recipe.find().sort("-likes").limit(3).lean()
      .then((top3) => {
        result.first = top3[0]
        result.second = top3[1]
        result.third = top3[2]
        
        res.render("index", {data: result})
        })
    })
    .catch((err) => console.log(err))
  
});


// SEARCH

app.get('/search', (req, res) => {

  let id = req.query.value

  Recipe.find({ title: {$regex: id, $options: "i"} }).limit(500).lean()
    .then((result) => {
      if(result.length == 0) {
        let message = "Sorry, no result found with that recipe name..."
        result.message = message
      }
      res.render("search", {data: result})
    })
    .catch((err) => {
      console.log(err)
      let message = "Sorry, no result found with that recipe name..."
      let result = {}
      result.message = message
      res.render("search", {data: result})
    })
})


// ABOUT PAGE
app.get('/about',function(req,res){
  let user = {}
  if (req.user != undefined){
    user.user = "Sign Out"
    user.path = "/logout"
    user.userId = "/"+req.user.id
  } else{
    user.user = "Sign In"
    user.path = "/login"
    user.userId = ""
  }
  res.render('about', {data: user})
  
});


// LOGIN PAGE

app.get('/login', (req, res) => {
  let user = {}
  if (req.user != undefined){
    user.user = "Sign Out"
    user.path = "/logout"
  } else{
    user.user = "Sign In"
    user.path = "/login"
  }
  res.render("login", {data: user})
})


// ADD AND REMOVE LIKES FROM RECIPE


app.put('/updateLikes/:id&:likes&:type', (req, res) => {
  let recipe_id = req.params.id
  let like_amount = req.params.likes
  let type = req.params.type
  let user_id = res.locals.userId
  Recipe.findOneAndUpdate({_id: recipe_id}, {likes: like_amount}, {runValidators: true})
  .then(() => {
    if (type == "add"){
      User.findOneAndUpdate({_id: user_id}, {$push: {likes: recipe_id}}, {runValidators: true})
        .then(() => {
        res.json()
    })
    } else {
      User.findOneAndUpdate({_id: user_id}, {$pull: {likes: recipe_id}}, {runValidators: true})
        .then(() => {
        res.json()
    })
    }
    res.json()
  })
})


// SPECIFIC RECIPE PAGE

app.get('/recipe/:id',function(req,res){
  const id = req.params.id
  Recipe.findById(id).lean()
  .then((result) => {
    User.findById(result.author) 
    .then((user) => {
      console.log(user)
      result.userImage = user.image
      result.userLikes = res.locals.userLikes
      result.userId = res.locals.userId
      result.displayName = capitalize.words(user.displayName)
      result.title = capitalize.words(result.title)
      res.render("recipe", {data: result})
    })
    .catch(err => console.log(err))
  })
  .catch((err) => console.log(err))
  
});

// SORTS AND FILTERS

app.get('/filter',function(req,res){

  let sortBy = req.query.sort
  let region = req.query.region
  let time = req.query.time
  let diet = req.query.diet

  let searchTerm = {region, time, diet}

  if (region == "Region") {
    delete searchTerm.region
  }
  if (time == "time") {
    delete searchTerm.time
  }
  if (diet == "diet") {
    delete searchTerm.diet
  }

  Recipe.find(searchTerm).sort(`-${sortBy}`).limit(100).lean()
    .then((result) => {        
      if(result.length == 0) {
        let message = "Sorry, no result found with those filters..."
        result.message = message
      }
      res.render("search", {data: result})
    })
    .catch((err) => console.log(err))
});

// 404 & 500 PAGE

app.use(function(req,res){
  res.status(404);
  result = {}
  if (req.user != undefined){
    result.user = "Sign Out"
    result.path = "/logout"
    result.userId = req.user.id
  } else{
    result.user = "Sign In"
    result.path = "/login"
    result.userId = "404"
  }
  
  res.render("404", {data: result});
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  result = {}
  if (req.user != undefined){
    result.user = "Sign Out"
    result.path = "/logout"
    result.userId = req.user.id
  } else{
    result.user = "Sign In"
    result.path = "/login"
    result.userId = "404"
  }
  res.render("500", {data: result});
});


