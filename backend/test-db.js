const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://tokenclippy_user:wvgZ6Ow53l94k8FF@cluster0.zyezkta.mongodb.net/tokenclippy?retryWrites=true&w=majority";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });

async function run() {
  try {
    console.log("🔄 Attempting a raw connection to Atlas...");
    await client.connect();
    console.log("🍃 SUCCESS! The raw connection worked perfectly!");
  } catch (error) {
    console.error("❌ RAW ERROR CAUGHT:");
    console.error(error);
  } finally {
    await client.close();
  }
}

run();
