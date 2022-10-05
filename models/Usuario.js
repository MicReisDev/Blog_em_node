const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
  nome:{
    require:true,
    type:String
  },
  email:{
    require:true,
    type:String
  },
  admin:{
    type:Number,
    default:0
  },
  senha:{
    require:true,
    type:String
  }
})

module.exports = mongoose.model("usuarios",Usuario)
