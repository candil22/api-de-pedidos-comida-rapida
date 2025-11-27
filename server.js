//uso de express, definicion de productos disponibles y estructuracion basica de los pedidos dentro de un array//

const express = require('express');
const app = express();
const PORT = 3005;

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

/.../


//GET//
app.get("/api/v1/orders", (req, res) => {
    res.status(200).json(pedidos);
});



//GET BY ID//
app.get("/api/v1/orders/:id", (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de pedido no válido." });
    }

    const order = pedidos.find(o => o.id === id);

    if (order) {
        res.status(200).json(order);
    } else {
        res.status(404).json({ message: "Pedido no encontrado." });
    }
});



//POST o CREAR PEDIDO//
app.post("/api/v1/orders", (req, res) => {
    const { nombre_usuario, productos_ids } = req.body;

    if (!nombre_usuario || !Array.isArray(productos_ids) || productos_ids.length === 0) {
        return res.status(400).json({
            message: "Faltan campos obligatorios: 'nombre_usuario' y 'productos_ids' (array con IDs) son requeridos."
        });
    }

    const orderDetails = calculateOrderDetails(productos_ids);

    if (!orderDetails) {
        return res.status(404).json({
            message: "Uno o más IDs de producto no existen."
        });
    }

    const newOrder = {
        id: nextOrderId++,
        nombre_usuario: nombre_usuario,
        productos: orderDetails.productosConDetalle,
        total: orderDetails.total,
        fecha: new Date().toISOString()
    };

    pedidos.push(newOrder);

    res.status(201).json({
        message: "Pedido creado exitosamente",
        data: newOrder
    });
});



//PUT o ACTUALIZAR PEDIDO//
app.put("/api/v1/orders/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre_usuario, productos_ids } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ message: "ID de pedido no válido." });
    }

    const orderIndex = pedidos.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        return res.status(404).json({ message: "Pedido no encontrado." });
    }

    if (!nombre_usuario && (!productos_ids || !Array.isArray(productos_ids))) {
        return res.status(400).json({
            message: "Se requiere 'nombre_usuario' o 'productos_ids' para actualizar."
        });
    }

    const currentOrder = pedidos[orderIndex];
    let updatedProducts = currentOrder.productos;
    let updatedTotal = currentOrder.total;
    
    if (productos_ids && Array.isArray(productos_ids) && productos_ids.length > 0) {
        const orderDetails = calculateOrderDetails(productos_ids);

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
        nombre_usuario: nombre_usuario || currentOrder.nombre_usuario,
        productos: updatedProducts,
        total: updatedTotal,
    };

    res.status(200).json({
        message: "Pedido actualizado exitosamente",
        data: pedidos[orderIndex]
    });
});



//DELETE o ELIMINAR PEDIDO//
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
        message: `Pedido con ID ${id} eliminado exitosamente.`
    });
});



//Iniciar el servidor y funcionamiento del puerto 3005//
app.listen(PORT, () => {
    console.log(`Servidor de API RESTful en ejecución en http://localhost:${PORT}`);
});