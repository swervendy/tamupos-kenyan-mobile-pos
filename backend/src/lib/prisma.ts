import { PrismaClient } from '../generated/prisma';

// It is recommended to create a single instance of PrismaClient and export it from a single file.
// This prevents creating too many connections to the database.
// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

const prisma = new PrismaClient();

export default prisma; 