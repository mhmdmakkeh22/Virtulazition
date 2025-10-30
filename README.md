# I Want Typescript

📜 Template repository for a new Node.js TypeScript project linted using ESLint with Prettier

## Usage

Install development dependencies:

```
npm install
```

Lint, then format `src/*.ts` by making in-place fixes:

```
npm run lint && npm run format
# or:
npm run fix
```

Run unit test suites:

```
npm run test
```

View coverage of unit tests:

```
npm run test:coverage
```

Build `src/*.ts` files into `dist/*.js` files:

```
npm run build
```

Serve `dist/index.js` using `node` (for production):

```
npm run start
```

Monitor file changes and serve `src/index.ts` using `nodemon` with `ts-node` (for development):

```
npm run watch
```
