import ArticleSer from "../../../services/content_manamet_ser/article_ser.js";
import {validateArticle} from '../../../model/content_management_model/article_model.js'


class ArtcleController {
    static async createArticle(req, res){
        try{
            const article = req.body
            const {error,value } = validateArticle(article)
            console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',value)
            if(error) throw new Error(error.details[0].message)
            const result = await ArticleSer.createArticle(value)
            res.status(201).json({
                success: true,
                message: "Article created successfully",
                data: result
                })
        } catch (er){
            res.status(400).json({
                success: false,
                message: er.message
            })
        }
    }

    // get all article
    static async getAllArticles(req, res){
        try{
            const result = await ArticleSer.getAllArticles()
            res.status(200).json({
                success: true,
                message: "All articles",
                data: result
            })
        } catch (er){
            res.status(400).json({
                success: false,
                message: er.message
            })
        }
    }

    // get article by id
    static async getArticleById(req, res){
        try{
            const {id} = req.params
            const result = await ArticleSer.getArticle(id)
            if(result){
                res.status(200).json({
                    success: true,
                    message: "Article found",
                    data: result
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: "Article not found"
                })
            }
        } catch (er){
            res.status(400).json({
                success: false,
                message: er.message
            })
        }
    }

    // update article by id
    static async updateArticle(req, res){
        try{
            const {id} = req.params
            const article = req.body
            const {error,value } = validateArticle(article)
            if(error) throw new Error(error.details[0].message)
            const result = await ArticleSer.updateArticle(id, value)
            if(result){
                res.status(200).json({
                    success: true,
                    message: "Article updated successfully",
                    data: result
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: "Article not found"
                })
            }
        } catch (er){
            res.status(400).json({
                success: false,
                message: er.message
            })
        }
    }

    // delete article by id
    static async deleteArticle(req, res){
        try{
            const {id} = req.params
            const result = await ArticleSer.deleteArticle(id)
            if(result){
                res.status(200).json({
                    success: true,
                    message: "Article deleted successfully"
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: "Article not found"
                })
            }
        } catch (er){
            res.status(400).json({
                success: false,
                message: er.message
            })
        }
    }

    static async getArticlesByStatus(req, res){
        try{
            const {status} = req.params
            const result = await ArticleSer.getArticlesByStatus(status)
            if(result){
                res.status(200).json({
                    success: true,
                    message: "Articles found",
                    data: result
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: "Articles not found"
                })
            }
        } catch (er){
            res.status(400).json({
                success: false,
                message: er.message
            })
        }
    }

    // update article status by id
    static async updateArticleStatus(req, res){
        try{
            const {id} = req.params
            const {status} = req.body
            const result = await ArticleSer.updateArticleStatus(id, status)
            if(result){
                res.status(200).json({
                    success: true,
                    message: "Article status updated successfully",
                    data: result
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: "Article not found"
                })
            }
        } catch (er){
            res.status(400).json({
                success: false,
                message: er.message
            })
        }
    }

}

export default ArtcleController;