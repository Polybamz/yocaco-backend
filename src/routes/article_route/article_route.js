import ArtcleController from '../../controller/content_management/article_controller/artocle_controler.js';
import { protect } from '../../middleware/auth.js';
import express from 'express';
const router = express.Router();

/// public reads
/// get all articles route
router.get('/get-all-articles', ArtcleController.getAllArticles);
/// get article by id route
router.get('/get-article-by-id/:id', ArtcleController.getArticleById);
/// get articles by status route
router.get('/get-articles-by-status/:status', ArtcleController.getArticlesByStatus);
/// get articles by type route (e.g. tiib / coaching)
router.get('/get-articles-by-type/:type', ArtcleController.getArticlesByType);

/// authenticated mutations
/// create article route
router.post('/create-article', protect, ArtcleController.createArticle);
/// update article route
router.put('/update-article/:id', protect, ArtcleController.updateArticle);
/// delete article route
router.delete('/delete-article/:id', protect, ArtcleController.deleteArticle);
/// update article status route
router.put('/update-article-status/:id', protect, ArtcleController.updateArticleStatus);

export default router;
