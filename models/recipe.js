const mongoose = require("mongoose")
const Schema = mongoose.Schema

const recipeSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    author:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    description: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true,
        default: "https://cdn.pixabay.com/photo/2018/04/28/14/12/food-3357374_960_720.jpg"
    },
    ingredients: {
        type: Array,
        require: true
    },
    instructions: {
        type: Array,
        require: true
    },
    likes: {
        type: Number,
        default: 0
    },
    region: {
        type: String,
        require: true
    },
    time: {
        type: String,
        required: true
    },
    diet: {
        type: String,
        required: true
    },
    servingSize: {
        type: String,
        default: "N/A"
    },
    prepTime: {
        type: String,
        default: "N/A"
    },
    cookTime: {
        type: String,
        default: "N/A"
    },
    totalTime: {
        type: String,
        default: "N/A"

    }
}, {timestamps: true});

const Recipe = mongoose.model("Recipe", recipeSchema);

module.exports = Recipe;