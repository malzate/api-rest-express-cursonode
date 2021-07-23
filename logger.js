
function log (req,res,next){
    console.log('iniciando sesión');
    next();
};

module.exports = log;