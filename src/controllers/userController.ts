import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 } from "uuid";

let databaseFolder = path.join(__dirname, "../../src/userDatabase");
let databaseFile = path.join(databaseFolder, "userDatabase.json");

// Create User
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // create database dynamically
    if (!fs.existsSync(databaseFolder)) {
      fs.mkdirSync(databaseFolder);
    }
    if (!fs.existsSync(databaseFile)) {
      fs.writeFileSync(databaseFile, " ");
    }

    // read from the database
    let databaseRead: any[] = [];

    try {
      const infos = fs.readFileSync(databaseFile, "utf8");
      if (!infos) {
        return res.status(404).json({
          message: `Error reading from database`,
        });
      } else {
        databaseRead = JSON.parse(infos);
      }
    } catch (parseError) {
      databaseRead = [];
    }

    // read from frontend
    const { userName, email, password } = req.body;

    // check if the user exists
    const existingUserEmail = databaseRead.find(
      (user: any) => user.email === email
    );
    const existingUsername = databaseRead.find(
      (user: any) => user.userName === userName
    );

    if (existingUserEmail) {
      return res.send({
        message: `User Email ${email} already exists`,
      });
    }

    if (existingUsername) {
      return res.send({
        message: `User ${userName} already exists`,
      });
    }

    // hash your password
    const saltRounds = password.length;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    // create the user
    const newUser = {
      id: v4(),
      userName: userName,
      email: email,
      password: hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    databaseRead.push(newUser);

    fs.writeFileSync(
      databaseFile,
      JSON.stringify(databaseRead, null, 2),
      "utf8"
    );

    return res.status(200).json({
      message: `User created successfully`,
      newUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `Servor Error`,
    });
  }
};

// Login User
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // read from database
    let readDatabase: any[] = [];
    const infos = fs.readFileSync(databaseFile, "utf8");

    if (!infos) {
      return res.status(404).json({
        message: `Error reading Database`,
      });
    } else {
      readDatabase = JSON.parse(infos);
    }

    const { email, password } = req.body;

    const thisUser = readDatabase.find((user: any) => user.email === email);

    if (!thisUser) {
      return res.send({
        message: `${email} does not exist`,
      });
    } else if (thisUser) {
      const validate = await bcrypt.compare(password, thisUser.password);
      if (validate) {
        const token = jwt.sign(thisUser, `${process.env.APP_SECRET}`);
        return res.status(200).json({
          message: "Login Successful!!!",
          email: thisUser.email,
          token,
        });
      } else {
        return res.send({
          message: "Login Unsuccessful!!!",
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

// Delete User
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let dataBaseRead: any[] = [];
    const infos = fs.readFileSync(databaseFile, "utf-8");

    if (!infos) {
      return res.status(404).json({
        message: `Error reading from database`,
      });
    } else {
      dataBaseRead = JSON.parse(infos);
    }

    // Getting the user ID from the request parameters (req.params.id)
    const userID = req.params.id;

    // finding the user with the matching id
    const theUser = dataBaseRead.find((user) => user.id === userID);
    

    if (!theUser) {
      return res.status(400).json({
        message: `User not found`,
      });
    }
    const index = dataBaseRead.indexOf(theUser)
    const removedUser = dataBaseRead.splice(index, 1);

    fs.writeFileSync(
      databaseFile,
      JSON.stringify(dataBaseRead, null, 2),
      "utf-8"
    );

    res.status(200).json({
      message: `User successfully deleted`,
      removedUser,
    });
  } catch (err) {
    res.status(500).send({
      message: "Internal server error",
    });
  }
};
