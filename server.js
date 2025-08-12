const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public')); // si pones index.html en /public
const DATAFILE = path.join(__dirname,'data','laws.json');

function readData(){
  return JSON.parse(fs.readFileSync(DATAFILE,'utf8'));
}

app.get('/api/countries', (req,res)=>{
  const data = readData();
  res.json(Object.keys(data).sort());
});

app.get('/api/laws', (req,res)=>{
  const country = req.query.country;
  if(!country) return res.status(400).json({error:'country required'});
  const data = readData();
  const found = data[country];
  if(!found) return res.status(404).json({error:'not found'});
  res.json(found);
});

// endpoint admin simple para actualizar (proteger con auth real en producción)
app.post('/api/admin/upsert', (req,res)=>{
  // body: {country, text, updated}
  const {country,text,updated} = req.body;
  if(!country || !text) return res.status(400).json({error:'bad request'});
  const data = readData();
  data[country] = {country,text,updated: updated || new Date().toISOString().slice(0,10)};
  fs.writeFileSync(DATAFILE, JSON.stringify(data,null,2),'utf8');
  res.json({ok:true});
});

app.listen(PORT, ()=> console.log('Server running on',PORT));
