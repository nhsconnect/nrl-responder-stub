// import chalk from 'chalk';
import server from './server';
// import { createInterface } from 'readline';

// process.stdin.setRawMode(true);
// process.stdin.resume();
// process.stdin.setEncoding('utf8');

// const readline = createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// process.stdout.write(`Run in manual mode? ${chalk.cyan.bold('[yN]')}\n> `);

// process.stdin.on('data', (answer: string) => {
//     const isManualMode = answer.toLowerCase() === 'y';

//     process.stdout.write('\n');

    server.start();

//     readline.close();
// }); 
