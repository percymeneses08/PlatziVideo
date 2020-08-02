// fetch('https://randomuser.me/api/')
//   .then(function(response) {
//     return response.json()
//   })
//   .then(function(user) {
//     console.log(user)
//   })

(async function load() {
  async function getData(url, option) {
    const response = await fetch(url, {
      cors: 'no-cors'
    })
    const data = await response.json()
    let errorMessage = 'no hay opción'
    if (option === 'movies') {
      if (data.data.movie_count >= 1) {
        // Si encontró resultado, aquí se acaba la función
        return data
      }
      errorMessage = 'No se encontró ningún resultado'
    } else if (option === 'users') {
      if (data.results[0]) {
        // Si encontró resultado, aquí se acaba la función
        return data
      }
      errorMessage = 'No se encontró usuario'
    }
    // sino creamos un error y lo lanzamos
    throw new Error(errorMessage)
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
    // Aquí no se puede usar innerHTML porque no es un templateLiteral para pasarlo como texto, sino que en cambio es un tag img creado con document.createElement
    // $featuringContainer.innerHTML = $loader
    $featuringContainer.append($loader)

    // usamos el FormData para que obtener datos (u otras cosas) de un formulario HTML sea más sencillo
    const data = new FormData($form)
    try {
      // Empiezo a ingresar con desestructuración
      const {
        data: {
          // Una vez localizado los datos, le cambio el nombre con los ( : ) para usarlo más adelante con un nombre distinto
          movies: pelis
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`, 'movies')
      // const HTMLString = featuringTemplate(peli.data.movies[0])
      const HTMLString = featuringTemplate(pelis[0])
      // Aquí se puede usar innerHTML porque es un templateLiteral, entonces si se le puede agregar como texto, para que se renderice como un documento HTML
      $featuringContainer.innerHTML = HTMLString
    } catch (error) {
      // Aquí recibimos el error creado anteriormente y sólo lanzamos el mensaje en un alert
      alert(error.message)

      $loader.remove()
      $home.classList.remove('search-active')
    }
  })

  function videoItemTemplate(movie, category) {
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
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
    // Retorno todo lo que esté dentro del body
    return html.body.children[0]
  }
  function addEventClick($element) {
    $element.addEventListener('click', _ => showModal($element))
  }
  function renderMovieList(list, $container, category) {
    $container.children[0].remove()
    // actionList.data.movies.forEach(movie => {
    list.forEach(movie => {
      // Creo un template html como string y lo retorno
      const HTMLString = videoItemTemplate(movie, category)
      // Creo un document html y le agrego el template creado anteriormente
      const movieElement = createTemplate(HTMLString)
      // Agrego el documento html al final del contenedor 
      $container.append(movieElement)
      addEventClick(movieElement)

      const image = movieElement.querySelector('img')
      // Le agregamos la animación sólo a la imagen una vez ya cargada
      image.addEventListener('load', element => element.target.classList.add('fadeIn'))
    })
  }

  async function cacheExist(category) {
    const listName = `${category}List`
    const cacheList = window.localStorage.getItem(listName)
    if (cacheList) {
      // console.log('sí habían datos')
      return JSON.parse(cacheList)
    }
    // console.log('no habían datos')
    const { data: { movies: movieList } } = await getData(`${BASE_API}list_movies.json?genre=${category}`, 'movies')
    // los datos obtenidos de la petición los guardo en la caché, volviéndolos previamente de json a string
    window.localStorage.setItem(listName, JSON.stringify(movieList))
    return movieList
  }

  // console.log(actionList, dramaList, animationList)

  // const { data: { movies: actionList } } = await getData(`${BASE_API}list_movies.json?genre=action`)
  const actionList = await cacheExist('action')
  const $actionContainer = document.querySelector('#action')
  renderMovieList(actionList, $actionContainer, 'action')

  // const { data: { movies: dramaList } } = await getData(`${BASE_API}list_movies.json?genre=thriller`)
  const dramaList = await cacheExist('drama')
  const $dramaContainer = document.getElementById('drama')
  renderMovieList(dramaList, $dramaContainer, 'drama')

  // const { data: { movies: animationList } } = await getData(`${BASE_API}list_movies.json?genre=animation`)
  const animationList = await cacheExist('animation')
  const $animationContainer = document.getElementById('animation')
  renderMovieList(animationList, $animationContainer, 'animation')

  const $modal = document.getElementById('modal')
  const $overlay = document.getElementById('overlay')
  const $hideModal = document.getElementById('hide-modal')

  const $modalTitle = $modal.querySelector('h1')
  const $modalImage = $modal.querySelector('img')
  const $modalDescription = $modal.querySelector('p')

  function findById(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category) {
    switch (category) {
      case "action": {
        return findById(actionList, id)
      }
      case "drama": {
        return findById(dramaList, id)
      }
      case "animation": {
        return findById(animationList, id)
      }
      default: break;
    }
  }

  function showModal($element) {
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const id = $element.dataset.id
    const category = $element.dataset.category
    const data = findMovie(id, category)

    $modalTitle.textContent = data.title
    $modalImage.setAttribute('src', data.medium_cover_image)
    $modalDescription.textContent = data.description_full
  }

  $hideModal.addEventListener('click', hideModal)
  function hideModal() {
    $overlay.classList.remove('active')
    $modal.style.animation = 'modalOut .8s forwards'
  }


  function playlistFriendsItemTemplate(user) {
    return (
      `<li class="playlistFriends-item">
        <a href="#">
          <img src="${user.picture.medium}" alt="${user.name.title}" />
          <span>
            ${user.name.first} ${user.name.last}
          </span>
        </a>
      </li>`
    )
  }
  async function playlistFriendsCacheExist() {
    const dataList = []
    const usersListCache = window.localStorage.getItem('usersList')
    if (usersListCache) {
      return JSON.parse(usersListCache)
    }
    try {
      for (let i = 0; i < 20; i++) {
        const data = await getData('https://randomuser.me/api/', 'users')
        // debugger
        dataList.push(data.results[0])
      }
    } catch (error) {
      alert(error.message)
    }
    window.localStorage.setItem('usersList', JSON.stringify(dataList))
    return dataList
  }

  const $playlistFriends = document.querySelector('.playlistFriends')
  // const imageTag = document.createElement('img')
  // setAttributes(imageTag, {
  //   src: 'src/images/loader.gif',
  //   width: '50px',
  //   height: '50px'
  // })
  // $playlistFriends.append(imageTag)

  const friendsList = await playlistFriendsCacheExist()
  debugger
  // imageTag.remove()
  // $playlistFriends.querySelector('img').remove()
  $playlistFriends.children[0].remove()
  friendsList.forEach(user => {
    const friendTemplate = playlistFriendsItemTemplate(user)
    const htmlDocument = document.implementation.createHTMLDocument()
    htmlDocument.body.innerHTML = friendTemplate
    const content = htmlDocument.body.children[0]
    // $playlistFriends.innerHTML += htmlDocument
    $playlistFriends.append(content)
  })

  const $button = document.querySelector('.primary-user button')
  $button.addEventListener('click', _ => {
    window.localStorage.clear()
    location.reload()
  })
})()
