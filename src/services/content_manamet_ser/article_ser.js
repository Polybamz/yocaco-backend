import { db, admin } from "../../config/config.js";


class ArticleSer {
    static async createArticle(data) {
        console.log("Creating article nnnnnnnnnnnnnnnnnn", data);
        try {
            const articleRef = db.collection("articles").doc();
            const articleData = {
                ...data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await articleRef.set(articleData);
            return articleRef.id;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    static async getAllArticles() {
        try {
            const articlesRef = db.collection("articles");
            const articlesDocs = await articlesRef.get();
            const articles = [];
            articlesDocs.forEach((doc) => {
                articles.push({ ...doc.data(), id: doc.id });
            });
            return articles;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async getArticlesByStatus(status) {
        try {
            const articlesRef = db.collection("articles").where("status", "==", status);
            const articlesDocs = await articlesRef.get();
            const articles = [];
            articlesDocs.forEach((doc) => {
                articles.push({ id: doc.id, ...doc.data() });
            });
            return articles;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async getArticle(id) {
        try {
            const articleRef = db.collection("articles").doc(id);
            const articleDoc = await articleRef.get();
            if (articleDoc.exists) {
                return articleDoc.data();
            } else {
                return null;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async updateArticle(id, data) {
        try {
            const articleRef = db.collection("articles").doc(id);
            const articleData = {
                title: data.title,
                content: data.content,
                author: data.author,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await articleRef.update(articleData);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    static async deleteArticle(id) {
        try {
            const articleRef = db.collection("articles").doc(id);
            await articleRef.delete();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // update article status
    static async updateArticleStatus(id, status) {
        try {
            const articleRef = db.collection("articles").doc(id);
            const articleData = {
                status: status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await articleRef.update(articleData);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    // get article by type;
    static async getAllArticlesByType(type, status) {
        try {
            const articlesRef = db.collection("articles").where('type', '==', type);
            const articlesDocs = await articlesRef.where('status', '==', status).get();
            const articles = [];
            articlesDocs.forEach((doc) => {
                articles.push({ ...doc.data(), id: doc.id });
            });
            return articles;
        } catch (er) {
            throw Error(er)
        }

    }
}

export default ArticleSer;