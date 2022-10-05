class TraficLight {

    constructor(lat, lng) {
        this.lng = lng;
        this.lat = lat;
        this.color = "#ff0000";
    }

    switchColor() {
        if (this.color === "#ff0000") {
            this.color = "#12ff00";
        } else {
            this.color = "#ff0000";
        }
    }
}