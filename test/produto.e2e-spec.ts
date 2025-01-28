import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes do Módulo Produto (e2e)', () => {

  let categoriaId: any;
  let produtoId: any;
  let app: INestApplication;

  beforeAll(async () => {
    // 'moduleFixture' faz uma copia do projeto, e faz o ambiente de teste
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + "./../src/**/entities/*.entity.ts"],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  })

  it("01 - Deve Cadastrar uma Nova Categoria", async () => {
      const resposta = await request(app.getHttpServer())
        .post('/categorias')
        .send({
          tipo: 'Cosméticos',
          descricao: 'Produtos voltados para realçar a beleza, como maquiagem, cuidados faciais e corporais.'
        })
        .expect(201)
  
        // Armazena esse 'Id' para ter disponível para os testes CRUD mais a frente
        categoriaId = resposta.body.id;
  
  });

  it("02 - Deve Cadastrar um Novo Produto", async () => {
    const resposta = await request(app.getHttpServer())
      .post('/produtos')
      .send({
        nome: "Sabonete Hidratante",
        detalhes: "Sabonete hidratante ideal para limpeza e cuidado com a pele.",
        preco: 9.99,
        quantidade_estoque: 100,
        foto: "https://ik.imagekit.io/m1iwfxqae/produtos_farmacia/produto_11.png?updatedAt=1738081548716",
        categoria: {
          "id": 1
        }
      })
      .expect(201)

      // Armazena esse 'Id' para ter disponível para os testes CRUD mais a frente
      produtoId = resposta.body.id;

  });

  it("03 - Deve Listar Todos os Produtos", async () => {
    return request(app.getHttpServer())
    .get('/produtos')
    .send({})
    .expect(200)
  })

  it("04 - Deve Listar o Produto pelo ID", async () => {
    return request(app.getHttpServer())
    .get('/produtos/1')
    .send({})
    .expect(200)
  })

  it("05 - Não Deve Listar um ID de Produto Não Encontrado", async () => {
    return request(app.getHttpServer())
    .get('/produtos/2')
    .send({})
    .expect(404)
  })

  it("06 - Deve Listar o Produto pelo Nome", async () => {
    return request(app.getHttpServer())
    .get('/produtos/nome/Sabonete')
    .send({})
    .expect(200)
  })

  it("07 - Deve Atualizar um Produto", async () => {
    return request(app.getHttpServer())
    .put('/produtos')
    .send({
      id: produtoId,
      nome: "Sabonete Hidratante",
      detalhes: "Sabonete hidratante ideal para limpeza e cuidado com a pele.",
      preco: 9.99,
      quantidade_estoque: 80,
      foto: "https://ik.imagekit.io/m1iwfxqae/produtos_farmacia/produto_11.png?updatedAt=1738081548716",
      categoria: {
        "id": 1
      }
    })
    // O que espero receber (retornar), segundo 'status code' do HTTP
    .expect(200)
    .then( resposta => {
      expect(80).toEqual(resposta.body.quantidade_estoque);
    })

  })

  it("08 - Deve Deletar o Produto pelo ID", async () => {
    return request(app.getHttpServer())
    .delete('/produtos/1')
    .send({})
    .expect(204)
  })

});