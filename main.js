const readline = require('readline');

const { Jardin } = require('./funciones.js'); //Exportamos la clase Jardin del otro archivo

let pause

const rl = readline.createInterface({ //Esta es la intefaz del readline para que funcione
  input: process.stdin,
  output: process.stdout,
});

function preguntar(texto) { //Creo una funcion para poder preguntar con una promesa mediante readline
  return new Promise((resolve) => {
    rl.question(texto, (respuesta) => {
      resolve(respuesta);
    });
  });
}

async function menu () { //En esta funcion instanciamos dentro la clase Jardin y creamos un menú con un switch
    
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

        menu = parseInt(await preguntar("Elige una opción: ")) //De esta forma se usa la funcion de preguntar que creamos anteriormente con await

        console.clear()

        switch (menu) {

            case 1: {
                console.clear()
                console.log("=== Cargar plantas ===") 

                await gestor.leerdatos() //Leemos los datos del json jardin
                
                await gestor.contarIds()

                let metodo = await preguntar("Metodo con el que cargar las plantas (manual, json, xlsx): ") //Preguntamos para usar de parametro de funcion

                await gestor.cargarPlantas(metodo)

                await gestor.escribirdatos() //Escribimos los datos del json jardin

                pause = await preguntar("Pulse Enter para continuar...")
                break;
            }
            
            case 2: {
                console.clear()
                console.log("=== Revisar riego ===") 

                await gestor.leerdatos()

                await gestor.cualesNecesitanRiego() // Se muestran las plantas que necesiten riego

                pause = await preguntar("Pulse Enter para continuar...")
                break;
            }
        
            case 3: {
                console.clear()
                console.log("=== Regar plantas que necesiten ===") 
                
                await gestor.leerdatos()

                await gestor.regarPlantas() //Regamos las plantas del array de necesitanPlantas, cabe recalcar que al editar en ese array se edita en el de plantas ya que es una especie de duplicado

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
                return;
            }

            default: {
                console.error("Error: Opción no válida, intentalo de nuevo.");
                pause = await preguntar("Pulse Enter para continuar...")
            }
        }
    }
}

menu()