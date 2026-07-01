const exercises = []

function add(languageSlug, difficulty, type, title, statement, starterCode, tips, commonErrors, solutionHint) {
  exercises.push({ languageSlug, difficulty, type, title, statement, starterCode, tips, commonErrors, solutionHint })
}

add('python', 'facil', 'practica', 'Suma de dos numeros',
  'Escribi una funcion suma(a, b) que devuelva la suma de a y b. Probala imprimiendo suma(2, 3).',
  'def suma(a, b):\n    # tu codigo aca\n    pass\n\nprint(suma(2, 3))',
  ['Recorda que en Python los bloques se definen por indentacion, no por llaves.', 'Usa return para devolver un valor desde una funcion.'],
  ['Olvidarse los dos puntos al final del def.', 'Mezclar tabs y espacios en la indentacion.'],
  'return a + b')
add('python', 'media', 'practica', 'Numeros primos',
  'Escribi una funcion es_primo(n) que devuelva True si n es primo y False si no.',
  'def es_primo(n):\n    # tu codigo aca\n    pass',
  ['Un numero es primo si solo es divisible por 1 y por si mismo.', 'Podes recorrer desde 2 hasta la raiz cuadrada de n para optimizar.'],
  ['No contemplar el caso n <= 1.', 'Recorrer de mas sin necesidad, afectando el rendimiento.'],
  'Recorrer desde 2 hasta int(n**0.5)+1 y verificar divisibilidad.')
add('python', 'dificil', 'debug', 'Arreglar la funcion de Fibonacci',
  'Este codigo deberia imprimir los primeros 10 numeros de Fibonacci pero tiene un error logico. Encontralo y arreglalo.',
  'def fibonacci(n):\n    a, b = 0, 1\n    resultado = []\n    for i in range(n):\n        resultado.append(a)\n        a = b\n        b = a + b\n    return resultado\n\nprint(fibonacci(10))',
  ['Segui el valor de a y b paso a paso en papel para las primeras iteraciones.', 'El error esta en el orden de las asignaciones.'],
  ['Actualizar b usando el nuevo valor de a en lugar del original.'],
  'La linea b = a + b debe calcularse antes de reasignar a, o usar a, b = b, a + b.')

add('javascript', 'facil', 'practica', 'Invertir un string',
  'Escribi una funcion invertir(texto) que devuelva el texto al reves.',
  'function invertir(texto) {\n  // tu codigo aca\n}\n\nconsole.log(invertir("hola"))',
  ['Los strings se pueden convertir a array con .split("")', 'Array tiene un metodo .reverse()'],
  ['Olvidarse de volver a unir el array en un string con .join("")'],
  'return texto.split("").reverse().join("")')
add('javascript', 'media', 'practica', 'Filtrar numeros pares',
  'Dado un array de numeros, devolve un nuevo array solo con los pares usando .filter().',
  'function soloPares(numeros) {\n  // tu codigo aca\n}\n\nconsole.log(soloPares([1,2,3,4,5,6]))',
  ['El operador % te da el resto de una division.', '.filter() recibe una funcion que devuelve true o false por cada elemento.'],
  ['Usar = en vez de === al comparar.', 'Modificar el array original en vez de devolver uno nuevo.'],
  'return numeros.filter(n => n % 2 === 0)')
add('javascript', 'dificil', 'debug', 'Promesa que nunca resuelve',
  'Esta funcion async deberia esperar 1 segundo y despues devolver "listo", pero se queda colgada. Encontra el error.',
  'function esperar() {\n  return new Promise((resolve) => {\n    setTimeout(() => {\n      console.log("listo")\n    }, 1000)\n  })\n}\n\nasync function run() {\n  const resultado = await esperar()\n  console.log(resultado)\n}\n\nrun()',
  ['Una promesa necesita llamar a resolve(valor) para completarse.', 'Revisa que pasa dentro del setTimeout.'],
  ['Olvidarse de invocar resolve dentro del setTimeout.'],
  'Agregar resolve("listo") dentro del setTimeout, ademas del console.log.')

