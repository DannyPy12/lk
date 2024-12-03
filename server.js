const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Configuración de la conexión con la base de datos
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'rafadetallado.neuroseeq.com',
  user: 'u475816193_rafa',
  password: 'Danny9710',
  database: 'u475816193_rafadetallado',
});

pool.on('error', (err) => {
  console.error('Error en el pool de conexiones MySQL:', err);
});

// Ruta para el login de administrador
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;

  pool.query('SELECT * FROM admins WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Error en la consulta SQL:', error);
      return res.status(500).send('Error en el servidor.');
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const admin = results[0];

    // Comparar contraseñas directamente
    if (admin.password === password) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }
  });
});

// Ruta para guardar reportes
app.post('/api/reportes', (req, res) => {
  const { service, date, price, received, change_amount } = req.body;

  if (!service || !date || price === undefined || received === undefined || change_amount === undefined) {
    return res.status(400).json({ success: false, message: 'Faltan datos necesarios.' });
  }

  const query = 'INSERT INTO reportes (service, date, price, received, change_amount) VALUES (?, ?, ?, ?, ?)';
  
  pool.query(query, [service, date, price, received, change_amount], (err, result) => {
    if (err) {
      console.error('Error al guardar el reporte:', err);
      return res.status(500).send('Error al guardar el reporte');
    }
    res.status(201).send('Reporte guardado con éxito');
  });
});

// Cerrar conexiones del pool al terminar
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error al cerrar el pool de conexiones', err);
    } else {
      console.log('Pool de conexiones cerrado.');
    }
    process.exit();
  });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
