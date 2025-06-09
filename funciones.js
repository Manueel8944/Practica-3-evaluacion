const fs = require('fs/promises');
const XLSX = require('xlsx');
const prompt = require('prompt-sync');
const { DateTime } = require('luxon');

class Planta{
    constructor(nombre, tipo, frecuenciaRiego, ultimoRiego){
        this.nombre = nombre
        this.tipo = tipo
        this.frecuenciaRiego = frecuenciaRiego
        this.ultimoRiego = ultimoRiego
    }
}

class Jardin{
    constructor(){
        this.plantas = []
    }

    async leerdatos() {
        try {
            const datos = await fs.readFile("jardin.json", 'utf8');
            this.plantas = JSON.parse(datos);
        } catch (error) {
            console.error("Error al leer los datos");
            this.plantas = [];
        }
    }

    async escribirdatos() {
        try {
            const datosparseados = JSON.stringify(this.plantas, null, 2);
            await fs.writeFile("jardin.json", datosparseados, 'utf8');
        } catch (error) {
            console.error("Error al escribir los datos");
        }
    }

    async cargarPlantas(metodo){
        switch(metodo){
            case 'manual': {
                let nombre = prompt('Nombre: ')
                let tipo = prompt('Tipo: ')
                let frecuenciaRiego = prompt('Frecuencia de riego (dias): ')
                let ultimoRiego = false

                this.plantas.push(new Planta(nombre, tipo, frecuenciaRiego, ultimoRiego))
            }

            case 'json': {
                let nuevasPlantas = []

                try {
                    const datos = await fs.readFile("./cargarPlantas/plantas.json", 'utf8');
                    nuevasPlantas = JSON.parse(datos);
                } 
                
                catch (error) {
                    console.error("Error al leer los datos");
                    nuevasPlantas = [];
                }

                for(let i = 0; i < nuevasPlantas.length; i++){
                    this.plantas.push(new Planta(nuevasPlantas[i].nombre, nuevasPlantas[i].tipo, nuevasPlantas[i].frecuenciaRiego, nuevasPlantas[i].ultimoRiego))
                }
            }

            case 'xlsx': {
                const ruta = './cargarPlantas/plantas.xlsx'
                const libro = XLSX.readFile(ruta)
                const hoja = 'Hoja1'
                const datosHoja = libro.Sheets[hoja]
                const datosXLSX = XLSX.utils.sheet_to_json(datosHoja)

                for(let i = 0; i < datosXLSX.length; i++){
                    if(datosXLSX[i].ultimoRiego === 'false'){
                        datosXLSX[i].ultimoRiego = false
                    }

                    this.plantas.push(new Planta(datosXLSX[i].nombre, nuevasPlantas[i].tipo, nuevasPlantas[i].frecuenciaRiego, nuevasPlantas[i].ultimoRiego))
                }
            }
        }
    }

    async revisarRiego(){
        let hoy = DateTime.now()
        console.log(hoy)
    }

}

module.exports = {Jardin}