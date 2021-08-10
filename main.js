const axios = require("axios");
const fs = require("fs");
var MongoClient = require("mongodb").MongoClient;
var Binary = require("mongodb").Binary;

axios.defaults.timeout = 700000;

setInterval(function () {
  console.log("Hitting file");
  axios
    .get("https://wintergarten.eventim-inhouse.de/webshop/export/export")
    .then((response) => {
      console.log("downloading file");
      fs.writeFile("./test.xml", response.data, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("downloaded file success");

        MongoClient.connect(
          "mongodb+srv://diode:diode321@cluster0.a7ftq.mongodb.net/?retryWrites=true&useUnifiedTopology=true&w=majority",
          function (err, client) {
            var db = client.db("file_db");
            if (err) {
              console.log("Please check you db connection parameters");
            } else {
              console.log("Connection success");
              var data = fs.readFileSync("test.xml");

              var collection = db.collection("files");
              collection.updateOne(
                { _id: "61045d6740a4e099b89978c3" },
                { $set: { file_data: Binary(data) } },
                { upsert: true },
                (err, result) => {
                  if (err) {
                    console.log("error writing file" + err.message);
                    client.close();
                  }
                  console.log("wrote file in mongodb");
                  console.log(result);
                  client.close();
                }
              );
            }
          }
        );
      });
    })
    .catch((err) => {
      console.error(err);
    });
}, 1000 * 60 * 60 * 2);
