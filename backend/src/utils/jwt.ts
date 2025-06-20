import jwt from 'jsonwebtoken';
import { env } from 'process';
import  {userInterface}  from '../types';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env" });

const secret:any =process.env.secret;

export  function createToken(payload: userInterface) {
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}