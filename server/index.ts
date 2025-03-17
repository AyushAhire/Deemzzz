import app from "./app";
import { log } from "./vite";

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    log(`serving locally on port ${port}`);
  });
}
