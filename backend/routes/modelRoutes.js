const express = require('express');
const router = express.Router();
const {
    getModels,
    getModelBySlug,
    getModelsByMake,
    getModelsByMakeSlug,
    getModelsByCategoryAndMake,
    getModelsByCategoryAndMakeSlug,
    createModel,
    updateModel,
    deleteModel,
} = require('../controllers/modelController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getModels)
    .post(protect, admin, createModel);

router.route('/make/:makeId')
    .get(getModelsByMake);

router.route('/make-slug/:makeSlug')
    .get(getModelsByMakeSlug);

router.route('/category/:categoryId/make/:makeId')
    .get(getModelsByCategoryAndMake);

router.route('/category-slug/:categorySlug/make-slug/:makeSlug')
    .get(getModelsByCategoryAndMakeSlug);

router.route('/:makeSlug/:modelSlug')
    .get(getModelBySlug);

router.route('/id/:id')
    .put(protect, admin, updateModel)
    .delete(protect, admin, deleteModel);

module.exports = router;
