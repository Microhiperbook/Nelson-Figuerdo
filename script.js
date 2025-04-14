const productos = [
  {
    id: 1,
    nombre: "Elden Ring",
    precio: 60.0,
    categoria: "Aventura",
    img: "https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg"
  },
  {
    id: 2,
    nombre: "FIFA 23",
    precio: 50.0,
    categoria: "Deportes",
    img: "https://assetsio.gnwcdn.com/co4zw5.jpg?width=1200&height=1200&fit=bounds&quality=70&format=jpg&auto=webp"
  },
  {
    id: 3,
    nombre: "God of War: Ragnarok",
    precio: 70.0,
    categoria: "Acción",
    img: "https://m.media-amazon.com/images/M/MV5BMTQ5YTA1ZmUtYzVlNC00YjI2LWJhYjgtNWE4MjY2OWEzMGQwXkEyXkFqcGc@._V1_.jpg"
  },
  {
    id: 4,
    nombre: "Call of Duty: Modern Warfare II",
    precio: 65.0,
    categoria: "Acción",
    img: "https://image.api.playstation.com/vulcan/ap/rnd/202205/2800/W5uSEsW7yefCNTHatS03v5q7.png"
  },
  {
    id: 5,
    nombre: "Zelda: Tears of the Kingdom",
    precio: 69.0,
    categoria: "Aventura",
    img: "https://locosxlosjuegos.com/wp-content/uploads/2023/07/tokt1.jpg"
  },
  {
    id: 6,
    nombre: "NBA 2K24",
    precio: 59.0,
    categoria: "Deportes",
    img: "https://image.api.playstation.com/vulcan/ap/rnd/202306/2609/4e2470cab2b54eb6d69bada84bac6d65df090605cfc16ee6.jpg"
  }
];

let carrito = new Map();

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const contenedorPayPal = document.getElementById("paypal-button-container");

function filtrarPorCategoria() {
  const seleccion = document.getElementById("categoria").value;
  const productosFiltrados = seleccion === "todos"
    ? productos
    : productos.filter((p) => p.categoria === seleccion);

  contenedorProductos.innerHTML = "";

  productosFiltrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  cantidadCarrito.textContent = cantidadTotal;
  contenedorPayPal.style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
  if (!carrito.has(id)) return;

  let item = carrito.get(id);
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (carrito.size === 0) return;

  if (confirm("¿Seguro que quieres vaciar el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.size === 0) {
    alert("Tu carrito está vacío. Agrega videojuegos antes de comprar.");
    return;
  }

  alert("¡Gracias por tu compra gamer! 🎮 Tu pedido está en camino.");
  vaciarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(Array.from(carrito.entries())));
}

function cargarCarrito() {
  const data = localStorage.getItem("carrito");
  if (data) {
    carrito = new Map(JSON.parse(data));
    actualizarCarrito();
  }
}

if (window.paypal) {
  paypal
    .Buttons({
      createOrder: function (data, actions) {
        const total = Array.from(carrito.values()).reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0
        );
        return actions.order.create({
          purchase_units: [{ amount: { value: total.toFixed(2) } }]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert(`¡Gracias ${details.payer.name.given_name}, tu pago fue exitoso! 🎮`);
          vaciarCarrito();
        });
      },
      onError: function (err) {
        console.error("Error con PayPal:", err);
        alert("Hubo un problema con el pago. Intenta de nuevo.");
      }
    })
    .render("#paypal-button-container");
}

filtrarPorCategoria();
cargarCarrito();
