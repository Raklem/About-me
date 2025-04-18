document.addEventListener('DOMContentLoaded', function() {
    // Предустановленные учетные записи
    const users = [
        { username: 'admin', password: 'admin123', email: 'admin@university.edu' },
        { username: 'student', password: 'student123', email: 'student@university.edu' },
        { username: 'teacher', password: 'teacher123', email: 'teacher@university.edu' }
    ];
    
    // Форма входа
    const loginForm = document.getElementById('login-form');
    
    // Проверяем, вошел ли пользователь ранее
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'index.html';
    }
    
    // Обработчик отправки формы
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Проверяем учетные данные
            login(username, password, rememberMe);
        });
    }
    

    function login(username, password, rememberMe) {
        // Ищем пользователя
        const user = users.find(user => user.username === username && user.password === password);
        
        if (user) {
            // Успешный вход
            showMessage('Login successful!', 'success');
            
            // Сохраняем данные в localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('username', user.username);
            
            // Если пользователь выбрал "Запомнить меня", сохраняем эту информацию
            if (rememberMe) {
                localStorage.setItem('rememberUser', 'true');
            } else {
                localStorage.removeItem('rememberUser');
            }
            
            // Перенаправление на основную страницу
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Неудачный вход
            showMessage('Incorrect login or password.', 'error');
        }
    }
    
    // Функция для отображения сообщений
    function showMessage(message, type) {
        // Удаляем существующие сообщения
        const existingMessage = document.querySelector('.message-box');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Создаем элемент сообщения
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;
        
        // Добавляем на страницу
        const loginBox = document.querySelector('.login-box');
        if (loginBox) {
            loginBox.insertBefore(messageBox, loginBox.firstChild);
        } else {
            document.body.appendChild(messageBox);
        }
        
        // Автоматическое удаление сообщения об ошибке через 3 секунды
        if (type === 'error') {
            setTimeout(() => {
                messageBox.remove();
            }, 3000);
        }
    }
});
