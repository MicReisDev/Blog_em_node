// A parte de rotas para quem tem premissão admin está a parte por questão de organização
//aqui nos requerimos o express de forma normal
const express  = require("express")
const router = express.Router()
const {eAdmin} = require("../helpers/eAdmin")
//no caso é assim que usamos de forma externa o  mongoose
 //requerimos o model
const categoria = require("../models/Categorias") //requerindo o model da categoria.js
const postagem = require("../models/Postagem") //requerindo o model da postagem
//aqui são as rotas definidas
router.get("/",(req,res)=>{ //pagina principal
  res.send("Página principal ADMIN")
})



//posts
router.get("/postagens", eAdmin,(req,res)=>{ 

  postagem.find().populate("categoria") //explicação no Postagem.js
  .sort({data:"desc"})
  .then((postagens)=>{  

    res.render("admin/postagens",{postagens:postagens.map(postagens=>postagens.toJSON())})
  
  }).catch((error)=>{
    req.flash("error", "ocorreu um erro ao carregar a página")
  })

})

//ir para a página de adicionar
router.get("/postagens/add",eAdmin,(req,res)=>{ 
  categoria.find().then((categorias)=>{ //neste site só é possível postar se a categoria existir, então estamos fazendo um FIND em categoria
    res.render("admin/addPostagens",{categorias:categorias.map(categorias=>categorias.toJSON())}) //a função map tranforma cada objeto da arai em um json
  })

})

router.post("/postagens/nova",eAdmin,(req,res)=>{
  
  const erros = []
  if(req.body.categoria == "0"){
    erros.push({erro:"é necessário existir pelo menos uma categoria para salvar qualquer postagem, valor entrar em contato com algum administrador"})
  }
  if(erros.length > 0){
    res.render("admin/addPostagem", {erros:erros})
  }else{
    const Novopost = new postagem({
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    }).save().then(()=>{
      req.flash("sucesso", "Postagem feita com sucesso")
      res.redirect("/admin/postagens")
    }).catch((error)=>{
      console.log(error)
      req.flash("error", "Ocorreu um erro, tente novamente mais tarde")
      res.redirect("/admin/postagens")
    })
  }

})

//editar postagem
router.get("/postagens/editar/:id",eAdmin,(req,res)=>{ 
  postagem.findById(req.params.id).then((postagem)=>{
    categoria.find().then((categorias)=>{ //neste site só é possível postar se a categoria existir, então estamos fazendo um FIND em categoria
      res.render("admin/editarPost",{postagem:postagem.toJSON(),categorias:categorias.map(categorias=>categorias.toJSON())}) //a função map tranforma cada objeto da arai em um json
    }) //passando para a pagina /editar as informações a serem editadas
  }).catch((error)=>{
    req.flash("error", "Ocorreu um erro, tente novamente mais tarde")
    res.redirect("/admin/postagens")
  })
  })

router.post("/postagens/editar",eAdmin,(req,res)=>{

  postagem.updateOne({_id:req.body.id}, 
    {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
  }).then(()=>{
    req.flash("sucesso", "postagem editada com sucesso!")
    res.redirect("/admin/postagens")
  }
  ).catch((error)=>{
    req.flash("error", "Ocorreu um erro ao salvar, tente novamente mais tarde!")
  })

})
  
//deletar postagem
router.post("/postagens/excluir",eAdmin,(req,res)=>{ //aqui estamos excluindo uma categoria, no caso ao apertar o botão vermelho X na rota /admin/categoria é enviado um post para exclusão e o redirecionamento para o pagina principal
  postagem.deleteOne({ _id:req.body.id }).then(()=>{
    req.flash("sucesso", "postagem EXCLUIDA com sucesso!")
    res.redirect("/admin/postagens")
  }).catch((error)=>{
    req.flash("error", "ocorreu um erro ao tentar excluir esta postagem")
    res.redirect("/admin/postagens")
  })
})



//rota que mostra todas as categorias
router.get("/categorias",eAdmin,(req,res)=>{ 

  categoria.find().sort({data:"desc"}).then((resul)=>{//no caso este comando está buscando todos os dados do banco de dados e está organizando de forma decrescente.
    res.render("admin/categorias",{categorias:resul.map(resul=>resul.toJSON())}) //enviando o resultado da consulta como json para a rota admin/categorias

  }).catch((error)=>{console.log(error)})

})

 

