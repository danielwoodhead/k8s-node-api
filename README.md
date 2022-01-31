# Kubernetes Node API

This guide is intended to demonstrate how to build a REST API using node, including:

- typescript
- linting
- testing
- express
- swagger
- docker
- kubernetes
- helm

It is split up into the following sections:

1. [Setting up the project](#setting-up-the-project)
2. [Adding an endpoint](#adding-an-endpoint)
3. [Adding docker](#adding-docker)
4. [Deploying to kubernetes](#deploying-to-kubernetes)

## Prerequisites

- node 16
- docker
- a local kubernetes cluster (the version included with Docker Desktop was used when writing this guide)
- kubectl (already installed if using kubernetes in Docker Desktop)
- helm
- vscode

# Setting up the project

Create a new folder:

```bash
mkdir k8s-node-api
cd k8s-node-api
```

Initialise a new node project:

```bash
npm init -y
```

Install typescript & node types:

```bash
npm i -D typescript @types/node
```

Initialise typescript:

```bash
npx tsc --init
```

Install a base tsconfig:

```bash
npm i -D @tsconfig/node16
```

Replace the content of `tsconfig.json` with:

```json
{
  "extends": "@tsconfig/node16/tsconfig.json",
  "compilerOptions": {
    "outDir": "./build"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

## Adding express

Install express:

```bash
npm i express
```

Install type definitions:

```bash
npm i -D @types/express
```

Create a new file called `src/app.ts` with the following content:

```typescript
import express from "express";

export default function createApp() {
  const app = express();
  app.use(express.json());

  return app;
}
```

Create a new file called `src/index.ts` with the following content:

```typescript
import createApp from "./app";

const port = 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
```

## Adding linting

Install eslint:

```bash
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Add a new file called `.eslintrc.js` with the following content:

```javascript
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
};
```

Add a new file called `.eslintignore` with the following content:

```
node_modules
build
```

Add a lint command to `package.json`:

```json
"scripts": {
  "lint": "eslint . --ext ts"
},
```

Try out the lint command (to see it report an error try adding an unused constant to `src/app.ts`):

```bash
npm run lint
```

## Adding testing

Install jest:

```bash
npm i -D jest ts-jest @types/jest
```

Configure jest:

```bash
npx ts-jest config:init
```

Add a test command to `package.json`:

```json
"scripts": {
  "test": "jest"
},
```

Install supertest:

```bash
npm i -D supertest @types/supertest
```

Create a new file called `src/app.test.ts` with the following content:

```typescript
import request from "supertest";
import createApp from "./app";

const app = createApp();

it("returns 404 for unknown route", async () => {
  await request(app).get("/unknown").expect(404);
});
```

Try out the test command:

```bash
npm test
```

## Adding a basic endpoint

Add a test for the new endpoint in `src/app.test.ts`:

```typescript
it("/health returns 200", async () => {
  await request(app).get("/health").expect(200);
});
```

Add the new endpoint in `src/app.ts`:

```typescript
import express, { Request, Response } from "express";

export default function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).send("Healthy");
  });

  return app;
}
```

## Running without docker

This section is only relevant if you want to be able to run the API locally without docker

Install ts-node-dev:

```bash
npm i -D ts-node-dev
```

Add a dev command to `package.json`:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --pretty --transpile-only src/index.ts"
},
```

Try out the dev command:

```bash
npm run dev
```

Call the API (this should return "Healthy"):

```bash
curl http://localhost:3000/health
```

Stop the process with Ctrl+C

# Adding an endpoint

The goals of this section are as follows:

- add a typical REST endpoint
- automatically document the endpoint with swagger
- override the [default express error handling](https://expressjs.com/en/guide/error-handling.html) to return [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807)-compliant errors

Install tsoa and swagger-ui-express:

```bash
npm i tsoa swagger-ui-express
npm i -D @types/swagger-ui-express
```

Enable experimentalDecorators & emitDecoratorMetadata in `tsconfig.json`:

```json
"compilerOptions": {
  "outDir": "./build",
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
},
```

Add a new file called `tsoa.json` with the following content:

```json
{
  "entryFile": "src/index.ts",
  "noImplicitAdditionalProperties": "throw-on-extras",
  "controllerPathGlobs": ["src/**/*controller.ts"],
  "spec": {
    "outputDirectory": "public",
    "specVersion": 3
  },
  "routes": {
    "routesDir": "src"
  }
}
```

Take note of `controllerPathGlobs` in the above configuration. It tells tsoa where to find the controllers with which to generate the swagger json. It will also automatically generate the express routes, instead of us manually defining them as we've done so far.

Add the controller in `src/items/items.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Path,
  Res,
  Response,
  Route,
  Tags,
  TsoaResponse,
} from "tsoa";
import { HttpStatusCode } from "../common/httpStatusCode";
import {
  notFoundResponseArgs,
  ProblemDetails,
  ValidationProblemDetails,
} from "../common/problemDetails";
import * as ItemService from "./items.service";
import { Item } from "./items.types";

@Route("items")
@Tags("items")
export class ItemsController extends Controller {
  /**
   * @isInt id
   */
  @Get("{id}")
  @Response<ValidationProblemDetails>(HttpStatusCode.BAD_REQUEST, "Bad Request")
  public async getItem(
    @Path() id: number,
    @Res()
    notFoundResponse: TsoaResponse<HttpStatusCode.NOT_FOUND, ProblemDetails>
  ): Promise<Item> {
    const item: Item = await ItemService.find(id);

    if (!item) {
      return notFoundResponse(...notFoundResponseArgs("Item not found"));
    }

    return item;
  }
}
```

The various other files referenced here can be found in the repo.

Add these commands to `package.json`:

```json
"scripts": {
  "predev": "npm run swagger",
  "prebuild": "npm run swagger",
  "swagger": "tsoa spec-and-routes"
},
```

Run the swagger command:

```bash
npm run swagger
```

This will generate two files:

- `public/swagger.json`
- `src/routes.ts`

Add the following middleware

`src/middleware/errorMiddleware.ts`:

```typescript
import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";
import { HttpStatusCode } from "../common/httpStatusCode";
import {
  validationProblemDetails,
  internalServerErrorProblemDetails,
  PROBLEM_JSON_CONTENT_TYPE,
} from "../common/problemDetails";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    next(err);
  } else if (err instanceof ValidateError) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .contentType(PROBLEM_JSON_CONTENT_TYPE)
      .json(validationProblemDetails(err));
  } else {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .contentType(PROBLEM_JSON_CONTENT_TYPE)
      .json(internalServerErrorProblemDetails());
  }
}
```

`src/middleware/notFoundMiddleware.ts`:

```typescript
import { Request, Response } from "express";
import { HttpStatusCode } from "../common/httpStatusCode";

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(HttpStatusCode.NOT_FOUND).send();
}
```

Modify `src/app.ts` as follows:

```typescript
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { notFoundMiddleware } from "./middleware/notFoundMiddleware";
import { RegisterRoutes } from "./routes";

