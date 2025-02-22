export function createFileTile(file, deleteCallback, copyCallback) {
    const fileTile = document.createElement("div");
    fileTile.classList.add("file-tile");

    // Ensure filename exists
    const fileName = file.filename || "Unknown File";
    
    // Determine file icon based on file type
    const fileExtension = fileName.split(".").pop();
    const fileIcon = getFileIcon(fileExtension);

    // Ensure hash exists
    const fileHash = file.hash ? file.hash.substring(0, 10) : "N/A";

    // Ensure file size exists
    const fileSize = file.size ? formatFileSize(file.size) : "Unknown Size";

    fileTile.innerHTML = `
        <img src="${fileIcon}" width="50" height="50" alt="File Icon" class="file-icon">
        <div class="file-info">
            <p class="file-name">${fileName}</p>
            <hr>
            <p class="file-size">Size: ${fileSize}</p>
            <p class="file-hash">SHA-256: <span>${fileHash}...</span>
                <button class="copy-hash-button">
                    <img src="../assets/img/copy_hash.png" width="14" height="14">
                </button>
            </p>
        </div>
        <div class="file-actions">
            <button class="copy-url-btn" data-filename="${fileName}">Copy URL</button>
            <button class="delete-btn" data-filename="${fileName}">Delete</button>
        </div>
    `;

    // Add event listeners
    fileTile.querySelector(".copy-url-btn").addEventListener("click", () => copyCallback(fileName));
    fileTile.querySelector(".delete-btn").addEventListener("click", () => deleteCallback(fileName));

    return fileTile;
}


// Get File Icon Based on Extension
function getFileIcon(extension) {
    const icons = {
        "pdf": "../assets/img/file_icons/pdf.png",
        "jpg": "../assets/img/file_icons/image.png",
        "png": "../assets/img/file_icons/image.png",
        "txt": "../assets/img/file_icons/txt.png",
        "zip": "../assets/img/file_icons/zip.png",
        "mp4": "../assets/img/file_icons/video.png",
        "mp3": "../assets/img/file_icons/audio.png"
    };

    return icons[extension] || "../assets/img/file_icons/default.png";
}

// 🔹 Format File Size
export function formatFileSize(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

