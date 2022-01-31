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
