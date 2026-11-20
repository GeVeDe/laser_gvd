let productoSeleccionado = "";
let precioSeleccionado = "";

function openModal(nombre, precio) {
    productoSeleccionado = nombre;
    precioSeleccionado = precio;

    document.getElementById("modalTitle").innerText = nombre;
    document.getElementById("modalPrice").innerText = `Desde $${precio} MXN`;

    const textGroup = document.getElementById("textGroup");
    const fileGroup = document.getElementById("fileGroup");
    const petFieldsGroup = document.getElementById("petFieldsGroup");
    const petCustomPhrase = document.getElementById("petCustomPhrase");

    document.getElementById("orderForm").reset();
    removeImage();
    resetFieldStates();
    petCustomPhrase.style.display = "none";

    // Detecta las 2 placas de mascota ("Placas para Mascota aluminio de color" y "Placa para mascota acero inoxidable")
    const esPlacaMascota = nombre.toLowerCase().includes("placa") && nombre.toLowerCase().includes("mascota");

    if (esPlacaMascota) {
        textGroup.style.display = "none";
        fileGroup.style.display = "none";
        petFieldsGroup.style.display = "block";
    } else {
        petFieldsGroup.style.display = "none";
        textGroup.style.display = "flex";
        fileGroup.style.display = "flex";
    }

    document.getElementById("productModal").style.display = "flex";
}

function toggleCustomPhrase() {
    const select = document.getElementById("petPhrase");
    const customInput = document.getElementById("petCustomPhrase");
    
    if (select.value === "otra") {
        customInput.style.display = "block";
        customInput.focus();
    } else {
        customInput.style.display = "none";
        customInput.value = "";
    }
}

function toggleFields() {
    const textInput = document.getElementById("customText");
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
        reader.readAsDataURL(file);
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
    document.getElementById("petCustomPhrase").style.display = "none";
    removeImage();
    resetFieldStates();
}

window.onclick = function(event) {
    const modal = document.getElementById("productModal");
    if (event.target === modal) {
        closeModal();
    }
}

// Configuración de Supabase
const SUPABASE_URL = 'https://ynorgaqusydmyfqrkxij.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-kvtZaGkQo_RRrPmDbquyA_0efoKrqp'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Procesar el pedido, guardarlo en Supabase y generar número de orden único
async function realizarEncargo(e) {
    e.preventDefault();

    const esPlacaMascota = productoSeleccionado.toLowerCase().includes("placa") && productoSeleccionado.toLowerCase().includes("mascota");
    let detallePedido = "";
    let imagenBase64Final = null;

    if (esPlacaMascota) {
        const petName = document.getElementById("petName").value.trim();
        const petPhone = document.getElementById("petPhone").value.trim();
        const phraseSelect = document.getElementById("petPhrase").value;
        const customPhrase = document.getElementById("petCustomPhrase").value.trim();

        if (!petName || !petPhone) {
            alert("Por favor, ingresa el nombre de la mascota y el teléfono de contacto.");
            return;
        }

        let fraseFinal = "";
        if (phraseSelect === "otra") {
            fraseFinal = customPhrase;
        } else {
            fraseFinal = phraseSelect;
        }

        detallePedido = `Mascota: ${petName}`;
        if (fraseFinal) {
            detallePedido += ` | Frase: "${fraseFinal}"`;
        }
        detallePedido += ` | Tel: ${petPhone}`;

    } else {
        const textoGrabado = document.getElementById("customText").value.trim();
        const fileInput = document.getElementById("customFile");
        const previewImg = document.getElementById("imagePreview");

        if (!textoGrabado && fileInput.files.length === 0) {
            alert("Por favor, ingresa el texto a grabar o adjunta una imagen para continuar.");
            return;
        }

        detallePedido = textoGrabado ? `Texto: ${textoGrabado}` : "Imagen de referencia adjunta";
        imagenBase64Final = fileInput.files.length > 0 ? previewImg.src : null;
    }

    // Generar Número de Orden Único (Ej: GVD-8492)
    const numeroOrden = "GVD-" + Math.floor(1000 + Math.random() * 9000);

    // Preparar el paquete de datos del pedido
    const nuevoPedido = {
        orden: numeroOrden,
        producto: productoSeleccionado,
        precio: precioSeleccionado,
        detalle: detallePedido,
        imagenBase64: imagenBase64Final,
        estado: "Pendiente"
    };

    try {
        const { error } = await _supabase
            .from('Pedidos')
            .insert([nuevoPedido]);

        if (error) {
            console.error("Error al guardar en Supabase:", error);
            alert("Hubo un error al registrar el pedido en la base de datos. Inténtalo de nuevo.");
            return;
        }

        // Abrir WhatsApp con el mensaje estructurado limpiamente
        const telefonoWhatsApp = "526461378014";
        let mensaje = `¡Hola Laser GVD! 👋 Mi número de orden es *${numeroOrden}* para el producto *${productoSeleccionado}* ($${precioSeleccionado} MXN). Me gustaría recibir el método de pago para realizar la transferencia.`;
        
        const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");

        closeModal();

    } catch (err) {
        console.error("Excepción:", err);
        alert("Ocurrió un error inesperado al procesar el pedido.");
    }
}