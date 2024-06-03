import express, { request, response } from 'express';
import sqlite3 from 'sqlite3'; 
import bodyParser from 'body-parser';
import cors from 'cors';

const app_estoque = express();
const porta = 3000;

//analisa JSON
app_estoque.use(bodyParser.json());
app_estoque.use(cors());

app_estoque.listen( porta, () => {
    console.log(`Servidor em execução na porta ${porta}!`)
});

const sqlite = sqlite3.verbose();
const sqlite_nome = "dados.db";
const sqlite_caminho = "./database/";
const sqlite_banco = new sqlite3.Database(
    sqlite_caminho + sqlite_nome,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    err => {
        if(err != null){
            console.log("Erro ao conectar " + sqlite_nome + err.message);
        } else{
            console.log("Conectado ao banco!");
        }
    }
);

const sql_criar_tbProdutos = 
`CREATE TABLE IF NOT EXISTS produtos(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_produto VARCHAR(100) NOT NULL,
    quantidade INTEGER,
    preco NUMERIC(10, 2) NOT NULL
);`;

sqlite_banco.run(
    sql_criar_tbProdutos,
    err => {
        if(err != null){
            console.log("Erro ao conectar " + sqlite_nome + err.message);
        } else{
            console.log("Conectado ao banco!");
        }
    }
);

//Listar produtos
app_estoque.get('/', (request, response) => {
    console.log("GET em '/'");
    const sql = "SELECT * FROM produtos";
    sqlite_banco.all(
        sql,
        [],
        (err, rows) => {
            if (err != null){
                console.log("Erro ao exibir produtos produtos!" + sqlite_nome + err.message);
                response.status(500).json({"status": "Erro ao exibir produtos produtos!"});
            } else{
                console.log("Produtos listados com sucesso!");
                // var produtos = rows.map( (x) => `${x.nome_produto}`);
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Allow-Methods', '*');
                response.setHeader('Access-Control-Allow-Headers', '*');
                response.status(200).json({"dados":rows});
            }
        }
    );
});

//Inserir produto
app_estoque.post('/inserirproduto', (request, response) => {
    const {nome_produto, quantidade, preco} = request.body;
    const sql = `INSERT INTO produtos(nome_produto, quantidade, preco) VALUES (?, ?,?);`
    sqlite_banco.run(
        sql,
        [nome_produto, quantidade, preco],
        err => {
            if (err != null){
                console.log("Erro ao inserir produto" + sqlite_nome + err.message);
                response.status(500).json({"status": "Erro ao inserir produto!"});
            } else{
                console.log("Produto inserido com sucesso!");
                response.redirect("/");
            }
        }
    );
});