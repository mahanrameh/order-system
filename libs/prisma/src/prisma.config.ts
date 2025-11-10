

export const prismaConfig = {
  dataSources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
  errorFormat: 'pretty',
};