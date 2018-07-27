var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema ({
    headline: {
        type: String, 
        required: true,
        unique: true
    },
   
    url: {
        type: String,
        required: true
    }, 
    summary: {
        type: String,
        required: true
    },
    saved:{
       type:Boolean,
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports= Article