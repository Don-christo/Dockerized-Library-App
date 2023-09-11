import express from "express";
import { createBook, getAllBooks, updateAnyBook, deleteBook, getBookInfo } from "../controllers/bookController";
import { auth } from "../utilities/auth";

const router = express.Router();

// create a new book and add it to the database
router.post('/create', auth, createBook);

// get all books from the database
router.get('/getbooks', auth, getAllBooks);

// update any book in the database
router.put('/update', auth, updateAnyBook); 

// delete any book in the database based on the title
router.delete('/delete', auth, deleteBook);

// getting the information of all books within the database
router.get('/getbooks/:id', getBookInfo);

export default router;
