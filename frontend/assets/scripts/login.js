document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.login-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = document.querySelector('.input-field[type="text"]').value;
        const password = document.querySelector('.input-field[type="password"]').value;

        if (!username || !password) {
            alert("Username and password are required!");
            return;
        }

        console.log(`Sign in pressed: ${username} ; ${password}`);

        try {
            const response = await fetch("http://pi0040:3000/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful:", data);
                localStorage.setItem("username", username); // Store session info
                window.location.href = "dashboard.html"; // Redirect to dashboard
            } else {
                alert("Login failed: " + data.message);
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Server error, please try again later.");
        }
    });

    // Redirect to registration page
    document.querySelector('.signup-text a').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'register.html'; // Redirects to register page
    });
});
