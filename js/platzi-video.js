const ipad = window.matchMedia('screen and (max-width: 1023px)');

const menu = document.querySelector('.lists');
const header = document.querySelector('.header');
const videoTitle = document.querySelector('.video-title');
const more = document.querySelector('.more');
const burgerButton = document.querySelector('#burger-menu');

ipad.addListener(Validation);

function Validation(event)
{
  if(event.matches)
  {
    burgerButton.addEventListener('click', hideShow);
    
  }
  else
  {
    burgerButton.removeEventListener('click', hideShow);
  }
}
Validation(ipad);

var numero = 0;
header.addEventListener('click', cambiarNumero);
videoTitle.addEventListener('click', cambiarNumero);
more.addEventListener('click', cambiarNumero);

function hideShow ()
{

  if(menu.classList.contains('is-active')) 
  {
    menu.classList.remove('is-active');
  }
  else 
  {
    menu.classList.add('is-active');
    cambiarNumero();
  } 
}

function cambiarNumero()
{
  numero++;
  if(numero >= 3) 
  {
    /*Siempre que den 3 clicks fuera del menú, este se va a esconder, aún si este ya se encuentra escondido, 
    entonces el 'remove' no va hacer ningún efecto, solo la variable 'numero' que se reinicia a '0';*/
    menu.classList.remove('is-active');
    numero = 0;
  }
}