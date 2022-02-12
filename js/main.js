// VARIABLES GLOBALES
const CARDS = document.getElementById('cards');
const ITEMS = document.getElementById('items');
const VACIAR_CARRITO = document.getElementById('vaciar-carrito');
const COMPRAR_BTN = document.getElementById('comprarBtn');
const BTN_AUMENTAR = document.getElementById('btn-aumentar');
const BTN_DISMINUIR = document.getElementById('btn-disminuir');
const FILTRO = document.getElementsByClassName('productFilt');

let badge = document.getElementById('badge');
let totalCarrito = document.querySelector('.pushbar__totalPrice');
let productos = {};
let carrito = {};

document.addEventListener('DOMContentLoaded', () => { // El evento DOMContentLoaded se dispara cuando el documento HTML fue completamente cargado y parseado
    fetchData();
    if(localStorage.getItem('carrito')) { // Una vez que se cargue el sitio preguntamos si localstorage con la key carrito existe
        carrito = JSON.parse(localStorage.getItem('carrito'));
        renderCarrito();
    }
})


/* EVENTOS */
CARDS.addEventListener('click', e => {
    addCarrito(e);
})
ITEMS.addEventListener('click', e => {
    btnAccion(e);
})


/* TRAIGO LOS PRODUCTOS DEL JSON */
const fetchData = async () => {
    try {
        const response = await fetch('./data/productos.json');
        const data = await response.json();
        productos = data;
        renderCards(productos);
    } catch (error) {
        console.log(error);
    }
}

/* FILTRO DE PRODUCTOS */
function filtro (e, tag) {
    for(let i = 0; i < FILTRO.length; i++) {
        if(FILTRO[i].dataset.category.includes(tag)) {
            FILTRO[i].style.display = "block";
        } else {
            FILTRO[i].style.display = "none";
        }
    }

}
document.getElementById("vaporizadoresBtn").addEventListener("click", (e) => filtro(e, 'vaporizadores'));
document.getElementById("resistenciasBtn").addEventListener("click", (e) => filtro(e, 'resistencias'));
document.getElementById("liquidosBtn").addEventListener("click", (e) => filtro(e, 'liquidos'));

/* PINTO LAS CARDS EN EL SITIO */
function renderCards (productos) { //De esta forma se evitaria el reflow
    let fragment = '';
    productos.forEach(producto => {
        fragment += `
        <div data-category="${producto.category}" class="productFilt col-12 col-md-4 mt-4">
          <div class="card">
              <img src="${producto.image}" alt="" class="card-img-top">
            <div class="card-body">
              <h5>${producto.title}</h5>
              <p>$<span>${producto.precio}</span></p>
              <button data-id="${producto.id}" class="btn btn-danger">Añadir al carrito</button>
            </div>
          </div>
        </div>
        `
    })

    CARDS.innerHTML = fragment;
}

function addCarrito (e) {
    /* console.log(e.target.getAttribute('data-id')) */
    if(e.target.classList.contains('btn')) {
        setCarrito(e.target.parentElement.parentElement); //De esta forma al hacer click en el boton, se obtendran el nodo padre del boton

        const Toast = Swal.mixin({ //Alerta de producto agregado
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 1500
          })          
          Toast.fire({
            icon: 'success',
            title: 'Producto agregado al carrito'
          })
    }

    e.stopPropagation(); // Para detener cualquier otro evento que se podria generar en los items
}

function setCarrito (objeto) {
    const producto = {
        id: objeto.querySelector('.btn').dataset.id,
        title: objeto.querySelector('h5').textContent,
        image: objeto.querySelector('img').src,
        precio: objeto.querySelector('span').textContent,
        cantidad: 1
    } 

    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    carrito[producto.id] = {...producto};
    renderCarrito();
}

/* PINTO PRODUCTOS EN EL CARRITO */
function renderCarrito () {
    let fragment = '';
    Object.values(carrito).forEach(producto => {
        fragment += `
        <div class="pushbar__item">
        <img src="${producto.image}" alt="">
        <div class="pushbar__text">
            <p class="pushbar__name">${producto.title}</p>
            <p class="pushbar__price">$${producto.precio}</p>
            <div class="pushbar__interaction">
                    <i data-id="${producto.id}" class="far fa-plus-square fa-lg  btn__cantidad"></i>
                <p class="pushbar__amount">${producto.cantidad}</p>
                    <i data-id="${producto.id}" class="far fa-minus-square fa-lg btn__cantidad"></i>
            </div>
            <i data-id="${producto.id}" class="fas fa-trash-alt fa-lg pushbar__delete"></i>
        </div>
    </div>
        `
    })

    ITEMS.innerHTML = fragment;
    totalPrecioCarrito();

    localStorage.setItem('carrito', JSON.stringify(carrito));
}

/* TOTAL DEL PRECIO, VACIAR CARRITO Y FINALIZAR COMPRA */
function totalPrecioCarrito () {
    const nPrecio = Object.values(carrito).reduce((acumulador, {cantidad, precio}) => acumulador + cantidad * precio,0) //Precio total del carrito
    const nCantidad = Object.values(carrito).reduce((acumulador, {cantidad}) => acumulador + cantidad,0) //Cantidad total de productos del badge

    totalCarrito.textContent = nPrecio;
    badge.textContent = nCantidad;

    if (nCantidad > 99) {
        badge.textContent = '99+';
    }

    VACIAR_CARRITO.addEventListener('click', () => {
        carrito = {};
        renderCarrito();
    })

    COMPRAR_BTN.addEventListener('click', () => {
        if (nPrecio !== 0) {
            Swal.fire(
                'Gracias por su compra!',
                'Que la disfrutes!',
                'success'
              )
        
              carrito = {};
              renderCarrito(); 
        }
    })
}

/* AUMENTAR, DISMINUIR CANTIDAD EN CARRITO. ELIMINAR PRODUCTO TAMBIEN. */
function btnAccion (e) {
    if(e.target.classList.contains('fa-plus-square')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = {...producto};
        renderCarrito();
    }

    if(e.target.classList.contains('fa-minus-square')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if(producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }
        renderCarrito();
    }

    if(e.target.classList.contains('fa-trash-alt')) {
        delete carrito[e.target.dataset.id]
        renderCarrito();
    }

    e.stopPropagation();
}
