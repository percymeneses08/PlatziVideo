// fetch('https://randomuser.me/api/')
//   .then(function(response) {
//     return response.json()
//   })
//   .then(function(user) {
//     console.log(user)
//   })

(async function load() {
  async function getData(url) {
    const response = await fetch(url)
    const data = await response.json()
    return data
  }
  const $form = document.getElementById('form')
  const $home = document.getElementById('home')
  const $featuringContainer = document.getElementById('featuring')

  function setAttributes($element, attributes) {
    for (attr in attributes) {
      // .setAttribute(atributo de estilo, valor)
      $element.setAttribute(attr, attributes[attr])
    }
  }
  const BASE_API = 'https://yts.mx/api/v2/'

  function featuringTemplate(peli) {
    return (
      `
        <div class="featuring">
          <div class="featuring-image">
            <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
          </div>
          <div class="featuring-content">
            <p class="featuring-title">Pelicula encontrada</p>
            <p class="featuring-album">${peli.title}</p>
          </div>
        </div>
      `
    )
  }
  $form.addEventListener('submit', async event => {
    event.preventDefault()
    $home.classList.add('search-active')
    const $loader = document.createElement('img')
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      width: 50,
      height: 50
    })
    // $featuringContainer.append($loader)
    $featuringContainer.innerHTML = $loader
    debugger

    const data = new FormData($form)
    const peli = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
    const HTMLString = featuringTemplate(peli.data.movies[0])
    $featuringContainer.innerHTML = HTMLString
  })

  const actionList = await getData(`${BASE_API}list_movies.json?genre=action`)
  const dramaList = await getData(`${BASE_API}list_movies.json?genre=thriller`)
  const animationList = await getData(`${BASE_API}list_movies.json?genre=animation`)
  // console.log(actionList, dramaList, animationList)

  function videoItemTemplate(movie) {
    return (
      `<div class="primaryPlaylistItem">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}" />
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
       </div>`
    )
  }
  function createTemplate(HTMLString) {
    // Creo un document HTML
    const html = document.implementation.createHTMLDocument()
    // Le agrego un template a ese documento
    html.body.innerHTML = HTMLString
    // Retorno el documento con el template
    return html.body.children[0]
  }
  function addEventClick($element) {
    $element.addEventListener('click', showModal)
  }
  function renderMovieList(list, $container) {
    $container.children[0].remove()
    // actionList.data.movies.forEach(movie => {
    list.forEach(movie => {
      // Creo un template html como string y lo retorno
      const HTMLString = videoItemTemplate(movie)
      // Creo un document html y le agrego el template creado anteriormente
      const movieElement = createTemplate(HTMLString)
      // Agrego el documento html al final del contenedor 
      $container.append(movieElement)
      addEventClick(movieElement)
    })
  }

  const $actionContainer = document.querySelector('#action')
  renderMovieList(actionList.data.movies, $actionContainer)

  const $dramaContainer = document.getElementById('drama')
  renderMovieList(dramaList.data.movies, $dramaContainer)

  const $animationContainer = document.getElementById('animation')
  renderMovieList(animationList.data.movies, $animationContainer)

  const $modal = document.getElementById('modal')
  const $overlay = document.getElementById('overlay')
  const $hideModal = document.getElementById('hide-modal')

  const $modalTitle = $modal.querySelector('h1')
  const $modalImage = $modal.querySelector('img')
  const $modalDescription = $modal.querySelector('p')

  function showModal() {
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
  }

  $hideModal.addEventListener('click', hideModal)
  function hideModal() {
    $overlay.classList.remove('active')
    $modal.style.animation = 'modalOut .8s forwards'
  }
})()