//neste ponto a categoria vai ser adicionada, neste ponto do código vai levar para a tela com um form com o methodo POST e vai seguir no código abaixo
router.get("/categorias/add",eAdmin,(req,res)=>{
  res.render("admin/addCategorias")
})



//este router foi definido no addCategorias.handlebars é o Post daqueles dados do input form
router.post("/categorias/nova",eAdmin,(req,res)=>{ 

  let erros = []

if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length<3){
  erros.push({erro:"ocorreu um erro no campo 'Nome', ele não pode estar em branco e nem menor do que 3 letras"})
}
if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length<3 || req.body.slug.includes(" ")){
  erros.push({erro:"ocorreu um erro no campo 'Slug', ele não pode estar em branco e nem menor do que 3 letras e não pode contar espaço"})
}

if (erros.length>0){
  res.render("admin/addCategorias",{erros:erros}) //importante o res.render só pode ser declarado uma vez no código.
  }
  else{
    const novaCat = new categoria({ //aqui estamos criando a nova categoria no banco de dados
      nome: req.body.nome,
      slug: req.body.slug
    }).save()//aqui está salvando a categoria
    .then(()=>{
      req.flash("sucesso", "categoria criada com sucesso")
      res.redirect("/admin/categorias")
      console.log("Salvo com sucesso")}).catch((error)=>{
        req.flash("error", "ocorreu um erro")
        console.log("ocorreu o erro " + error)})
  }
})


//aqui estamos recebendo o ID pelo params que é diferente do body, pois o body vem de um form do methods Post e o params vem da URL dinâmica /:id
router.get("/categorias/editar/:id",eAdmin,(req,res)=>{
  categoria.findById(req.params.id).then((categorias)=>{
    res.render("admin/editarCat",{categorias:categorias.toJSON()}) //passando para a pagina /editar as informações a serem editadas
  })
  })

router.post("/categorias/editado",eAdmin,(req,res)=>{ //este router foi definido no editar.handlebars é o method Post daqueles dados editados
categoria.updateOne({_id:req.body.id}, 
  {
    nome:req.body.nome,
    slug:req.body.slug
}).then(()=>{
  req.flash("sucesso", "categoria editada com sucesso!")
  res.redirect("/admin/categorias")
}
).catch((error)=>{
  req.flash("error", "Ocorreu um erro ao salvar, tente novamente mais tarde!")
})
//   let erros = []

// if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length<3){
//   erros.push({erro:"ocorreu um erro no campo 'Nome', ele não pode estar em branco e nem menor do que 3 letras"})
// }
// if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length<3 || req.body.slug.includes(" ")){
//   erros.push({erro:"ocorreu um erro no campo 'Slug', ele não pode estar em branco e nem menor do que 3 letras e não pode contar espaço"})
// }

// if (erros.length>0){

//   }
//   else{
//     const novaCat = new categoria({ //aqui estamos criando uma nova categoria
//       nome: req.body.nome,
//       slug: req.body.slug
//     }).save()//aqui está salvando a categoria
//     .then(()=>{
//       req.flash("sucesso", "categoria criada com sucesso")
//       res.redirect("/admin/categorias")
//       console.log("Salvo com sucesso")}).catch((error)=>{
//         req.flash("error", "ocorreu um erro")
//         console.log("ocorreu o erro " + error)})
//   }
})

//excluir categoria
router.post("/categorias/excluir",eAdmin,(req,res)=>{ //aqui estamos excluindo uma categoria, no caso ao apertar o botão vermelho X na rota /admin/categoria é enviado um post para exclusão e o redirecionamento para o pagina principal
  categoria.deleteOne({ _id:req.body.id }).then(()=>{
    req.flash("sucesso", "categoria EXCLUIDA com sucesso!")
    res.redirect("/admin/categorias")
  }).catch((error)=>{
    req.flash("error", "ocorreu um erro ao tentar excluir esta categoria")
    res.redirect("/admin/categorias")
  })
})


module.exports = router //temos que exportar para o arquivo principal que está usando o express