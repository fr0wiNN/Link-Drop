document.addEventListener("DOMContentLoaded", () => {
    // Handle login submission
    document.querySelector('.login-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = document.querySelector('.input-field[type="text"]').value;
        const password = document.querySelector('.input-field[type="password"]').value;

        console.log(`Register pressed: ${username} ; ${password}`);
    });

    // Handle registration button click (redirect)
    document.querySelector('.signup-text a').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'login.html'; // Redirects to register page
    });
});
