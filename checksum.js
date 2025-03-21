const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const glob = require("glob");

// Initialize Express app
const app = express();
const port = 3005; // You can choose any port you like

// Directory where your project is located
const projectDirectory = path.join(__dirname);
const checksumFilePath = path.join(projectDirectory, "checksum.txt"); // File to store the checksum

// Function to calculate checksum for a file
const calculateFileChecksum = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
};

// Function to get all the files in the project, excluding node_modules, log, and checksum.txt
const getProjectFiles = () => {
  return new Promise((resolve, reject) => {
    glob(
      "**/*",
      {
        cwd: projectDirectory,
        nodir: true,
        ignore: ["node_modules/**/*", "log/**/*", "feed/**/*", "checksum.txt"]
      },
      (err, files) => {
        if (err) reject(err);
        else resolve(files);
      }
    );
  });
};

// Function to read the stored checksum
const readStoredChecksum = () => {
  if (fs.existsSync(checksumFilePath)) {
    try {
      const data = fs.readFileSync(checksumFilePath, "utf-8");
      return JSON.parse(data); // Try to parse the JSON
    } catch (err) {
      console.warn(
        "Error parsing checksum file, initializing as empty object."
      );
      return {}; // Return an empty object if parsing fails
    }
  }
  return {}; // Return an empty object if no checksum file exists
};

// Function to store the checksum
const storeChecksum = (checksum) => {
  fs.writeFileSync(checksumFilePath, checksum, "utf-8");
};

// Function to list changed, missing, and new files
const listFileDifferences = (
  currentFiles,
  projectChecksums,
  storedChecksums
) => {
  const changedFiles = [];
  const missingFiles = [];
  const newFiles = [];

  // Check for changed and missing files
  for (const file of Object.keys(storedChecksums)) {
    if (!projectChecksums[file]) {
      // If a file in the stored checksum is not in the current project
      missingFiles.push(file);
    } else if (storedChecksums[file] !== projectChecksums[file]) {
      // If the file's checksum has changed
      changedFiles.push(file);
    }
  }

  // Check for new files
  for (const file of Object.keys(projectChecksums)) {
    if (!storedChecksums[file]) {
      newFiles.push(file);
    }
  }

  return { changedFiles, missingFiles, newFiles };
};

// Main function to generate checksum for the entire project (called only once)
const generateProjectChecksum = async () => {
  try {
    const files = await getProjectFiles();

    let projectChecksums = {};

    // Calculate checksum for each file
    files.forEach((file) => {
      const filePath = path.join(projectDirectory, file);
      const fileChecksum = calculateFileChecksum(filePath);
      projectChecksums[file] = fileChecksum;
    });

    // Store the checksums in checksum.txt
    storeChecksum(JSON.stringify(projectChecksums, null, 2));

    console.log("Initial checksum stored.");
  } catch (error) {
    console.error("Error generating checksum:", error);
  }
};

// Only generate checksum if it doesn't already exist
if (!fs.existsSync(checksumFilePath)) {
  console.log("Checksum not found. Generating initial checksum...");
  generateProjectChecksum();
}

// Endpoint for verification
app.get("/verify-checksum", async (req, res) => {
  try {
    const files = await getProjectFiles();

    let projectChecksums = {};

    // Calculate checksum for each file
    files.forEach((file) => {
      const filePath = path.join(projectDirectory, file);
      const fileChecksum = calculateFileChecksum(filePath);
      projectChecksums[file] = fileChecksum;
    });

    // Read the stored checksum
    const storedChecksums = readStoredChecksum();

    // List the file differences
    const { changedFiles, missingFiles, newFiles } = listFileDifferences(
      files,
      projectChecksums,
      storedChecksums
    );

    // Return the verification result
    if (
      changedFiles.length > 0 ||
      missingFiles.length > 0 ||
      newFiles.length > 0
    ) {
      res.json({
        message: "Differences detected.",
        changedFiles: changedFiles,
        missingFiles: missingFiles,
        newFiles: newFiles,
      });
    } else {
      res.json({
        message: "No changes detected. Project is the same.",
        changedFiles: [],
        missingFiles: [],
        newFiles: [],
      });
    }
  } catch (error) {
    console.error("Error verifying checksum:", error);
    res
      .status(500)
      .json({ message: "Error verifying checksum.", error: error.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Checksum verification API running on http://localhost:${port}`);
});
