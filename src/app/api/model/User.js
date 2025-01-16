class User {
    constructor(username, coords) {
        this.username = username;
        this.coords = coords;
    }

    // Getters
    getUsername() {
        return this.username;
    }

    getCoords() {
        return this.coords;
    }

    // Setters
    setUsername(username) {
        this.username = username;
    }

    setCoords(coords) {
        this.coords = coords;
    }
}

module.exports = User;