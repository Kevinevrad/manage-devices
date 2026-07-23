import { app } from "./src/app";
import process from "process";

app.listen(process.env.PORT, () => {
  console.log(`APP RUNNING ON PORT : ${process.env.PORT}`);
});