export default function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static("public"));

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).send("Healthy");
  });

  app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: "/swagger.json",
      },
    })
  );

  RegisterRoutes(app);

  app.use(errorMiddleware);
  app.use(notFoundMiddleware);

  return app;
}
```

Run the API:

```bash
npm run dev
```

Navigate to `http://localhost:3000/swagger` in a browser to see the swagger page:

![swagger](./images/swagger.PNG "swagger")

# Adding docker

Add a build command to `package.json`:

```json
"scripts": {
  "build": "tsc"
},
```

Try out the build command:

```bash
npm run build
```

Create a new file called `Dockerfile` with the following content:

```dockerfile
FROM node:16-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json tsoa.json ./
COPY src src
RUN npm run build

FROM node:16-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /usr/src/app/build build/
COPY --from=builder /usr/src/app/public public/
EXPOSE 3000
CMD [ "node", "./build/index.js" ]
```

This is a multi-stage dockerfile with the goal of minimising the size of the image

Create a new file called `.dockerignore` with the following content:

```
node_modules
npm-debug.log
```

Build the image:

```bash
docker build -t k8s-node-api .
```

Run the image:

```bash
docker run -dp 3000:3000 k8s-node-api
```

Call the API (this should return "Healthy"):

```bash
curl http://localhost:3000/health
```

Stop the container:

```bash
docker stop {container_id}
```

You can get the container ID with:

```bash
docker ps
```

## Docker Compose

Docker Compose is a tool for defining and running multi-container Docker applications. However it can still be useful for single-container applications, in that it simplifies the build/run commands.

Add a new file called `docker-compose.yaml` with the following content:

```yaml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "3000:3000"
```

Build and run the image:

