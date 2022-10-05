const mongoose = require("mongoose") //começamos requerindo o mongoose
const Schema = mongoose.Schema; // depois definimos uma constante com o Schema, poderia ser feito de forma direta mas assim o código fica mais organizado

const Categoria = new Schema({ //por convenção o new Schema sempre tem a primeira letra maiuscula
  nome:{
    type: String,
    require:true
  },
  slug:{
    type:String,
    require: true
  },
  data:{
    type: Date,
    default: Date.now()
  }
})


module.exports = mongoose.model("categorias", Categoria)//exportando o model
 //criando um model o model vai servir exatamente igual uma função construtora no caso dentro o collection categorias, vai usar de referencia o modelo Categoria