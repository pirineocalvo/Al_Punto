const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const archivos = [
    'server.js',
    'routes/marketRoutes.js',
    'routes/menuRoutes.js',
    'routes/mesasRoutes.js',
    'routes/orderRoutes.js',
    'routes/reseniasRoutes.js',
    'routes/reserveRoutes.js',
    'routes/ticketsRoutes.js',
    'routes/userRoutes.js',
];

const opciones = {
    // compact: true mete todo en una línea, lo corregimos con post-proceso abajo
    compact: true,

    // Renombra variables, funciones y parámetros con nombres sin sentido (a, b, _0x1, etc.)
    identifierNamesGenerator: 'mangled',

    // Los strings se quedan donde están
    stringArray: false,

    // Convierte claves de objetos literales a notación de índice
    transformObjectKeys: false,

    // Simplifica expresiones booleanas y condicionales
    simplify: true,

    // Desactivado: no añade código basura ni aplana el flujo (eso lo hace imposible de leer)
    controlFlowFlattening: false,
    deadCodeInjection: false,
    numbersToExpressions: false,
    splitStrings: false,
};

// Añade saltos de línea después de ; { } para que no quede todo en una sola línea
const addLineBreaks = (code) => {
    return code
        .replace(/;/g, ';\n')
        .replace(/\{/g, '{\n')
        .replace(/\}/g, '\n}\n');
};

archivos.forEach(archivo => {
    const rutaCompleta = path.join(__dirname, archivo);
    try {
        const codigo = fs.readFileSync(rutaCompleta, 'utf8');
        const resultado = JavaScriptObfuscator.obfuscate(codigo, opciones);
        const codigoFinal = addLineBreaks(resultado.getObfuscatedCode());
        fs.writeFileSync(rutaCompleta, codigoFinal, 'utf8');
        console.log(`Ofuscado: ${archivo}`);
    } catch (err) {
        console.error(`Error en ${archivo}:`, err.message);
    }
});

console.log('\nOfuscacion completada.');
