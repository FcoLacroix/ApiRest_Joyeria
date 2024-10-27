const express = require('express');
const app = express();
const pool = require('./db');
const format = require('pg-format');

const logger = (req, res, next) => {
  console.log(`Consulta a la ruta: ${req.url}`);
  next();
};

app.use(logger);

const obtenerJoyas = async (req, res) => {
  try {
    const { limits = 10, page = 1, order_by = 'id_ASC' } = req.query;
    const [campo, direccion] = order_by.split('_');
    const offset = (page - 1) * limits;

    const query = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);
    const { rows: joyas } = await pool.query(query);

    const enlaces = {
      prev: `/joyas?limits=${limits}&page=${Math.max(1, page - 1)}&order_by=${order_by}`,
      next: `/joyas?limits=${limits}&page=${Number(page) + 1}&order_by=${order_by}`
    };

    res.json({ joyas, enlaces });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las joyas' });
  }
};

app.get('/joyas', obtenerJoyas);

const obtenerJoyasPorFiltros = async (req, res) => {
  try {
    const { precio_min, precio_max, categoria, metal } = req.query;
    const query = `SELECT * FROM inventario WHERE 
                   ($1::int IS NULL OR precio >= $1) AND 
                   ($2::int IS NULL OR precio <= $2) AND 
                   ($3::text IS NULL OR categoria = $3) AND 
                   ($4::text IS NULL OR metal = $4)`;
    const { rows: joyas } = await pool.query(query, [precio_min, precio_max, categoria, metal]);
    res.json(joyas);
  } catch (error) {
    res.status(500).json({ error: 'Error al filtrar las joyas' });
  }
};

app.get('/joyas/filtros', obtenerJoyasPorFiltros);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
