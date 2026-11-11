let productoSeleccionado = "";
let precioSeleccionado = "";

function openModal(nombre, precio) {
    productoSeleccionado = nombre;
    precioSeleccionado = precio;

    document.getElementById("modalTitle").innerText = nombre;
    document.getElementById("modalPrice").innerText = `Desde $${precio} MXN`;

    const textGroup = document.getElementById("textGroup");
    const fileGroup = document.getElementById("fileGroup");

    document.getElementById("orderForm").reset();
    removeImage();
    resetFieldStates();

    const esPlacaMascota = nombre.toLowerCase().includes("placa");

    if (esPlacaMascota) {
        fileGroup.style.display = "none"; 
        textGroup.style.display = "flex";
    } else {
        fileGroup.style.display = "flex"; 
        textGroup.style.display = "flex";
    }

    document.getElementById("productModal").style.display = "flex";
}

function toggleFields() {
    const textInput = document.getElementById("customText");
    const textGroup = document.getElementById("textGroup");
    const fileGroup = document.getElementById("fileGroup");

    const tieneTexto = textInput.value.trim().length > 0;

    if (tieneTexto) {
        fileGroup.classList.add("field-disabled");
    } else {
        resetFieldStates();
    }
}

function previewImage(event) {
    const file = event.target.files[0];
    const textGroup = document.getElementById("textGroup");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreview");
    const uploadBtn = document.getElementById("fileInputWrapper");

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = "block";
            uploadBtn.style.display = "none"; 
            
            textGroup.classList.add("field-disabled");
            document.getElementById("customText").disabled = true;
        }
        reader.readAsDataURL(file); // Convierte la imagen a Base64 para enviarla al POS
    }
}

function removeImage() {
    const fileInput = document.getElementById("customFile");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const uploadBtn = document.getElementById("fileInputWrapper");

    fileInput.value = ""; 
    previewContainer.style.display = "none";
    uploadBtn.style.display = "block"; 

    resetFieldStates();
}

function resetFieldStates() {
    const textInput = document.getElementById("customText");
    const textGroup = document.getElementById("textGroup");
    const fileGroup = document.getElementById("fileGroup");

    textInput.disabled = false;
    textGroup.classList.remove("field-disabled");
    fileGroup.classList.remove("field-disabled");
}

function closeModal() {
    document.getElementById("productModal").style.display = "none";
    document.getElementById("orderForm").reset();
    removeImage();
    resetFieldStates();
}

window.onclick = function(event) {
    const modal = document.getElementById("productModal");
    if (event.target === modal) {
        closeModal();
    }
}

// Procesar el pedido y generar número de orden único
async function realizarEncargo(e) {
    e.preventDefault();

    const textoGrabado = document.getElementById("customText").value.trim();
    const fileInput = document.getElementById("customFile");
    const previewImg = document.getElementById("imagePreview");

    if (!textoGrabado && fileInput.files.length === 0) {
        alert("Por favor, ingresa el texto a grabar o adjunta una imagen para continuar.");
        return;
    }

    // Generar Número de Orden Único (Ej: GVD-8492)
    const numeroOrden = "GVD-" + Math.floor(1000 + Math.random() * 9000);

    // Preparar el paquete de datos del pedido
    const nuevoPedido = {
        orden: numeroOrden,
        producto: productoSeleccionado,
        precio: precioSeleccionado,
        detalle: textoGrabado ? `Texto: ${textoGrabado}` : "Imagen de referencia adjunta",
        imagenBase64: fileInput.files.length > 0 ? previewImg.src : null,
        estado: "Pendiente",
        fecha: new Date().toLocaleTimeString()
    };

    // AQUÍ SE ENVIARÁ A TU BASE DE DATOS (Firebase/Supabase)
    // Por ahora, simularemos el guardado y le mostraremos su número al cliente:
    alert(`¡Pedido registrado con éxito! 🎉\nTu número de orden es: ${numeroOrden}\nGuárdalo para recoger tu pieza.`);

    // Opcional: También puedes abrir WhatsApp para que el cliente te salude con su número si lo deseas como respaldo:
    const telefonoWhatsApp = "526461378014";
    let mensaje = `¡Hola Laser GVD! 👋 Mi número de orden es *${numeroOrden}* para el producto *${productoSeleccionado}* ($${precioSeleccionado} MXN).`;
    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    closeModal();
}