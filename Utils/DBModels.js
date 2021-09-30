const mongoose = require('mongoose');
// set complete schemas for each player and character
exports.PlayerSchema = new mongoose.Schema({
    tag: String,
    discordID: String, 
    totalRolls: Number, 
    currentRolls: Number, 
    dateList: Array, 
    wishList: Array
}, {collection: 'Players', versionKey: false}) ;

exports.CharacterSchema = new mongoose.Schema({
    name: String, 
    amity:Number, 
    amityRatio:Number,
    battle:Number, 
    battleRatio:Number,
    date:Number, 
    dateRatio:Number,
    energy:Number, 
    images: Array, 
    questions:Array, 
    rarityRatio:Number,
    aliases:String, 
    series: String, 
    categoryName: String, 
    rollCategoryFilters: Array 
}, {collection: 'Characters', versionKey: false}) ;