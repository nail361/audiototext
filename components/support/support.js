setTimeout(function() {
    window.intergramId = "2023837952";

    window.ig_hour_now = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit'});
    var time_full = new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute:'2-digit' });

    window.ig_integram_title = 'Поддержка';
    window.ig_introMessage   = 'Привет! Моё имя Мирослав. Онлайн каждый день с 11:00 до 22:00 по Москве. Напишите ваш вопрос, проблему или пожелание.';
    window.ig_autoResponse   = 'Ваше сообщение отправлено. Моё местное время ' + time_full + ' и обычно я оффлайн, но возможно отвечу в течение минуты. Не закрывайте окно!';

    if (window.ig_hour_now >= 11 && window.ig_hour_now <= 22) {
        window.ig_integram_title += ' Online';
        window.ig_autoResponse   = 'Ваше сообщение отправлено. Постараюсь ответить в течение минуты. Не закрывайте окно!';
    }

    window.intergramCustomizations = {
        titleClosed: window.ig_integram_title,
        titleOpen: window.ig_integram_title,
        introMessage: window.ig_introMessage,
        autoResponse: window.ig_autoResponse,
        autoNoResponse: 'Не успел за минуту :( Если ответ на вопрос для вас важен - пожалуйста, напишите ваш Email, я обязательно с вами свяжусь. Либо напишите в телеграмм @audiototext_admin или на почту shubin@аудиорасшифровщик.рф',
        placeholderText: 'Сообщение',
        // mainColor: "#E91E63", // Can be any css supported color 'red', 'rgb(255,87,34)', etc
        alwaysUseFloatingButton: false // Use the mobile floating button also on large screens
    };

    setTimeout(function() {
        const script = document.createElement('script');
        script.setAttribute('src', 'https://www.intergram.xyz/js/widget.js');
        script.setAttribute('type', 'text/javascript');

        document.getElementsByTagName('head')[0].appendChild(script);
    }, 1000);
}, 2000);