add('c', 'facil', 'practica', 'Area de un rectangulo',
  'Escribi un programa en C que pida base y altura por teclado y muestre el area.',
  '#include <stdio.h>\n\nint main() {\n    float base, altura;\n    // tu codigo aca\n    return 0;\n}',
  ['Usa scanf("%f", &variable) para leer numeros decimales.', 'No olvides el & antes del nombre de la variable en scanf.'],
  ['Olvidarse el punto y coma al final de las sentencias.', 'Usar %d en vez de %f para leer floats.'],
  'scanf("%f %f", &base, &altura); printf("Area: %f", base * altura);')
add('c', 'media', 'practica', 'Maximo de un arreglo',
  'Escribi una funcion que reciba un arreglo de enteros y su tamano, y devuelva el valor maximo.',
  '#include <stdio.h>\n\nint maximo(int arr[], int n) {\n    // tu codigo aca\n}\n\nint main() {\n    int nums[] = {3, 7, 2, 9, 4};\n    printf("%d", maximo(nums, 5));\n    return 0;\n}',
  ['Inicializa el maximo con el primer elemento del arreglo.', 'Recorre el arreglo con un for comparando cada elemento.'],
  ['Acceder fuera de los limites del arreglo (off-by-one).', 'No inicializar la variable de maximo antes del bucle.'],
  'int max = arr[0]; for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i]; return max;')
add('c', 'dificil', 'debug', 'Segmentation fault en punteros',
  'Este programa deberia imprimir el valor apuntado por p, pero crashea. Encontra el error de punteros.',
  '#include <stdio.h>\n\nint main() {\n    int *p;\n    *p = 10;\n    printf("%d", *p);\n    return 0;\n}',
  ['Un puntero debe apuntar a una direccion de memoria valida antes de usarlo.', 'Falta reservar memoria o asignarlo a una variable existente.'],
  ['Usar un puntero sin inicializar (puntero salvaje).'],
  'Declarar int valor; int *p = &valor; antes de asignar *p = 10;')

add('cpp', 'facil', 'practica', 'Clase Punto',
  'Crea una clase Punto con atributos x e y, y un metodo mostrar() que imprima sus valores.',
  '#include <iostream>\nusing namespace std;\n\nclass Punto {\npublic:\n    // tu codigo aca\n};\n\nint main() {\n    Punto p;\n    return 0;\n}',
  ['Los atributos public se acceden desde fuera de la clase.', 'Usa cout << para imprimir en C++.'],
  ['Olvidarse el punto y coma despues de cerrar la clase.', 'Confundir . con :: al llamar metodos.'],
  'int x, y; void mostrar() { cout << x << ", " << y; }')
add('cpp', 'media', 'practica', 'Vector de enteros ordenado',
  'Usando la libreria <vector> y <algorithm>, ordena un vector de enteros de menor a mayor.',
  '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {5, 2, 8, 1, 9};\n    // tu codigo aca\n    for (int n : nums) cout << n << " ";\n    return 0;\n}',
  ['sort() necesita un iterador de inicio y uno de fin.', 'nums.begin() y nums.end() te dan esos iteradores.'],
  ['Olvidarse de incluir <algorithm>.'],
  'sort(nums.begin(), nums.end());')
add('cpp', 'dificil', 'debug', 'Memory leak en un bucle',
  'Este codigo reserva memoria con new pero nunca la libera. Corregilo agregando el delete correspondiente.',
  '#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 0; i < 1000; i++) {\n        int* datos = new int[100];\n        // uso de datos\n    }\n    return 0;\n}',
  ['Toda memoria reservada con new debe liberarse con delete.', 'Para arreglos, se usa delete[] en vez de delete.'],
  ['Olvidarse de liberar memoria dinamica dentro de un bucle, causando memory leaks.'],
  'Agregar delete[] datos; al final de cada iteracion del for.')

add('java', 'facil', 'practica', 'Clase Persona',
  'Crea una clase Persona con nombre y edad, y un metodo saludar() que imprima un saludo.',
  'public class Persona {\n    // tu codigo aca\n\n    public static void main(String[] args) {\n        Persona p = new Persona();\n    }\n}',
  ['Los atributos van declarados dentro de la clase, antes de los metodos.', 'Usa System.out.println() para imprimir.'],
  ['Olvidarse el modificador public en la clase principal.', 'No hacer coincidir el nombre del archivo con el de la clase publica.'],
  'String nombre; int edad; void saludar() { System.out.println("Hola " + nombre); }')
