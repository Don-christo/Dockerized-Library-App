import express, { Request, Response, NextFunction } from "express";
import { v4 } from "uuid";
import path from "path";
import fs from "fs";

let bookFolder = path.join(__dirname, "../../src/bookDatabase");
let bookFile = path.join(bookFolder, "bookDatabase.json");
// let allUsersJSON = fs.readFileSync(
//   path.join(__dirname, "database/userDatabase/userDatabase.json"),
//   "utf8"
// );
// let allUsers = JSON.parse(allUsersJSON);

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //   let user = allUsers.find(
    //     (x: { email: any }) => x.email === req.body.user.email
    //   );

    //   if (!user) {
    //     res.status(401).send("unauthorized user");
    //     return;
    //   }

    // create database dynamically
    if (!fs.existsSync(bookFolder)) {
      fs.mkdirSync(bookFolder);
    }
    if (!fs.existsSync(bookFile)) {
      fs.writeFileSync(bookFile, " ");
    }

    // read from database
    let allBooks: any[] = [];
    try {
      const infos = fs.readFileSync(bookFile, "utf8");
      if (!infos) {
        return res.status(400).json({
          message: `Could not read file`,
        });
      } else {
        allBooks = JSON.parse(infos);
      }
    } catch (parseError) {
      allBooks = [];
    }

    const {
      title,
      author,
      datePublished,
      description,
      pageCount,
      genre,
      bookId,
      publisher,
    } = req.body;

    let existingBook = allBooks.find((book) => book.title === title);
    if (existingBook) {
      return res.send({
        message: `Book already exists`,
      });
    }

    let newBook = {
      bookId: v4(),
      title: title,
      author: author,
      datePublished: datePublished,
      description: description,
      pageCount: pageCount,
      genre: genre,
      publisher: publisher,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    allBooks.push(newBook);

    fs.writeFile(bookFile, JSON.stringify(allBooks, null, 2), "utf8", (err) => {
      if (err) {
        return res.status(500).json({
          message: `Error writing book`,
        });
      } else {
        return res.status(200).json({
          message: `Book saved successfully`,
          newBook,
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

// Get all books from database - GET request (READ)
export const getAllBooks = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const infos = fs.readFileSync(bookFile, "utf8");
    const allBooks = JSON.parse(infos);
    return res.status(200).json(allBooks);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Failed to retrieve books from the database` });
  }
};

// Edit a Book or Update it based on title - UPDATE Request (UPDATE)
export const updateAnyBook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      author,
      datePublished,
      description,
      pageCount,
      genre,
      publisher,
    } = req.body;

    const infos = fs.readFileSync(bookFile, "utf8");
    const allBooks = JSON.parse(infos);

    const book = allBooks.find((book: any) => book.title === title);
    if (!book) {
      return res.status(404).json({ message: `Book not found` });
    }

    const updatedBook = {
      ...book,
      title,
      author,
      datePublished,
      description,
      pageCount,
      genre,
      publisher,
      updatedAt: new Date(),
    };

    const updatedBooks = allBooks.map((book: any) => {
      if (book.title === title) {
        return updatedBook;
      } else {
        return book;
      }
    });

    fs.writeFile(
      bookFile,
      JSON.stringify(updatedBooks, null, 2),
      "utf8",
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: `Failed to update the book in the database` });
        } else {
          return res.status(200).json({
            message: `Book successfully updated`,
            updatedBook,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: `Failed to update the book` });
  }
};

// Delete a book from the database based on the title - DELETE Request (DELETE)
export const deleteBook = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;

    const infos = fs.readFileSync(bookFile, "utf8");
    const allBooks = JSON.parse(infos);

    const book = allBooks.find((book: any) => book.title === title);
    if (!book) {
      return res.status(404).json({ message: `Book not found` });
    }

    const updatedBooks = allBooks.filter((book: any) => book.title !== title);

    fs.writeFile(
      bookFile,
      JSON.stringify(updatedBooks, null, 2),
      "utf8",
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: `Failed to delete the book from the database` });
        } else {
          return res.status(200).json({
            message: `Book successfully deleted`,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete the book` });
  }
};

// Getting the information of a book based on the id - GET Request (READ)
export const getBookInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.id;
    const infos = fs.readFileSync(bookFile, "utf8");
    const allBooks = JSON.parse(infos);

    const book = allBooks.find((book: any) => book.bookId === bookId);
    if (!book) {
      res.status(404).send({ message: `Book not found` });
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(500).send({ message: `Couldn't retrive book information` });
  }
};
