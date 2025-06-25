document.addEventListener('DOMContentLoaded', function() {
    const email = 'yzad5v7i7' + '@' + 'mozmail.com';
    const emailElement = document.getElementById('email-placeholder');
    emailElement.innerHTML = '<a href="mailto:' + email + '">' + email + '</a>';
});
