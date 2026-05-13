window.NotificationsHelper = {
    shownNotifications: new Set(),

    start() {
        this.fetchUnreadNotifications();

        setInterval(() => {
            this.fetchUnreadNotifications();
        }, 5000);
    },

    async fetchUnreadNotifications() {
        try {
            const token = localStorage.getItem("token");
            const baseUrl = localStorage.getItem("BaseUrl");

            const response = await fetch(
                `${baseUrl}/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const notifications = await response.json();
            for (const notification of notifications) {
                if (
                    notification.read === false &&
                    !this.shownNotifications.has(notification._id)
                ) {
                    this.shownNotifications.add(notification._id);
                    this.show(notification.message);
                    await fetch(
                        `${baseUrl}/notifications/${notification._id}/read`,
                        {
                            method: "PATCH",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                }
            }

        } catch (error) {
            console.error(error);
        }
    },

    show(message) {
        const popup = document.createElement("div");

        popup.innerHTML = 'New Notification <br>' + message;

        popup.style.position = "fixed";
        popup.style.top = "20px";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.background = "#222";
        popup.style.color = "white";
        popup.style.padding = "15px 20px";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
        popup.style.zIndex = "9999";

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
};