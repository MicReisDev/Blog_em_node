const mongoose = require("mongoose") //começamos requerindo o mongoose
const Schema = mongoose.Schema; // depois definimos uma constante com o Schema, poderia ser feito de forma direta mas assim o código fica mais organizado

const Postagem = new Schema({ //por convenção o new Schema sempre tem a primeira letra maiuscula
  titulo:{
    type: String,
    require:true
  },
  slug:{
    type:String,
    require: true
  },
  descricao:{
    type: String,
    required:true
  },
  conteudo:{
    type: String,
    required:true
  },
  categoria:{
    type:Schema.Types.ObjectId,//essa propriedade serve para referenciarmos outra tabela sem precisarmos escrever um código que irá fazer uma busca, no caso está sendo passado o id para este campo lá no formulário addPostagens.handlebars, a tabela de referencia é atribuida no campo ref:"", para o código funcionar, ao realizarmos o find temos que passar desta forma find().populate(campo que será populado) neste caso é find().populate("categoria")
    ref:"categorias", //tabela de referencia
    required: true
  },
  data:{
    type: Date,
    default: Date.now()
  }
})


module.exports = mongoose.model("postagens", Postagem)