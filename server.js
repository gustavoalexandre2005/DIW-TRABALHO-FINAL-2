const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'obras.json');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper: Ler banco de dados
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { obras: [], favoritos: {} };
  }
}

// Helper: Salvar banco de dados
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ==================== ROTAS DE OBRAS ====================

// GET - Listar todas as obras
app.get('/api/obras', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.obras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar obras' });
  }
});

// GET - Buscar obra por ID
app.get('/api/obras/:id', async (req, res) => {
  try {
    const db = await readDB();
    const obra = db.obras.find(o => o.id === parseInt(req.params.id));
    
    if (!obra) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }
    
    res.json(obra);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar obra' });
  }
});

// POST - Criar nova obra
app.post('/api/obras', async (req, res) => {
  try {
    const db = await readDB();
    const novaObra = {
      id: db.obras.length > 0 ? Math.max(...db.obras.map(o => o.id)) + 1 : 1,
      titulo: req.body.titulo,
      autor: req.body.autor,
      data: req.body.data,
      tecnica: req.body.tecnica,
      dimensoes: req.body.dimensoes,
      localizacao: req.body.localizacao,
      imagem: req.body.imagem,
      link: req.body.link,
      resumo: req.body.resumo
    };

    db.obras.push(novaObra);
    await writeDB(db);
    
    res.status(201).json(novaObra);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar obra' });
  }
});

// PUT - Atualizar obra existente
app.put('/api/obras/:id', async (req, res) => {
  try {
    const db = await readDB();
    const index = db.obras.findIndex(o => o.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    db.obras[index] = {
      ...db.obras[index],
      ...req.body,
      id: db.obras[index].id // Manter o ID original
    };

    await writeDB(db);
    res.json(db.obras[index]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar obra' });
  }
});

// DELETE - Remover obra
app.delete('/api/obras/:id', async (req, res) => {
  try {
    const db = await readDB();
    const index = db.obras.findIndex(o => o.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }

    const obraRemovida = db.obras.splice(index, 1)[0];
    
    // Remover dos favoritos de todos os usuários
    Object.keys(db.favoritos).forEach(email => {
      db.favoritos[email] = db.favoritos[email].filter(id => id !== parseInt(req.params.id));
    });

    await writeDB(db);
    res.json({ message: 'Obra removida com sucesso', obra: obraRemovida });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover obra' });
  }
});

// ==================== ROTAS DE FAVORITOS ====================

// GET - Buscar favoritos de um usuário
app.get('/api/favoritos/:email', async (req, res) => {
  try {
    const db = await readDB();
    const email = decodeURIComponent(req.params.email);
    const favoritos = db.favoritos[email] || [];
    
    // Retornar as obras favoritas completas
    const obrasFavoritas = db.obras.filter(o => favoritos.includes(o.id));
    
    res.json(obrasFavoritas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// POST - Adicionar obra aos favoritos
app.post('/api/favoritos', async (req, res) => {
  try {
    const { email, obraId } = req.body;
    const db = await readDB();

    if (!db.favoritos[email]) {
      db.favoritos[email] = [];
    }

    if (!db.favoritos[email].includes(obraId)) {
      db.favoritos[email].push(obraId);
      await writeDB(db);
      res.json({ message: 'Obra adicionada aos favoritos', favoritos: db.favoritos[email] });
    } else {
      res.json({ message: 'Obra já está nos favoritos', favoritos: db.favoritos[email] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
});

// DELETE - Remover obra dos favoritos
app.delete('/api/favoritos', async (req, res) => {
  try {
    const { email, obraId } = req.body;
    const db = await readDB();

    if (db.favoritos[email]) {
      db.favoritos[email] = db.favoritos[email].filter(id => id !== obraId);
      await writeDB(db);
      res.json({ message: 'Obra removida dos favoritos', favoritos: db.favoritos[email] });
    } else {
      res.json({ message: 'Usuário não possui favoritos', favoritos: [] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📂 Banco de dados: ${DB_PATH}`);
});