```bash
docker-compose build
docker-compose up
```

Call the API (this should return "Healthy"):

```bash
curl http://localhost:3000/health
```

Press Ctrl+C to stop the container

# Deploying to kubernetes

The intention is to eventually use helm to deploy to kubernetes but it's informative (and simpler) to do so without helm at least once.

Create a new folder:

```bash
mkdir -p deployment/k8s
cd deployment/k8s
```

Add a new file called `k8s-node-api.yaml` with the following content:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-node-api
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: k8s-node-api
  template:
    metadata:
      labels:
        app: k8s-node-api
    spec:
      containers:
        - name: k8s-node-api
          image: k8s-node-api:latest
          imagePullPolicy: IfNotPresent
---
apiVersion: v1
kind: Service
metadata:
  name: k8s-node-api
  namespace: default
spec:
  type: NodePort
  selector:
    app: k8s-node-api
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30001
```

Deploy to kubernetes:

```bash
kubectl apply -f k8s-node-api.yaml
```

Check the status of the deployment:

```bash
kubectl get deployments
```

You should see something like this:

```
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
k8s-node-api   1/1     1            1           3s
```

Call the API (this should return "Healthy"):

```bash
curl http://localhost:30001/health
```

When you're finished, clear up the resources that were created:

```bash
kubectl delete -f k8s-node-api.yaml
```

## Adding a helm chart

Create a new folder for helm (assuming you followed the previous section you will currently be in `deployment/k8s`):

```bash
cd ..
mkdir helm
cd helm
```

Create the helm chart:

```bash
helm create k8s-node-api
```

This generates quite a few files, most of which we're going to delete to keep things simple:

1. delete the `charts` folder
2. delete the contents of the `templates` folder
3. delete the contents of the `values.yaml` file

Replace the contents of `Chart.yaml` with:

```yaml
apiVersion: v2
name: k8s-node-api
description: A Helm chart for k8s-node-api
type: application
version: 0.1.0
appVersion: "1.0.0"
```

Take what we put in `k8s-node-api.yaml` in the previous section and add it to the helm chart (this time in separate files)

Add a new file called `templates/deployment.yaml` with the following content:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-node-api
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: k8s-node-api
  template:
    metadata:
      labels:
        app: k8s-node-api
    spec:
      containers:
        - name: k8s-node-api
          image: k8s-node-api:latest
          imagePullPolicy: IfNotPresent
```

Add a new file called `templates/service.yaml` with the following content:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: k8s-node-api
  namespace: default
spec:
  type: NodePort
  selector:
    app: k8s-node-api
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30001
```

Install the helm chart:

```bash
helm upgrade --install k8s-node-api k8s-node-api/
```

Check the status of the deployment:

```bash
kubectl get deployments
```

You should see something like this:

```
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
k8s-node-api   1/1     1            1           3s
```

Call the API (this should return "Healthy"):

```bash
curl http://localhost:30001/health
```

Helm charts can be made more flexible by allowing values to be passed in at install time

Add the following to `values.yaml`:

```yaml
image:
  tag: "latest"
```

In `templates/deployment.yaml`, replace:

```yaml
image: k8s-node-api:latest
```

with:

```yaml
image: k8s-node-api:{{ .Values.image.tag }}
```

This allows you to override the image tag:

```bash
helm upgrade --install --set image.tag=mytag k8s-node-api k8s-node-api/
```

When you're finished, clear up the resources that were created:

```bash
helm uninstall k8s-node-api
```

With this, the cycle to get a change into kubernetes is (from the repo root):

1. Make code change
2. Run `docker build -t k8s-node-api .`
3. Run `kubectl rollout restart deployment/k8s-node-api`
   - note: this is only suitable for local development - beyond that you would create an image with a new tag and run `helm upgrade`

# Useful commands

Open a shell in a running container (docker):

```bash
docker exec -it {container_name} //bin/sh
```

Open a shell in a running container (kubernetes):

```bash
kubectl exec --stdin --tty {pod_name} -- //bin/sh
```

Clear up resources:

```bash
docker system prune
```

# Future

This guide intentionally tried to keep things simple for the purpose of learning while still providing a decent foundation to build on. So naturally there's a lot more that could be done to make it production-ready:

- [express security best practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [express performance best practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [kubernetes production best practices](https://learnk8s.io/production-best-practices)
- [helm chart best practices](https://helm.sh/docs/chart_best_practices)
