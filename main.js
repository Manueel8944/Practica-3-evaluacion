const readline = require('readline');

const { Jardin } = require('./funciones.js');

let pause

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function preguntar(texto) {
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => {
      resolve(respuesta);
    });
  });
}

async function menu () {
    
    const gestor = new Jardin()

    let menu = 0

    while (menu != 8) { 

        console.clear()
        console.log("\x1b[36m╔════════════════════════════════════╗\x1b[0m");
        console.log("\x1b[36m║ \x1b[32m        GESTOR JARDIN     \x1b[36m         ║\x1b[0m");
        console.log("\x1b[36m╠════════════════════════════════════╣\x1b[0m");
        console.log("\x1b[36m║ \x1b[33m 1)\x1b[0m Cargar plantas             \x1b[36m    ║\x1b[0m");
        console.log("\x1b[36m║ \x1b[33m 2)\x1b[0m Revisar riego                 \x1b[36m ║\x1b[0m");
        console.log("\x1b[36m║ \x1b[33m 3)\x1b[0m Regar plantas que necesiten   \x1b[36m ║\x1b[0m");
        console.log("\x1b[36m║ \x1b[33m 4)\x1b[0m Mostrar logs     \x1b[36m              ║\x1b[0m");
        console.log("\x1b[36m║ \x1b[33m 5)\x1b[0m Salir                        \x1b[36m  ║\x1b[0m");
        console.log("\x1b[36m╚════════════════════════════════════╝\x1b[0m");

        menu = parseInt(await preguntar("Elige una opción: "))

        console.clear()

        switch (menu) {

            case 1: {
                console.clear()
                console.log("=== Cargar plantas ===") 

                await gestor.leerdatos()
                
                await gestor.contarIds()

                let metodo = await preguntar("Metodo con el que cargar las plantas (manual, json, xlsx): ")

                await gestor.cargarPlantas(metodo)

                await gestor.escribirdatos()

                pause = await preguntar("Pulse Enter para continuar...")
                break;
            }
            
            case 2: {
                console.clear()
                console.log("=== Revisar riego ===") 

                await gestor.leerdatos()

                await gestor.revisarRiego()
                await gestor.cualesNecesitanRiego()

                pause = await preguntar("Pulse Enter para continuar...")
                break;
            }
        
            case 3: {
                console.clear()
                console.log("=== Regar plantas que necesiten ===") 
                
                await gestor.leerdatos()

                gestor.regarPlantas()

                await gestor.escribirdatos()

                pause = await preguntar("Pulse Enter para continuar...")
                break;
            }

            case 4: {
                console.clear()
                console.log("=== Mostrar logs ===") 
                
                await gestor.verLogs()

                pause = await preguntar("Pulse Enter para continuar...")
                break;
            }

            case 5: {
                console.clear()
                console.log("=== Salir ===")
                rl.close()
                break;
            }

            default: {
                console.error("Error: Opción no válida, intentalo de nuevo.");
                pause = await preguntar("Pulse Enter para continuar...")
            }
        }
    }
}

menu()