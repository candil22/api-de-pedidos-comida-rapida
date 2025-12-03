// PUNTO FINAL

Verificar: https://api-comida-d4z6.onrender.com

Obtener producto: https://api-comida-d4z6.onrender.com/productos

GET producto por id: https://api-comida-d4z6.onrender.com/api/v1/orders/1

GET pedido: https://api-comida-d4z6.onrender.com/pedidos

Get id por pedido: https://api-comida-d4z6.onrender.com/pedidos/1

POST pedido: https://api-comida-d4z6.onrender.com/api/v1/orders

Body:

{
    "nombreUsuario": "Nicolas",
    "productosIds": ["prod-101", "prod-103", "prod-104"]
}

PUT id por pedido: https://api-comida-d4z6.onrender.com/api/v1/orders/1

Cuerpo:

{
    "nombreUsuario": "Alejandro",
    "productosIds": ["prod-102", "prod-104", "prod-105"]
}


DELETE por id: https://api-comida-d4z6.onrender.com/api/v1/orders/1