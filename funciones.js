const fs = require('fs/promises');
const XLSX = require('xlsx');
const prompt = require('prompt-sync');
const { DateTime } = require('luxon');

class Planta{
    constructor(id, nombre, tipo, frecuenciaRiego, ultimoRiego){
        this.id = id
        this.nombre = nombre
        this.tipo = tipo
        this.frecuenciaRiego = frecuenciaRiego
        this.ultimoRiego = ultimoRiego
    }
}

class Jardin{
    constructor(){
        this.plantas = []
        this.numID = 0
        this.necesitanRiego = []
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

    async crearLog(mensaje){
        let momento = DateTime.now().toISO()
        let log = `[${momento}] ${mensaje}\n`
        await fs.appendFile('logs.txt', log)
    }

    async contarIds(){
        this.numID = this.plantas.length
    }

    async cargarPlantas(metodo){
        switch(metodo){
            case 'manual': {
                let nombre = prompt('Nombre: ')
                let tipo = prompt('Tipo: ')
                let frecuenciaRiego = prompt('Frecuencia de riego (dias): ')
                let ultimoRiego = false

                this.plantas.push(new Planta(this.numID, nombre, tipo, frecuenciaRiego, ultimoRiego))
                this.crearLog(`Planta cargada con el ID(${this.numID})`)
                this.numID++

                break;
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
                    this.plantas.push(new Planta(this.numID, nuevasPlantas[i].nombre, nuevasPlantas[i].tipo, nuevasPlantas[i].frecuenciaRiego, nuevasPlantas[i].ultimoRiego))
                    this.crearLog(`Planta cargada con el ID(${this.numID})`)
                    this.numID++
                }

                break;
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

                    this.plantas.push(new Planta(this.numID, datosXLSX[i].nombre, datosXLSX[i].tipo, datosXLSX[i].frecuenciaRiego, datosXLSX[i].ultimoRiego))
                    this.crearLog(`Planta cargada con el ID(${this.numID})`)
                    this.numID++
                }

                break;
            }

            default: {
                console.error("Error: Opción no válida, intentalo de nuevo.");
            }
        }
    }

    async revisarRiego(){
        let hoy = DateTime.now()
        this.necesitanRiego = []

        for (let i = 0; i < this.plantas.length; i++){
            let ultRiego = this.plantas[i].ultimoRiego

            if (!ultRiego){
                this.necesitanRiego.push(this.plantas[i])
            }

            else{
                let ultRiegoSumado = DateTime.fromISO(this.plantas[i].ultimoRiego).plus({ days: this.plantas[i].frecuenciaRiego })

                if (hoy >= ultRiegoSumado) {
                    this.necesitanRiego.push(this.plantas[i])
                }
            }
        }
    }

    async cualesNecesitanRiego(){
        for(let i = 0; i < this.necesitanRiego.length; i++) {
            console.log(`- La planta ${this.necesitanRiego[i].nombre} con id (${this.necesitanRiego[i].id}) necesita ser regada.`)
        }

        this.necesitanRiego = []
    }

    async regarPlantas(){
        await this.revisarRiego()

        let hoy = DateTime.now().toISODate();
        
        for(let i = 0; i < this.necesitanRiego.length; i++) {
            this.necesitanRiego[i].ultimoRiego = hoy
            this.crearLog(`Planta regada con el ID(${this.necesitanRiego[i].id})`)
        }

        let pause1 = prompt("Regando plantas..")
        pause1 = prompt("Regando plantas....")
        pause1 = prompt("Regando plantas........")
        console.log("¡Plantas regadas correctamente!")

        this.necesitanRiego = []
    }

    async verLogs(){
        try {
            const data = await fs.FileSync('logs.txt', 'utf8');
            console.log(data);
        } 
        
        catch (err) {
            console.error("Error al leer el archivo");
        }
    }

}

module.exports = {Jardin}