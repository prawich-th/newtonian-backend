import { PrismaClient } from "@prisma/client";

const dotenv = require("dotenv").config();

export const prisma = new PrismaClient();
