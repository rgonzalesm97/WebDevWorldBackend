const { Router } = require('express');
const { check } = require('express-validator');
const ArticlesService = require('../controllers/article');
const AuthService = require('../controllers/auth');
const { validarCampos } = require('../middlewares/validar-campos');
const { validateJWT } = require('../middlewares/validar-jwt');

/* var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './upload/articles' }); */

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload/articles')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });



const router = Router();

//--------------------------------------BLOG--------------------------------------
//save article
router.post('/save', [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
    validarCampos
], ArticlesService.save);

//get articles
router.get('/get/:last?', ArticlesService.getArticles);

//get an article
router.get('/getone/:id', ArticlesService.getArticleById);

//update article
router.put('/update/:id', [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
    validarCampos
], ArticlesService.updateArticle);

//delete article
router.delete('/delete/:id', ArticlesService.deleteArticle);

//upload image in an article
router.post('/upload-image/:id?', upload.single('file0'), ArticlesService.uploadImage);

//get image
router.get('/get-image/:image', ArticlesService.getImage);

//search article
router.get('/search/:search', ArticlesService.searchArticle);

//-----------------------------------------AUTH-------------------------------------------

//Login
router.post('/login', [
    check('email', 'email is invalid').isEmail(),
    check('password', 'password in required').isLength({ min: 6 }),
    validarCampos
], AuthService.login);

//Register
router.post('/register', [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'email is invalid').isEmail(),
    check('password', 'password in required and 6 or more characters long').isLength({ min: 6 }),
    validarCampos
], AuthService.register);

//Renew token
router.get('/renew', validateJWT, AuthService.renew);

module.exports = router;