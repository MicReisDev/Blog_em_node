//Modulos carregados
    const express = require("express")
    const app = express() //roterização e servidor
    const handlebars = require("express-handlebars") //templete
    const bodyParser = require("body-parser")//transferir os dados no body da aplicação e tendo acesso através do req.body
    const mongoose = require("mongoose") //DATABASE
    const usuario = require("./routes/usuario")
    const admin = require("./routes/admin")// aqui estamos importando um grupo de rotas, está separada pois os admins terão mais paginas que não seram acessadas pelo publico em geral
    const session = require("express-session")//este é necessário para criarmos uma sessão, login com usuário
    const flash = require("connect-flash") //para transmitir mensagens rápidas e dinâmicas
    const postagem = require("./models/Postagem") //model de postam
    const categorias = require("./models/Categorias") //model de categorias
    const passport = require("passport")
    require("./config/autentificacao")(passport)
    const dotenv = require("dotenv") //o dotenv serve para encriptarmos os dados de conexão do mongo db

    //configuração dotenv
    dotenv.config();
    const MONGO_CNSTRING = process.env.MONGO_CNSTRING; //isso está encriptando meu login na cloud do mongodb e a chave está no arquivo .env


//configuração de sessão, login etc...
    app.use(session({
      secret: "blogapp", //pode ser literalmente qualquer coisa, é apenas um parâmetro que a função pede
      resave: true, //tem que ser true
      saveUninitialized: true //idem ao de cima
    }))
    app.use(passport.initialize())
    app.use(passport.session())
  
//Middleware
//os midlewares são uma parte do código que é responsável por uma função de intermediar a request e o response
//neste caso estamos criando uma váriavel global que pode ser acessada em qualquer parte da aplicação
    app.use(flash())
    app.use((req,res,next)=>{ //essa é a sintaxe de um middleware
      res.locals.sucesso = req.flash("sucesso") //aqui é a criação de uma variável global
      res.locals.error = req.flash("error")
      res.locals.user = req.user || null; // neste aqui após o usuário logado esse req.user está armazenando os dados do usuário, e pode ser acessado em qualquer lugar do handlebars com a variavel user.
      next()
    })

//mongoose conectando ao db
    mongoose.connect(MONGO_CNSTRING).then(()=>console.log("conectado ao mongodb")).catch((error)=>console.log("ocorreu o seguinte error "+error))

//css 
    const path = require("path") //o path é arquivo padrão do express e para podermos usar style no handlebars é necessiário importar ele
    app.use(express.static(path.join(__dirname, "public"))) // neste projeto foi utilizado o bootstrap, com essa função é possível no arquivo main.handlebars tenha acesso a pasta public como pasta raiz.

//bodyparse
    app.use(bodyParser.urlencoded({extended:false})) //Confi
    app.use(bodyParser.json())//Configuração do body parser em json

//handlebars
    app.engine("handlebars", handlebars.engine({defaultLayout:"main"}));//definição que o arquivo principal é o main.handlebars
    app.set("view engine", "handlebars");//configuração do handlebars


//roterização
    app.use("/usuario",usuario) 
    app.use("/admin",admin) //após a importação da rota é necessário dizer a o express no index principal que vamos usar esse grupo de rotas, o primeiro parâmetro é como será a raiz desse grupo de rotas, neste caso se usarmos o /admin após declaramos a porta, vamos ser direcionados a porta "/" do arquivo admin.js, o segundo argumento é a variavel que armazena a rota importada.


    app.get("/",(req,res)=>{ //home do site

             
      postagem.find().populate("categoria") //explicação no Postagem.js
      .sort({data:"desc"}) //exibição das postagens em orden de postagem recente
      .then((postagens)=>{  
    
        res.render("home",{postagens:postagens.map(postagens=>postagens.toJSON())})
      
      }).catch((error)=>{
        req.flash("error", "ocorreu um erro ao carregar a página")
      })
      
    
    })

    //quando clicarmos em cima de alguma postagem vamos ser direcionados a essa rota que vai pegar a postagem específica e exibir
    app.get("/post/:id",(req,res)=>{ //nesta rota é possível ver o site em si
      postagem.findById(req.params.id).then((postagem)=>{
        res.render("post", {postagem:postagem.toJSON()})
      })

    })

    app.get("/categorias",(req,res)=>{ //lista a categoria do site para que o usuário possa acessar todas as postagens de uma determinada categoria
      categorias.find().then((categoria)=>{
        res.render("categorias",{categoria:categoria.map(categoria=>categoria.toJSON())})
      })
    })

    app.get("/categorias/:id",(req,res)=>{
      categorias.findOne({slug:req.params.id}).then((categoria)=>{
        if(categoria){
          postagem.find({categoria:categoria._id}).sort({data:"desc"}).then((postagem)=>{
            res.render("listaPostagens",{postagem:postagem.map(postagem=>postagem.toJSON()), categoria: categoria.nome})
          })
        }
        else{
          req.flash("error","erro ao carregar categoria")
          res.redirect("/")
        }
      })

    })

    const port = process.env.PORT || 8089
    app.listen(port,()=>{
      console.log("servidor rodando")
    });
