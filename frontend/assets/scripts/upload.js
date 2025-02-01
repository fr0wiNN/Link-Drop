document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.querySelector("#file-input");
    const uploadButton = document.querySelector(".upload-file-button");

    uploadButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent any default behavior
        console.log("Button clicked");
        fileInput.click(); // Open the file selector
    });

    fileInput.addEventListener("change", (event) => {
        const selectedFile = event.target.files[0]; // Get the selected file
        if (selectedFile) {
            console.log("File selected:", selectedFile.name);
            // TODO: Handle file upload (send to server, etc.)
        }
    });
});
