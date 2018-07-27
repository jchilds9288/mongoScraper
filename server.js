var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Setup for handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/nytdb");

// Routes
app.get("/", (req, res)=>{
    db.Article.find()
        .exec()
        .then(doc => {
            res.render("index", {articles:doc})
        })
})

app.get("/all", (req, res)=>{
    db.Article.find()
        .exec()
        .then(doc => {
            res.send(doc)
        })
})


app.get("/saved", function (req, res) {
    db.Article.find({ "saved": true }).populate("notes").exec(function (error, articles) {
      var hbsObject = {
        articles: articles
      };
      console.log("freak freak freak")
      console.log(hbsObject)
      res.render("saved", hbsObject);
    });
  });


app.post("/saved/:id", (req, res) => {
console.log("come on")
    db.Article.findOneAndUpdate({"_id": req.params.id}, {"saved": true})    
        .exec((err, doc) => {
        if (err) {
            console.log(err);
        } else {
            console.log("freak 1")
            console.log(doc)
            res.send(doc);
        }
     });
});
// A GET route for scraping the NYT website

app.get("/scrape", (req, res) => {
    // First, we grab the body of the html with request
    axios.get("https://www.nytimes.com/").then(response => {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article.story").each((i, element) => {
            // Save an empty result object
            var result = {};

            console.log(element)

            // Add the text and href of every link, and save them as properties of the result object
            result.headline = $(element)
                .find("a")
                .text()
                .trim()
            result.url = $(element)
                .find("a")
                .attr("href")
            result.summary = 'test'
            result.saved= false

            console.log(result)

            // // Create a new Article using the `result` object built from scraping
           
            db.Article.create(result)
                .then(dbArticle => {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(err => {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
            
        });

        res.redirect("/all");
    });
});



  


// app.put("/articles/:id", (req,res)=>{
// const {id} = req.params
// console.log(id)
// db.Article.update({_id: id},{saved:true}, (err)=>{
//         if (err){
//             return console.log(error)
//         } res.status(200).json({message: "article saved"}) 
//     })
// })

// app.post("/notes/:id", function (req, res) {
//     // Create a new note and pass the req.body to the entry
//     console.log("req.body is: ", req)
//     db.Note.create( req.body)
//       .then(function (dbNote) {
//         console.log("The note should be: ", dbNote);
//         // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//         return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//       })
//       .then(function (dbArticle) {
//         // Send article back to the client
//         res.json(dbArticle);
//       })
//       .catch(function (err) {
//         // Catch errors and send em to the client 
//         res.json(err);
//       });
//   });


app.get("/notes/:id", function (req, res){
const id = req.params.id
db.Article.find({_id:id}).populate("note")
    .exec(function(error, article){
        if(error){
            res.status(500).json({message:error.message})
        }
        res.status(200).json({data:article.note})
    })
})


app.post("/notes", function (req, res) {
    var newNote = new db.Note({
      body: req.body.content,
      article: req.body.articleId
    });
    newNote.save(function (err, note) {
      if (err) {
        console.log(err);
      } else {
        db.Article.findOneAndUpdate({ "_id": req.body.articleId }, { $push: { "note": note } })
        .exec(function (err) {
          if (err) {
            res.send(err);
          } else {
            res.send(note);
          }
        });
      }
    });
  });

  app.listen(PORT, () => {
    console.log("server started");
})