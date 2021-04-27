const {response} = require('express');
const Article = require('../models/Article');
var fs = require('fs');
var path = require('path');

const ArticlesService = {

    save: (req, res = response) => {

        try {
            var article = new Article();

            article.title = req.body.title;
            article.content = req.body.content;
            article.image = req.body.image;

            //Save article
            article.save((err, articleSaved) => {

                if(err || !articleSaved){
                    return res.status(404).send({
                        status: 'error',
                        message: 'There was an error saving the article'
                    })
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleSaved
                })
            });

        } catch (error) {
            return res.status(500).send({
                status: 'error',
                message: 'There was an error, please contact admin'
            });
        }
    },

    getArticles: (req, res = response) => {

        const query = Article.find({});

        const last = req.params.last;
        if(last || last != undefined) query.limit(5);

        query.sort('-_id').exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error getting the articles'
                });
            }

            if(!articles){
                return res.status(404).send({
                    status: 'error',
                    message: 'There is no articles!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        })
    },

    getArticleById: (req, res = response) => {

        const articleId = req.params.id;

        if(!articleId || articleId === null){
            return res.status(404).send({
                status: 'error',
                message: 'Article doesn\'t exist!'
            });
        }

        Article.findById(articleId, (err, article) => {
            if(err || !article){
                return res.status(404).send({
                    status: 'error',
                    message: 'Article doesn\'t exist!'
                });
            }

            return res.status(200).send({
                status: 'success',
                article
            })
        });
    },

    updateArticle: (req, res = response) => {

        var articleId = req.params.id;

        Article.findByIdAndUpdate(articleId, req.body, {new: true}, (err, articleUpdated) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error updating!'
                });
            }

            if(!articleUpdated){
                return res.status(404).send({
                    status: 'error',
                    message: 'Article does\'t exist!'
                });
            }

            return res.status(200).send({
                status: 'success',
                message: 'Article updated!',
                articleUpdated
            });
        });
    },

    deleteArticle: (req, res = response) => {

        var articleId = req.params.id;

        //Find and delet
        Article.findByIdAndDelete(articleId, (err, articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error deleting!'
                });
            }

            if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'Article can\'t be deleted, it probably doesn\'t exist!'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
                
            });
        });

    },

    uploadImage: (req, res = response) => {

        var file_name = 'No image to upload...';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }

        var file_path = req.files.file0.path;

            // * ADVERTENCIA * 
            // EN LINUX O MAC
            // var file_split = file_path.split('/');
            // EN WINDOWS
            // var file_split = file_path.split('\\');
        var file_name = file_path.split('/')[2];
        var file_ext = file_name.split('.')[1];

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){

            fs.unlink(file_path, (err) => {
                return res.status(500).send({
                    status: 'error',
                    message: 'File extension is not valid...'
                });
            });

        }else{
            //si todo es valido
            var articleId = req.params.id;

            if(articleId){
                Article.findByIdAndUpdate(articleId, {image: file_name}, {new:true}, (err, articleUpdated) =>{
                    if(err || !articleUpdated){
                        return res.status(200).send({
                            status: 'error',
                            message: 'Error saving image!'
                        });
                    }
    
                    return res.status(200).send({
                        status: 'success',
                        article: articleUpdated
                    });
                });
            }else{
                return res.status(200).send({
                    status: 'Success',
                    image: file_name
                });
            }
        } 

    },

    getImage: (req, res = response) => {

        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        fs.stat(path_file, (err, stat) => {
            if(err){
                return res.status(404).send({
                    status: 'error',
                    message: 'Image doesn\'t exist!'
                });
            }

            return res.sendFile(path.resolve(path_file));
        });
    },

    searchArticle: (req, res = response) => {

        var searchString = req.params.search;

        Article.find({ "$or": [
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error in request!'
                });
            }

            if(!articles || articles.length <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'No articles match your search!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        });

    }

}


module.exports = ArticlesService;