add('java', 'media', 'practica', 'ArrayList de strings',
  'Crea un ArrayList<String> con 3 nombres y recorrelo imprimiendo cada uno con un for-each.',
  'import java.util.ArrayList;\n\npublic class Main {\n    public static void main(String[] args) {\n        // tu codigo aca\n    }\n}',
  ['Import java.util.ArrayList antes de usarlo.', 'El for-each usa la sintaxis for (Tipo variable : coleccion).'],
  ['Olvidarse el import.', 'Usar corchetes [] como si fuera un array normal.'],
  'ArrayList<String> nombres = new ArrayList<>(); nombres.add("Ana"); for (String n : nombres) System.out.println(n);')
add('java', 'dificil', 'debug', 'NullPointerException',
  'Este codigo tira NullPointerException. Encontra por que y corregilo.',
  'public class Main {\n    static String mensaje;\n\n    public static void main(String[] args) {\n        System.out.println(mensaje.length());\n    }\n}',
  ['Un String no inicializado vale null por defecto.', 'Antes de usar un objeto, asegurate de que no sea null.'],
  ['Usar un metodo sobre una variable que nunca fue inicializada.'],
  'Inicializar mensaje = "hola"; antes de llamar a mensaje.length();')

add('html', 'facil', 'practica', 'Estructura basica',
  'Escribi la estructura minima de un documento HTML5 con un titulo y un parrafo.',
  '<!-- tu codigo aca -->',
  ['Todo documento HTML5 empieza con <!DOCTYPE html>.', 'El contenido visible va dentro de <body>.'],
  ['Olvidarse de cerrar las etiquetas.', 'Poner el <title> fuera del <head>.'],
  '<!DOCTYPE html><html><head><title>Mi pagina</title></head><body><p>Hola</p></body></html>')
add('html', 'media', 'practica', 'Formulario de contacto',
  'Crea un formulario con campos para nombre y email, y un boton de enviar.',
  '<form>\n  <!-- tu codigo aca -->\n</form>',
  ['Usa <label> asociado con for/id para accesibilidad.', 'El input de email deberia usar type="email".'],
  ['Olvidarse el atributo name en los inputs, necesario para enviar el formulario.'],
  '<label for="nombre">Nombre</label><input id="nombre" name="nombre"><input type="email" name="email"><button type="submit">Enviar</button>')
add('html', 'dificil', 'debug', 'Etiquetas mal anidadas',
  'Este HTML tiene etiquetas mal anidadas que rompen el layout. Encontra el problema.',
  '<div>\n  <p>Texto <strong>importante</p></strong>\n</div>',
  ['Las etiquetas deben cerrarse en el orden inverso al que se abrieron (como una pila).'],
  ['Cerrar </p> antes que </strong> cuando strong se abrio despues.'],
  '<p>Texto <strong>importante</strong></p>')

add('css', 'facil', 'practica', 'Centrar una caja',
  'Centra un div de 200px de ancho horizontalmente en la pagina usando CSS.',
  '.caja {\n  width: 200px;\n  /* tu codigo aca */\n}',
  ['margin: 0 auto centra elementos de ancho fijo.', 'display: flex con justify-content: center es otra alternativa.'],
  ['Usar margin: auto sin especificar un ancho fijo en el elemento.'],
  'margin: 0 auto;')
add('css', 'media', 'practica', 'Grid de 3 columnas',
  'Crea un layout de grilla con 3 columnas iguales y separacion de 16px entre elementos.',
  '.contenedor {\n  /* tu codigo aca */\n}',
  ['display: grid activa el modelo de grilla.', 'grid-template-columns: repeat(3, 1fr) crea 3 columnas iguales.'],
  ['Olvidarse de definir grid-template-columns y esperar que se acomode solo.'],
  'display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;')
add('css', 'dificil', 'debug', 'Especificidad de selectores',
  'El texto deberia verse rojo pero aparece azul. Encontra el problema de especificidad en el CSS.',
  '#titulo { color: blue; }\n.destacado { color: red; }\n\n<h1 id="titulo" class="destacado">Hola</h1>',
  ['Los selectores de ID tienen mayor especificidad que los de clase.', 'Para forzar el rojo sin cambiar el HTML, hay que aumentar la especificidad del selector de clase.'],
  ['Asumir que el orden en el archivo importa mas que la especificidad del selector.'],
  'Usar #titulo.destacado { color: red; } o aumentar la especificidad de otra forma.')

