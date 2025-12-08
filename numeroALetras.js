function numeroALetras(num){
const unidades = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const decenas = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const especiales = ["once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];

    if (num < 10) return unidades[num];
    if (num > 10 && num < 20) return especiales[num - 11];

    if (num < 100) {
        let d = Math.floor(num / 10);
        let u = num % 10;
        if (u === 0) return decenas[d];
        if (d === 1) return "dieci" + unidades[u]; // dieciséis, diecisiete, etc.
        if (d === 2) return "veinti" + unidades[u]; // veintiuno, veintidós, etc.
        return decenas[d] + " y " + unidades[u];
    }

    if (num < 1000) {
        let c = Math.floor(num / 100);
        let resto = num % 100;
        let centenas = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
        if (resto === 0) return centenas[c];
        if (c === 1) return "ciento " + numeroALetras(resto);
        return centenas[c] + " " + numeroALetras(resto);
    }

    if (num < 10000) {
        let m = Math.floor(num / 1000);
        let resto = num % 1000;
        let miles = (m === 1 ? "mil" : unidades[m] + " mil");
        if (resto === 0) return miles;
        return miles + " " + numeroALetras(resto);
    }

    return "Número demasiado grande";
}




module.exports = numeroALetras;
