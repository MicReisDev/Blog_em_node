const express  = require("express")
const router = express.Router()
const Usuario = require("../models/Usuario")
const bcrypt = require("bcryptjs") //serve para encriptar a senha
const passport = require("passport")

 //tela de criação de usuário - inputs
router.get("/registro",(req,res)=>{
  res.render("usuario/registro")
})


//criação de usuário
router.post("/registro/criar",(req,res)=>{ //verificação backend
    var erros = []
    if (!req.body.nome||req.body.nome==undefined||req.body.nome==" "||req.body.nome==null){
      erros.push({erro:"nome inválido"})
    }
    if (!req.body.email||req.body.email==undefined||req.body.email==" "||req.body.email==null){
      erros.push({erro:"email inválido"})
    }
    if (!req.body.senha||req.body.senha==undefined||req.body.senha==" "||req.body.senha==null){
      erros.push({erro:"senha inválida"})
    }
    if (req.body.senha.length<6){
      erros.push({erro:"Sua senha tem que ser maior ou igual a 6 dígitos"})
    }
    if(!(req.body.senha === req.body.senha2)){
      erros.push({erro:"as senhas devem ser iguais, tente novamente"})
    }
    if(erros.length>0){
      res.render("usuario/registro", {erros:erros})
    }
    else{
      Usuario.findOne({email:req.body.email}).then((usuario)=>{
        if(usuario){
          req.flash("error","já existe um usuário com este email cadastrado")
          res.redirect("usuario/registro")
        }
        else{ //criando o usuário
          const novoUs = new Usuario({
            nome:req.body.nome,
            email:req.body.email,
            senha:req.body.senha
          })

          bcrypt.genSalt(10,(erro,salt)=>{ //estrutura de encriptação
            bcrypt.hash(novoUs.senha, salt, (erro,hash)=>{ //encriptando a senha
              if(erro){
                req.flash("error", "ocorreu um erro ao salvar a senha, tente novamente mais tarde")
                res.redirect("/")
              }
              else{
                novoUs.senha = hash //após encriptada está sendo atribuida

                novoUs.save().then(()=>{//salvando o hash
                  req.flash("sucesso", "Usuário criado com sucesso!")
                  res.redirect("/")
                }).catch((error)=>{
                  console.log(error)
                  req.flash("error", "Ocorreu um erro ao salvar sua senha, tente novamente mais tarde!")
                  res.redirect("/")
                })
              }
            })
          })

        }
      }).catch((error)=>{
        req.flash("error","Houve um erro interno")
        console.log(error)
        res.redirect("/")
      })
    }
})

//tela de login
router.get("/login", (req,res)=>{ 
  res.render("usuario/login")
})

//logando usuário e autenticando com o passport
router.post("/login", (req,res,next)=>{ 
  passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/usuario/login",
    failureFlash: true
  })(req,res,next)

})

//deslogar
router.get("/sair",(req,res,next)=>{
  req.logout(req.user, err=>{
    if(err){return next(err)}
    req.flash("sucesso","Deslogado com sucesso!")
    res.redirect("/")
  })
})

module.exports = router