add('sql', 'facil', 'practica', 'Seleccionar clientes',
  'Escribi una consulta que seleccione nombre y email de la tabla clientes donde el pais sea Argentina.',
  'SELECT -- tu codigo aca\nFROM clientes',
  ['Usa WHERE para filtrar filas.', 'Los strings en SQL van entre comillas simples.'],
  ['Usar comillas dobles en vez de simples para strings.'],
  "SELECT nombre, email FROM clientes WHERE pais = 'Argentina';")
add('sql', 'media', 'practica', 'Total de ventas por cliente',
  'Escribi una consulta que muestre el id de cliente y la suma total de sus ventas, agrupado por cliente.',
  'SELECT cliente_id, -- tu codigo aca\nFROM ventas\nGROUP BY cliente_id',
  ['Usa funciones de agregacion como SUM().', 'Todo lo que no este en una funcion de agregacion debe ir en el GROUP BY.'],
  ['Olvidarse el GROUP BY al usar funciones de agregacion.'],
  'SELECT cliente_id, SUM(total) AS total_ventas FROM ventas GROUP BY cliente_id;')
add('sql', 'dificil', 'debug', 'JOIN que duplica filas',
  'Esta consulta devuelve filas duplicadas por cada cliente. Encontra el problema en el JOIN.',
  'SELECT c.nombre, v.total\nFROM clientes c\nJOIN ventas v ON 1 = 1',
  ['La condicion de un JOIN debe relacionar las claves entre ambas tablas.', '1 = 1 hace que cada fila de una tabla se combine con todas las de la otra (producto cartesiano).'],
  ['Escribir una condicion de JOIN que siempre es verdadera.'],
  'JOIN ventas v ON v.cliente_id = c.id')

add('go', 'facil', 'practica', 'Funcion suma con multiples retornos',
  'Escribi una funcion que reciba dos enteros y devuelva la suma y la resta.',
  'package main\n\nimport "fmt"\n\nfunc calcular(a int, b int) (int, int) {\n\t// tu codigo aca\n}\n\nfunc main() {\n\tsuma, resta := calcular(5, 3)\n\tfmt.Println(suma, resta)\n}',
  ['Go permite devolver multiples valores separados por coma.', 'El return debe coincidir con los tipos declarados en la firma.'],
  ['Olvidar declarar ambos tipos de retorno en la firma de la funcion.'],
  'return a + b, a - b')
add('go', 'media', 'practica', 'Slices y append',
  'Crea un slice vacio de enteros y agregale los numeros del 1 al 5 usando append.',
  'package main\n\nimport "fmt"\n\nfunc main() {\n\tnumeros := []int{}\n\t// tu codigo aca\n\tfmt.Println(numeros)\n}',
  ['append devuelve un nuevo slice, hay que reasignarlo.', 'Podes usar un for con range o un for clasico.'],
  ['Llamar a append sin reasignar el resultado a la variable.'],
  'for i := 1; i <= 5; i++ { numeros = append(numeros, i) }')
add('go', 'dificil', 'debug', 'Goroutine sin sincronizar',
  'Este programa deberia imprimir "listo" despues de la goroutine, pero termina antes. Arreglalo con sync.WaitGroup.',
  'package main\n\nimport "fmt"\n\nfunc main() {\n\tgo func() {\n\t\tfmt.Println("trabajando")\n\t}()\n\tfmt.Println("listo")\n}',
  ['El programa principal no espera a que terminen las goroutines por defecto.', 'sync.WaitGroup permite esperar a que terminen antes de salir.'],
  ['No sincronizar goroutines y asumir que van a terminar antes que main.'],
  'Usar var wg sync.WaitGroup, wg.Add(1) antes de la goroutine, wg.Done() al final de ella, y wg.Wait() antes del ultimo Println.')

add('ruby', 'facil', 'practica', 'Metodo saludo',
  'Escribi un metodo saludar(nombre) que devuelva "Hola, nombre!".',
  'def saludar(nombre)\n  # tu codigo aca\nend\n\nputs saludar("Mundo")',
  ['En Ruby, la ultima expresion evaluada se devuelve automaticamente.', 'Los strings se interpolan con #{variable}.'],
  ['Olvidarse el end al cerrar un metodo.'],
  '"Hola, #{nombre}!"')
