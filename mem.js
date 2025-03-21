const express = require("express");
const fs = require("fs");
const path = require("path");
const memjs = require("memjs");
require("dotenv").config(); // For environment variables
const app = express();
const port = 4500;
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Debug: Check environment variable
console.log("MEMCACHED_SERVERS:", process.env.MEMCACHED_SERVERS);
console.log("DB_SERVERS:", process.env.DB_HOST);

// Initialize Memcached client
const servers = process.env.MEMCACHED_SERVERS || "127.0.0.1:11211"; // Default server if none is set
const mc = memjs.Client.create(servers);

// Preload all images in a folder to Memcached
app.get("/preload-images", async (req, res) => {
  // console.log("TEST");
  const folderPath = "./activate/photos/questionpaper/images"; // Adjust folder path as needed
  let cachedCount = 0; // Counter for cached images

  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // Check if it's a valid image file
      if (
        fs.statSync(filePath).isFile() &&
        file.toUpperCase().endsWith(".JPG")
      ) {
        const imageId = path.parse(file).name; // Extract the image name without extension
        const imageData = fs.readFileSync(filePath);

        // Cache the image
        await mc.set(imageId, imageData, { expires: 3600 }); // Cache for 1 hour
        cachedCount++; // Increment the counter
        console.log(`Image ${imageId} cached successfully.`);
      }
    }

    console.log(`Total images cached: ${cachedCount}`);
    return res.status(200).json({ message: `All images preloaded into Memcached. Total images cached: ${cachedCount}` });
    // return res.status(401).json({ message: 'Access token is missing or invalid.' });
  } catch (error) {
    console.error("Error preloading images:", error);
    return res.status(500).json("Failed to preload images.");
  }
});

// app.get("/image/:id", async (req, res) => {
//   console.log("img");

//   const imageId = req.params.id;
//   const imagePath = `./activate/photos/questionpaper/images/${imageId}.jpg`; // Replace with actual path
//   console.log("memcache");
//   try {
//     console.log(`Request received for image: ${imageId}`);
//     // Check Memcached for the image
//     const cachedImage = await mc.get(imageId);

//     if (cachedImage.value) {
//       console.log(`Serving image ${imageId} from Memcached`);
//       res.setHeader("Content-Type", "image/jpeg");
//       res.send(cachedImage.value);
//     } else {
//       // Read from disk if not in cache
//       if (fs.existsSync(imagePath)) {
//         console.log(`Image ${imageId} not in cache, reading from disk`);
//         const imageData = fs.readFileSync(imagePath);

//         // Cache the image in Memcached
//         await mc.set(imageId, imageData, { expires: 3600 });

//         console.log(`Serving image ${imageId} from disk and caching it`);
//         res.setHeader("Content-Type", "image/jpeg");
//         res.send(imageData);
//       } else {
//         console.log(`Image ${imageId} not found`);
//         res.status(404).send("Image not found");
//       }
//     }
//   } catch (error) {
//     console.error(`Error handling image ${imageId}:`, error);
//     res.status(500).send("Internal server error");
//   }
// });

// Fetch image from Memcached or serve fallback
app.get("/image/:id", async (req, res) => {
  const imageId = req.params.id;
  const fallbackPath = "./assets/broken.gif"; // Path to fallback image

  try {
    const cachedImage = await mc.get(imageId);

    if (cachedImage.value) {
      console.log(`Serving image ${imageId} from cache`);
      res.setHeader("Content-Type", "image/jpeg");
      res.send(cachedImage.value);
    } else if (fs.existsSync(fallbackPath)) {
      console.log(`Image ${imageId} not in cache, serving fallback image`);
      const fallbackData = fs.readFileSync(fallbackPath);

      res.setHeader("Content-Type", "image/jpeg");
      res.send(fallbackData);
    } else {
      console.error("Fallback image not found.");
      res.status(404).send("Image not found, and no fallback available.");
    }
  } catch (error) {
    console.error(`Error fetching image ${imageId}:`, error);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
