const express = require("express");

const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const query = `
    SELECT posts.*, authors.name AS author_name FROM posts
    INNER JOIN authors ON posts.author_id = authors.id  
  `;
  const [posts] = await db.query(query);
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const [authors] = await db.query("Select * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "INSERT INTO posts (title, summary, body, author_id) VALUES (?)",
    [data]
  );
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const query = `
    SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts 
    INNER JOIN authors ON posts.author_id = authors.id
    WHERE posts.id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length == 0) {
    return res.status(404).render("404");
  }

  const postData = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humanReadableDate: posts[0].date.toLocaleDateString("en-GB"),
  };

  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async function (req, res) {
  const query = `
    SELECT * FROM posts 
    WHERE posts.id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length == 0) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: posts[0] });
});

router.post("/posts/:id/edit", async function (req, res) {
  const query = `
  UPDATE posts
  SET title = '${req.body.title}', summary = '${req.body.summary}', body = '${req.body.content}'
  WHERE id=${req.params.id};
  `;

  await db.query(query);
  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function (req, res) {
  const query = `
  DELETE FROM posts WHERE id=${req.params.id};
  `;

  await db.query(query);
  res.redirect("/posts");
});

module.exports = router;
