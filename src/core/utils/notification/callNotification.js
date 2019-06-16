const options = {
    body: 'Notification body',
    icon: '/public/images/logo512x512.png'
};

export function callNotification(overrideOptions?: Object) {
    const notifyTitle   = (overrideOptions && overrideOptions.title) || 'Donut notify';
    const notifyOptions = {
        ...options,
        ...overrideOptions
    };

    if (!('Notification' in window)) {
        // eslint-disable-next-line
        window.alert('This browser does not support desktop notification');

        return;
    }

    window.console.log(Notification.permission);

    if (Notification.permission === 'granted') {
        new Notification(notifyTitle, notifyOptions);

        return;
    }

    if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                new Notification(notifyTitle, notifyOptions);

                return;
            }
        });

        return;
    }
}
