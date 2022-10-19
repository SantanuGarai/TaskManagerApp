const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL);

// {
//   useNewUrlParser: true,
//   useCreateIndex: true, // this is makes sure that when mongoose works with mongodb, our indexes are created, allowing us to quickly access the data we need to access
//   useUnifiedTopology: true, //To use the new Server Discover and Monitoring engine
//   useFindAndModify: false, //DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated. See: https://mongoosejs.com/docs/deprecations.html#findandmodify
// }
//gvMDENHXgexAJqjk
