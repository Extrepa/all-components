const prisma = new Proxy(
  {},
  {
    get() {
      return async () => {
        throw new Error('Preview stub: prisma not available');
      };
    },
  }
);

export default prisma;
