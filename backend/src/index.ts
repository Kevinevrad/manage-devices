import { PrismaClient } from "@prisma/client/extension";
import express from "express";
import { json } from "node:stream/consumers";

const app = express();
const prisma = new PrismaClient();
