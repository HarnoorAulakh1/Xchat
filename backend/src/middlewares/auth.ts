import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import ObjectID from "bson-objectid";

export const check = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token =
    (req.cookies && req.cookies.token) ||
    (req.headers["authorization"]
      ? JSON.parse(req.headers["authorization"])["value"]
      : null);
  const secret: any = process.env.secret;
  try {
    const data: any = jwt.verify(token, secret);
    req.body.user = data;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }

};