add('ruby', 'media', 'practica', 'Seleccionar pares de un array',
  'Usando select, devolve solo los numeros pares de un array.',
  'def pares(numeros)\n  # tu codigo aca\nend\n\nputs pares([1,2,3,4,5,6]).inspect',
  ['select recibe un bloque que devuelve true o false.', 'El operador % te da el resto de una division.'],
  ['Usar map en vez de select cuando se necesita filtrar.'],
  'numeros.select { |n| n % 2 == 0 }')
add('ruby', 'dificil', 'debug', 'Bucle infinito con until',
  'Este bucle nunca termina. Encontra el error en la condicion.',
  'contador = 0\nuntil contador == 5\n  puts contador\n  contador -= 1\nend',
  ['until repite mientras la condicion sea falsa.', 'Revisa si el contador se acerca o se aleja de la condicion de corte.'],
  ['Decrementar un contador cuando deberia incrementarse (o viceversa).'],
  'Cambiar contador -= 1 por contador += 1.')

add('csharp', 'facil', 'practica', 'Clase Producto',
  'Crea una clase Producto con Nombre y Precio, y un metodo MostrarInfo().',
  'using System;\n\nclass Producto {\n    // tu codigo aca\n}',
  ['Las propiedades en C# suelen usar { get; set; }', 'Console.WriteLine imprime en pantalla.'],
  ['Olvidarse el punto y coma al final de las sentencias.'],
  'public string Nombre { get; set; } public double Precio { get; set; } public void MostrarInfo() { Console.WriteLine($"{Nombre}: {Precio}"); }')
add('csharp', 'media', 'practica', 'Lista y LINQ',
  'Dada una List<int>, usa LINQ para obtener solo los numeros mayores a 10.',
  'using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static void Main() {\n        List<int> numeros = new List<int> {5, 15, 8, 22, 3};\n        // tu codigo aca\n    }\n}',
  ['LINQ agrega metodos como .Where() a las colecciones.', 'Se necesita using System.Linq.'],
  ['Olvidarse el using System.Linq y que .Where no este disponible.'],
  'var mayores = numeros.Where(n => n > 10).ToList();')
add('csharp', 'dificil', 'debug', 'Excepcion de referencia nula',
  'Este codigo tira NullReferenceException. Encontra el problema.',
  'using System;\n\nclass Program {\n    static void Main() {\n        string texto = null;\n        Console.WriteLine(texto.Length);\n    }\n}',
  ['Antes de usar un objeto, verifica que no sea null.', 'El operador ?. permite acceder de forma segura.'],
  ['Usar una variable de referencia sin inicializarla primero.'],
  'Inicializar texto = ""; o usar texto?.Length para evitar la excepcion.')

add('php', 'facil', 'practica', 'Funcion de saludo',
  'Escribi una funcion saludar($nombre) que devuelva un saludo personalizado.',
  '<?php\nfunction saludar($nombre) {\n    // tu codigo aca\n}\n\necho saludar("Mundo");',
  ['Las variables en PHP siempre empiezan con $.', 'Se puede concatenar strings con el punto (.).'],
  ['Olvidarse el signo $ antes del nombre de una variable.'],
  'return "Hola, " . $nombre . "!";')
add('php', 'media', 'practica', 'Array asociativo',
  'Crea un array asociativo con nombre y edad, y recorrelo imprimiendo clave y valor.',
  '<?php\n$persona = [\n    // tu codigo aca\n];\n\nforeach ($persona as $clave => $valor) {\n    echo "$clave: $valor\\n";\n}',
  ['Los arrays asociativos usan la sintaxis "clave" => valor.', 'foreach ($array as $clave => $valor) recorre pares clave-valor.'],
  ['Usar solo indices numericos cuando se necesitan claves con nombre.'],
  '"nombre" => "Ana", "edad" => 30')
add('php', 'dificil', 'debug', 'Comparacion floja vs estricta',
  'Esta condicion deberia ser false pero da true por un problema de comparacion. Corregila.',
  '<?php\n$valor = "0";\nif ($valor == false) {\n    echo "es falso";\n} else {\n    echo "es verdadero";\n}',
  ['El operador == en PHP hace conversion de tipos automatica.', 'El operador === compara tipo y valor sin conversion.'],
  ['Usar == cuando se necesita una comparacion estricta con ===.'],
  'Cambiar == por === para una comparacion estricta.')

module.exports = exercises
