document.addEventListener("DOMContentLoaded", () => {
    // Get file info from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("user");
    const filename = urlParams.get("file");

    if (!username || !filename) {
        document.body.innerHTML = "<h2>Error: Invalid file request.</h2>";
        return;
    }

    const fileInfo = document.getElementById("file-info");
    const downloadBtn = document.getElementById("download-btn");
    const fileName = document.getElementById("file-name");
    const fileIcon = document.getElementById("file-icon");

    // Set file details
    fileName.innerHTML = `<i>${filename}</i>`
    fileInfo.innerHTML = `From: <strong>${username}</strong><br>Size: 10GB<br>Hash: hash_here`;

    // Extract file extension
    const fileExtension = filename.split('.').pop().toLowerCase();

    // File type to icon mapping
    const iconMap = {
        "pdf": "../assets/img/file_icons/pdf.png",
        "jpg": "../assets/img/file_icons/image.png",
        "jpeg": "../assets/img/file_icons/image.png",
        "png": "../assets/img/file_icons/image.png",
        "gif": "../assets/img/file_icons/image.png",
        "mp4": "../assets/img/file_icons/video.png",
        "avi": "../assets/img/file_icons/video.png",
        "mkv": "../assets/img/file_icons/video.png",
        "mp3": "../assets/img/file_icons/audio.png",
        "wav": "../assets/img/file_icons/audio.png",
        "zip": "../assets/img/file_icons/zip.png",
        "rar": "../assets/img/file_icons/zip.png",
        "7z": "../assets/img/file_icons/zip.png",
        "txt": "../assets/img/file_icons/txt.png",
        "doc": "../assets/img/file_icons/doc.png",
        "docx": "../assets/img/file_icons/doc.png",
        "xls": "../assets/img/file_icons/excel.png",
        "xlsx": "../assets/img/file_icons/excel.png",
        "ppt": "../assets/img/file_icons/ppt.png",
        "pptx": "../assets/img/file_icons/ppt.png",
        "json": "../assets/img/file_icons/json.png",
        "html": "../assets/img/file_icons/html.png",
        "css": "../assets/img/file_icons/css.png",
        "js": "../assets/img/file_icons/js.png",
        "exe": "../assets/img/file_icons/exe.png",
        "default": "../assets/img/file_icons/default.png"
    };

    // Set file icon (fallback to default if not found)
    fileIcon.src = iconMap[fileExtension] || iconMap["default"];

    // Set the file download URL
    const fileUrl = `http://localhost:3000/api/files/download/${username}/${filename}`;

    // Add click event to trigger download
    downloadBtn.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = filename; // This suggests to the browser to download the file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
