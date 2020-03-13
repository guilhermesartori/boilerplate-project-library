/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/books")
    .get(function(req, res) {
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, db) => {
          var collection = db.db().collection("books");
          collection.find().toArray(function(err, result) {
            for (var i = 0; i < result.length; i++) {
              result[i].commentcount = result[i].comments.length;
              delete result[i].comments;
            }
            res.json(result);
          });
        }
      );
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(function(req, res) {
      var title = req.body.title;
      if (!title) {
        res.send("missing title");
      } else {
        MongoClient.connect(
          MONGODB_CONNECTION_STRING,
          { useUnifiedTopology: true },
          function(err, db) {
            var collection = db.db().collection("books");
            var doc = { title: title, comments: [] };
            collection.insertOne(doc, { w: 1 }, function(err, result) {
              res.json(result.ops[0]);
            });
          }
        );
      }
      //response will contain new book object including atleast _id and title
    })

    .delete(function(req, res) {
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, con) => {
          let db = con.db();
          db.collection("books").remove({}, (err, status) => {
            res.send("complete delete successful");
          });
        }
      );
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      try {
        bookid = new ObjectId(bookid);
      } catch (Exception) {
        return res.send("no book exists");
      }
      let comment = req.body.comment;
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, con) => {
          let db = con.db();
          db.collection("books").findOne(
            { _id: bookid },
            (err, book) => {
              if (err) return res.send("no book exists");
              else res.json(book);
            }
          );
        }
      );
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, con) => {
          let db = con.db();
          db.collection("books").findOneAndUpdate(
            { _id: new ObjectId(bookid) },
            { $push: { comments: comment } },
            { returnNewDocument: true },
            (err, book) => {
              res.json(book.value);
            }
          );
        }
      );
      //json res format same as .get
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      MongoClient.connect(
        MONGODB_CONNECTION_STRING,
        { useUnifiedTopology: true },
        (err, con) => {
          let db = con.db();
          db.collection("books").remove(
            { id: new ObjectId(bookid) },
            (err, status) => {
              res.send("delete successful");
            }
          );
        }
      );
      //if successful response will be 'delete successful'
    });
};
