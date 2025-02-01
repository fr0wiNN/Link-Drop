document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.login-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const username = document.querySelector('.input-field[type="text"]').value;
        const password = document.querySelector('.input-field[type="password"]').value;

        // TODO: check for potential sql injection

        console.log(`Sign in pressed: ${username} ; ${password}`);

        // TODO: authenticate user and create user object
    });

    // Registration button click - redirect to register.html
    document.querySelector('.signup-text a').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'register.html'; // Redirects to register page
    });
});
