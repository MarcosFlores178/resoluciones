require('dotenv').config();
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const { isAuthenticated } = require('./middlewares/authMiddleware');
const { checkRole } = require('./middlewares/roleMiddleware');

// import toastr from 'toastr';
// import 'toastr/build/toastr.min.css';
const toastr = require('toastr');
let session = require('express-session');
const bcrypt = require('bcrypt');
const expressLayouts = require('express-ejs-layouts');

//LIVERELOAD:
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

// Rutas

const methodOverride = require('method-override');

let app = express();

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usuariosRouter = require('./routes/usuarios');
const resolucionesRouter = require('./routes/resoluciones');
const superadminRouter = require('./routes/superadmin');


app.use(connectLivereload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // ruta al layout principal

// Configuración de LiveReload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));
liveReloadServer.watch(path.join(__dirname, 'views'));


liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(session({
  secret: 'MH354G486H46G',
  resave: false,
  saveUninitialized: true
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.rol = req.session.user?.rol || null;
  next();
});
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.use('/toastr', express.static(path.join(__dirname, 'node_modules', 'toastr', 'build')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

//rutas publicas
app.use('/', indexRouter);
app.use('/auth', authRouter);

//rutas protegidas
app.use(isAuthenticated); // Middleware para verificar autenticación

app.use('/resoluciones', resolucionesRouter);
app.use('/superadmin', superadminRouter);
app.use('/usuarios', usuariosRouter)
// app.use('/', isAuthenticated, checkRole(['superadmin', 'organizador', 'administrativo']), resolucionesRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const http = require('http');

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;
