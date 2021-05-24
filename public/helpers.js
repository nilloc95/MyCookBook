const User = require("../models/User")
const capitalize = require("capitalize")

module.exports = {
   
    // SRC: https://stackoverflow.com/questions/11229831/regular-expression-to-remove-html-tags-from-a-string
    // uses regex to find angle brackets and remove them and their content. needed because i used ck editor which adds <p> tags
    stripTags: function(input) {
        return input.replace(/<(?:.|\n)*?>/gm, '')
    },
    editIcon: function(author, currentUser, recipeId){
        if (author == currentUser) {
            
            return `<div class="text-end">           
            <button style="display: inline;" class="btn trash-icon" onclick="confirm_delete('${recipeId}')" type="button"><i class="vis-btn fas fa-trash-alt"></i></button>           
            <a href="/edit/${recipeId}" class="btn edit-icon"><i class="vis-btn fas fa-edit"></i></a>
            </div>`

        } else{
            return `<div class="text-end"><a disabled class="btn"><i style="color: #f9f9f9;" class="fas fa-edit"></i></a></div>`
        }
    },
    checkUrl: function(url) {

        // SRC: https://stackoverflow.com/questions/9714525/javascript-image-url-verify
        // Description: uses Regex to ensure the url has a jpeg or some other valid picture ending.
        // I added a few words for the "else" to try and catch incorrect inputs specifically

        if ((url.match(/(jpeg|jpg|gif|png|images)/) != null)){
            return true
        } else{
            return(url.match(/(none|na|no image|""|" ")/) == null);
        }
    },
    loggedIn: function(user) {
        if (user != undefined) {
            return true
        } else{
            return false
        }
    },
    select: function(selected, options){

        // SRC: https://stackoverflow.com/questions/13046401/how-to-set-selected-select-option-in-handlebars-template/15373215
        // SRC2: https://handlebarsjs.com/guide/block-helpers.html#basic-blocks
        // uses regular expression to add a selected tag to the value passed. In the edit page, I pass the value previously selected, this will
        // find that value and add a selected tag to it

        return options
            .fn(this)
            .replace(
                new RegExp(' value=' + selected + ""),
                '$& selected = "selected"'
            )
            .replace(
                new RegExp('>' + selected + '</option>'),
                ' selected="selected"$&'
            )
    },
    hasLiked: function(userLikes, recipeId){
       if (userLikes.includes(recipeId)) {
           return true
       } else {
           return false
       }
    }, 
    editIconRecipe: function(author, currentUser, recipeId){
        if (author == currentUser) {
            
            return `<span class="float-end edit-icon-recipe">           
            <button class="btn ps-5 trash-icon pe-1" onclick="confirm_delete('${recipeId}')" type="button"><i class="vis-btn fas fa-trash-alt"></i></button>           
            <a href="/edit/${recipeId}" class="btn edit-icon"><i class="vis-btn fas fa-edit"></i></a>
            </span>`

        } else{
            return `<span class="text-end"><a disabled class="btn"><i style="color: #f9f9f9;" class="fas fa-edit"></i></a></span>`
        }
    }, 
    capitalizeWord: function(string) {
        string = capitalize.words(string)
        return string
    }
}