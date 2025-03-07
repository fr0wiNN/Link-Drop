import { createFileTile } from "./dashboard-ui.js";

document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.querySelector("#file-input");
    const uploadButton = document.querySelector(".upload-file-button");
    const fileTilesContainer = document.querySelector(".file-tiles-container");

    loadFiles();

    uploadButton.addEventListener("click", () => fileInput.click());

    // Load all hosted files from database

    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const username = localStorage.getItem("username");
        if (!username) {
            alert("Error: You must be logged in to upload files.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:3000/api/files/upload/${username}`, {
                method: "POST",
                body: formData,
            });
        
            const result = await response.json();
            console.log(result);
        
            if (result.success) {
                alert("File uploaded successfully!");
                // TODO: update files listed
            } else {
                alert(`Upload failed: ${result.message}`);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Server error, please try again later.");
        }
        
    });

    // Fetch & Display Hosted Files
    async function loadFiles() {
        const username = localStorage.getItem("username");
        if (!username) {
            alert("Error: You must be logged in.", "error");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/files/userfiles/${username}`);
            const data = await response.json();

            if (!data.success) {
                alert(`${data.message}`, "error");
                return;
            }

            fileTilesContainer.innerHTML = ""; // Clear previous file tiles

            // 🔹 If user has no files, show a message
            if (data.files.length === 0) {
                fileTilesContainer.innerHTML = `<p class="no-files-message">No files uploaded yet.</p>`;
                return;
            }

            // 🔹 Display each file
            data.files.forEach(file => {
                const fileTile = createFileTile(file, deleteFile, copyFileURL);
                fileTilesContainer.appendChild(fileTile);
            });

        } catch (error) {
            console.error("Failed to load files:", error);
            alert("Server error while loading files.", "error");
        }
    }


    async function copyFileURL(filename) {
        const username = localStorage.getItem("username");
    
        try {
            const response = await fetch(`http://localhost:3000/api/files/get-file-hash/${username}/${filename}`);
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Failed to retrieve file hash");
            }
    
            const file_hash = data.file_hash;
            const url = `http://localhost:5500/frontend/pages/download.html?user=${username}&file=${file_hash}`;
    
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url)
                    .then(() => alert("File URL copied!", "success"))
                    .catch(err => {
                        console.error("Clipboard copy failed:", err);
                        fallbackCopyTextToClipboard(url);
                    });
            } else {
                fallbackCopyTextToClipboard(url);
            }
        } catch (error) {
            console.error("Error copying file URL:", error);
            alert("Failed to copy file URL.");
        }
    }
    

// Fallback function using `execCommand`
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand("copy");
        alert("File URL copied!", "success");
    } catch (err) {
        console.error("Fallback copy failed:", err);
        alert("Failed to copy the file URL.");
    }

    document.body.removeChild(textArea);
}

    async function deleteFile(filename) {
        const username = localStorage.getItem("username");
        if (!username) return;

        try {
            const response = await fetch(`http://localhost:3000/api/files/delete/${username}/${filename}`, {
                method: "DELETE",
            });

            const result = await response.json();
            if (result.success) {
                alert("File deleted!", "success");
                loadFiles(); // Refresh file list after deletion
            } else {
                alert(`${result.message}`, "error");
            }
        } catch (error) {
            console.error("File deletion failed:", error);
            alert("Server error while deleting file.", "error");
        }
    }
});
