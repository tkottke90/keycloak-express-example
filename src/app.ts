import { Request, Response, NextFunction } from "express";
import { resolve } from "path";
import cookieParser from "cookie-parser";
import { KeyCloakFactory } from "./lib/keycloak";

const keycloak = new KeyCloakFactory();

const express = require("express");

const app = express();
app.use(cookieParser("secret"));
keycloak.configureKeycloakMiddleware(app, '/logout');

const loggedInProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`${req.method} ${req.path}`);

  next();
};

app.use(loggedInProtection);

// A normal un-protected public URL.
app.get("/status", function (req: Request, res: Response) {
  res.json({ status: "OK" });
});

const router = express.Router();

router.get("/login", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  const reject = (err: any) => {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized", details: err });
  };

  if (!authHeader) {
    return reject({});
  }

  try {
    await keycloak.loginUser(authHeader, req, res);
    
    res.json({ message: 'Success' });
  } catch (err) {
    return reject(err);
  }
});

function clearUserToken(res: Response) {
  res.clearCookie('keycloak-token');
}

router.get('/logout', (req: Request, res: Response) => {
  clearUserToken(res);


  res.redirect('/login');
});

router.get('/data', keycloak.protect(), (req: Request, res: Response) => {

  res.json({ message: 'One Billion Dollars, ba ba ba da-da-da da-da-da' });
})

app.use('/api', router);

app.use('/access-denied', (req: Request, res: Response) => {
  clearUserToken(res);

  res.status(401).json({ message: 'Unauthorized' });
})

app.use(express.static(resolve(__dirname, "../public")));

app.use("/*", (req: Request, res: Response) => {
  res.sendFile(resolve(__dirname, "../public/index.html"));
});

export default app;