const main = document.createElement('main');
main.className = 'app';

const heading = document.createElement('h1');
heading.textContent = 'Мой список задач';

main.append(heading);
document.body.append(main);