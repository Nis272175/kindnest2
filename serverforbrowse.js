const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://collectnis:240311035766@learningstage1.rjgxf.mongodb.net/?retryWrites=true&w=majority&appName=learningStage1";
const app = express();

////////////////////////////////////////////////////////////////////
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

///////////////////////////////////////////////////////////////////

const client = new MongoClient(uri);
// const PORT = 3000;
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/regOrg.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/regOrg.html"));
});
app.get("/donation.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/donation.html"));
});
app.get("/browse.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/browse.html"));
  // const newData = { name: result.orgName,category: "education", location: "urban" ,age: 10};
  // res.json(newData);
});
app.get("/contact.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/contact.html"));
});
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});
app.get("/faq.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/faq.html"));
});
app.get("/guideline.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/guideline.html"));
});
app.get("/hiw.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/hiw.html"));
});
app.get("/mission.html", (req, res) => {
  res.sendFile(path.join(__dirname, "/mission.html"));
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

async function fetchOrg() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("connected to the client");

    // Specify the database and collection
    const database = client.db("TempMail");
    const collection = database.collection("maildata");

    // Query the collection (e.g., find all documents)
    // const mailData = await collection.find({}).toArray();
    // const query = { _id: "67416ffa69d8d3d5b911a757" }; // Ensure _id is in correct format
    // const result = await collection.findOne(query);
    const query = { _id: new ObjectId("67416ffa69d8d3d5b911a757") };
    const result = await collection.findOne(query);

    if (result) {
      console.log("Document Data:", result);
      console.log("==>", result.mail);
      // ////////////////////////////////////
      io.on("connection", (socket) => {
        console.log("Client connected");

        // Send data to the client
        socket.emit("newData", {
          name: result.orgName,
          category: "education",
          location: "urban",
          description: result.des,
          needs: [
            { item: "Textbooks", quantity: 50, urgency: "high" },
            { item: "Laptops", quantity: 10, urgency: "medium" },
            { item: "Backpacks", quantity: 30, urgency: "low" },
          ],
        });

        socket.on("disconnect", () => {
          console.log("Client disconnected");
        });
        // ////////////////////////////////////
      });
    } else {
      console.log("No document found with the specified _id.");
    }
    // Log the data
    // console.log("Mail Data:", mailData);
  } catch (error) {
    console.error("Error reading data:", error);
  } finally {
    await client.close();
  }
}
fetchOrg();

// ----------------------------------------------------  //

// /////////serverofcontact.js/////////////////////////
app.post("/submit", async (req, res) => {
  console.log("In here ...yay!");

  try {
    // await client.connect();
    // const database = client.db("TempMail");
    // const maildata = database.collection("maildata");

    const review = {
      name: req.body.name,
      mail: req.body.email,
      SUB: req.body.subject,
      mssg: req.body.message,
    };

    // const result = await maildata.insertOne(review);

    // -----------------------------  //

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "collectnis@gmail.com",
        pass: "pnethpyfiwonoufy",
      },
    });

    function sendMail(to, sub, msg) {
      transporter.sendMail({
        to: to,
        subject: sub,
        html: msg,
      });
      console.log("email sent");
    }
    sendMail(req.body.email, req.body.subject, req.body.message);

    // -----------------------------  //

    res.redirect("/contact.html");
    // await maildata.deleteMany({});
    // console.log("All documents deleted from collection");
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    // await client.close();
  }
  //
});
// ////////////////////////////////////////////////////

// ----------------------------------------------------  //

// /////////serverforreg.js////////////////////////////
app.post("/register", async (req, res) => {
  // ----------------- //
  try {
    console.log("NO no NO");

    await client.connect();
    console.log("crossed client connect");
    const database = client.db("TempMail");
    console.log("crossed db");
    const maildata = database.collection("maildata");
    console.log("crossed collection");

    const review = {
      orgName: req.body.orgName,
      contactName: req.body.contactName,
      mail: req.body.email,
      phone: req.body.phone,
      des: req.body.description,
    };
    console.log("crossed review");

    const result = await maildata.insertOne(review);

    console.log("crossed insertOne");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "collectnis@gmail.com",
        pass: "pnethpyfiwonoufy",
      },
    });

    function sendMail(to, sub, msg) {
      transporter.sendMail({
        to: to,
        subject: sub,
        html: msg,
      });
      console.log("email sent");
    }
    const message = `
          <p><strong>Organization Name:</strong> ${review.orgName}</p>
          <p><strong>Contact Name:</strong> ${review.contactName}</p>
          <p><strong>Email:</strong> ${review.mail}</p>
          <p><strong>Phone:</strong> ${review.phone}</p>
          <p><strong>Description:</strong> ${review.des}</p>
          // <p><strong>Message:</strong> ${req.body.message}</p>
          <p><strong>Status :</strong> <em>pending</em> </p>
      `;
    const subject = "New Registration";
    sendMail(req.body.email, subject, message);

    // -----------------------------  //

    res.redirect("/regOrg.html");
    // await maildata.deleteMany({});
    // console.log("All documents deleted from collection");
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});
// ////////////////////////////////////////////////////
// trying it
fetchOrg();
// tried it
// ----------------------------------------------------  //

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
