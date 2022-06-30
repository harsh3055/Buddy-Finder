const express = require('express');
const router = express.Router();
const studyhubs = require('../controllers/studyhubs');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateStudyhub } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Studyhub = require('../models/studyhub');

router.route('/')
    .get(catchAsync(studyhubs.index))
    .post(isLoggedIn, upload.array('image'), validateStudyhub, catchAsync(studyhubs.createStudyhub))


router.get('/new', isLoggedIn, studyhubs.renderNewForm)

router.route('/:id')
    .get(catchAsync(studyhubs.showStudyhub))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateStudyhub, catchAsync(studyhubs.updateStudyhub))
    .delete(isLoggedIn, isAuthor, catchAsync(studyhubs.deleteStudyhub));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(studyhubs.renderEditForm))



module.exports = router;