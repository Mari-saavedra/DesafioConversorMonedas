const monto = document.getElementById('monto')
const lista = document.getElementById('lista')
const btnBuscar = document.getElementById('btnBuscar')
const resultado = document.getElementById('resultado')

//obtenemos las moendas de la api
const apiListaMonedas = async () => {
    try 
    {
        const res = await fetch('https://mindicador.cl/api')
        const data = await res.json()

        return(data)
    } 
    catch (error)
    {
        alert("No se pudo obtener las Monedas.")
    }
}

// Llenamos la lista con las monedas
const llenaLista = async () => {
    const data = await apiListaMonedas()

    if (data) 
    {
        for (const indice in data) {
            if (data[indice]?.nombre) {
                const nombre = data[indice].nombre;
                const id = indice

                lista.value = nombre
                lista.innerHTML += `<option value="${id}">${nombre}</option>`    
            }
        }
    }
    else
    {
        alert("No se pudo llenar la lista con las Monedas.")
    }
}

llenaLista()

// Obtenemos datos de la moneda seleccionada de la lista y que pasa como parametro
const datosMoneda = async (moneda) => {
    try 
    {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`)
        
        const valores = await res.json()

        return valores
    } 
    catch(error) 
    {
        //alert("No hay datos para la moneda seleccionada.")
        resultado.innerHTML = 'No hay datos para la moneda seleccionada.'
    }
}

// hacemos la conversion
btnBuscar.addEventListener('click', async () => {
    if (monto.value && lista.value)
    {   
       const datos = await datosMoneda(lista.value)

       if (datos) 
        {            
            resultado.innerHTML = `Resultado: ${(monto.value / datos.serie[0].valor).toFixed(2)} ${datos.codigo}`

            renderGrafica(lista.value)
       }
    }
   else
   {
    alert("Asegurese de ingresar el monto en pesos y seleccionar la moneda para realizar la conversión.")
   }
})

//obtenemos datos para el grafico
const datosFechaMoneda = async (moneda) => {
    try 
    {   
        const valores = await datosMoneda(moneda)

        const datosParaMostrar = valores.serie.slice(0,10);

        const labels = datosParaMostrar.map((objeto) => 
        {
           const fecha = new Date(objeto.fecha).toLocaleDateString();

           return fecha;
         })
      
        const data = datosParaMostrar.map((objeto) => objeto.valor)

        const datasets = 
        [
            {              
            label: `Valores de ${moneda.toUpperCase()}`,
            borderColor: "hsl(0, 98.40%, 49.40%)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            data,
            },
        ]
            
        return {labels, datasets}
    }
    catch (error)
    {
        console.error("Error al obtener los datos de la moneda:", error.message)
    }
}

let chartInstance = null; // Variable para almacenar la instancia del gráfico

async function renderGrafica( moneda) {
    const chartData = await datosFechaMoneda(moneda);

    if (chartData) 
    {
        const config = {
                        type: "line",
                        data: chartData,
                        options:{
                                responsive: true,
                                plugins: { legend: { position: "top", }, },
                                scales: {
                                        x:  {
                                            title: { 
                                                   display: true,
                                                   text: "Fecha",
                                                   },
                                            },
                                        y:  {
                                            title: { 
                                                   display: true,
                                                   text: "Valor",
                                                   },
                                            },
                                        },
                                },
                        }

        if (chartInstance) 
        {
            chartInstance.destroy();
        }

        const ctx = document.getElementById("myChart").getContext("2d");
        chartInstance = new Chart(ctx, config);
    } 
    else 
    {
    console.error("No se pudieron cargar los datos para el gráfico.")
    }
}