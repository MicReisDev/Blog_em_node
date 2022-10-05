module.exports = {
  eAdmin: function(req,res,next){
    if(req.isAuthenticated() && req.user.admin == 1){
      return next();
    }
    req.flash("error","Você deve estar logado e ter permissão ADMIN para acessar este painél")
    res.redirect("/")
  }
}