const localS = require("passport-local").Strategy
const bcrypt = require("bcryptjs")

//models
const Usuario = require("../models/Usuario")
//definição
module.exports = (passport)=>{

  passport.use(new localS({usernameField:"email",passwordField:"senha"},(email,senha,done)=>{

    Usuario.findOne({email:email})
    .then((usuario)=>{
      if(!usuario){
        return done(null, false,{message:"essa conta não existe ou ainda não foi cadastrada"});
      }
      else{
        bcrypt.compare(senha,usuario.senha,(erro,sucesso)=>{
          if (sucesso){
            return done(null, usuario);
          }else{
            return done(null, false,{message:"senha incorreta"});
          }

        })
      }
    })
    .catch((error)=>{

    });

  }))

  passport.serializeUser((usuario,done)=>{//código que salva a sessão do usuário
    done(null, usuario.id) 
  })

  passport.deserializeUser((id, done)=>{
    Usuario.findById(id,(err,usuario)=>{
      done(err,usuario)
    })
  })
}