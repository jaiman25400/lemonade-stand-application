import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/common/setup-app';

function asBeverage(body: unknown): { id: string; name: string } {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('id' in body) ||
    !('name' in body) ||
    typeof body.id !== 'string' ||
    typeof body.name !== 'string'
  ) {
    throw new Error('Unexpected beverage response');
  }

  return { id: body.id, name: body.name };
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/beverages (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/beverages')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('rejects extra fields on create', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/beverages')
      .send({ name: 'Iced Tea', extra: true })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
  });

  it('creates, reads, updates, and deletes a beverage', async () => {
    const name = `Classic Lemonade ${Date.now()}`;

    const created = await request(app.getHttpServer())
      .post('/api/beverages')
      .send({ name })
      .expect(201);

    const createdBody = asBeverage(created.body);

    expect(createdBody).toEqual(
      expect.objectContaining({ name, id: expect.any(String) }),
    );

    const { id } = createdBody;

    const fetched = await request(app.getHttpServer())
      .get(`/api/beverages/${id}`)
      .expect(200);
    expect(fetched.body).toEqual(expect.objectContaining({ id, name }));

    const updatedName = `${name} Updated`;
    const updated = await request(app.getHttpServer())
      .patch(`/api/beverages/${id}`)
      .send({ name: updatedName })
      .expect(200);
    expect(updated.body).toEqual(
      expect.objectContaining({ id, name: updatedName }),
    );

    await request(app.getHttpServer())
      .delete(`/api/beverages/${id}`)
      .expect(204);

    await request(app.getHttpServer()).get(`/api/beverages/${id}`).expect(404);
  });

  it('links a size and price to a beverage', async () => {
    const stamp = Date.now();

    const size = await request(app.getHttpServer())
      .post('/api/sizes')
      .send({ name: `Small ${stamp}` })
      .expect(201);
    const sizeId = (size.body as { id: string }).id;

    const beverage = await request(app.getHttpServer())
      .post('/api/beverages')
      .send({ name: `Classic Lemonade ${stamp}` })
      .expect(201);
    const beverageId = asBeverage(beverage.body).id;

    const linked = await request(app.getHttpServer())
      .post(`/api/beverages/${beverageId}/sizes`)
      .send({ sizeId, price: 2 })
      .expect(201);

    expect(linked.body.sizes).toEqual([
      expect.objectContaining({ id: sizeId, name: `Small ${stamp}`, price: 2 }),
    ]);

    await request(app.getHttpServer())
      .patch(`/api/beverages/${beverageId}/sizes/${sizeId}`)
      .send({ price: 2.5 })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/beverages/${beverageId}/sizes/${sizeId}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(`/api/beverages/${beverageId}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/sizes/${sizeId}`)
      .expect(204);
  });

  it('places an order with a server total and snapshot prices', async () => {
    const stamp = Date.now();

    const size = await request(app.getHttpServer())
      .post('/api/sizes')
      .send({ name: `Small ${stamp}` })
      .expect(201);
    const sizeId = (size.body as { id: string }).id;

    const beverage = await request(app.getHttpServer())
      .post('/api/beverages')
      .send({ name: `Classic Lemonade ${stamp}` })
      .expect(201);
    const beverageId = asBeverage(beverage.body).id;

    await request(app.getHttpServer())
      .post(`/api/beverages/${beverageId}/sizes`)
      .send({ sizeId, price: 2 })
      .expect(201);

    const created = await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        customerName: 'Ada Lovelace',
        email: 'ada@example.com',
        items: [{ beverageId, sizeId, quantity: 3 }],
      })
      .expect(201);

    expect(created.body).toEqual(
      expect.objectContaining({
        customerName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: null,
        total: 6,
        confirmationNumber: expect.stringMatching(/^LS-[A-F0-9]{8}$/),
        items: [
          expect.objectContaining({
            beverageName: `Classic Lemonade ${stamp}`,
            sizeName: `Small ${stamp}`,
            quantity: 3,
            unitPrice: 2,
            lineTotal: 6,
          }),
        ],
      }),
    );

    const confirmationNumber = created.body.confirmationNumber as string;

    await request(app.getHttpServer())
      .patch(`/api/beverages/${beverageId}/sizes/${sizeId}`)
      .send({ price: 9 })
      .expect(200);

    const fetched = await request(app.getHttpServer())
      .get(`/api/orders/${confirmationNumber}`)
      .expect(200);

    expect(fetched.body).toEqual(
      expect.objectContaining({
        confirmationNumber,
        total: 6,
        items: [
          expect.objectContaining({
            unitPrice: 2,
            lineTotal: 6,
          }),
        ],
      }),
    );

    await request(app.getHttpServer())
      .delete(`/api/beverages/${beverageId}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/sizes/${sizeId}`)
      .expect(204);
  });

  it('rejects an order that includes a client total or no contact', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        customerName: 'Ada',
        email: 'ada@example.com',
        total: 1,
        items: [
          {
            beverageId: '00000000-0000-4000-8000-000000000001',
            sizeId: '00000000-0000-4000-8000-000000000002',
            quantity: 1,
          },
        ],
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        customerName: 'Ada',
        items: [
          {
            beverageId: '00000000-0000-4000-8000-000000000001',
            sizeId: '00000000-0000-4000-8000-000000000002',
            quantity: 1,
          },
        ],
      })
      .expect(400);
  });

  it('returns a consistent error body for unknown routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/missing')
      .expect(404);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        path: '/api/missing',
      }),
    );
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('message');
  });
});
