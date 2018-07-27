$(document).ready(function () {

console.log("attaching listener to scrape button")
    $(".scrape-button").on("click", handleScrapeButton);
    
    console.log("attaching listener to save button")
    
    $(".save-button").on("click", handleSavedButton)

    console.log("attaching listener to note button")
    
    $(".note-button").on("click", handleNoteButton);

    $(".closeButton").on("click", handleCloseModal);

    $(".saveNoteButton").on("click", handleSaveNoteButton);

})

const handleNoteButton= (event)=>{
    const articleId = event.target.dataset.id
    $("#noteModal").show()
    //get notes atached to this article
        fetch("/notes/" + articleId, {
            method: "GET"
        })
        .then(res => res.json())
        .then(notes => {
            console.log(notes)
            $("#noteContent").data("articleId", articleId)
        })
        .catch(err => console.error(err))
        //send a get request to api to get notes for article
        

    //load modal with data about that article
        //loading the notes data and the id for the article 
    //render out notes in HTML &  render form to subit note 
  
}

const handleSaveNoteButton= (event)=>{
    const noteContent = $("#noteContent")
    const newNote = {
        content: noteContent.val(), 
        articleId:noteContent.data("articleId") 
    }
    console.log(newNote)
    fetch("/notes", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(newNote)
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => console.log('Success:', response));

}
const handleSavedButton= (event)=>{
    console.log(event.target)
    var id = $(event.target).data("id");
    console.log(id)
    $.ajax({
        method: "POST",
        url: "/saved/" + id
    });
}

const handleScrapeButton= ()=>{
    $.get("/scrape", function (response) {
        console.log("scraped!")
        var articlesAdded = response.length;
        alert("Added " + articlesAdded + " New Articles!");
    });
}

const handleCloseModal= ()=>{
    $("#noteModal").hide()
}