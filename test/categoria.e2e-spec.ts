import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('Testes do Módulo Categoria (e2e)', () => {

  let categoriaId: any;
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

  it("02 - Deve Listar Todas as Categorias", async () => {
    return request(app.getHttpServer())
    .get('/categorias')
    .send({})
    .expect(200)
  })

  it("03 - Deve Listar a Categoria pelo ID", async () => {
    return request(app.getHttpServer())
    .get('/categorias/1')
    .send({})
    .expect(200)
  })

  it("04 - Não Deve Listar um ID de Categoria Não Encontrada", async () => {
    return request(app.getHttpServer())
    .get('/categorias/2')
    .send({})
    .expect(404)
  })

  it("05 - Deve Listar a Categoria por Tipo", async () => {
    return request(app.getHttpServer())
    .get('/categorias/tipo/Cosméticos')
    .send({})
    .expect(200)
  })

  it("06 - Deve Atualizar uma Categoria", async () => {
    return request(app.getHttpServer())
    .put('/categorias')
    .send({
        id: categoriaId,
        tipo: 'Cosméticos - Atualizado',
        descricao: 'Produtos voltados para realçar a beleza, como maquiagem, cuidados faciais e corporais.'
    })
    // O que espero receber (retornar), segundo 'status code' do HTTP
    .expect(200)
    .then( resposta => {
      expect("Cosméticos - Atualizado").toEqual(resposta.body.tipo);
    })

  })

  it("07 - Deve Deletar a Categoria pelo ID", async () => {
    return request(app.getHttpServer())
    .delete('/categorias/1')
    .send({})
    .expect(204)
  })

});