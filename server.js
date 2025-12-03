const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; 

app.use(express.json());

const productos = [
    { id: 'prod-101', nombre: 'Empanada de Carne', precio: 3.50 },
    { id: 'prod-102', nombre: 'Arepa de Huevo', precio: 4.25 },
    { id: 'prod-103', nombre: 'Salchipapa Clásica', precio: 9.80 },
    { id: 'prod-104', nombre: 'Choriperro Especial', precio: 12.50 },
    { id: 'prod-105', nombre: 'Aborrajado', precio: 6.00 }
];

let pedidos = [];
let nextOrderId = 1;
const calculateOrderDetails = (productIds) => {
    let total = 0;
    const productosConDetalle = [];
    for (const id of productIds) {
        const producto = productos.find(p => p.id === id);
        
        if (!producto) {
            return null; 
        }
        productosConDetalle.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio
        });
        total += producto.precio;
    }
    return { 
        productosConDetalle, 
        total: parseFloat(total.toFixed(2))
    };
};

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API de Comidas Activa",
        status: "OK",
        endpoints: ["/productos", "/api/v1/orders"]
    });
});

app.get("/productos", (req, res) => {
    res.status(200).json({
        message: "Listado de productos disponibles",
        data: productos
    });
});

app.get("/productos/:id", (req, res) => {
    const id = req.params.id; 
    const producto = productos.find(p => p.id === id);
    if (producto) {
        res.status(200).json(producto);
    } else {
        res.status(404).json({ message: "Producto no encontrado." });
    }
});

app.get("/api/v1/orders", (req, res) => {
    res.status(200).json({ 
        message: "Lista de pedidos activos (solo en memoria)",
        data: pedidos
    });
});

app.get("/api/v1/orders/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de pedido no válido (debe ser numérico)." });
    }

    const order = pedidos.find(o => o.id === id);
    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404).json({ message: "Pedido no encontrado." });
    }
});

app.post("/api/v1/orders", (req, res) => {
    const { nombreUsuario, productosIds } = req.body; 
    if (!nombreUsuario || !Array.isArray(productosIds) || productosIds.length === 0) {
        return res.status(400).json({
            message: "Faltan campos obligatorios: 'nombreUsuario' y 'productosIds' (array con IDs) son requeridos."
        });
    }
    const orderDetails = calculateOrderDetails(productosIds);
    if (!orderDetails) {
        return res.status(404).json({
            message: "Uno o más IDs de producto no existen."
        });
    }

    const newOrder = {
        id: nextOrderId++,
        nombreUsuario: nombreUsuario,
        productos: orderDetails.productosConDetalle,
        total: orderDetails.total,
        fechaCreacion: new Date().toISOString()
    };

    pedidos.push(newOrder);
    res.status(201).json({
        message: "Pedido creado exitosamente",
        data: newOrder
    });
});

app.put("/api/v1/orders/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { nombreUsuario, productosIds } = req.body;
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de pedido no válido." });
    }
    const orderIndex = pedidos.findIndex(o => o.id === id);
    if (orderIndex === -1) {
        return res.status(404).json({ message: "Pedido no encontrado." });
    }
    if (!nombreUsuario && (!productosIds || productosIds.length === 0)) {
        return res.status(400).json({
            message: "Se requiere 'nombreUsuario' o 'productosIds' para actualizar."
        });
    }
    const currentOrder = pedidos[orderIndex];
    let updatedProducts = currentOrder.productos;
    let updatedTotal = currentOrder.total;
    
    if (productosIds && Array.isArray(productosIds) && productosIds.length > 0) {
        const orderDetails = calculateOrderDetails(productosIds);
        if (!orderDetails) {
             return res.status(404).json({
                 message: "Uno o más IDs de producto proporcionados no existen."
             });
        }
        
        updatedProducts = orderDetails.productosConDetalle;
        updatedTotal = orderDetails.total;
    }
    pedidos[orderIndex] = {
        ...currentOrder,
        nombreUsuario: nombreUsuario || currentOrder.nombreUsuario, 
        productos: updatedProducts,
        total: updatedTotal,
    };
    res.status(200).json({
        message: "Pedido actualizado exitosamente",
        data: pedidos[orderIndex]
    });
});

app.delete("/api/v1/orders/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de pedido no válido." });
    }
    const initialLength = pedidos.length;
    pedidos = pedidos.filter(o => o.id !== id);
    
    if (pedidos.length === initialLength) {
        return res.status(404).json({ message: "Pedido no encontrado." });
    }
    res.status(200).json({
        message: `Pedido con ID ${id} eliminado exitosamente.`,
        data: { id: id }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor de API RESTful en ejecución en http://localhost:${PORT}`);
});
