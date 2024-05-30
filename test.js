const fs = require('fs');
const path = require('path');

// Source directory containing PNG and JPG images
const sourceDirectory = 'C:\\Users\\tural\\Desktop\\University Logo';

// Destination directory where images will be saved
const destinationDirectory = 'C:\\Users\\tural\\Desktop\\TK\\UniComm\\logo_directory';

// Function to save an image as binary to the file system
function saveImage(filePath, destinationDirectory) {
    // Read the image file as binary
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Extract the image file name
        const imageName = path.basename(filePath);

        // Construct the destination file path
        const destinationFilePath = path.join(destinationDirectory, imageName);

        // Write the binary data to the destination file
        fs.writeFile(destinationFilePath, data, 'binary', (err) => {
            if (err) {
                console.error('Error saving image:', err);
            } else {
                console.log('Image saved successfully:', destinationFilePath);
            }
        });
    });
}

// Read files from the source directory
fs.readdir(sourceDirectory, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // Filter PNG and JPG files
    const imageFiles = files.filter(file => ['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase()));

    // Save each image file to the destination directory
    imageFiles.forEach(file => {
        const filePath = path.join(sourceDirectory, file);
        saveImage(filePath, destinationDirectory);
    });
});
