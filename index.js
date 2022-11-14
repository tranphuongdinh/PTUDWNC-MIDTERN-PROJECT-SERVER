import express from 'express';
const app = express();
import cors from 'cors';
import DbConnect from './config/db/index.js';
import route from './components/root/root.route.js'
import { PORT } from './constants/common.js';

DbConnect();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

route(app);

app.listen(PORT, () => {
  console.log('Server started on ' + PORT);
});
