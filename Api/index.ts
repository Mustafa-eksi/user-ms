import Express from "express";
const app = Express();

app.use(Express.json({ limit: '5mb' }));

// Routes
import { router as AuthRouter} from './Routes/Auth';
app.use("/auth", AuthRouter);

// FIXME: hardcoded port
app.listen(4000, ()=>{
    console.log("[user-ms] => Listening on port 4000");
});

export default app;