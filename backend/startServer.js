import app from './server.js';

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, process.env.IP, () => {
  console.log('Server is running on port ' + process.env.IP + ":"  + PORT);
});

export default server;