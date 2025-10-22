import ArtcleController from '../../controller/content_management/article_controller/artocle_controler.js';
import express from 'express';
const router = express.Router();


/// create article route
router.post('/create-article', ArtcleController.createArticle);
/// get all articles route
router.get('/get-all-articles', ArtcleController.getAllArticles);
/// get article by id route
router.get('/get-article-by-id/:id', ArtcleController.getArticleById);
/// update article route
router.put('/update-article/:id', ArtcleController.updateArticle);
/// delete article route
router.delete('/delete-article/:id', ArtcleController.deleteArticle);
/// update article status route
router.put('/update-article-status/:id', ArtcleController.updateArticleStatus);
/// get articles by status route
router.get('/get-articles-by-status/:status', ArtcleController.getArticlesByStatus);

export default router;