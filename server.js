const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/marketplace_db')
  .then(() => console.log("Connecté à MongoDB"))
  .catch(err => console.error(err));

//schema categorie
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true}
});

const Category = mongoose.model('Category', categorySchema);

//schema produit
const productsSchema = new mongoose.Schema({
  name: { type: String, required: true},
  price: { type: Number, required: true},
  stock: { type: Number, required: true},
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category'}
});

const Products = mongoose.model('Products', productsSchema);

//schema utilisateur
const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  mail: { type: String, unique: true}
});

const User = mongoose.model('User', userSchema);

//schema reviews
const reviewsSchema = new mongoose.Schema({
  comments: { type: Number, min: 1, max: 5, required: true},
  products: { type: mongoose.Schema.Types.ObjectId, ref: 'Products'},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const Reviews = mongoose.model('Reviews', reviewsSchema);

//get & post categorie
app.get('/api/category', async (req, res) => {
  try {
    const category = await Category.find();
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message});
  }
})

app.post('/api/category', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save()
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: "Donnée invalide"});
  }
})

// routes gestion du catalogue
app.get('/api/products', async (req, res) => {
  const product = await Products.find().populate("category");
  res.json(product);
})

app.post('/api/products', async(req, res) => {
  try {
    if (req.body.price <= 0) {
      return res.status(400).json({ error: "Le prix doit etre positive"});
  }
    const newProduct = new Products(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);

  } catch (err) {
    res.status(400).json({ message: "Erreur lors de l'ajout"});
  }
});

// route systeme avis
app.post('/api/reviews', async (req, res) => {
  try {
    const reviews = new Reviews(req.body);
    await reviews.save();
    res.status(201).json(reviews);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de l'ajout"})
  }
})

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Reviews.find()
      .populate('author', 'username')
      .populate({
        path: 'products',
        populate: { path: 'category'}
      });
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: "Impossible de voir les reviews"});
  }
});

//route user
app.post('/api/user', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch(err) {
    res.status(400).json({ error: "Impossible de créer un user"});
  }
})

app.get('/api/user', async(req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch(err) {
    res.status(400).json({ error: "Impossible de lire"})
  }
})

//delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Products.findByIdAndDelete(req.params.id);
    res.json({ message: "Livre supprimé "});
  } catch (err) {
    res.status(400).json({ error: "Le nom est requis "});
  }
})

app.listen(3000, () => console.log(" Serveur Garage sur http://localhost:3000"));
