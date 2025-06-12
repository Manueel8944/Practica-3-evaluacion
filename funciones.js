const fs = require('fs/promises')
const XLSX = require('xlsx')
const prompt = require('prompt-sync')()
const { DateTime } = require('luxon')

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
        this.necesitanRiego = [] //Este es un array que se duplican los objetos de plantas que necesitan regado para luego editarlos aquí y que se editen en el array normal
    }

    async leerdatos() { //Aqui leemos los datos del array de jardin de manera asincrona
        try {
            const datos = await fs.readFile("jardin.json", 'utf8');
            this.plantas = JSON.parse(datos);
        } catch (error) {
            console.error("Error al leer los datos");
            this.plantas = [];
        }
    }

    async escribirdatos() {//Aqui escribimos los datos del array de jardin de manera asincrona
        try {
            const datosparseados = JSON.stringify(this.plantas, null, 2);
            await fs.writeFile("jardin.json", datosparseados, 'utf8');
        } catch (error) {
            console.error("Error al escribir los datos");
        }
    }

    async crearLog(mensaje){ //Esta es uan funcion que sirve para llamarla y poniendo de parametro el mensaje que quieras y se crea una linea en el txt de logs
        let momento = DateTime.now().toISO() //Esto es la fecha y hora
        let log = `[${momento}] ${mensaje}\n`
        await fs.appendFile('logs.txt', log)
    }

    async contarIds(){
        this.numID = this.plantas.length //Esto lo uso para ponerle un identificador unico a cada planta, soy consciente de que si se pudieran eliminar plantas no funcionaría bien pero no es el caso
    }

    async cargarPlantas(metodo){ //Esta funcion recibe de parametro la forma en que cargar las plantas y se hace un swich con ese parametro
        switch(metodo){
            case 'manual': { //Preguntamos los atributos de la planta y creamos un objeto con ellos y pusheamos en el array
                let nombre = prompt('Nombre: ')
                let tipo = prompt('Tipo: ')
                let frecuenciaRiego = prompt('Frecuencia de riego (dias): ')
                let ultimoRiego = prompt('Fecha de la ultima vez que ha sido regada (yyyy-mm-dd): ')

                this.plantas.push(new Planta(this.numID, nombre, tipo, frecuenciaRiego, ultimoRiego))

                console.log('Planta cargada con exito!')
                this.crearLog(`Planta cargada con el ID (${this.numID})`)
                this.numID++

                break;
            }

            case 'json': { // En esta funcion leemos los datos del json de cargar plantas, los metemos en un array y hacemos un push creando objetos de planta
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
                    this.crearLog(`Planta cargada con el ID (${this.numID})`)
                    this.numID++
                }

                console.log('Plantas cargadas con exito!')

                break;
            }

            case 'xlsx': { //Aqui pues leemos el archivo excel y creamos los objetos de planta
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
                    this.crearLog(`Planta cargada con el ID (${this.numID})`)
                    this.numID++
                }

                console.log('Plantas cargadas con exito!')

                break;
            }

            default: {
                console.error("Error: Opción no válida, intentalo de nuevo.");
            }
        }
    }

    async revisarRiego(){ //En esta funcion metemos en el array de necesitanRiego las plantas que lo necesiten
        let hoy = DateTime.now() //Vemos la fecha de hoy para controlar el tiempo de regado
        this.necesitanRiego = [] //Formateamos el array para que no haya problemas

        for (let i = 0; i < this.plantas.length; i++){
            let ultRiego = this.plantas[i].ultimoRiego //Sacamos el valor de ultimo riego de cada objeto del array

            if (!ultRiego){ // Si es false directamente necesitan regado
                this.necesitanRiego.push(this.plantas[i])
            }

            else{
                let ultRiegoSumado = DateTime.fromISO(this.plantas[i].ultimoRiego).plus({ days: this.plantas[i].frecuenciaRiego }) //Aqui vemos que dia necesitarian regado sumandole al ultimo riego los dias necesarios. El fromISO sirve para formatearlas al formato iso para poder comprarlo y el plus es para añadir los dias

                if (hoy >= ultRiegoSumado) { //Vemos si el ultimo riego mas los dias que necesita es menor que hoy, si es asi necesitan ser regadas
                    this.necesitanRiego.push(this.plantas[i])
                }
            }
        }
    }

    async cualesNecesitanRiego(){
        await this.revisarRiego()////LLamamos a esta funcion para ver que plantas necesitan riego para que se añadan al array

        for(let i = 0; i < this.necesitanRiego.length; i++) { // Aqui basicamente mostramos el array de necesitan riego
            console.log(`- La planta ${this.necesitanRiego[i].nombre} con el ID (${this.necesitanRiego[i].id}) necesita ser regada.`)
        }

        this.necesitanRiego = []
    }

    async regarPlantas(){ // Aqui regamos las plantas que lo necesiten y ponemos su valor de ultimo regado a la fecha actual
        await this.revisarRiego() //LLamamos a esta funcion para ver que plantas necesitan riego para que se añadan al array, además si actualizo los objetos del array de necesitanRiego tambien se actualiza en el array de plantas ya que es como un clon.

        let hoy = DateTime.now().toISODate(); //Vemos la fecha de hoy
        
        for(let i = 0; i < this.necesitanRiego.length; i++) {
            this.necesitanRiego[i].ultimoRiego = hoy // Aqui igualamos los que necesiten riego su ultimo regado a hoy
            await this.crearLog(`Planta regada con el ID (${this.necesitanRiego[i].id})`) //Creamos el log de que lo regamos
        }

        let pause1 = prompt("Regando plantas..")
        pause1 = prompt("Regando plantas....")
        pause1 = prompt("Regando plantas........")
        console.log("¡Plantas regadas correctamente!")

        this.necesitanRiego = []
    }

    async verLogs(){ //Esto es para mostrar toda la informacion dek txt logs
        try {
            const data = await fs.readFile('logs.txt', 'utf8')
            console.log(data)
        } 
        
        catch (err) {
            console.error("Error al leer el archivo")
        }
    }

}

module.exports = {Jardin} // Exportamos la clase jardin que usa todo asi que no hay que exportar lo demás