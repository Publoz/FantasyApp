const express = require('express');
const app = express();
const port = 3000;
// create an array to store articles
let articles = [
  { id: 1, title: 'Article 1', content: 'Content 1' },
  { id: 2, title: 'Article 2', content: 'Content 2' },
  { id: 3, title: 'Article 3', content: 'Content 3' }
];
// create an endpoint to get all articles
app.get('/articles', (req, res) => {
  res.json(articles);
});
// create an endpoint to get an article by id
app.get('/articles/:id', (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).send('Article not found');
  res.json(article);
});
// create an endpoint to create an article
app.post('/articles', (req, res) => {
  const article = {
    id: articles.length + 1,
    title: req.body.title,
    content: req.body.content
  };
  articles.push(article);
  res.json(article);
});
// create an endpoint to update an article
app.put('/articles/:id', (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).send('Article not found');
  article.title = req.body.title;
  article.content = req.body.content;
  res.json(article);
});
// create an endpoint to delete an article
app.delete('/articles/:id', (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).send('Article not found');
  const index = articles.indexOf(article);
  articles.splice(index, 1);
  res.json(article);
});
app.listen(port, () => console.log(`Newspaper API listening at http://localhost:${port}`));