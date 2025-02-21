document.addEventListener("DOMContentLoaded", () => {
    // Handle registration submission
    document.querySelector('.login-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = document.querySelector('.input-field[type="text"]').value.trim();
        const password = document.querySelector('.input-field[type="password"]').value.trim();

        if (!username || !password) {
            alert("Username and password cannot be empty!");
            return;
        }

        console.log(`Register pressed: ${username} ; ${password}`);

        try {
            // Send a request to the backend to register a new user
            const response = await fetch("http://pi0040:3000/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful! Redirecting to login...");
                window.location.href = "login.html"; // Redirect to login page
            } else {
                alert("Registration failed: " + data.message);
            }
        } catch (error) {
            console.error("Error registering user:", error);
            alert("Server error, please try again later.");
        }
    });

    // Handle login button click (redirect)
    document.querySelector('.signup-text a').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html'; // Redirect to login page
    });
});
