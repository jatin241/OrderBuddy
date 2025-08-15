const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://jatin759936:cQRk4fdxghxRYpfa@cluster0.xsmb4kb.mongodb.net/emp__db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    process.exit(0); // Exit after success
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit with failure
  });
