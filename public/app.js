

let recipes = document.querySelector("#recipes")
let loggedIn = document.querySelector(".profile")
let popup = document.createElement("div")


popup.classList = "alert alert-info"
popup.textContent = "You must be signed in to like a recipe"


recipes.addEventListener("click", (e) => {
  if (e.target.classList.contains("fa-heart")){
    // If user is logged in, change 
    if (loggedIn.classList.contains("loggedIn")){
      let id = e.target.parentNode.firstChild.nextSibling.id
      let likes_value = e.target.nextSibling.nextSibling

      // If Recipe has already been liked
      if (e.target.classList == "far fa-heart ms-2 me-2 icons") {
        e.target.classList = "fas fa-heart ms-2 me-2 icons heart"
        likes_value.textContent = Number(likes_value.textContent) + 1
        addLike(id, Number(likes_value.textContent))

        // If Recipe hasn't been liked
      } else if (e.target.classList == "fas fa-heart ms-2 me-2 icons heart") {
        likes_value.textContent = Number(likes_value.textContent) - 1
        removeLike(id, Number(likes_value.textContent))
        e.target.classList = "far fa-heart ms-2 me-2 icons"
      }
    } else {
      let recipeLink = e.target.parentNode.firstChild.nextSibling
      let parent = e.target.parentNode
      addPopup(recipeLink, parent)
    }
  } 
})


const addLike = (id, likes) => {
  // Updates likes to item
  // Updates array of liked items for the user
  fetch(`/updateLikes/${id}&${likes}&add`, {
    method: "PUT"
  })
  .then(() => {return})
}
const removeLike = (id, likes) => {
  // Updates likes to item
  // Updates array of liked items for the user
  fetch(`/updateLikes/${id}&${likes}&remove`, {
    method: "PUT"
  })
  .then(() => {return})
}


const confirm_delete = (id) => {
  if (confirm("Are you sure you want to delete this recipe?")){
      return fetch(`/delete/${id}`, {
          method: "DELETE",
          redirect: "follow"
      })
      .then((response) => {
          response.json()
          .then(data => window.location.href = data.redirect)
      })
      .catch(err => console.log(err))
  } else {
      return false
  }
}


const addPopup = (recipeLink, parent) => {
  
  parent.insertBefore(popup, recipeLink)
  setTimeout(function(){removePopup(parent)}, 3000)
}

const removePopup = (parent) => {
  if (parent.childNodes[1].classList == "alert alert-info"){
    parent.removeChild(parent.childNodes[1])
  }
}

const addImage = () => {
  return "https://cdn.pixabay.com/photo/2018/04/28/14/12/food-3357374_960_720.jpg"
}